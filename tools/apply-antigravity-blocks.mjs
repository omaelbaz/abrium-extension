/**
 * One-shot restore: pull the final page code out of antigravity-prompt.md and
 * write it to the 18 page files that lost their changes.
 *
 * Only the files in TARGETS are touched. i18n/ui.ts, lib/icons.ts and
 * components/pages/* are already correct and are explicitly excluded, even
 * though the document also contains blocks for them.
 */

import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOC = path.join(root, 'antigravity-prompt.md');
const WEBSITE = path.join(root, 'website');

/** Doc-relative paths (they are relative to website/). */
const TARGETS = new Set([
  'src/pages/index.astro',
  'src/pages/features.astro',
  'src/pages/faq.astro',
  'src/pages/download.astro',
  'src/pages/changelog.astro',
  'src/pages/terms.astro',
  'src/pages/privacy.astro',
  'src/pages/contact.astro',
  'src/pages/cookie-preferences.astro',
  'src/pages/[lang]/index.astro',
  'src/pages/[lang]/features.astro',
  'src/pages/[lang]/faq.astro',
  'src/pages/[lang]/download.astro',
  'src/pages/[lang]/changelog.astro',
  'src/pages/[lang]/terms.astro',
  'src/pages/[lang]/privacy.astro',
  'src/pages/[lang]/contact.astro',
  'src/pages/[lang]/cookie-preferences.astro',
]);

/** Never write these, whatever the document says. */
const FORBIDDEN = [/^src\/i18n\//, /^src\/lib\//, /^src\/components\//];

const doc = await readFile(DOC, 'utf8');
const lines = doc.split(/\r?\n/);

/** Parse every "**File:** `path`" section and its following fenced block. */
const blocks = new Map();
for (let i = 0; i < lines.length; i += 1) {
  const marker = /^\*\*File:\*\*\s+`([^`]+)`/.exec(lines[i]);
  if (!marker) continue;
  const target = marker[1];

  // Find the opening fence that follows.
  let open = i + 1;
  while (open < lines.length && !/^```/.test(lines[open])) open += 1;
  if (open >= lines.length) {
    console.error(`  no opening fence after marker for ${target}`);
    continue;
  }
  const fence = /^(`{3,})/.exec(lines[open])[1];

  // Closing fence = a line that is exactly the same run of backticks.
  let close = open + 1;
  while (close < lines.length && lines[close].trimEnd() !== fence) close += 1;
  if (close >= lines.length) {
    console.error(`  unterminated fence for ${target}`);
    continue;
  }

  blocks.set(target, lines.slice(open + 1, close).join('\n'));
}

console.log(`parsed ${blocks.size} block(s) from antigravity-prompt.md`);

let written = 0;
const missing = [];
for (const target of TARGETS) {
  if (FORBIDDEN.some((rule) => rule.test(target))) {
    console.error(`  REFUSING protected path: ${target}`);
    continue;
  }
  const body = blocks.get(target);
  if (body === undefined) {
    missing.push(target);
    continue;
  }
  const absolute = path.join(WEBSITE, target);
  await stat(path.dirname(absolute)); // fail loudly if the directory is wrong
  await writeFile(absolute, body.endsWith('\n') ? body : `${body}\n`, 'utf8');
  console.log(`  wrote ${String(body.length).padStart(6)}B  website/${target}`);
  written += 1;
}

if (missing.length > 0) {
  console.error(`\nMISSING from the document (${missing.length}):`);
  for (const target of missing) console.error(`  ${target}`);
  process.exit(1);
}

console.log(`\n${written}/${TARGETS.size} target files written`);
if (written !== TARGETS.size) process.exit(1);
