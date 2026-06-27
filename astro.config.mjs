import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// TODO: trocar pelo dominio final em producao
const SITE = process.env.PUBLIC_SITE_URL || 'https://www.maloteeletronico.com.br';

export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  build: { inlineStylesheets: 'auto' },
});
