// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Keep in sync with siteConfig.url in src/data/site.ts (a test enforces it).
  site: 'https://nodiwears.com',
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
