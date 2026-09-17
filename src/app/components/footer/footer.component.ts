import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { IntegrityService } from '../../core/security/integrity.service';

/**
 * Componente Footer Protegido:
 *
 * Muestra los créditos de autoría obtenidos mediante descifrado en tiempo de ejecución.
 * Incorpora un guardián de integridad con MutationObserver para evitar alteraciones
 * maliciosas en el DOM o intentos de ocultación.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  private readonly integrity = inject(IntegrityService);

  @ViewChild('footerRoot') footerRoot!: ElementRef<HTMLElement>;
  @ViewChild('authorLink') authorLink!: ElementRef<HTMLAnchorElement>;

  // Carga útil de autoría descifrada en memoria mediante máscara XOR
  readonly payload = this.integrity.getAttributionPayload();
  readonly integrityToken = this.integrity.getHandshakeToken();

  private observer: MutationObserver | null = null;
  private watchdogInterval: any = null;

  ngAfterViewInit(): void {
    this.verifyAndRegister();
    this.initTamperWatchdog();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
    }
  }

  /**
   * Valida la presencia física y registra el token con el servicio central.
   */
  private verifyAndRegister(): void {
    const el = this.footerRoot?.nativeElement;
    if (el && this.integrityToken) {
      this.integrity.registerFooterHandshake(this.integrityToken, el);
    }
  }

  /**
   * Inicia el observador de mutaciones del DOM para detectar modificaciones maliciosas:
   * Si se elimina el enlace, se altera el texto o se manipulan los atributos de visibilidad.
   */
  private initTamperWatchdog(): void {
    const target = this.footerRoot?.nativeElement;
    if (!target) return;

    this.observer = new MutationObserver(() => {
      this.handleMutation();
    });

    this.observer.observe(target, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });

    // Guardián periódico adicional contra manipulación de estilos en DevTools
    this.watchdogInterval = setInterval(() => {
      this.handleMutation();
    }, 2500);
  }

  /**
   * Responde a cualquier intento de manipulación en el footer.
   */
  private handleMutation(): void {
    const el = this.footerRoot?.nativeElement;
    if (!el) return;

    // Si alguien intenta ocultarlo con estilos inline, los neutralizamos
    if (el.style.display === 'none') {
      el.style.display = 'block';
    }
    if (el.style.visibility === 'hidden') {
      el.style.visibility = 'visible';
    }
    if (parseFloat(el.style.opacity || '1') === 0) {
      el.style.opacity = '1';
    }

    // Comprobar la integridad tras cualquier mutación
    this.verifyAndRegister();
  }
}
