import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { ScannerControlsComponent } from './components/scanner-controls/scanner-controls.component';
import { FiltersBarComponent } from './components/filters-bar/filters-bar.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { WelcomeModalComponent } from './components/welcome-modal/welcome-modal.component';
import { UnfollowQueueComponent } from './components/unfollow-queue/unfollow-queue.component';
import { ToastComponent } from './components/toast/toast.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScannerService } from './services/scanner.service';
import { StorageService } from './services/storage.service';
import { STORAGE_KEYS } from './constants/instagram.constants';

/**
 * Componente Principal (AppComponent):
 * Ensambla el layout completo de la extensión en Angular 18 (Standalone).
 * Coordina las vistas entre Auditoría, Cola de Unfollow, Ajustes y Pantalla de Bienvenida.
 * Previene cierres accidentales de pestaña si hay un proceso en curso.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    ScannerControlsComponent,
    FiltersBarComponent,
    UserCardComponent,
    PaginationComponent,
    SettingsModalComponent,
    WelcomeModalComponent,
    UnfollowQueueComponent,
    ToastComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  readonly scanner = inject(ScannerService);
  private readonly storage = inject(StorageService);

  // Controla la visibilidad de los modales mediante Signals
  readonly isSettingsOpen = signal<boolean>(false);
  readonly isWelcomeOpen = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    const welcomeSeen = await this.storage.get<boolean>(STORAGE_KEYS.WELCOME_SEEN, false);
    if (!welcomeSeen) {
      this.isWelcomeOpen.set(true);
    }
  }

  /**
   * Listener global de seguridad: Previene que el usuario cierre o recargue la pestaña
   * por accidente mientras se esté ejecutando un escaneo o proceso de unfollow.
   */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent): void {
    if (this.scanner.isActiveProcess()) {
      e.preventDefault();
      e.returnValue = 'Un escaneo o proceso de unfollow está en curso. ¿Seguro que deseas salir?';
    }
  }
}
