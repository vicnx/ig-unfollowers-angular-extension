import { Injectable, signal, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/instagram.constants';

export type ThemeMode = 'dark' | 'light';

/**
 * ThemeService:
 * Gestiona el tema visual (Modo Oscuro / Modo Claro) con la estética nativa de Instagram.
 * Persiste la preferencia en storage y sincroniza el atributo data-theme en el documento.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storage = inject(StorageService);

  readonly currentTheme = signal<ThemeMode>('dark');

  constructor() {
    this.initTheme();
  }

  private async initTheme(): Promise<void> {
    const savedTheme = await this.storage.get<ThemeMode | null>(STORAGE_KEYS.THEME, null);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.setTheme(savedTheme);
      return;
    }

    // Si no hay preferencia guardada, verificar si Instagram o el sistema prefieren modo claro
    if (typeof window !== 'undefined') {
      const isHostLight = document.documentElement.classList.contains('theme-light');
      const isSystemLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

      if (isHostLight || (isSystemLight && !document.documentElement.classList.contains('theme-dark'))) {
        this.setTheme('light');
        return;
      }
    }

    // Por defecto modo oscuro (estética nativa Instagram Dark)
    this.setTheme('dark');
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
    this.storage.set(STORAGE_KEYS.THEME, theme);
  }

  toggleTheme(): void {
    const nextTheme: ThemeMode = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }
}
