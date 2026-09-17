import { Component, computed, inject } from '@angular/core';
import { ScannerService } from '../../services/scanner.service';

/**
 * Componente Pagination:
 * Permite paginar de 50 en 50 usuarios, e incluye atajos de selección masiva
 * para marcar todos los usuarios de la página actual o todos los filtrados.
 * Emplea Signals computadas (computed) de Angular 18.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly scanner = inject(ScannerService);

  /**
   * Signal computada: Comprueba si todos los usuarios visibles en la página actual están seleccionados.
   */
  readonly isPageAllSelected = computed(() => {
    const page = this.scanner.currentPageUsers();
    if (page.length === 0) return false;
    const selectedIds = new Set(this.scanner.selectedUsers().map((u) => u.id));
    return page.every((u) => selectedIds.has(u.id));
  });

  /**
   * Signal computada: Comprueba si absolutamente todos los usuarios filtrados están seleccionados.
   */
  readonly isAllSelected = computed(() => {
    const all = this.scanner.displayedUsers();
    if (all.length === 0) return false;
    const selectedIds = new Set(this.scanner.selectedUsers().map((u) => u.id));
    return all.every((u) => selectedIds.has(u.id));
  });

  /**
   * Alterna la selección de todos los usuarios de la página actual.
   */
  onTogglePage(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.scanner.toggleCurrentPageSelection(checked);
  }

  /**
   * Alterna la selección de todos los usuarios filtrados en todas las páginas.
   */
  onToggleAll(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.scanner.toggleAllDisplayedSelection(checked);
  }
}
