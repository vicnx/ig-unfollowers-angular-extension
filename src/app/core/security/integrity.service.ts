import { Injectable, signal } from '@angular/core';

/**
 * Servicio de Integridad y Protección Criptográfica de Autoría:
 *
 * Protege los metadatos de autoría y atribución original mediante ofuscación y cifrado
 * simétrico con máscara XOR multicapa.
 *
 * Evita la clonación no autorizada y eliminación del pie de página mediante un handshake criptográfico
 * en memoria y monitoreo del árbol DOM en tiempo de ejecución.
 */
@Injectable({
  providedIn: 'root',
})
export class IntegrityService {
  // Clave simétrica de ciclo periódico (XOR Mask)
  private readonly _k = [0x58, 0x45, 0x4e, 0x54, 0x45, 0x32, 0x30, 0x32, 0x36];

  // Vectores binarios cifrados en tiempo de compilación:
  private readonly _cUrl = [48, 49, 58, 36, 54, 8, 31, 29, 81, 49, 49, 38, 33, 39, 28, 83, 93, 91, 119, 51, 39, 55, 43, 74];
  private readonly _cNick = [0, 32, 32, 32, 32];
  private readonly _cFull = [14, 44, 45, 49, 43, 70, 85, 18, 119, 54, 33, 47, 58, 44];

  private readonly _cLabel = [27, 55, 43, 53, 33, 93, 16, 81, 89, 54, 101, 172, 201, 225, 221, 136, 189, 22, 40, 42, 60];
  private readonly _cVer = [46, 116, 96, 101, 107, 2];

  // Checksum esperado para garantizar que ningún byte fue alterado
  private readonly _expectedChecksum = 4550;

  // Estado reactivo de integridad verificado en tiempo de ejecución
  readonly isSystemIntact = signal<boolean>(false);
  private _handshakeToken: string | null = null;

  constructor() {
    this.verifyAuthorSignature();
  }

  /**
   * Descifra un vector de bytes aplicando la máscara XOR dinámica.
   */
  private _d(bytes: number[]): string {
    const raw = bytes.map((b, i) => b ^ this._k[i % this._k.length]);
    return decodeURIComponent(
      raw
        .map((b) => '%' + b.toString(16).padStart(2, '0'))
        .join('')
    );
  }

  /**
   * Obtiene la carga útil descifrada de autoría de forma segura.
   */
  getAttributionPayload() {
    return {
      url: this._d(this._cUrl),
      nickname: this._d(this._cNick),
      fullName: this._d(this._cFull),
      label: this._d(this._cLabel),
      version: this._d(this._cVer),
    };
  }

  /**
   * Valida la firma matemática del paquete de datos de autoría.
   */
  verifyAuthorSignature(): boolean {
    const allBytes = [
      ...this._cUrl,
      ...this._cNick,
      ...this._cFull,
      ...this._cLabel,
      ...this._cVer,
    ];

    const currentChecksum = allBytes.reduce((acc, val) => acc + val, 0);
    const valid = currentChecksum === this._expectedChecksum;

    if (valid) {
      // Generar token criptográfico efímero para handshake
      this._handshakeToken = 'iu_sec_' + Math.abs(currentChecksum ^ 0xfeedbeef).toString(16);
    } else {
      this._handshakeToken = null;
    }

    return valid;
  }

  /**
   * Registra la confirmación de montaje e integridad física del footer en el DOM.
   */
  registerFooterHandshake(token: string, footerElement: HTMLElement | null): boolean {
    if (!this._handshakeToken || token !== this._handshakeToken) {
      this.isSystemIntact.set(false);
      return false;
    }

    if (!footerElement || !this.isFooterNodeTampered(footerElement)) {
      this.isSystemIntact.set(true);
      return true;
    }

    this.isSystemIntact.set(false);
    return false;
  }

  /**
   * Inspecciona si el nodo del footer ha sido alterado, eliminado o escondido mediante CSS malicioso.
   */
  isFooterNodeTampered(el: HTMLElement): boolean {
    if (!el || !document.body.contains(el)) {
      return true; // Ha sido removido del DOM
    }

    const style = window.getComputedStyle(el);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      parseFloat(style.opacity || '1') <= 0.05 ||
      el.offsetHeight === 0
    ) {
      return true; // Ocultado maliciosamente con CSS
    }

    // Verificar que el enlace de GitHub apunte al perfil original
    const authorLink = el.querySelector('a') as HTMLAnchorElement | null;
    if (!authorLink) return true;

    const payload = this.getAttributionPayload();
    if (!authorLink.href.startsWith(payload.url)) {
      return true; // Enlace modificado o redirigido
    }

    return false;
  }

  /**
   * Obtiene el token de handshake esperado.
   */
  getHandshakeToken(): string | null {
    return this._handshakeToken;
  }

  /**
   * Validación global del sistema requerida antes de arrancar auditoría o unfollow.
   */
  validateExecutionIntegrity(): { allowed: boolean; reason?: string } {
    if (!this.verifyAuthorSignature()) {
      return {
        allowed: false,
        reason: 'Error de integridad: La firma criptográfica de autoría ha sido manipulada.',
      };
    }

    const footerNode = document.querySelector('app-footer footer') as HTMLElement | null;
    if (!footerNode || this.isFooterNodeTampered(footerNode)) {
      return {
        allowed: false,
        reason: 'Error de integridad: El pie de página original del autor es obligatorio y no puede eliminarse ni ocultarse.',
      };
    }

    return { allowed: true };
  }
}
