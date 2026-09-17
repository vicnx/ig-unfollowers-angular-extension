import { Component, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScannerService } from '../../services/scanner.service';

/**
 * Componente SettingsModal:
 * Permite ajustar los tiempos de pausa anti-bloqueo de Instagram (expresados en segundos para el usuario)
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

  // Tiempos expresados en SEGUNDOS para una experiencia clara e intuitiva
  secondsTimings = {
    timeBetweenSearchCycles: Math.round(this.scanner.timings().timeBetweenSearchCycles / 100) / 10,
    timeToWaitAfterFiveSearchCycles: Math.round(this.scanner.timings().timeToWaitAfterFiveSearchCycles / 1000),
    timeBetweenUnfollows: Math.round(this.scanner.timings().timeBetweenUnfollows / 100) / 10,
    timeToWaitAfterFiveUnfollows: Math.round(this.scanner.timings().timeToWaitAfterFiveUnfollows / 1000),
    usersPerSearchCycle: this.scanner.timings().usersPerSearchCycle,
  };

  importMode: 'merge' | 'replace' = 'merge';

  /**
   * Guarda los nuevos tiempos convirtiendo de segundos a milisegundos internamente.
   */
  saveSettings(): void {
    const timeBetweenSearchCycles = Math.max(500, Math.round(this.secondsTimings.timeBetweenSearchCycles * 1000));
    const timeToWaitAfterFiveSearchCycles = Math.max(2000, Math.round(this.secondsTimings.timeToWaitAfterFiveSearchCycles * 1000));
    const timeBetweenUnfollows = Math.max(1000, Math.round(this.secondsTimings.timeBetweenUnfollows * 1000));
    const timeToWaitAfterFiveUnfollows = Math.max(10000, Math.round(this.secondsTimings.timeToWaitAfterFiveUnfollows * 1000));
    const usersPerSearchCycle = Math.max(10, Math.min(100, Math.round(this.secondsTimings.usersPerSearchCycle)));

    this.scanner.updateTimings({
      timeBetweenSearchCycles,
      timeToWaitAfterFiveSearchCycles,
      timeBetweenUnfollows,
      timeToWaitAfterFiveUnfollows,
      usersPerSearchCycle,
    });

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

  /**
   * Manejador de alternancia del modo de prueba (Mock Data).
   */
  onToggleMockMode(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.scanner.setMockMode(checkbox.checked, true);
  }

  /**
   * Carga inmediatamente las cuentas mock y cierra el modal para ver resultados.
   */
  onLoadDefaultMock(): void {
    this.scanner.setMockMode(true, true);
    this.close.emit();
  }

  /**
   * Regenera la lista mock con nombres y combinaciones aleatorias.
   */
  onRegenerateRandomMock(): void {
    this.scanner.regenerateRandomMock();
  }

  /**
   * Exporta las cuentas mock en formato JSON descargable.
   */
  onExportMockJson(): void {
    this.scanner.exportMockJson();
  }

  /**
   * Importa un archivo JSON personalizado con usuarios mock.
   */
  onImportMockFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.scanner.importCustomMockJson(file);
      this.close.emit();
    }
    input.value = '';
  }

  /**
   * Desactiva el modo de prueba y restablece el estado real.
   */
  onExitMockMode(): void {
    this.scanner.setMockMode(false);
  }
}
