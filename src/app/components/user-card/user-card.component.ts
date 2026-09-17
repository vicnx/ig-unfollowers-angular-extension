import { Component, computed, inject, input } from '@angular/core';
import { UserNode } from '../../models/user.model';
import { ScannerService } from '../../services/scanner.service';

/**
 * Componente UserCard:
 * Representa una tarjeta individual de usuario de Instagram utilizando Angular 18 Signals (input(), computed()).
 * Cuenta con avatar circular con protección no-referrer, enlace seguro al perfil,
 * insignias oficiales de verificado/privado, estrella de lista blanca y checkbox.
 */
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
})
export class UserCardComponent {
  // Input Reactivo Signal (Angular 18)
  readonly user = input.required<UserNode>();
  readonly scanner = inject(ScannerService);

  // Computados reactivos para reactividad de alto rendimiento
  readonly isSelected = computed(() =>
    this.scanner.selectedUsers().some((u) => u.id === this.user().id)
  );

  readonly isWhitelisted = computed(() =>
    this.scanner.whitelistedUsers().some((u) => u.id === this.user().id)
  );

  readonly avatarSrc = computed(() => {
    const u = this.user();
    if (!u.profile_pic_url || u.profile_pic_url.trim() === '') {
      return this.generateFallbackAvatar(u.username);
    }
    return u.profile_pic_url;
  });

  /**
   * Manejador de evento al alternar el checkbox de selección.
   */
  onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.scanner.toggleUserSelection(this.user(), checked);
  }

  /**
   * Respaldo en caso de error de carga del avatar oficial de Instagram.
   * Genera un avatar SVG autónomo en data URI para no depender de APIs externas bloqueables.
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = this.generateFallbackAvatar(this.user().username);
  }

  /**
   * Genera un avatar SVG dinámico con gradiente acorde al estilo de Instagram.
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
        <linearGradient id="g_${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${pair[0]}"/>
          <stop offset="100%" stop-color="${pair[1]}"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#g_${Math.abs(hash)})"/>
      <text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
