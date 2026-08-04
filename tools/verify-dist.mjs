/**
 * Gate on the BUILT bundle, run as the last step of `pnpm build`.
 *
 * This exists because a real Load Unpacked test found the side panel rendering
 * with zero CSS, and every check at the time passed: dev-harness.html serves
 * source through Vite, preview:states renders templates to a standalone file,
 * and neither one opens dist/. The bundle Chrome actually loads was unverified.
 *
 * Asserts that dist/ is a self-contained production bundle:
 *   - it is not a crxjs DEV MODE stub
 *   - every manifest-declared entry exists on disk
 *   - every HTML page links a stylesheet, and that stylesheet is real
 *   - nothing points at a dev server
 *
 * Exit 1 on any failure.  node tools/verify-dist.mjs
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const failures = [];
const checks = [];

function check(label, ok, detail = '') {
  checks.push({ label, ok, detail });
  if (!ok) failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
}

async function exists(relative) {
  try {
    await stat(path.join(dist, relative));
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

/* --- manifest -------------------------------------------------------------- */

let manifest;
try {
  manifest = JSON.parse(await readFile(path.join(dist, 'manifest.json'), 'utf8'));
} catch (error) {
  console.error('✗ dist/manifest.json is missing or unparseable — did `pnpm build` run?');
  console.error(`  ${error.message}`);
  process.exit(1);
}

check('manifest is MV3', manifest.manifest_version === 3);
check(
  'host_permissions scoped to claude.ai',
  JSON.stringify(manifest.host_permissions) === JSON.stringify(['https://claude.ai/*']),
  JSON.stringify(manifest.host_permissions),
);
for (const permission of ['storage', 'unlimitedStorage', 'sidePanel']) {
  check(`permission "${permission}"`, (manifest.permissions ?? []).includes(permission));
}

/* --- declared entry points all exist --------------------------------------- */

const htmlPages = [];

const sidePanelPath = manifest.side_panel?.default_path;
check('side_panel.default_path declared', Boolean(sidePanelPath));
if (sidePanelPath) {
  check(`side_panel file exists (${sidePanelPath})`, await exists(sidePanelPath));
  htmlPages.push(sidePanelPath);
}

// Every HTML surface the manifest can open must be checked, not just the first
// one built. The popup is a separate chrome://extensions surface with its own
// entry chunk and its own stylesheet links.
const popupPath = manifest.action?.default_popup;
check('action.default_popup declared', Boolean(popupPath));
if (popupPath) {
  check(`popup file exists (${popupPath})`, await exists(popupPath));
  htmlPages.push(popupPath);
}

const worker = manifest.background?.service_worker;
check('background.service_worker declared', Boolean(worker));
if (worker) check(`service worker exists (${worker})`, await exists(worker));

for (const entry of manifest.content_scripts ?? []) {
  for (const js of entry.js ?? []) {
    check(`content script exists (${js})`, await exists(js));
  }
}

for (const [size, file] of Object.entries(manifest.icons ?? {})) {
  check(`icon ${size} exists`, await exists(file), file);
}

check('default_locale set', Boolean(manifest.default_locale));
check(
  `_locales/${manifest.default_locale}/messages.json exists`,
  await exists(path.join('_locales', manifest.default_locale ?? 'en', 'messages.json')),
);

/* --- every __MSG_ key resolves in every shipped locale --------------------- */

const msgKeys = [...new Set([...JSON.stringify(manifest).matchAll(/__MSG_([a-z_]+)__/g)].map((m) => m[1]))];
let localeDirs = [];
try {
  localeDirs = await readdir(path.join(dist, '_locales'));
} catch {
  /* reported by the default_locale check above */
}
for (const locale of localeDirs) {
  try {
    const table = JSON.parse(
      await readFile(path.join(dist, '_locales', locale, 'messages.json'), 'utf8'),
    );
    const missing = msgKeys.filter((key) => !table[key]);
    check(`_locales/${locale} resolves all __MSG_ keys`, missing.length === 0, missing.join(', '));
  } catch (error) {
    check(`_locales/${locale} readable`, false, error.message);
  }
}

/* --- the CSS regression this file exists to catch -------------------------- */

