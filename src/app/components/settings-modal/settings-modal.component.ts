import { Component, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScannerService } from '../../services/scanner.service';
import { Timings } from '../../models/timings.model';

/**
 * Componente SettingsModal:
 * Permite ajustar los tiempos de pausa anti-bloqueo de Instagram
 * y gestionar la importación, exportación y limpieza de la Lista Blanca protegida.
 * Utiliza output() de Angular 18.
 */
@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.scss',
})
export class SettingsModalComponent {
  readonly scanner = inject(ScannerService);

  // Output moderno con Angular 18 output()
  readonly close = output<void>();

  // Copia local de los tiempos para editar antes de guardar
  formTimings: Timings = { ...this.scanner.timings() };
  importMode: 'merge' | 'replace' = 'merge';

  /**
   * Guarda los nuevos tiempos en chrome.storage.local y actualiza el servicio.
   */
  saveSettings(): void {
    this.scanner.updateTimings(this.formTimings);
    this.close.emit();
  }

  /**
   * Manejador de selección de archivo JSON para importar lista blanca.
   */
  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.scanner.importWhitelistFile(file, this.importMode);
    }
    input.value = '';
  }
}
