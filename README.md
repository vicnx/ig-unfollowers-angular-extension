# 📱 ¿Quién me dejó de seguir? — Instagram Unfollowers Extension

[![GitHub Pages](https://img.shields.io/badge/Web%20Docs-GitHub%20Pages-blueviolet.svg)](https://vicnx.github.io/ig-unfollowers-angular-extension/)
[![Releases](https://img.shields.io/github/v/release/vicnx/ig-unfollowers-angular-extension?color=blue&label=Versi%C3%B3n)](https://github.com/vicnx/ig-unfollowers-angular-extension/releases)
[![Framework](https://img.shields.io/badge/Angular-18%20(Standalone%20%2B%20Signals)-dd0031.svg)](https://angular.dev)
[![Manifest](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintenance-Yes%20(2026)-success.svg)](https://github.com/vicnx)

Una extensión moderna y segura para Google Chrome y navegadores Chromium (Brave, Edge, Opera) desarrollada en **Angular 18**, diseñada para detectar con precisión quién no te sigue de vuelta en Instagram sin necesidad de copiar ni pegar código en la consola de desarrollador.

🌐 **Guía web y documentación visual:** [https://vicnx.github.io/ig-unfollowers-angular-extension/](https://vicnx.github.io/ig-unfollowers-angular-extension/)

<u>¡100% Privada, basada en tu sesión actual de navegador y sin enviar contraseñas a servidores externos!</u>
---

## 🚀 Instalación Rápida (Chrome / Brave / Edge)

Tienes dos formas sencillas de instalar la extensión en tu navegador:

### Opción A: Descargar archivo ZIP precompilado (Recomendado)
1. Ve a la sección de [Releases de GitHub](https://github.com/vicnx/ig-unfollowers-angular-extension/releases).
2. Descarga el archivo `ig-unfollowers-extension.zip` de la última versión.
3. Descomprime el archivo en una carpeta de tu ordenador.
4. Abre tu navegador y dirígete a: `chrome://extensions/` (o `edge://extensions/`, `brave://extensions/`).
5. Activa el interruptor **"Modo de desarrollador"** en la esquina superior derecha.
6. Haz clic en **"Cargar descomprimida"** (*Load unpacked*) y selecciona la carpeta descomprimida.

### Opción B: Clonar y compilar tú mismo
1. Clona este repositorio:
   ```bash
   git clone https://github.com/vicnx/ig-unfollowers-angular-extension.git
   cd ig-unfollowers-angular-extension
   ```
2. Instala dependencias y compila:
   ```bash
   npm install
   npm run build
   ```
3. Abre `chrome://extensions/`, activa el **Modo de desarrollador**, pulsa en **"Cargar descomprimida"** y selecciona la carpeta `dist/`.

---

## 🖥️ Modo de Uso

1. **Abre Instagram**: Ve a [instagram.com](https://www.instagram.com/) e inicia sesión con tu cuenta normalmente.
2. **Botón Flotante Superior Derecho**: Verás un botón circular flotante con degradado nativo de Instagram en la **esquina superior derecha**.
3. **Panel Lateral Deslizable**: Haz clic en el botón flotante (o en el icono de la extensión en la barra de herramientas) para desplegar el panel lateral con diseño Dark Mode de Instagram.
4. **Comenzar Auditoría**: Pulsa el botón principal **"Comenzar Auditoría"** para iniciar el análisis automático.
5. **Explora los Resultados**:
   - Visualiza avatares en alta resolución con nombres de usuario, nombres completos y enlaces directos a sus perfiles.
   - Filtra al instante por:
     - 🛡️ **Verificados** (cuentas oficiales con insignia azul).
     - 🔒 **Privadas** (cuentas con candado).
     - 👤 **Sin Foto de Perfil** (cuentas sin imagen personalizada).
     - 🔄 **No-Seguidores vs Seguidores Mutuos**.
6. ⭐ **Lista Blanca (Protección)**:
   - Haz clic en la estrella de cualquier tarjeta para protegerla en tu **Lista Blanca**. Las cuentas en lista blanca jamás serán seleccionadas ni eliminadas por error.
7. 💾 **Gestión de Lista Blanca (Ajustes)**:
   - **Exportar:** Guarda una copia de seguridad en JSON de tus cuentas protegidas.
   - **Importar:** Restaura o fusiona tu lista blanca en cualquier momento.
   - **Vaciar:** Limpia tu lista blanca con un clic.
   - *Tu lista blanca se sincroniza automáticamente en `chrome.storage.local` entre sesiones.*
8. ✅ **Selección Masiva o Individual**:
   - Selecciona cuentas una por una, por página actual o todas las mostradas.
   - Usa los selectores rápidos para marcar automáticamente solo las que cumplan condiciones concretas.
9. ⚡ **Dejar de Seguir (Unfollow Seguro)**:
   - Pulsa **"Dejar de seguir seleccionados"**.
   - Se abrirá una vista de cola en vivo con barra de progreso, pausas y estados en tiempo real.
10. ⚙️ **Configuración de Tiempos Anti-Baneo**:
    - En el modal de ajustes puedes calibrar los segundos entre solicitudes y pausas largas automáticas cada 5 bajas para proteger tu cuenta de bloqueos de acción de Instagram.
11. 📊 **Exportación a CSV**:
    - Descarga el listado completo de no-seguidores en formato CSV compatible con Excel y Google Sheets.

---

## 🔒 Privacidad y Seguridad

- **100% En Tu Navegador (Client-Side Only):** No hay servidores intermedios ni bases de datos remotas. Todo el procesamiento se realiza localmente en tu ordenador.
- **Sin Credenciales:** La extensión nunca te pedirá tu usuario ni tu contraseña; utiliza de forma segura la sesión y cookies que ya tienes activas en Instagram.
- **Protección Anti-Hotlinking de Imágenes:** Incorpora políticas de `no-referrer` y reglas de red DeclarativeNetRequest en Manifest V3 para mostrar las fotos de perfil reales de Instagram evitando bloqueos 403 Forbidden.
- **Protección Anti-Bypass y Cifrado:** Todos los créditos de autoría y firmas de integridad están cifrados en memoria mediante máscaras simétricas XOR multicapa para garantizar la autenticidad del proyecto original.

---

## ⚡ Notas de Rendimiento y Prevención de Bloqueos

- El tiempo total de escaneo dependerá de la cantidad de personas que sigas y de tus seguidores.
- La extensión aplica tiempos de espera aleatorizados (pacing humano) y pausas de seguridad recomendadas para emular el comportamiento de un usuario real.
- Puedes pausar y reanudar el proceso en cualquier momento con el botón **Pausar/Reanudar**.
- La lista blanca y configuraciones personalizadas se almacenan localmente y persisten al cerrar el navegador.

---

## ✨ Características Principales

- 🔍 **Auditoría rápida y fiable** de seguidores y no-seguidores en Instagram.
- 🎨 **Estética Premium Instagram Dark Mode** con transiciones fluidas, badges oficiales y tipografía cuidada.
- 📌 **Botón flotante no intrusivo** en la esquina superior derecha con drawer deslizable.
- ⭐ **Sistema robusto de Lista Blanca** con soporte de importación/exportación JSON.
- 🛡️ **Filtros avanzados en vivo** (verificados, cuentas privadas, cuentas sin foto).
- ⏱️ **Ajustes de cadencia anti-baneo** personalizables (retrasos entre ciclos y pausas largas).
- 📤 **Exportación a CSV** con un solo clic.
- 🚦 **Monitoreo en vivo de bajas** con registro detallado de éxitos y errores.
- 📱 **Diseño 100% responsivo y adaptable**.

---

## 🛠️ Tecnologías y Desarrollo

Este proyecto está construido con los estándares modernos de desarrollo web y extensiones de navegador:

- **Framework:** [Angular 18](https://angular.dev/) (Standalone Components, Signals reactivos, Computed values)
- **Lenguajes:** TypeScript 5.5, HTML5 Semántico, Vanilla SCSS
- **Plataforma:** Google Chrome Extensions (Manifest V3, DeclarativeNetRequest, Chrome Storage API)
- **Node.js:** Versión 18 o superior recomendada

### Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Compilar proyecto y empaquetar extensión para producción
npm run build

# Compilación continua con recarga automática
npm run watch

# Probar servidor local de desarrollo
npm start
```

Los archivos finales listos para instalar se generan automáticamente en la carpeta `dist/`.

---

## ⚖️ Aviso Legal y Licencia

**Aviso Legal (Disclaimer):** Esta extensión es una herramienta de código abierto y uso educativo. No está afiliada, asociada, autorizada, respaldada ni conectada de ninguna manera oficial con Instagram, Meta Platforms, Inc., ni con ninguna de sus subsidiarias o filiales. El uso de esta herramienta corre bajo la exclusiva responsabilidad de cada usuario.

📜 Distribuido bajo la Licencia [MIT](LICENSE).

---

Creado con ❤️ por **[Xente](https://github.com/vicnx)**.
