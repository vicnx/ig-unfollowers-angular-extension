import { Injectable, computed, signal } from '@angular/core';
import { RawFriendshipUser, UserNode } from '../models/user.model';
import { ScanningFilter, ScanningTab, UnfollowFilter } from '../models/filters.model';
import { AppStatus, UnfollowLogEntry } from '../models/state.model';
import { Timings } from '../models/timings.model';
import { InstagramApiService } from './instagram-api.service';
import { StorageService } from './storage.service';
import {
  DEFAULT_TIMINGS,
  FOLLOWERS_PAGE_SAFETY_LIMIT,
  FOLLOWING_PAGE_SAFETY_LIMIT,
  UNFOLLOWERS_PER_PAGE,
} from '../constants/instagram.constants';
import { IntegrityService } from '../core/security/integrity.service';

@Injectable({
  providedIn: 'root',
})
export class ScannerService {
  // Reactive Signals State
  readonly status = signal<AppStatus>('initial');
  readonly percentage = signal<number>(0);
  readonly allResults = signal<UserNode[]>([]);
  readonly followerIds = signal<Set<string>>(new Set());
  readonly whitelistedUsers = signal<UserNode[]>([]);
  readonly selectedUsers = signal<UserNode[]>([]);
  readonly unfollowLog = signal<UnfollowLogEntry[]>([]);
  readonly isPaused = signal<boolean>(false);
  readonly toast = signal<{ show: boolean; text: string; type?: 'info' | 'warning' | 'success' | 'error' }>({
    show: false,
    text: '',
  });

  readonly filter = signal<ScanningFilter>({
    showNonFollowers: true,
    showFollowers: false,
    showVerified: true,
    showPrivate: true,
    showWithOutProfilePicture: true,
  });

  readonly unfollowFilter = signal<UnfollowFilter>({
    showSucceeded: true,
    showFailed: true,
  });

  readonly searchTerm = signal<string>('');
  readonly currentTab = signal<ScanningTab>('non_whitelisted');
  readonly currentPage = signal<number>(1);
  readonly timings = signal<Timings>(DEFAULT_TIMINGS);

  // Computed Signals
  readonly isScanning = computed(() => this.status() === 'scanning');
  readonly isUnfollowing = computed(() => this.status() === 'unfollowing');
  readonly isActiveProcess = computed(() => (this.isScanning() || this.isUnfollowing()) && this.percentage() < 100);

  readonly displayedUsers = computed(() => {
    const results = this.allResults();
    const whitelist = this.whitelistedUsers();
    const whitelistSet = new Set(whitelist.map((u) => u.id));
    const tab = this.currentTab();
    const filters = this.filter();
    const query = this.searchTerm().trim().toLowerCase();

    return results.filter((user) => {
      const isWhitelisted = whitelistSet.has(user.id);
      if (tab === 'non_whitelisted' && isWhitelisted) return false;
      if (tab === 'whitelisted' && !isWhitelisted) return false;

      if (!filters.showPrivate && user.is_private) return false;
      if (!filters.showVerified && user.is_verified) return false;
      if (!filters.showFollowers && user.follows_viewer) return false;
      if (!filters.showNonFollowers && !user.follows_viewer) return false;
      if (!filters.showWithOutProfilePicture && this.api.isWithoutProfilePicture(user)) return false;

      if (query) {
        const matchesUser = user.username.toLowerCase().includes(query);
        const matchesName = user.full_name.toLowerCase().includes(query);
        if (!matchesUser && !matchesName) return false;
      }

      return true;
    });
  });

  readonly totalPages = computed(() => {
    const total = Math.ceil(this.displayedUsers().length / UNFOLLOWERS_PER_PAGE);
    return total < 1 ? 1 : total;
  });

  readonly currentPageUsers = computed(() => {
    const sorted = [...this.displayedUsers()].sort((a, b) => (a.username.toLowerCase() > b.username.toLowerCase() ? 1 : -1));
    const start = (this.currentPage() - 1) * UNFOLLOWERS_PER_PAGE;
    return sorted.slice(start, start + UNFOLLOWERS_PER_PAGE);
  });

  readonly metrics = computed(() => {
    const results = this.allResults();
    return {
      totalScanned: results.length,
      nonFollowers: results.filter((u) => !u.follows_viewer).length,
      verified: results.filter((u) => u.is_verified).length,
      private: results.filter((u) => u.is_private).length,
      whitelisted: this.whitelistedUsers().length,
      selected: this.selectedUsers().length,
    };
  });

