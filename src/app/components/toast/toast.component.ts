import { Component, inject } from '@angular/core';
import { ScannerService } from '../../services/scanner.service';

/**
 * Componente Toast:
 * Notificación flotante emergente para comunicar estados de la aplicación,
 * advertencias de pausas anti-baneo o confirmación de exportación.
 * Utiliza @if y @switch nativos de Angular 18.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  readonly scanner = inject(ScannerService);
}
