// Recalcula os hashes sha256 dos scripts inline para a diretiva CSP script-src.
// Rode APOS cada `npm run build` que altere JS inline (seus scripts ou upgrade do Astro):
//   node scripts/csp-hashes.mjs
// Cole a linha "script-src ..." impressa no infra/nginx-malote-site.conf.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'dist', 'index.html'), 'utf8');

const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
const hashes = [];
let m;
while ((m = re.exec(html))) {
  if (/\bsrc=/.test(m[1])) continue; // scripts externos sao cobertos por 'self'
  hashes.push("'sha256-" + createHash('sha256').update(m[2], 'utf8').digest('base64') + "'");
}

console.log(`${hashes.length} script(s) inline encontrados.\n`);
console.log("script-src 'self' " + hashes.join(' ') + ';');
