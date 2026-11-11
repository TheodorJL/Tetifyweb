// Před každým `firebase deploy` stáhne z živého webu stránku /changelog do složky changelog/.
// /changelog se staví a nasazuje každou noc z repa TheodorJL/Changelog (jen tahle cesta,
// zbytek webu nechává být). Bez tohohle kroku by ruční deploy /changelog smazal.
// Spouští ho "predeploy" ve firebase.json; složka changelog/ je v .gitignore.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIVE = 'https://tetify-d7f01.web.app/changelog';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'changelog');

async function get(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw Object.assign(new Error(`${res.status} ${url}`), { status: res.status });
  return Buffer.from(await res.arrayBuffer());
}

let manifest;
try {
  manifest = JSON.parse(await get(`${LIVE}/files.json`));
} catch (e) {
  if (e.status === 404) {
    console.log('changelog: na webu zatím není, nic nestahuju');
    process.exit(0);
  }
  console.error(`changelog: nepodařilo se stáhnout seznam souborů (${e.message}).`);
  console.error('Deploy by /changelog smazal, proto končím. Zkus to znovu, až bude síť.');
  process.exit(1);
}

rmSync(dir, { recursive: true, force: true });
const files = [...manifest.files, { path: 'files.json' }];
for (const f of files) {
  const path = normalize(f.path);
  if (path.startsWith('..') || path.startsWith('/')) throw new Error(`divná cesta ${f.path}`);
  const buf = f.path === 'files.json' ? Buffer.from(JSON.stringify(manifest, null, 1) + '\n') : await get(`${LIVE}/${f.path}`);
  if (f.sha256 && createHash('sha256').update(buf).digest('hex') !== f.sha256) {
    console.error(`changelog: ${f.path} se změnil během stahování, spusť deploy znovu.`);
    process.exit(1);
  }
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), buf);
}
console.log(`changelog: ${files.length} souborů z živého webu`);
