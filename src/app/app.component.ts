import { Component, HostListener, inject, signal } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { ScannerControlsComponent } from './components/scanner-controls/scanner-controls.component';
import { FiltersBarComponent } from './components/filters-bar/filters-bar.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { UnfollowQueueComponent } from './components/unfollow-queue/unfollow-queue.component';
import { ToastComponent } from './components/toast/toast.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScannerService } from './services/scanner.service';

/**
 * Componente Principal (AppComponent):
 * Ensambla el layout completo de la extensión en Angular 18 (Standalone).
 * Coordina las vistas entre Auditoría y Cola de Unfollow utilizando control flow nativo (@if, @for),
 * y previene cierres accidentales de pestaña si hay un proceso en curso.
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
    UnfollowQueueComponent,
    ToastComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly scanner = inject(ScannerService);

  // Controla la visibilidad del modal de ajustes y lista blanca mediante Signal
  readonly isSettingsOpen = signal<boolean>(false);

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
