/**
 * Dev-only vault seeding. NOT part of a production build.
 *
 * vite.config.ts aliases this module to ./dev-seed.prod.ts for `vite build`,
 * so the fixtures never enter the production graph at all. That swap exists
 * because tree-shaking alone was not enough: `import.meta.env.DEV` dead-codes
 * the function body, but Rollup still kept tests/fixtures/artifacts.ts —
 * its top-level `new Map(...)` and `.reduce(...)` are not provably pure — and
 * all six fixtures were emitted into the shipped service worker.
 *
 * The DEV guard below is kept as well, so the fixtures cannot run even if the
 * alias is ever removed. tools/verify-dist.mjs asserts the outcome.
 *
 * Imports here MUST stay static: `import()` is disallowed in
 * ServiceWorkerGlobalScope by the HTML spec (w3c/ServiceWorker#1356), in
 * module workers too.
 */

import { readArtifacts, writeArtifacts } from '../lib/storage.ts';
import { ARTIFACT_FIXTURES } from '../../tests/fixtures/artifacts.ts';

/** Mirrors --l-danger in tokens.css; chrome.action cannot read CSS. */
const DEV_ERROR_BADGE_COLOR = '#A33A2A';

/**
 * Make a dev-mode failure impossible to miss.
 *
 * The seeding bug hid behind a correct-looking empty state — the same shape of
 * failure as the CSS regression: valid-looking but wrong. A toolbar badge costs
 * nothing, needs no UI, and is visible the moment the extension loads.
 */
async function flagDevFailure(summary: string, error?: unknown): Promise<void> {
  console.error(
    '[abrium] DEV SEEDING FAILED — the vault will look empty but should not be.\n' +
      `  ${summary}\n` +
      '  Dev-only path; production ships no fixtures.\n' +
      '  Check chrome://extensions → Errors, then reload the unpacked extension.',
    error ?? '',
  );
  try {
    await chrome.action.setBadgeText({ text: 'ERR' });
    await chrome.action.setBadgeBackgroundColor({ color: DEV_ERROR_BADGE_COLOR });
    await chrome.action.setTitle({ title: `Abrium dev: seeding failed — ${summary}` });
  } catch (badgeError) {
    console.error('[abrium] Could not raise the dev failure badge', badgeError);
  }
}

async function clearDevFailureFlag(): Promise<void> {
  try {
    await chrome.action.setBadgeText({ text: '' });
  } catch (error) {
    console.error('[abrium] Could not clear the dev badge', error);
  }
}

/**
 * Seed the same fixtures the state-matrix preview uses, so a freshly loaded
 * dev build has something real to review before capture exists.
 *
 * The write is READ BACK and counted rather than trusted. A throw is not the
 * only way to end up with an empty vault, and assuming otherwise is precisely
 * what let the previous failure pass unnoticed for three prompts.
 */
export async function seedDevFixtures(): Promise<void> {
  if (!import.meta.env.DEV) return;

  try {
    const existing = await readArtifacts();
    if (existing.length > 0) {
      // Never clobber real captures.
      await clearDevFailureFlag();
      console.info('[abrium] Vault already holds %d artifacts — not seeding', existing.length);
      return;
    }

    await writeArtifacts(ARTIFACT_FIXTURES);

    // Verify the outcome, not merely the absence of a throw.
    const seeded = await readArtifacts();
    if (seeded.length !== ARTIFACT_FIXTURES.length) {
      await flagDevFailure(
        `wrote ${ARTIFACT_FIXTURES.length} fixtures but read back ${seeded.length}`,
      );
      return;
    }

    await clearDevFailureFlag();
    console.info(
      '[abrium] Seeded %d dev fixtures: %s',
      seeded.length,
      seeded.map((artifact) => artifact.title).join(', '),
    );
  } catch (error) {
    await flagDevFailure('seeding threw before the vault could be populated', error);
  }
}
