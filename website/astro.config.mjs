import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://abrium.onl',
  output: 'static',
  integrations: [sitemap({
    i18n: {
      defaultLocale: 'en',
      locales: {
        en: 'en',
        ar: 'ar',
        fr: 'fr',
        es: 'es',
        pt: 'pt'
      }
    }
  })],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'fr', 'es', 'pt'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
