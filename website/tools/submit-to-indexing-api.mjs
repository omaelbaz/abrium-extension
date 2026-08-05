#!/usr/bin/env node
/**
 * Submit abrium.onl's pages to the Google Web Search Indexing API.
 *
 * DRY RUN BY DEFAULT. Nothing is sent unless you pass --live.
 *
 *   node tools/submit-to-indexing-api.mjs                       # list only
 *   node tools/submit-to-indexing-api.mjs --live --key=<path>   # submit
 *
 * The URL list is read from the sitemap the build itself emits
 * (dist/sitemap-index.xml -> dist/sitemap-N.xml), so it tracks Astro's
 * real routes. A hand-typed list would drift the first time a page is
 * added. Run `npm run build` first.
 *
 * The service account key path is never hardcoded — it is specific to one
 * machine, and `credentials/` is gitignored. Resolution order:
 *   1. --key=<path>
 *   2. $INDEXING_KEY_FILE
 *   3. $GOOGLE_APPLICATION_CREDENTIALS
 *   4. the single *.json inside <repo>/credentials/
 * The file is handed to google-auth-library as a path; its contents are
 * never read into a log line by this script.
 *
 * Requires the googleapis package, which is NOT a project dependency (it
 * would end up in Vercel's install for a script Vercel never runs):
 *   npm install --no-save googleapis
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIR = resolve(__dirname, '..');
const REPO_DIR = resolve(WEBSITE_DIR, '..');
const DIST_DIR = join(WEBSITE_DIR, 'dist');

// Indexing API quota is 200 URLs/day per project by default, and the
// endpoint is documented for JobPosting/BroadcastEvent pages — see the
// note printed at the end of a dry run.
const DELAY_MS = 600;
const MAX_ATTEMPTS = 3;
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

const LIVE = flag('live');
const HOST_OVERRIDE = value('host'); // e.g. --host=https://www.abrium.onl
const KEY_ARG = value('key');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fail(message, hint) {
  console.error(`\n  ERROR  ${message}`);
  if (hint) console.error(`         ${hint}`);
  process.exit(1);
}

/** Every <loc> in every sitemap the build emitted, read off disk. */
function collectUrls() {
  const indexPath = join(DIST_DIR, 'sitemap-index.xml');
  if (!existsSync(indexPath)) {
    fail(
      `No sitemap at ${indexPath}`,
      'Run `npm run build` in website/ first — the URL list comes from the build output.'
    );
  }

  const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

  // The index lists absolute URLs; the files sit beside it in dist/.
  const shards = locs(readFileSync(indexPath, 'utf8')).map((u) => join(DIST_DIR, basename(new URL(u).pathname)));

  const urls = [];
  for (const shard of shards) {
    if (!existsSync(shard)) fail(`Sitemap index references ${basename(shard)}, which is missing from dist/.`);
    urls.push(...locs(readFileSync(shard, 'utf8')));
  }

  const unique = [...new Set(urls)].sort();
  if (unique.length === 0) fail('The sitemap contained no <loc> entries.');

  if (!HOST_OVERRIDE) return unique;
  const origin = new URL(HOST_OVERRIDE).origin;
  return unique.map((u) => origin + new URL(u).pathname + new URL(u).search);
}

/** Locate the key file without ever hardcoding this machine's filename. */
function resolveKeyFile() {
  const candidate =
    KEY_ARG || process.env.INDEXING_KEY_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (candidate) {
    const path = resolve(candidate);
    if (!existsSync(path)) fail(`Key file not found: ${path}`);
    return path;
  }

  const dir = join(REPO_DIR, 'credentials');
  const found = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  if (found.length === 1) return join(dir, found[0]);
  if (found.length > 1) {
    fail(`credentials/ holds ${found.length} .json files — pass the right one with --key=<path>.`);
  }

  fail(
    'No service account key given.',
    'Pass --key=<path>, set $INDEXING_KEY_FILE, or drop the single .json into credentials/ (gitignored).'
  );
}

async function publish(indexing, url) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await indexing.urlNotifications.publish({
        requestBody: { url, type: 'URL_UPDATED' },
      });
      return { ok: true, at: res.data?.urlNotificationMetadata?.latestUpdate?.notifyTime };
    } catch (err) {
      const status = err?.response?.status ?? err?.code;
      const detail = err?.response?.data?.error?.message || err?.message || String(err);

      // Back off only on the transient statuses; a 403 means the service
      // account is not an owner of the property and retrying cannot fix it.
      if (RETRYABLE.has(Number(status)) && attempt < MAX_ATTEMPTS) {
        const wait = DELAY_MS * 2 ** attempt;
        console.log(`         ${status} — retrying in ${wait}ms (attempt ${attempt + 1}/${MAX_ATTEMPTS})`);
        await sleep(wait);
        continue;
      }
      return { ok: false, status, detail };
    }
  }
  return { ok: false, detail: 'exhausted retries' };
}

async function main() {
  const urls = collectUrls();

  console.log(`\n  Google Indexing API — URL_UPDATED`);
  console.log(`  Source: website/dist sitemap (${urls.length} URLs)`);
  if (HOST_OVERRIDE) console.log(`  Host override: ${new URL(HOST_OVERRIDE).origin}`);
  console.log(`  Mode:   ${LIVE ? 'LIVE — submitting' : 'DRY RUN — nothing will be sent'}\n`);

  if (!LIVE) {
    urls.forEach((u, i) => console.log(`  ${String(i + 1).padStart(2, ' ')}. ${u}`));
    console.log(`\n  ${urls.length} URLs would be submitted as URL_UPDATED.`);
    console.log(`  Re-run with --live --key=<path to service account json> to send them.`);
    console.log(`\n  Notes:`);
    console.log(`   · Default quota is 200 URLs/day per Cloud project.`);
    console.log(`   · Google documents this endpoint for JobPosting and BroadcastEvent`);
    console.log(`     pages. Other pages are accepted and commonly submitted, but the`);
    console.log(`     sitemap in Search Console remains the supported path for them.`);
    console.log(`   · The service account must be an Owner of the property in Search`);
    console.log(`     Console for the exact host these URLs use.\n`);
    return;
  }

  const keyFile = resolveKeyFile();
  console.log(`  Key:    ${basename(keyFile)} (contents never logged)\n`);

  let google;
  try {
    ({ google } = await import('googleapis'));
  } catch {
    fail('Cannot load the googleapis package.', 'Install it for this one-off run: npm install --no-save googleapis');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const indexing = google.indexing({ version: 'v3', auth });

  const failures = [];
  for (const [i, url] of urls.entries()) {
    const label = `  ${String(i + 1).padStart(2, ' ')}/${urls.length}`;
    const result = await publish(indexing, url);

    if (result.ok) {
      console.log(`${label}  OK    ${url}`);
    } else {
      console.log(`${label}  FAIL  ${url}`);
      console.log(`         ${result.status ?? '?'} ${result.detail}`);
      failures.push({ url, status: result.status, detail: result.detail });
    }

    if (i < urls.length - 1) await sleep(DELAY_MS);
  }

  const ok = urls.length - failures.length;
  console.log(`\n  Done — ${ok} succeeded, ${failures.length} failed, ${urls.length} total.`);
  if (failures.length) {
    console.log(`\n  Failures:`);
    for (const f of failures) console.log(`   · ${f.url}  →  ${f.status ?? '?'} ${f.detail}`);
    process.exitCode = 1;
  }
}

main().catch((err) => fail(err?.message || String(err)));
