# 🤖 Guía de Directrices y Buenas Prácticas para Agentes (AGENTS.md)

Este documento define los estándares arquitectónicos, buenas prácticas de código, directrices de seguridad y flujos de trabajo obligatorios para cualquier agente de IA o desarrollador que trabaje en el proyecto **¿Quién me dejó de seguir? — Instagram Unfollowers Extension**.

---

## 🎯 1. Filosofía del Proyecto
- **Simplicidad y claridad:** Código limpio, tipado estricto, sin redundancias y fácil de mantener.
- **Privacidad primero:** 100% ejecución en el navegador (client-side). Sin servidores externos, sin recolectar credenciales.
- **Protección de cuenta:** Estrategia anti-bloqueo para emular cadencia humana frente a la API de Instagram.
- **Protección de autoría:** Mecanismo anti-tampering cifrado para los créditos a Vicente Andani (`vicnx`).

---

## ⚡ 2. Estándares de Angular Moderno (Angular 18)

### 2.1 Componentes Standalone y Modularidad
- Todos los componentes deben ser **Standalone** (`standalone: true`). No se deben crear ni utilizar NgModules (`@NgModule`).
- **Separación estricta de archivos:** Cada componente debe tener sus 3 archivos separados:
  - `[component-name].component.html` (Estructura semántica)
  - `[component-name].component.scss` (Estilos encapsulados)
  - `[component-name].component.ts` (Lógica y estado reactivo)
- **Prohibido el uso de `CommonModule`:** En Angular 18, el nuevo control flow está integrado en el compilador. No importar `CommonModule` a menos que sea estrictamente necesario.

### 2.2 Control Flow Nativo (Obligatorio)
Bajo ninguna circunstancia se deben usar directivas estructurales antiguas:
- ❌ **NO USAR:** `*ngIf`, `*ngFor`, `*ngSwitch`
- ✅ **USAR SIEMPRE:**
  - `@if (condicion) { ... } @else if (...) { ... } @else { ... }`
  - `@for (item of coleccion(); track item.id) { ... } @empty { ... }`
  - `@switch (valor()) { @case ('a') { ... } @default { ... } }`

### 2.3 Reactividad con Signals
- Todo el estado reactivo debe manejarse mediante **Signals**:
  - Estado mutable: `readonly nombreSignal = signal<T>(valorInicial);`
  - Valores derivados: `readonly derivado = computed(() => funcionDeCalculo());`
  - Evitar el uso excesivo de `BehaviorSubject` o suscripciones manuales de RxJS en componentes cuando un Signal o Computed sea suficiente.

### 2.4 Inputs y Outputs Funcionales
- ❌ **NO USAR:** `@Input()` ni `@Output()` con `new EventEmitter()`.
- ✅ **USAR:**
  - `readonly user = input.required<UserNode>();`
  - `readonly count = input<number>(0);`
  - `readonly itemSelected = output<UserNode>();`
  - `readonly close = output<void>();`

---

## 🛡️ 3. Directrices de Extensiones de Chrome (Manifest V3)

### 3.1 Manejo de Imágenes y CDNs de Instagram
- Los servidores de Meta (`*.cdninstagram.com`, `*.fbcdn.net`) devuelven **HTTP 403 Forbidden** si detectan un encabezado `Referer` de extensión.
- **Regla obligatoria:** Toda etiqueta `<img>` que cargue imágenes externas debe incluir:
  ```html
  <img [src]="avatarSrc()" referrerpolicy="no-referrer" crossorigin="anonymous" (error)="onImageError($event)" />
  ```
- Mantener siempre las reglas `rules.json` de **DeclarativeNetRequest** activas en `manifest.json`.
- Disponer siempre de fallback autónomo en formato **Data URI SVG** para garantizar que la interfaz nunca muestre imágenes rotas.

### 3.2 Seguridad y Persistencia
- Utilizar `chrome.storage.local` con fallback transparente a `localStorage` (como está estructurado en `StorageService`).
- El botón flotante inyectado en `instagram.com` debe ubicarse **arriba a la derecha** (`top: 20px !important; right: 24px !important;`) y ocultarse suavemente cuando el panel lateral deslizable esté abierto.

---

