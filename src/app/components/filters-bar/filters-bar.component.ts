import { Component, inject } from '@angular/core';
import { ScannerService } from '../../services/scanner.service';
import { ScanningFilter, ScanningTab } from '../../models/filters.model';
import { UserNode } from '../../models/user.model';

/**
 * Componente FiltersBar:
 * Ofrece la navegación por pestañas (No-Seguidores vs Lista Blanca),
 * selección de filtros con checkboxes estilizados y atajos de selección masiva.
 */
@Component({
  selector: 'app-filters-bar',
  standalone: true,
  imports: [],
  templateUrl: './filters-bar.component.html',
  styleUrl: './filters-bar.component.scss',
})
export class FiltersBarComponent {
  readonly scanner = inject(ScannerService);

  // Funciones de predicado para selección rápida
  readonly isVerified = (u: UserNode): boolean => u.is_verified;
  readonly isPrivate = (u: UserNode): boolean => u.is_private;
  readonly isNoPic = (u: UserNode): boolean => this.scanner['api'].isWithoutProfilePicture(u);

  /**
   * Cambia de pestaña activa y restablece a la página 1.
   */
  setTab(tab: ScanningTab): void {
    this.scanner.currentTab.set(tab);
    this.scanner.currentPage.set(1);
  }

  /**
   * Alterna un filtro booleano (Privados, Verificados, Sin foto, etc.).
   */
  toggleFilter(key: keyof ScanningFilter): void {
    const current = this.scanner.filter();
    this.scanner.filter.set({
      ...current,
      [key]: !current[key],
    });
    this.scanner.currentPage.set(1);
  }

  /**
   * Añade o remueve las cuentas seleccionadas de la Lista Blanca protegida.
   */
  handleWhitelistAction(): void {
    if (this.scanner.currentTab() === 'non_whitelisted') {
      this.scanner.whitelistSelected();
    } else {
      this.scanner.unwhitelistSelected();
    }
  }
}
