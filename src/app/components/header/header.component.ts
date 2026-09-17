import { Component, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScannerService } from '../../services/scanner.service';
import { ThemeService } from '../../services/theme.service';

/**
 * Componente Header:
 * Barra superior con logotipo oficial de Instagram, nombre de la aplicación "¿Quién me dejó de seguir?",
 * alternador de tema Claro/Oscuro, información/bienvenida, campo de búsqueda en tiempo real,
 * exportador a CSV y control de cierre del panel deslizable.
 * Utiliza output() de Angular 18.
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
  readonly themeService = inject(ThemeService);

  // Outputs declarativos modernos de Angular 18
  readonly openSettings = output<void>();
  readonly openWelcome = output<void>();

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
