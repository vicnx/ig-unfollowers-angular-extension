import { Component, inject } from '@angular/core';
import { ScannerService } from '../../services/scanner.service';
import { UserNode } from '../../models/user.model';

/**
 * Componente UnfollowQueue:
 * Supervisa en vivo el proceso de bajas (unfollows) seleccionados utilizando control flow moderno de Angular 18,
 * mostrando el progreso, errores de red y filtros por estado de éxito.
 */
@Component({
  selector: 'app-unfollow-queue',
  standalone: true,
  imports: [],
  templateUrl: './unfollow-queue.component.html',
  styleUrl: './unfollow-queue.component.scss',
})
export class UnfollowQueueComponent {
  readonly scanner = inject(ScannerService);

  /**
   * Alterna el filtro de logs para mostrar u ocultar operaciones exitosas o fallidas.
   */
  toggleFilter(key: 'showSucceeded' | 'showFailed'): void {
    const current = this.scanner.unfollowFilter();
    this.scanner.unfollowFilter.set({
      ...current,
      [key]: !current[key],
    });
  }

  /**
   * Finaliza la cola y regresa a la vista de auditoría limpiando las cuentas seleccionadas.
   */
  returnToScan(): void {
    this.scanner.status.set('scanning');
    this.scanner.clearSelection();
  }

  /**
   * Retorna la URL del avatar o genera uno dinámico SVG.
   */
  getAvatarSrc(user: UserNode): string {
    if (!user.profile_pic_url || user.profile_pic_url.trim() === '') {
      return this.generateFallbackAvatar(user.username);
    }
    return user.profile_pic_url;
  }

  /**
   * Manejador de error para fallback en caso de falla de carga.
   */
  onImageError(event: Event, user: UserNode): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = this.generateFallbackAvatar(user.username);
  }

  /**
   * Genera avatar SVG autónomo con degradado.
   */
  generateFallbackAvatar(username: string): string {
    const initial = (username ? username.charAt(0) : '?').toUpperCase();
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const gradients = [
      ['#f09433', '#bc1888'],
      ['#405de6', '#5851db'],
      ['#fd1d1d', '#f77737'],
      ['#00c6ff', '#0072ff'],
      ['#f857a6', '#ff5858'],
      ['#11998e', '#38ef7d'],
    ];
    const pair = gradients[Math.abs(hash) % gradients.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="g_q_${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${pair[0]}"/>
          <stop offset="100%" stop-color="${pair[1]}"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#g_q_${Math.abs(hash)})"/>
      <text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
