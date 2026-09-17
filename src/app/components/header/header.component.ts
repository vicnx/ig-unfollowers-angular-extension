import { Component, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScannerService } from '../../services/scanner.service';

/**
 * Componente Header:
 * Barra superior con el logotipo de Instagram, nombre de la aplicación "¿Quién me dejó de seguir?",
 * campo de búsqueda en tiempo real, exportador a CSV y control de cierre del panel.
 * Utiliza output() de Angular 18 en lugar del decorador legacy @Output().
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly scanner = inject(ScannerService);

  // Output declarativo moderno (Angular 18)
  readonly openSettings = output<void>();

  /**
   * Envía un mensaje a la ventana principal (Instagram) mediante postMessage
   * para que el Content Script cierre suavemente el iframe deslizable.
   */
  closeDrawer(): void {
    if (typeof window !== 'undefined') {
      window.parent.postMessage({ type: 'IU_CLOSE_DRAWER' }, '*');
    }
  }
}
