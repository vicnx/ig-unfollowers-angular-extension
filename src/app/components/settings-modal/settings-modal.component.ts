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

  // ── Presets de Seguridad ────────────────────────────────────────────────────

  /** Definición de los 3 presets disponibles. */
  readonly presets: TimingPreset[] = [
    {
      id: 'safe',
      label: '🛡️ Seguro',
      description: 'Máxima protección. Ideal para cuentas nuevas o tras un bloqueo.',
      timeBetweenUnfollows: 10,
      timeToWaitAfterFiveUnfollows: 300,
    },
    {
      id: 'balanced',
      label: '⚖️ Equilibrado',
      description: 'Velocidad moderada con pausas largas reducidas. Recomendado.',
      timeBetweenUnfollows: 4,
      timeToWaitAfterFiveUnfollows: 120,
    },
    {
      id: 'fast',
      label: '⚡ Rápido',
      description: 'Mínimo razonable. Solo para cuentas maduras sin bloqueos recientes.',
      timeBetweenUnfollows: 2,
      timeToWaitAfterFiveUnfollows: 60,
    },
  ];

  /**
   * Devuelve el ID del preset activo comparando los timings actuales,
   * o 'custom' si los valores no coinciden con ningún preset.
   */
  get activePresetId(): string {
    for (const p of this.presets) {
      if (
        this.secondsTimings.timeBetweenUnfollows === p.timeBetweenUnfollows &&
        this.secondsTimings.timeToWaitAfterFiveUnfollows === p.timeToWaitAfterFiveUnfollows
      ) {
        return p.id;
      }
    }
    return 'custom';
  }

  /**
   * Evalúa el nivel de riesgo de ban basado en los valores actuales.
   * 'safe' | 'warning' | 'danger'
   */
  get dangerLevel(): 'safe' | 'warning' | 'danger' {
    const delay = this.secondsTimings.timeBetweenUnfollows;
    const longPause = this.secondsTimings.timeToWaitAfterFiveUnfollows;

    if (delay < 2 || longPause < 30) return 'danger';
    if (delay < 4 || longPause < 60) return 'warning';
    return 'safe';
  }

  /** Mensaje descriptivo del nivel de riesgo actual. */
  get dangerMessage(): string {
    const delay = this.secondsTimings.timeBetweenUnfollows;
    const longPause = this.secondsTimings.timeToWaitAfterFiveUnfollows;

    if (delay < 1) {
      return '🚨 Menos de 1 segundo entre unfollows. Esto disparará el sistema anti-spam de Instagram con casi total seguridad.';
    }
    if (delay < 2 && longPause < 30) {
      return '🚨 Riesgo muy alto de bloqueo de cuenta. Estos valores son demasiado agresivos para cualquier tipo de cuenta.';
    }
    if (delay < 2) {
      return '⚠️ Menos de 2 segundos entre unfollows puede provocar un bloqueo de acción temporal en cuentas con poca antigüedad.';
    }
    if (longPause < 30) {
      return '⚠️ La pausa larga es demasiado corta. Instagram detecta ráfagas sostenidas sin descanso.';
    }
    if (delay < 4 || longPause < 60) {
      return '⚠️ Valores en zona de riesgo moderado. Funcionan en cuentas maduras, pero pueden provocar bloqueos en cuentas nuevas o previamente sancionadas.';
    }
    return '🛡️ Configuración dentro de los parámetros seguros. Los tiempos imitan la cadencia humana natural.';
  }

  /**
   * Aplica un preset al formulario de tiempos.
   */
  applyPreset(preset: TimingPreset): void {
    this.secondsTimings.timeBetweenUnfollows = preset.timeBetweenUnfollows;
    this.secondsTimings.timeToWaitAfterFiveUnfollows = preset.timeToWaitAfterFiveUnfollows;
  }

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

/** Modelo de un preset de velocidad de unfollow. */
interface TimingPreset {
  id: string;
  label: string;
  description: string;
  timeBetweenUnfollows: number;
  timeToWaitAfterFiveUnfollows: number;
}
