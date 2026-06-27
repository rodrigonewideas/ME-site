// Gera public/og-image.png (1200x630) a partir de scripts/og-image.svg.
// Uso (no servidor com node): npx --yes sharp-cli ... OU: node scripts/gen-og.mjs
// Requer sharp instalado (devDependency ou via npx).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(here, 'og-image.svg'));
const out = join(here, '..', 'public', 'og-image.png');

await sharp(svg, { density: 144 })
  .resize(1200, 630)
  .png({ quality: 90 })
  .toFile(out);

console.log('og-image.png gerado em', out);
