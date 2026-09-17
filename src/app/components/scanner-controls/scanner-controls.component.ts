import { Component, computed, inject } from '@angular/core';
import { ScannerService } from '../../services/scanner.service';

/**
 * Componente ScannerControls:
 * Gestiona el botón de inicio de auditoría, la barra de progreso reactiva con degradado Instagram,
 * el botón interactivo de pausar/reanudar y la cuadrícula de métricas en tiempo real.
 * Emplea computed signals de Angular 18 para la etiqueta de estado reactiva.
 */
@Component({
  selector: 'app-scanner-controls',
  standalone: true,
  imports: [],
  templateUrl: './scanner-controls.component.html',
  styleUrl: './scanner-controls.component.scss',
})
export class ScannerControlsComponent {
  readonly scanner = inject(ScannerService);

  /**
   * Signal computada con el texto descriptivo del estado actual.
   */
  readonly statusLabel = computed(() => {
    const status = this.scanner.status();
    if (status === 'scanning') {
      return this.scanner.isPaused() ? 'Escaneo pausado' : 'Escaneando cuentas...';
    }
    if (status === 'unfollowing') {
      return this.scanner.isPaused() ? 'Unfollow pausado' : 'Dejando de seguir...';
    }
    return 'Auditoría finalizada';
  });
}
