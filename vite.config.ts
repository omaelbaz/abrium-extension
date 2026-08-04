import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' with { type: 'json' };

/**
 * Vite + @crxjs/vite-plugin.
 *
 * crxjs reads manifest.json, rewrites the TypeScript/HTML entry paths to their
 * built outputs, and emits a loadable MV3 bundle. Everything the extension
 * needs is bundled locally — JSZip included — because MV3's CSP forbids
 * loading script from a CDN.
 *
 * OUTPUT DIRECTORIES ARE SPLIT ON PURPOSE.
 *
 *   pnpm dev    → dist-dev/   (crxjs dev bundle; needs the Vite server running)
 *   pnpm build  → dist/       (self-contained production bundle)
 *
 * They used to share dist/, and that shipped a real bug: crxjs's dev bundle
 * replaces the side panel's index.html with a "CRXJS DEV MODE" stub that
 * carries NO stylesheet link and defers everything to localhost:5173. Loading
 * that unpacked renders the panel with zero CSS. Whichever command ran last
 * silently decided what chrome://extensions picked up. Separate directories
 * make that mistake impossible to make.
 */
export default defineConfig(({ command }) => {
  const buildTimestamp = JSON.stringify(new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC');
  return {
  define: {
    __BUILD_TIMESTAMP__: buildTimestamp,
  },
  plugins: [
    crx({ manifest }),

    /**
     * Vite tags emitted <script> and <link> with `crossorigin`, which puts
     * same-origin subresource requests into CORS mode. An extension page has
     * no need for it — the assets are its own — and CORS mode on
     * chrome-extension:// URLs is a known source of subtle load failures.
     * Dropping the attribute costs nothing and removes the failure class.
     */
    /**
     * Production builds get a no-op seeder, so tests/fixtures/artifacts.ts
     * never enters the graph.
     *
     * Tree-shaking was not sufficient on its own: `import.meta.env.DEV`
     * dead-codes the seeding function, but Rollup still retained the fixture
     * module — its top-level `new Map(...)` and `.reduce(...)` are not
     * provably pure — and emitted all six artifacts into the shipped service
     * worker. Swapping the module is deterministic where tree-shaking is a
     * hope. tools/verify-dist.mjs asserts the result.
     */
    {
      name: 'abrium:no-dev-seed-in-production',
      apply: 'build',
      enforce: 'pre',
      async resolveId(source, importer, options) {
        if (!/dev-seed\.ts$/.test(source) || /dev-seed\.prod\.ts$/.test(source)) return null;
        if (!importer) return null;
        return this.resolve('./dev-seed.prod.ts', importer, options);
      },
    },

    {
      name: 'abrium:strip-crossorigin',
      transformIndexHtml: {
        order: 'post',
        handler(html: string) {
          return html.replace(/\s+crossorigin(?=[\s>])/g, '');
        },
      },
    },
  ],

  // public/ is copied verbatim to the bundle root, so icons/ resolves as the
  // manifest declares it.
  publicDir: 'public',

  build: {
    outDir: command === 'serve' ? 'dist-dev' : 'dist',
    emptyOutDir: true,
    // Extension surfaces are small and load from disk; readable output is
    // worth more than the last few kilobytes during review.
    sourcemap: true,
    target: 'chrome114',

    // Vite's modulepreload polyfill calls fetch() on <link> hrefs. Those are
    // local chrome-extension:// chunks, not remote requests, but Chrome 114+
    // supports modulepreload natively — so dropping the polyfill removes the
    // only fetch() in the bundle and keeps "no network calls" checkable
    // against the built output, not just against src/.
    modulePreload: { polyfill: false },
  },

  server: {
    // crxjs serves HMR over a fixed port so the unpacked extension can find it.
    port: 5173,
    strictPort: true,
    hmr: { port: 5173 },
  },
};
});