  readonly displayedUnfollowLog = computed(() => {
    const log = this.unfollowLog();
    const query = this.searchTerm().trim().toLowerCase();
    const filter = this.unfollowFilter();

    return log.filter((entry) => {
      if (!filter.showSucceeded && entry.unfollowedSuccessfully) return false;
      if (!filter.showFailed && !entry.unfollowedSuccessfully) return false;
      if (query && !entry.user.username.toLowerCase().includes(query)) return false;
      return true;
    });
  });

  constructor(
    private api: InstagramApiService,
    private storage: StorageService,
    private integrity: IntegrityService,
  ) {
    this.initFromStorage();
  }

  private async initFromStorage(): Promise<void> {
    const [whitelist, timings] = await Promise.all([this.storage.loadWhitelist(), this.storage.loadTimings()]);
    this.whitelistedUsers.set(whitelist);
    this.timings.set(timings);
  }

  showToast(text: string, type: 'info' | 'warning' | 'success' | 'error' = 'info', duration = 4000): void {
    this.toast.set({ show: true, text, type });
    if (duration > 0) {
      setTimeout(() => {
        if (this.toast().text === text) {
          this.toast.set({ show: false, text: '' });
        }
      }, duration);
    }
  }

  hideToast(): void {
    this.toast.set({ show: false, text: '' });
  }

  togglePause(): void {
    this.isPaused.update((p) => !p);
  }

  // Scanner Execution
  async startScan(): Promise<void> {
    if (this.status() === 'scanning') return;

    // Comprobación de seguridad e integridad del sistema (firma de autoría obligatoria)
    const integrityCheck = this.integrity.validateExecutionIntegrity();
    if (!integrityCheck.allowed) {
      this.showToast(integrityCheck.reason || 'Error de integridad del sistema.', 'error', 6000);
      return;
    }

    const whitelist = await this.storage.loadWhitelist();
    this.whitelistedUsers.set(whitelist);
    this.selectedUsers.set([]);
    this.allResults.set([]);
    this.percentage.set(0);
    this.currentPage.set(1);
    this.status.set('scanning');
    this.isPaused.set(false);

    const timings = this.timings();

    const estimatePhaseProgress = (fetched: number) => 100 * (1 - 1 / (1 + fetched / 150));

    const fetchList = async (
      kind: 'following' | 'followers',
      safetyLimit: number,
      rangeStart: number,
      rangeEnd: number,
      onPage: (users: readonly RawFriendshipUser[]) => void,
    ): Promise<boolean> => {
      let maxId: string | undefined;
      let pagesFetched = 0;
      let cycle = 0;
      let totalFetched = 0;

      while (true) {
        let page;
        try {
          page = await this.api.fetchFriendshipsPage(kind, maxId, timings.usersPerSearchCycle);
        } catch (e: any) {
          console.error(`Error al escanear ${kind}:`, e);
          return false;
        }

        const pageUsers = page.users ?? [];
        totalFetched += pageUsers.length;
        onPage(pageUsers);

        const rangeSize = rangeEnd - rangeStart;
        const progress = Math.round(rangeStart + estimatePhaseProgress(totalFetched) * (rangeSize / 100));
        this.percentage.set(Math.min(rangeEnd, progress));

        const hasMore = Boolean(page.next_max_id) && page.has_more !== false;
        if (!hasMore || pageUsers.length === 0) {
          break;
        }

        pagesFetched++;
        if (pagesFetched >= safetyLimit) {
          console.warn(`Límite de seguridad alcanzado para ${kind} (${safetyLimit} páginas).`);
          return false;
        }
        maxId = page.next_max_id;

        // User paused
        while (this.isPaused()) {
          await this.api.sleep(1000);
        }

        // Anti-ban human pacing
        const microPause = Math.floor(Math.random() * 1500) + 500;
        await this.api.sleep(microPause);

        const cycleDelay = Math.floor(Math.random() * (timings.timeBetweenSearchCycles * 0.3)) + timings.timeBetweenSearchCycles;
        await this.api.sleep(cycleDelay);

        cycle++;
        if (cycle > 6) {
          cycle = 0;
          const longPause = Math.max(0, timings.timeToWaitAfterFiveSearchCycles + (Math.random() * 8000 - 4000));
          this.showToast(`Pausando ${Math.round(longPause / 1000)}s para evitar bloqueos temporales de Instagram...`, 'warning', 0);
          await this.api.sleep(longPause);
          this.hideToast();
        }
      }

      this.percentage.set(rangeEnd);
      return true;
    };

    // 1. Fetch Following
    const followingUsers: RawFriendshipUser[] = [];
    const followingOk = await fetchList('following', FOLLOWING_PAGE_SAFETY_LIMIT, 0, 45, (users) => {
      followingUsers.push(...users);
    });

    if (!followingOk && followingUsers.length === 0) {
      this.status.set('initial');
      this.showToast('No se pudo cargar la lista de seguidos. Comprueba tu sesión en Instagram.', 'error');
      return;
    }

    // 2. Fetch Followers (ID set)
    const followerIds = new Set<string>();
    const followersOk = await fetchList('followers', FOLLOWERS_PAGE_SAFETY_LIMIT, 45, 95, (users) => {
      for (const u of users) {
        followerIds.add(String(u.pk_id ?? u.pk));
      }
    });

    this.followerIds.set(followerIds);

    // Map into UserNode
    const results: UserNode[] = followingUsers.map((u) =>
      this.api.rawFriendshipUserToUserNode(u, followerIds.has(String(u.pk_id ?? u.pk))),
    );

    this.allResults.set(results);
    this.percentage.set(100);

    if (followingOk && followersOk) {
      this.showToast(`¡Escaneo completado con éxito! Se encontraron ${this.metrics().nonFollowers} no-seguidores.`, 'success');
    } else {
      this.showToast('Escaneo parcial: Se cargaron los datos pero una lista fue interrumpida.', 'warning');
    }
  }

