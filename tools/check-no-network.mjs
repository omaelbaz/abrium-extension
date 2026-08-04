/**
 * CI guard: no external network access anywhere in the extension source
 * (CLAUDE.md — Storage, and "Never send captured content anywhere").
 *
 * Fails on network primitives and on absolute http(s) URLs in code. Local
 * blob:/data:/file: URLs are fine — that is how downloads are produced — and
 * claude.ai appearing in the manifest's host_permissions is expected.
 *
 * Usage: node tools/check-no-network.mjs   (exit 1 on any finding)
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = ['src'];
const EXTENSIONS = new Set(['.ts', '.js', '.mjs', '.html', '.css']);

/**
 * The built bundle is scanned too when it exists, but only for network
 * primitives. Minified third-party code legitimately carries URLs in licence
 * banners and error strings (JSZip does both); a URL that is never passed to a
 * request API is not a network call, so flagging those would be noise.
 */
const DIST_DIR = 'dist';

const FORBIDDEN = [
  { name: 'fetch(', pattern: /\bfetch\s*\(/g },
  { name: 'XMLHttpRequest', pattern: /\bXMLHttpRequest\b/g },
  { name: 'WebSocket', pattern: /\bWebSocket\b/g },
  { name: 'EventSource', pattern: /\bEventSource\b/g },
  { name: 'sendBeacon', pattern: /\bsendBeacon\b/g },
  { name: 'importScripts', pattern: /\bimportScripts\s*\(/g },
  /**
   * Hosts allowed to appear as <a href> navigation targets. These are never
   * fetched — the primitive rules above are what enforce that, and they have no
   * exemptions. Any other absolute URL in src/ is still a failure.
   *   claude.ai    conversation link in the artifact detail view
   *   patreon.com  support link            (PLACEHOLDER — not a real page yet)
   *   github.com   open-source repo link   (PLACEHOLDER — repo not created yet)
   *   abrium.onl   changelog link          (PLACEHOLDER — page not built yet)
   */
  {
    name: 'remote URL',
    pattern: /["'`]https?:\/\/(?!claude\.ai|patreon\.com|github\.com|abrium\.onl)[^"'`\s]+/g,
  },
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      yield* walk(full);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

const findings = [];
let scanned = 0;

for (const dir of SCAN_DIRS) {
  for await (const file of walk(path.join(root, dir))) {
    scanned += 1;
    const source = await readFile(file, 'utf8');
    const lines = source.split('\n');
    for (const { name, pattern } of FORBIDDEN) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(source)) !== null) {
        const line = source.slice(0, match.index).split('\n').length;
        const text = (lines[line - 1] ?? '').trim();
        // A comment saying "no fetch here" is not a violation.
        if (/^\s*(\/\/|\*|<!--)/.test(text)) continue;
        findings.push({ file: path.relative(root, file), line, rule: name, text: text.slice(0, 90) });
      }
    }
  }
}

// --- built output: primitives only -----------------------------------------

const PRIMITIVES = FORBIDDEN.filter((rule) => rule.name !== 'remote URL');
let distScanned = 0;

try {
  for await (const file of walk(path.join(root, DIST_DIR))) {
    if (file.endsWith('.map')) continue;
    distScanned += 1;
    const source = await readFile(file, 'utf8');
    for (const { name, pattern } of PRIMITIVES) {
      pattern.lastIndex = 0;
      if (pattern.test(source)) {
        findings.push({
          file: path.relative(root, file),
          line: 0,
          rule: name,
          text: '(in built output)',
        });
      }
    }
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error; // dist/ simply not built yet
}

if (findings.length > 0) {
  console.error(`✗ network guard: ${findings.length} finding(s)\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  [${f.rule}]  ${f.text}`);
  }
  process.exit(1);
}

console.log(
  `✓ network guard: ${scanned} source files + ${distScanned} built files, no network access found`,
);
