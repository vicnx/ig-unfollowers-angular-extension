/**
 * Script de sincronización y subida de versión SemVer (Semantic Versioning).
 *
 * Actualiza de forma atómica:
 * 1. package.json
 * 2. public/manifest.json
 * 3. src/app/constants/version.constants.ts
 * 4. src/app/core/security/integrity.service.ts (vector cifrado y checksum)
 *
 * Uso:
 *   node scripts/bump-version.js patch   (1.0.0 -> 1.0.1)
 *   node scripts/bump-version.js minor   (1.0.0 -> 1.1.0)
 *   node scripts/bump-version.js major   (1.0.0 -> 2.0.0)
 *   node scripts/bump-version.js 1.2.3   (versión explícita)
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const manifestJsonPath = path.join(rootDir, 'public', 'manifest.json');
const versionConstPath = path.join(rootDir, 'src', 'app', 'constants', 'version.constants.ts');
const integrityServicePath = path.join(rootDir, 'src', 'app', 'core', 'security', 'integrity.service.ts');
const readmePath = path.join(rootDir, 'README.md');

const arg = process.argv[2] || 'patch';

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version || '1.0.0';

function getNextVersion(current, type) {
  const parts = current.split('.').map(Number);
  if (parts.length < 3) return '1.0.0';

  if (type === 'major') {
    return `${parts[0] + 1}.0.0`;
  } else if (type === 'minor') {
    return `${parts[0]}.${parts[1] + 1}.0`;
  } else if (type === 'patch') {
    return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  } else if (/^\d+\.\d+\.\d+/.test(type)) {
    return type;
  } else {
    console.error(`Tipo de versión inválido: ${type}. Usa patch, minor, major o x.y.z`);
    process.exit(1);
  }
}

const newVersion = getNextVersion(currentVersion, arg);
console.log(`\n🚀 Subiendo versión SemVer: ${currentVersion} -> ${newVersion}\n`);

// 1. package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
console.log('✅ package.json actualizado');

// 2. public/manifest.json
const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
manifestJson.version = newVersion;
fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2) + '\n', 'utf8');
console.log('✅ public/manifest.json actualizado');

// 3. version.constants.ts
const versionConstContent = `/**
 * Constante global de versión de la aplicación según SemVer (Semantic Versioning).
 * Sincronizada automáticamente con package.json, public/manifest.json y documentación.
 */
export const APP_VERSION = '${newVersion}';
export const APP_NAME = '¿Quién me dejó de seguir? - Instagram Unfollowers';
export const APP_BUILD_DATE = '${new Date().toISOString().split('T')[0]}';
`;
fs.writeFileSync(versionConstPath, versionConstContent, 'utf8');
console.log('✅ src/app/constants/version.constants.ts actualizado');

// 4. integrity.service.ts
const key = [0x58, 0x45, 0x4e, 0x54, 0x45, 0x32, 0x30, 0x32, 0x36];
const versionString = `v${newVersion}`;
const encVerBytes = Array.from(Buffer.from(versionString, 'utf8')).map((b, i) => b ^ key[i % key.length]);

let integrityCode = fs.readFileSync(integrityServicePath, 'utf8');

// Reemplazar _cVer
integrityCode = integrityCode.replace(
  /private readonly _cVer = \[.*?\];/,
  `private readonly _cVer = [${encVerBytes.join(', ')}];`
);

// Calcular nuevo checksum
const cUrlMatch = integrityCode.match(/private readonly _cUrl = \[(.*?)\];/);
const cNickMatch = integrityCode.match(/private readonly _cNick = \[(.*?)\];/);
const cFullMatch = integrityCode.match(/private readonly _cFull = \[(.*?)\];/);
const cLabelMatch = integrityCode.match(/private readonly _cLabel = \[(.*?)\];/);

if (cUrlMatch && cNickMatch && cFullMatch && cLabelMatch) {
  const parseBytes = (str) => str.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const allBytes = [
    ...parseBytes(cUrlMatch[1]),
    ...parseBytes(cNickMatch[1]),
    ...parseBytes(cFullMatch[1]),
    ...parseBytes(cLabelMatch[1]),
    ...encVerBytes,
  ];
  const newChecksum = allBytes.reduce((acc, v) => acc + v, 0);

  integrityCode = integrityCode.replace(
    /private readonly _expectedChecksum = \d+;/,
    `private readonly _expectedChecksum = ${newChecksum};`
  );
  fs.writeFileSync(integrityServicePath, integrityCode, 'utf8');
  console.log(`✅ src/app/core/security/integrity.service.ts actualizado (Checksum: ${newChecksum})`);
}

// 5. README.md
if (fs.existsSync(readmePath)) {
  let readmeContent = fs.readFileSync(readmePath, 'utf8');
  readmeContent = readmeContent.replace(
    /img\.shields\.io\/badge\/version-[^-\s)]+-informational\.svg/,
    `img.shields.io/badge/version-${newVersion}-informational.svg`
  );
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  console.log('✅ README.md badge de versión actualizado');
}

console.log(`\n🎉 Versión ${newVersion} sincronizada exitosamente en todos los módulos.\n`);