  // Selection controls
  toggleUserSelection(user: UserNode, isSelected: boolean): void {
    const current = this.selectedUsers();
    if (isSelected) {
      if (!current.some((u) => u.id === user.id)) {
        this.selectedUsers.set([...current, user]);
      }
    } else {
      this.selectedUsers.set(current.filter((u) => u.id !== user.id));
    }
  }

  toggleCurrentPageSelection(selectAll: boolean): void {
    const pageUsers = this.currentPageUsers();
    const current = this.selectedUsers();
    if (selectAll) {
      const currentIds = new Set(current.map((u) => u.id));
      const toAdd = pageUsers.filter((u) => !currentIds.has(u.id));
      this.selectedUsers.set([...current, ...toAdd]);
    } else {
      const pageIds = new Set(pageUsers.map((u) => u.id));
      this.selectedUsers.set(current.filter((u) => !pageIds.has(u.id)));
    }
  }

  toggleAllDisplayedSelection(selectAll: boolean): void {
    const displayed = this.displayedUsers();
    if (selectAll) {
      const currentIds = new Set(this.selectedUsers().map((u) => u.id));
      const toAdd = displayed.filter((u) => !currentIds.has(u.id));
      this.selectedUsers.set([...this.selectedUsers(), ...toAdd]);
    } else {
      const displayedIds = new Set(displayed.map((u) => u.id));
      this.selectedUsers.set(this.selectedUsers().filter((u) => !displayedIds.has(u.id)));
    }
  }

  selectByCondition(condition: (u: UserNode) => boolean): void {
    const matches = this.displayedUsers().filter(condition);
    const currentIds = new Set(this.selectedUsers().map((u) => u.id));
    const toAdd = matches.filter((u) => !currentIds.has(u.id));
    this.selectedUsers.set([...this.selectedUsers(), ...toAdd]);
  }

  clearSelection(): void {
    this.selectedUsers.set([]);
  }

  // Whitelist management
  async toggleWhitelist(user: UserNode): Promise<void> {
    const current = this.whitelistedUsers();
    const exists = current.some((u) => u.id === user.id);
    let updated: UserNode[];
    if (exists) {
      updated = current.filter((u) => u.id !== user.id);
      this.showToast(`@${user.username} eliminado de la Lista Blanca`, 'info', 2000);
    } else {
      updated = [...current, user];
      this.showToast(`@${user.username} protegido en Lista Blanca ⭐`, 'success', 2000);
    }
    this.whitelistedUsers.set(updated);
    await this.storage.saveWhitelist(updated);
  }

  async whitelistSelected(): Promise<void> {
    const selected = this.selectedUsers();
    if (selected.length === 0) return;

    const current = this.whitelistedUsers();
    const currentIds = new Set(current.map((u) => u.id));
    const toAdd = selected.filter((u) => !currentIds.has(u.id));
    const updated = [...current, ...toAdd];

    this.whitelistedUsers.set(updated);
    await this.storage.saveWhitelist(updated);
    this.clearSelection();
    this.showToast(`${toAdd.length} cuentas añadidas a la Lista Blanca`, 'success');
  }