## 🔒 4. Seguridad de Autoría y Anti-Tampering
- Los créditos de autoría a **Vicente Andani (`vicnx` / `Xente`)** están protegidos en `src/app/core/security/integrity.service.ts` mediante máscara simétrica XOR multicapa.
- **Regla:** No incluir cadenas en texto plano con el nombre o URLs de GitHub en el HTML ni en los templates.
- **Handshake obligatorio:** El escáner (`ScannerService`) debe verificar la integridad física y criptográfica del footer antes de ejecutar `startScan()` o `startUnfollow()`.

---

## 🏷️ 5. Gestión de Versiones SemVer (Semantic Versioning)

El proyecto sigue el estándar **SemVer** (`MAJOR.MINOR.PATCH`):
- `MAJOR`: Cambios incompatibles o reestructuración nuclear.
- `MINOR`: Nuevas funcionalidades o mejoras compatibles hacia atrás.
- `PATCH`: Corrección de errores, parches de seguridad o ajustes menores de estilo.

### 5.1 Ubicación Central de la Versión
La versión se define en:
- `src/app/constants/version.constants.ts` (`APP_VERSION = '1.0.0'`)
- `package.json` (`"version": "1.0.0"`)
- `public/manifest.json` (`"version": "1.0.0"`)
- `README.md` (Badge de versión oficial)

### 5.2 Scripts de Subida de Versión
Para subir la versión de forma sincronizada y automática (incluyendo la actualización del checksum de seguridad):
```bash
npm run version:patch   # Sube el parche (ej. 1.0.0 -> 1.0.1)
npm run version:minor   # Sube la versión menor (ej. 1.0.0 -> 1.1.0)
npm run version:major   # Sube la versión mayor (ej. 1.0.0 -> 2.0.0)
```

---

## 📝 6. Regla de Recomendación de Commits (Obligatoria)

> 🚫 **PROHIBICIÓN ESTRICTA DE COMMITS AUTOMÁTICOS:**
> El agente **NUNCA** debe ejecutar `git commit` ni `git push` bajo ningún concepto. El control del historial y la decisión de confirmar los cambios pertenece única y exclusivamente al usuario.
>
> **REGLA OBLIGATORIA PARA EL ASISTENTE:**
> Al finalizar **CADA** cambio, refactorización o nueva característica, el agente **SOLO DEBE MOSTRAR EL MENSAJE DE COMMIT** (sin comandos de consola como `git commit` ni `git add`).
> 
> El mensaje debe seguir el formato **Conventional Commits**, estar redactado en **inglés** e incluir el **emoji** correspondiente.

### Tabla de Tipos y Emojis de Commits:
| Tipo | Emoji | Propósito | Mensaje de Ejemplo |
| :--- | :---: | :--- | :--- |
| `feat` | ✨ | Nueva característica o funcionalidad | `✨ feat(scanner): add instant search filter by username` |
| `fix` | 🐛 | Corrección de errores o bugs | `🐛 fix(avatar): resolve 403 error on Instagram CDN images` |
| `security` | 🔒 | Mejoras de seguridad, anti-tampering o gitignore | `🔒 security(integrity): protect author footer with XOR cipher` |
| `refactor` | ♻️ | Refactorización de código sin alterar comportamiento | `♻️ refactor(components): migrate to Angular 18 control flow (@if, @for)` |
| `style` | 🎨 | Estilos, diseño, CSS, animaciones | `🎨 style(header): modernize floating launcher button position` |
| `docs` | 📝 | Documentación, README o GitHub Pages | `📝 docs(readme): add installation guide and GitHub Pages links` |
| `perf` | ⚡ | Mejoras de rendimiento o reducción de bundle | `⚡ perf(bundle): remove CommonModule to reduce dist size` |
| `chore` | 📦 | Tareas de mantenimiento, dependencias o SemVer | `📦 chore(release): bump version to 1.0.1 with SemVer script` |

---

## 🛠️ 7. Protocolo de Verificación Pre-Entrega
Antes de dar por completado cualquier requerimiento:
1. Ejecutar `npm run build` y asegurar que termine con código 0 y sin advertencias de compilación.
2. Verificar que no se hayan introducido dependencias o archivos innecesarios.
3. Asegurar que los cambios en archivos compilados queden reflejados en la carpeta `dist/`.
4. Proporcionar únicamente el mensaje de commit sugerido (sin comandos).