for (const page of htmlPages) {
  let html;
  try {
    html = await readFile(path.join(dist, page), 'utf8');
  } catch (error) {
    check(`${page} readable`, false, error.message);
    continue;
  }

  // crxjs's dev bundle replaces the page with a stub that has no stylesheet.
  check(
    `${page} is a production page, not a CRXJS DEV MODE stub`,
    !html.includes('CRXJS DEV MODE'),
    'run `pnpm build` — dist/ currently holds a dev bundle',
  );

  const hrefs = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)]
    .map((tag) => /href=["']([^"']+)["']/i.exec(tag[0])?.[1])
    .filter(Boolean);

  check(`${page} links at least one stylesheet`, hrefs.length > 0);

  // Vite code-splits CSS, so the design system can live in a shared chunk while
  // the screen's own rules sit in another. The tokens must therefore be present
  // across the page's stylesheets COLLECTIVELY, not in each one.
  let combined = '';
  for (const href of hrefs) {
    check(`${page} stylesheet is local (${href})`, !/^https?:/i.test(href));
    const onDisk = path.join(dist, href.replace(/^\//, ''));
    let css = '';
    try {
      css = await readFile(onDisk, 'utf8');
    } catch {
      check(`stylesheet exists on disk (${href})`, false, onDisk);
      continue;
    }
    check(`stylesheet exists on disk (${href})`, true);
    check(`stylesheet is non-empty (${href})`, css.length > 0, `${css.length} bytes`);
    combined += css;
  }

  // A page whose stylesheets load but lost the design system is the same bug
  // as a page with no stylesheet at all.
  check(
    `${page} stylesheets carry the design tokens`,
    combined.includes('--color-accent') && combined.includes('.abr-card'),
    `${combined.length} bytes of CSS linked`,
  );

  for (const preload of [...html.matchAll(/<link[^>]+rel=["']modulepreload["'][^>]*>/gi)]
    .map((tag) => /href=["']([^"']+)["']/i.exec(tag[0])?.[1])
    .filter(Boolean)) {
    check(`${page} modulepreload exists (${preload})`, await exists(preload.replace(/^\//, '')));
  }

  for (const src of [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1])) {
    check(`${page} script is local (${src})`, !/^https?:/i.test(src));
    check(`script exists on disk (${src})`, await exists(src.replace(/^\//, '')));
  }
}

/* --- dev-only material must never reach production -------------------------
   The seeding bug was invisible because an empty vault looks like a correct
   empty state. Its fix imports fixtures statically, which then leaked all six
   into the shipped worker until the build swapped the module out. Both halves
   are asserted here so neither can regress quietly. */

const FIXTURE_MARKERS = ['art_01H8X', 'Onboarding flow diagram', 'Pricing table with annual'];
const leaked = [];
for await (const file of walk(dist)) {
  if (file.endsWith('.map')) continue;
  if (!/\.(js|html|css|json)$/.test(file)) continue;
  const body = await readFile(file, 'utf8');
  if (FIXTURE_MARKERS.some((marker) => body.includes(marker))) {
    leaked.push(path.relative(dist, file));
  }
}
check(
  'no dev fixture data in production bundle',
  leaked.length === 0,
  leaked.length > 0 ? `${leaked.join(', ')} — is the dev-seed swap still wired in vite.config.ts?` : '',
);

/* --- nothing may point at a dev server ------------------------------------- */

const devRefs = [];
for await (const file of walk(dist)) {
  if (file.endsWith('.map')) continue;
  if (!/\.(js|html|css|json)$/.test(file)) continue;
  const body = await readFile(file, 'utf8');
  if (/localhost:\d+|127\.0\.0\.1:\d+/.test(body)) devRefs.push(path.relative(dist, file));
}
check('no dev-server references in dist/', devRefs.length === 0, devRefs.join(', '));

/* --- report ---------------------------------------------------------------- */

if (failures.length > 0) {
  console.error(`✗ dist verification failed — ${failures.length} problem(s):\n`);
  for (const failure of failures) console.error(`  • ${failure}`);
  console.error('\n  dist/ is NOT safe to load unpacked.');
  process.exit(1);
}

console.log(`✓ dist verification: ${checks.length} checks passed — dist/ is loadable unpacked`);
