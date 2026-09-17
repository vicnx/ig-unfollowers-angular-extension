# ¿Quién me dejó de seguir? — Instagram Unfollowers

[![Docs](https://img.shields.io/badge/Documentación-GitHub%20Pages-blueviolet.svg)](https://vicnx.github.io/ig-unfollowers-angular-extension/)
[![Latest Release](https://img.shields.io/github/v/release/vicnx/ig-unfollowers-angular-extension?color=blue&label=Última%20versión)](https://github.com/vicnx/ig-unfollowers-angular-extension/releases)
[![Angular](https://img.shields.io/badge/Angular-18-dd0031.svg)](https://angular.dev)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](LICENSE)

Extensión de Chrome desarrollada en **Angular 18** que detecta, filtra y gestiona de forma segura quién no te sigue de vuelta en Instagram — sin consola, sin tokens externos y sin comprometer tu cuenta.

> 🌐 **Documentación completa:** [vicnx.github.io/ig-unfollowers-angular-extension](https://vicnx.github.io/ig-unfollowers-angular-extension/)

---

## ✨ Características

- **Auditoría completa** — Compara tus seguidos y seguidores directamente desde tu sesión activa de Instagram
- **Filtros avanzados** — Filtra por verificados, cuentas privadas, sin foto de perfil o seguidores mutuos
- **Lista Blanca** — Protege cuentas que nunca deben ser eliminadas; exportable e importable en JSON
- **Unfollow seguro** — Cadencia anti-bloqueo con presets configurables (Seguro / Equilibrado / Rápido)
- **Tiempo estimado** — Muestra el tiempo restante antes de iniciar y durante el proceso de unfollow
- **Exportación** — Descarga los resultados en CSV compatible con Excel y Google Sheets
- **100% privado** — Sin servidores externos. Todo se ejecuta en tu navegador con tu sesión activa

---

## 🚀 Instalación y uso

Descarga el ZIP de la [última release](https://github.com/vicnx/ig-unfollowers-angular-extension/releases). La guía incluye el proceso de instalación completo y un walkthrough visual de todas las funciones.

> 📖 [Documentación completa con imágenes →](https://vicnx.github.io/ig-unfollowers-angular-extension/)

---

## 🔒 Privacidad y seguridad

| Aspecto | Detalle |
|---|---|
| Ejecución | 100% local en tu navegador (client-side) |
| Credenciales | Nunca se solicitan usuario ni contraseña |
| Red | Utiliza únicamente la sesión activa de Instagram |
| Almacenamiento | `chrome.storage.local` — ningún dato sale del dispositivo |
| Integridad | Firma de autoría cifrada con máscara XOR multicapa |

---

## 🛠️ Stack técnico

- **Framework:** Angular 18 — Standalone Components, Signals, Computed values
- **Lenguajes:** TypeScript 5.5 · HTML5 semántico · Vanilla SCSS
- **Plataforma:** Chrome Extensions Manifest V3 · DeclarativeNetRequest · Chrome Storage API

### Comandos de desarrollo

```bash
npm run build        # Build de producción
npm run watch        # Build en modo watch
npm run package      # Genera el ZIP de release versionado
npm run version:patch / minor / major   # Bump de versión SemVer
```

---

## ⚖️ Aviso legal

Esta extensión es un proyecto de código abierto de uso personal. No está afiliada ni respaldada por Instagram o Meta Platforms, Inc. Su uso es responsabilidad exclusiva del usuario.

Distribuido bajo licencia [MIT](LICENSE).

---

Desarrollado por **[Xente](https://github.com/vicnx)**.
