import { defineConfig } from 'vitest/config';

/**
 * Unit tests only — colocated `*.test.ts` files next to the /lib and
 * /content modules they cover. The existing manual harnesses
 * (tools/extract-test.html, tools/dev-harness.html) are unaffected and
 * stay as the real-browser verification path; this config is for
 * automated, CI-runnable coverage of pure/near-pure logic.
 *
 * jsdom is the default environment: i18n.ts's hydrate() walks a DOM tree
 * and content/capture.ts registers a MutationObserver, so most test files
 * need document/DOM APIs even where the function under test is otherwise
 * pure.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
