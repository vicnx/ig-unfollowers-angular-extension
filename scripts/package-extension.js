/**
 * Script de empaquetado de la extensión para release.
 *
 * Lee la versión de package.json, hace el build de producción
 * y genera un ZIP listo para adjuntar a la release de GitHub.
 *
 * Uso:
 *   npm run package
 *
 * Genera: instagram-unfollowers-v{version}.zip
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = packageJson.version;
const zipName = `instagram-unfollowers-v${version}.zip`;
const zipPath = path.join(rootDir, zipName);
const distPath = path.join(rootDir, 'dist');

console.log(`\n📦 Empaquetando extensión v${version}...\n`);

// 1. Build de producción
console.log('🔨 Ejecutando build de producción...');
try {
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.error('\n❌ Error durante el build. Empaquetado cancelado.');
  process.exit(1);
}

// 2. Verificar que existe la carpeta dist
if (!fs.existsSync(distPath)) {
  console.error('\n❌ No se encontró la carpeta dist/. Algo falló en el build.');
  process.exit(1);
}

// 3. Eliminar ZIP anterior si existe
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
  console.log(`🗑️  ZIP anterior eliminado: ${zipName}`);
}

// 4. Crear el ZIP usando el módulo nativo de Node (archiver si disponible, si no PowerShell)
try {
  // Intentar con PowerShell (disponible en Windows)
  const psCommand = `Compress-Archive -Path "${distPath}\\*" -DestinationPath "${zipPath}" -Force`;
  execSync(`powershell -Command "${psCommand}"`, { cwd: rootDir, stdio: 'inherit' });
  console.log(`\n✅ ZIP generado correctamente: ${zipName}`);
} catch (err) {
  // Fallback: intentar con zip nativo (Linux/macOS)
  try {
    execSync(`cd "${distPath}" && zip -r "${zipPath}" .`, { stdio: 'inherit', shell: true });
    console.log(`\n✅ ZIP generado correctamente: ${zipName}`);
  } catch (zipErr) {
    console.error('\n❌ No se pudo crear el ZIP. Instala la herramienta zip o usa PowerShell.');
    process.exit(1);
  }
}

// 5. Mostrar info del ZIP
const stats = fs.statSync(zipPath);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`📁 Tamaño: ${sizeMB} MB`);
console.log(`📍 Ubicación: ${zipPath}`);
console.log(`\n🚀 Listo para subir a la release de GitHub como:\n   ${zipName}\n`);
