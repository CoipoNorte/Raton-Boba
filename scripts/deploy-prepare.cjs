#!/usr/bin/env node
'use strict';
/**
 * Prepara el proyecto Raton Boba para GitHub Pages.
 *
 *   node scripts/deploy-prepare.cjs package   -> package.json (name, scripts, gh-pages)
 *   node scripts/deploy-prepare.cjs vite      -> vite.config.ts (base) + public/.nojekyll
 *
 * Es idempotente: ejecutarlo varias veces no cambia nada extra.
 * Para probarlo sobre una copia, define RB_PROJECT_ROOT=<carpeta>.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.env.RB_PROJECT_ROOT
  ? path.resolve(process.env.RB_PROJECT_ROOT)
  : process.cwd();

const PROJECT_NAME = 'raton-boba';
const BASE_PATH = '/Raton-Boba/';
const PREDEPLOY_SCRIPT = 'npm run build';
const DEPLOY_SCRIPT = 'gh-pages -d dist';
const GH_PAGES_VERSION = '^6.3.0';

function info(msg) {
  console.log('[deploy-prepare] ' + msg);
}

function fail(msg) {
  console.error('[deploy-prepare] ERROR: ' + msg);
  process.exit(1);
}

function absolute(rel) {
  return path.join(ROOT, rel);
}

function readRequired(rel) {
  const file = absolute(rel);
  if (!fs.existsSync(file)) {
    fail('No se encontró "' + rel + '" en ' + ROOT + '. Ejecuta el script desde la raíz del proyecto.');
  }
  return fs.readFileSync(file, 'utf8');
}

/** Escribe sólo si el contenido cambia (idempotencia). */
function writeIfChanged(rel, content) {
  const file = absolute(rel);
  const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (previous === content) {
    info(rel + ': ya estaba correcto.');
    return;
  }
  fs.writeFileSync(file, content, 'utf8');
  info(rel + ': actualizado.');
}

function preparePackage() {
  const rel = 'package.json';
  const raw = readRequired(rel);

  let pkg;
  try {
    pkg = JSON.parse(raw);
  } catch (err) {
    fail('package.json no es JSON válido: ' + err.message);
  }

  if (!pkg.scripts || typeof pkg.scripts !== 'object') {
    fail('package.json no tiene la sección "scripts".');
  }
  if (!pkg.scripts.build) {
    fail('package.json no tiene el script "build" necesario para publicar.');
  }

  pkg.name = PROJECT_NAME;
  pkg.scripts.predeploy = PREDEPLOY_SCRIPT;
  pkg.scripts.deploy = DEPLOY_SCRIPT;

  if (!pkg.devDependencies || typeof pkg.devDependencies !== 'object') {
    pkg.devDependencies = {};
  }
  const declared =
    (pkg.devDependencies && pkg.devDependencies['gh-pages']) ||
    (pkg.dependencies && pkg.dependencies['gh-pages']);
  if (!declared) {
    pkg.devDependencies['gh-pages'] = GH_PAGES_VERSION;
  }

  writeIfChanged(rel, JSON.stringify(pkg, null, 2) + '\n');

  // Verificación posterior a la escritura.
  const check = JSON.parse(readRequired(rel));
  if (check.name !== PROJECT_NAME) fail('La verificación de "name" falló.');
  if (check.scripts.predeploy !== PREDEPLOY_SCRIPT) fail('La verificación de "predeploy" falló.');
  if (check.scripts.deploy !== DEPLOY_SCRIPT) fail('La verificación de "deploy" falló.');
  info('package.json verificado: name=' + check.name + ', deploy="' + check.scripts.deploy + '".');
}

function prepareVite() {
  const rel = 'vite.config.ts';
  let src = readRequired(rel);

  const baseValue = /base\s*:\s*(['"`])[^'"`]*\1/;
  if (baseValue.test(src)) {
    src = src.replace(baseValue, "base: '" + BASE_PATH + "'");
  } else {
    const opener = /defineConfig\(\s*\{/;
    const match = opener.exec(src);
    if (!match) {
      fail('No se encontró "defineConfig({" en vite.config.ts. Añade base: \'' + BASE_PATH + '\' a mano.');
    }
    const insertAt = match.index + match[0].length;
    src = src.slice(0, insertAt) + "\n  base: '" + BASE_PATH + "'," + src.slice(insertAt);
  }

  writeIfChanged(rel, src);

  const check = readRequired(rel);
  if (check.indexOf("base: '" + BASE_PATH + "'") === -1) {
    fail('La verificación de base de Vite falló.');
  }
  info('vite.config.ts verificado: base=' + BASE_PATH);

  const publicDir = absolute('public');
  if (!fs.existsSync(publicDir)) {
    fail('No existe la carpeta public/. Vite necesita public/ para copiar .nojekyll.');
  }
  const nojekyll = path.join(publicDir, '.nojekyll');
  if (!fs.existsSync(nojekyll)) {
    fs.writeFileSync(nojekyll, '', 'utf8');
    info('public/.nojekyll creado.');
  } else {
    info('public/.nojekyll presente.');
  }
}

const mode = process.argv[2];
if (mode === 'package') {
  preparePackage();
} else if (mode === 'vite') {
  prepareVite();
} else {
  fail('Uso: node scripts/deploy-prepare.cjs <package|vite>');
}
info('Listo.');
