import { Component, output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { STORAGE_KEYS } from '../../constants/instagram.constants';

/**
 * Componente WelcomeModal:
 * Ventana de bienvenida y transparencia en seguridad.
 * Explica al usuario:
 * 1. Privacidad absoluta (100% Client-Side, sin acceso a contraseñas ni recolección de credenciales).
 * 2. Tiempos seguros preconfigurados en segundos para evitar bloqueos de acción de Instagram.
 * 3. Uso de la Lista Blanca protegida.
 */
@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './welcome-modal.component.html',
  styleUrl: './welcome-modal.component.scss',
})
export class WelcomeModalComponent {
  private readonly storage = inject(StorageService);

  readonly close = output<void>();
  readonly dontShowAgain = signal<boolean>(true);

  async onDismiss(): Promise<void> {
    if (this.dontShowAgain()) {
      await this.storage.set(STORAGE_KEYS.WELCOME_SEEN, true);
    }
    this.close.emit();
  }
}