  async unwhitelistSelected(): Promise<void> {
    const selected = this.selectedUsers();
    if (selected.length === 0) return;

    const selectedIds = new Set(selected.map((u) => u.id));
    const updated = this.whitelistedUsers().filter((u) => !selectedIds.has(u.id));

    this.whitelistedUsers.set(updated);
    await this.storage.saveWhitelist(updated);
    this.clearSelection();
    this.showToast(`${selected.length} cuentas eliminadas de la Lista Blanca`, 'info');
  }

  // Unfollow execution
  async startUnfollow(): Promise<void> {
    // Comprobación de seguridad e integridad del sistema
    const integrityCheck = this.integrity.validateExecutionIntegrity();
    if (!integrityCheck.allowed) {
      this.showToast(integrityCheck.reason || 'Error de integridad del sistema.', 'error', 6000);
      return;
    }

    const toUnfollow = this.selectedUsers();
    if (toUnfollow.length === 0) {
      alert('Debes seleccionar al menos un usuario para dejar de seguir.');
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres dejar de seguir a ${toUnfollow.length} cuenta(s)? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.status.set('unfollowing');
    this.percentage.set(0);
    this.unfollowLog.set([]);
    this.isPaused.set(false);

    const timings = this.timings();
    let counter = 0;

    for (const user of toUnfollow) {
      counter++;
      const progress = Math.round((counter / toUnfollow.length) * 100);

      while (this.isPaused()) {
        await this.api.sleep(1000);
      }

      try {
        const success = await this.api.unfollowUser(user.id);
        const entry: UnfollowLogEntry = {
          user,
          unfollowedSuccessfully: success,
          timestamp: Date.now(),
        };
        this.unfollowLog.update((log) => [entry, ...log]);
        this.percentage.set(progress);
      } catch (err: any) {
        const entry: UnfollowLogEntry = {
          user,
          unfollowedSuccessfully: false,
          timestamp: Date.now(),
          errorMessage: err.message,
        };
        this.unfollowLog.update((log) => [entry, ...log]);
        this.percentage.set(progress);
      }

      // If last user, finish
      if (counter >= toUnfollow.length) {
        break;
      }

      // Anti-ban delays
      const delay = Math.floor(Math.random() * (timings.timeBetweenUnfollows * 0.3)) + timings.timeBetweenUnfollows;
      await this.api.sleep(delay);

      // Long sleep every 5 unfollows to avoid Instagram action ban
      if (counter % 5 === 0) {
        const minutes = Math.round(timings.timeToWaitAfterFiveUnfollows / 60000);
        this.showToast(`Pausando ${minutes} minuto(s) para prevenir bloqueos de acción de Instagram...`, 'warning', 0);
        await this.api.sleep(timings.timeToWaitAfterFiveUnfollows);
        this.hideToast();
      }
    }

    this.showToast(`Proceso de unfollow completado.`, 'success');
  }

  // Update Settings
  async updateTimings(newTimings: Timings): Promise<void> {
    this.timings.set(newTimings);
    await this.storage.saveTimings(newTimings);
    this.showToast('Configuración guardada correctamente.', 'success');
  }

  // Whitelist operations
  async clearAllWhitelist(): Promise<void> {
    if (confirm('¿Estás seguro de que quieres vaciar la lista blanca por completo?')) {
      await this.storage.clearWhitelist();
      this.whitelistedUsers.set([]);
      this.showToast('Lista blanca vaciada.', 'info');
    }
  }

  async importWhitelistFile(file: File, mode: 'merge' | 'replace'): Promise<void> {
    try {
      const updated = await this.storage.importWhitelistFromJson(file, this.whitelistedUsers(), mode);
      this.whitelistedUsers.set(updated);
      await this.storage.saveWhitelist(updated);
      this.showToast(`Lista blanca importada con éxito (${updated.length} usuarios).`, 'success');
    } catch (e: any) {
      this.showToast(e.message, 'error');
    }
  }

  exportWhitelist(): void {
    this.storage.exportWhitelistAsJson(this.whitelistedUsers());
  }

  exportUnfollowersCsv(): void {
    this.storage.exportUsersAsCsv(this.displayedUsers());
  }

  exportUnfollowersJson(): void {
    this.storage.exportUsersAsJson(this.displayedUsers());
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
