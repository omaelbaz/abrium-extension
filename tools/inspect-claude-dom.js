/**
 * claude.ai DOM inspector — paste into the DevTools console ON a claude.ai
 * conversation page that has a few artifacts open.
 *
 * WHY THIS EXISTS
 * The selector VALUES in src/lib/extract.ts were written without access to a
 * live claude.ai session, so they are informed guesses. This script reports
 * what is actually there and prints a ready-to-paste replacement.
 *
 * WHAT IT DOES / DOES NOT DO
 *  - Reads only STRUCTURE: tag names, data-* / role / aria-* attribute names
 *    and values, and how many nodes each candidate selector matches.
 *  - Prints at most a 120-character preview of any source block, purely so you
 *    can tell code from prose. It does not collect, upload or store anything —
 *    there is no network call in this file. Everything stays in your console.
 *  - If a preview would still show something you would rather not paste back,
 *    just send me the SELECTOR REPORT section and omit the previews.
 *
 * HOW TO USE
 *  1. Open a claude.ai conversation with 2–3 artifacts of different kinds
 *     (a code block, an HTML or SVG one, a document).
 *  2. Open the artifact panel so the artifacts are mounted in the DOM.
 *  3. DevTools → Console → paste this whole file → Enter.
 *  4. Copy the output back to me, or paste the printed SELECTORS block
 *     straight into src/lib/extract.ts.
 */

(() => {
  const CANDIDATES = {
    artifactContainer: [
      '[data-testid="artifact-panel"]',
      '[data-testid="artifact"]',
      '[data-artifact-id]',
      'div[role="dialog"][aria-label*="rtifact"]',
      'div[aria-label*="rtifact"]',
    ],
    title: [
      '[data-testid="artifact-title"]',
      'h1, h2, h3',
      '[aria-label][role="heading"]',
      'header [class*="title"]',
    ],
    source: [
      '[data-testid="artifact-code"] pre',
      '[data-testid="code-block"] code',
      'pre code',
      'pre',
    ],
    sourceTab: [
      '[data-testid="artifact-code-tab"]',
      'button[role="tab"][aria-label*="ode"]',
      'button[role="tab"]',
    ],
    languageLabel: ['[data-testid="artifact-language"]', '[data-language]', '[class*="language-"]'],
  };

  const out = [];
  const say = (line = '') => out.push(line);

  say('==================== ABRIUM DOM REPORT ====================');
  say('url            : ' + location.href.replace(/\/chat\/[^/?#]+/, '/chat/<redacted>'));
  say('conversation id: ' + (/\/chat\/([A-Za-z0-9_-]+)/.exec(location.pathname)?.[1] ? 'FOUND (matches expected shape)' : 'NOT FOUND — extract.ts cannot build a link'));
  say('');

  /* ---- 1. do the current guesses match anything? ---- */
  say('---- SELECTOR REPORT (what extract.ts currently expects) ----');
  for (const [target, list] of Object.entries(CANDIDATES)) {
    say(target + ':');
    for (const selector of list) {
      let count = 0;
      try { count = document.querySelectorAll(selector).length; } catch { count = -1; }
      const mark = count > 0 ? 'MATCH' : count === 0 ? '  -  ' : 'ERROR';
      say('  [' + mark + '] ' + String(count).padStart(4) + '  ' + selector);
    }
  }
  say('');

  /* ---- 2. every data-testid on the page: the strongest signal ---- */
  const testids = new Map();
  for (const element of document.querySelectorAll('[data-testid]')) {
    const value = element.getAttribute('data-testid');
    testids.set(value, (testids.get(value) ?? 0) + 1);
  }
  say('---- ALL data-testid VALUES ON THIS PAGE (' + testids.size + ' distinct) ----');
  if (testids.size === 0) {
    say('  (none — claude.ai may not ship testids in production; rely on role/aria)');
  } else {
    for (const [value, count] of [...testids].sort((a, b) => b[1] - a[1])) {
      say('  ' + String(count).padStart(4) + '  ' + value);
    }
  }
  say('');

  /* ---- 3. discover artifact-ish containers from the source blocks up ---- */
  say('---- DISCOVERED CONTAINERS (walking up from each <pre>) ----');
  const blocks = [...document.querySelectorAll('pre')];
  say('found ' + blocks.length + ' <pre> block(s)');
  say('');

  blocks.slice(0, 8).forEach((block, index) => {
    say('[' + (index + 1) + '] <pre> preview: ' +
      JSON.stringify((block.textContent || '').trim().slice(0, 120)));

    const code = block.querySelector('code');
    if (code) say('     <code> class: ' + JSON.stringify(code.className || '(none)'));

    let node = block.parentElement;
    let depth = 0;
    while (node && depth < 10) {
      const interesting = [...node.attributes]
        .filter((a) => a.name.startsWith('data-') || a.name === 'role' || a.name.startsWith('aria-'))
        .map((a) => a.name + '=' + JSON.stringify(a.value.slice(0, 60)));
      if (interesting.length > 0) {
        say('     ^' + String(depth + 1).padStart(2) + ' <' + node.tagName.toLowerCase() + '> ' +
          interesting.join('  '));
      }
      node = node.parentElement;
      depth += 1;
    }
    say('');
  });

  /* ---- 4. how many artifacts does the page think it has? ---- */
  say('---- HEADINGS NEAR SOURCE BLOCKS (title candidates) ----');
  blocks.slice(0, 8).forEach((block, index) => {
    let node = block.parentElement;
    let found = null;
    let depth = 0;
    while (node && depth < 8 && !found) {
      found = node.querySelector('h1, h2, h3, [role="heading"]');
      node = node.parentElement;
      depth += 1;
    }
    say('[' + (index + 1) + '] ' + (found
      ? '<' + found.tagName.toLowerCase() + '> ' + JSON.stringify((found.textContent || '').trim().slice(0, 60))
      : '(no heading found within 8 ancestors — title would fall back)'));
  });
  say('');

  /* ---- 5. a ready-to-paste starting point ---- */
  const bestContainer = [...testids.keys()].filter((v) => /artifact/i.test(v));
  say('---- SUGGESTED SELECTORS BLOCK ----');
  if (bestContainer.length > 0) {
    say('artifactContainer candidates seen on this page:');
    for (const value of bestContainer) say("  '[data-testid=\"" + value + "\"]',");
  } else {
    say('No artifact-ish data-testid found. Use the ^N lines in section 3 to');
    say('pick the outermost element that wraps exactly one artifact, and key on');
    say('its most semantic attribute (role/aria-label beat class names).');
  }
  say('');
  say('=================== END ABRIUM DOM REPORT ==================');

  const report = out.join('\n');
  console.log(report);
  try {
    copy(report); // DevTools helper
    console.log('(report copied to clipboard)');
  } catch {
    console.log('(select the output above and copy it manually)');
  }
  return 'Abrium DOM report printed above.';
})();
