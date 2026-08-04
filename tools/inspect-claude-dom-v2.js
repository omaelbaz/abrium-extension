/**
 * claude.ai DOM inspector, round 2 — paste into the DevTools console ON the
 * same artifact page as last time, with the artifact panel open in CODE view.
 *
 * WHAT ROUND 1 ESTABLISHED
 *   ✅ div[aria-label*="rtifact"]  → 2 containers. Confirmed, now locked in.
 *   🔴 every source candidate      → 0. There are ZERO <pre> elements on the
 *      page despite a visibly syntax-highlighted code panel, so the code view
 *      is an editor component (CodeMirror/Monaco-style), not <pre>/<code>.
 *   ℹ  all 18 data-testid values are page chrome; none artifact-specific.
 *
 * SO THIS ROUND STARTS FROM THE CONTAINER, NOT FROM <pre>.
 *
 * SAFETY — same rules as before
 *   - Reads STRUCTURE: tag names, class names, attribute names, counts.
 *   - No network call anywhere in this file. Nothing is uploaded or stored.
 *     Everything stays in your console.
 *   - Text previews are truncated to 120 characters, purely so you can tell
 *     code from prose. If a preview still shows something you would rather not
 *     share, send me only the sections you are comfortable with — the
 *     FINGERPRINT and CLASS INVENTORY sections are the important ones and
 *     contain no conversation content.
 *
 * HOW TO RUN
 *   1. Same Ailywood artifact page, panel open, CODE view (not Preview).
 *   2. DevTools → Console → paste this whole file → Enter.
 *   3. Read PART 1 output, then follow the PART 2 prompt it prints — that
 *      step needs one click from you and is the one most likely to solve this.
 */

(() => {
  const CONTAINER_SELECTOR = 'div[aria-label*="rtifact"]';
  const MAX_PREVIEW = 120;
  const out = [];
  const say = (line = '') => out.push(line);
  const preview = (text) => JSON.stringify(String(text || '').replace(/\s+/g, ' ').trim().slice(0, MAX_PREVIEW));

  /** Editor libraries betray themselves through class-name conventions. */
  const FINGERPRINTS = [
    { name: 'CodeMirror 6', test: (c) => /(^|\s)cm-/.test(c) },
    { name: 'CodeMirror 5', test: (c) => /CodeMirror/.test(c) },
    { name: 'Monaco / VS Code', test: (c) => /monaco-|view-line|view-lines/.test(c) },
    { name: 'Prism / highlight.js', test: (c) => /(^|\s)token(\s|$)|hljs/.test(c) },
    { name: 'Shiki', test: (c) => /shiki|line(\s|$)/.test(c) },
    { name: 'Ace', test: (c) => /ace_/.test(c) },
  ];

  say('=============== ABRIUM DOM REPORT v2 ===============');
  say('url            : ' + location.href.replace(/\/chat\/[^/?#]+/, '/chat/<redacted>'));

  const containers = [...document.querySelectorAll(CONTAINER_SELECTOR)];
  say('containers     : ' + containers.length + '  via  ' + CONTAINER_SELECTOR);
  if (containers.length === 0) {
    say('');
    say('!! No container matched. Is the artifact panel open? Re-open it and re-run.');
    console.log(out.join('\n'));
    return 'No artifact container found.';
  }
  say('');

  containers.forEach((container, index) => {
    const all = [...container.querySelectorAll('*')];
    say('################ CONTAINER ' + (index + 1) + ' of ' + containers.length + ' ################');
    say('tag            : <' + container.tagName.toLowerCase() + '>');
    say('aria-label     : ' + preview(container.getAttribute('aria-label')));
    say('descendants    : ' + all.length);
    say('textContent len: ' + (container.textContent || '').length);
    say('');

    /* ---- 1. editor-library fingerprints ---- */
    say('---- FINGERPRINTS ----');
    const hits = new Map();
    for (const element of all) {
      const className = typeof element.className === 'string'
        ? element.className
        : String(element.getAttribute('class') || '');
      if (!className) continue;
      for (const fingerprint of FINGERPRINTS) {
        if (fingerprint.test(className)) {
          hits.set(fingerprint.name, (hits.get(fingerprint.name) ?? 0) + 1);
        }
      }
    }
    if (hits.size === 0) {
      say('  none of the known editor conventions matched — see CLASS INVENTORY');
    } else {
      for (const [name, count] of [...hits].sort((a, b) => b[1] - a[1])) {
        say('  ' + String(count).padStart(5) + '  ' + name);
      }
    }

    const editable = [...container.querySelectorAll('[contenteditable]')];
    say('  contenteditable elements: ' + editable.length);
    editable.slice(0, 3).forEach((element, i) => {
      say('    [' + (i + 1) + '] <' + element.tagName.toLowerCase() + '> class=' +
        preview(element.getAttribute('class')) + ' len=' + (element.textContent || '').length);
    });
    say('');

    /* ---- 2. full class inventory, frequency ranked ---- */
    say('---- CLASS INVENTORY (every distinct class in this container) ----');
    const classCounts = new Map();
    for (const element of all) {
      const raw = typeof element.className === 'string'
        ? element.className
        : String(element.getAttribute('class') || '');
      for (const token of raw.split(/\s+/).filter(Boolean)) {
        classCounts.set(token, (classCounts.get(token) ?? 0) + 1);
      }
    }
    say('  ' + classCounts.size + ' distinct class tokens');
    const ranked = [...classCounts].sort((a, b) => b[1] - a[1]);
    for (const [token, count] of ranked.slice(0, 60)) {
      say('  ' + String(count).padStart(5) + '  ' + token);
    }
    if (ranked.length > 60) say('  … ' + (ranked.length - 60) + ' more (repeated-class tokens matter most; these are the top 60)');
    say('');

    /* ---- 3. attribute-name inventory ---- */
    say('---- ATTRIBUTE NAMES USED IN THIS CONTAINER ----');
    const attrCounts = new Map();
    for (const element of [container, ...all]) {
      for (const attribute of element.attributes) {
        attrCounts.set(attribute.name, (attrCounts.get(attribute.name) ?? 0) + 1);
      }
    }
    for (const [name, count] of [...attrCounts].sort((a, b) => b[1] - a[1]).slice(0, 40)) {
      say('  ' + String(count).padStart(5) + '  ' + name);
    }
    say('');

    /* ---- 4. plain-text fallbacks an editor often keeps around ---- */
    say('---- PLAIN-TEXT FALLBACK CANDIDATES ----');
    const textareas = [...container.querySelectorAll('textarea')];
    say('  <textarea>: ' + textareas.length);
    textareas.slice(0, 3).forEach((element, i) => {
      say('    [' + (i + 1) + '] len=' + (element.value || '').length +
        ' class=' + preview(element.getAttribute('class')) +
        ' preview=' + preview(element.value));
    });

    const hidden = [...container.querySelectorAll('[aria-hidden="true"]')]
      .filter((element) => (element.textContent || '').trim().length > 80);
    say('  aria-hidden elements with >80 chars of text: ' + hidden.length);
    hidden.slice(0, 3).forEach((element, i) => {
      say('    [' + (i + 1) + '] <' + element.tagName.toLowerCase() + '> len=' +
        (element.textContent || '').length + ' class=' + preview(element.getAttribute('class')));
    });

    // The single deepest element holding a lot of text is often the editor body.
    const textiest = all
      .map((element) => ({ element, length: (element.textContent || '').length }))
      .filter((entry) => entry.length > 100)
      .sort((a, b) => a.length - b.length)[0];
    if (textiest) {
      say('  smallest element holding >100 chars (likely the code body):');
      say('    <' + textiest.element.tagName.toLowerCase() + '> len=' + textiest.length +
        ' class=' + preview(textiest.element.getAttribute('class')));
      say('    preview=' + preview(textiest.element.textContent));
    }
    say('');

    /* ---- 5. title, SCOPED to this container ---- */
    say('---- TITLE CANDIDATES (scoped to this container only) ----');
    const titleCandidates = [
      '[data-testid="artifact-title"]',
      '[role="heading"]',
      'h1, h2, h3, h4',
      '[class*="title"]',
    ];
    for (const selector of titleCandidates) {
      let found = [];
      try { found = [...container.querySelectorAll(selector)]; } catch { /* ignore */ }
      say('  ' + String(found.length).padStart(3) + '  ' + selector +
        (found.length > 0 ? '   first=' + preview(found[0].textContent) : ''));
    }
    say('');
  });

  /* ---- 6. the Copy button: claude.ai's own extraction path ---- */
  say('---- COPY BUTTON ----');
  const copyButtons = [...document.querySelectorAll('[data-testid="action-bar-copy"]')];
  say('  [data-testid="action-bar-copy"]: ' + copyButtons.length + ' found');
  copyButtons.slice(0, 3).forEach((button, i) => {
    const inContainer = containers.findIndex((c) => c.contains(button));
    say('    [' + (i + 1) + '] <' + button.tagName.toLowerCase() + '> ' +
      'insideContainer=' + (inContainer >= 0 ? '#' + (inContainer + 1) : 'no') +
      ' aria-label=' + preview(button.getAttribute('aria-label')));
  });
  say('');
  say('  A React onClick handler cannot be read out of the DOM, so instead of');
  say('  guessing at it we OBSERVE what it produces. See PART 2.');
  say('');
  say('=============== END REPORT v2 (PART 1) ===============');
  say('');
  say('>>> PART 2 — the one that most likely solves this. Two steps:');
  say('>>>   1. Run:  __abriumWatchCopy()');
  say('>>>   2. Click claude.ai\'s own Copy button on the artifact.');
  say('>>> It reports what the app itself put on the clipboard and finds the');
  say('>>> element whose text matches it — that element IS the source selector.');
  say('>>> Nothing is sent anywhere; only length + a 120-char preview is shown.');

  console.log(out.join('\n'));
  try { copy(out.join('\n')); console.log('(report copied to clipboard)'); } catch { /* manual copy */ }

  /* =====================================================================
     PART 2 — observe claude.ai's own copy, then locate its source element
     ===================================================================== */
  globalThis.__abriumWatchCopy = () => {
    const log = [];
    const said = (line = '') => { log.push(line); };

    const analyse = (text, via) => {
      said('=============== ABRIUM COPY OBSERVATION ===============');
      said('captured via  : ' + via);
      said('length        : ' + text.length + ' chars');
      said('lines         : ' + text.split('\n').length);
      said('preview       : ' + preview(text));
      said('');

      const normalise = (value) => String(value || '').replace(/\s+/g, ' ').trim();
      const needle = normalise(text);

      const depthOf = (element) => {
        let depth = 0;
        let node = element;
        while (node && !node.matches(CONTAINER_SELECTOR)) { depth += 1; node = node.parentElement; }
        return depth;
      };

      // Several nested wrappers can hold identical text (an editor typically
      // has a scroller > content > lines chain). Among equally good matches
      // take the DEEPEST, which is the tightest element that still holds the
      // whole source — that is the selector worth writing down.
      let best = null;
      for (const container of document.querySelectorAll(CONTAINER_SELECTOR)) {
        for (const element of [container, ...container.querySelectorAll('*')]) {
          const haystack = normalise(element.textContent);
          if (haystack.length === 0) continue;
          const exact = haystack === needle;
          const contains = !exact && haystack.includes(needle);
          if (!exact && !contains) continue;
          const score = exact ? 0 : haystack.length - needle.length;
          const depth = depthOf(element);
          if (!best || score < best.score || (score === best.score && depth > best.depth)) {
            best = { element, score, exact, depth };
          }
        }
      }

      said('---- WHERE DOES THAT TEXT LIVE IN THE DOM? ----');
      if (!best) {
        said('  NO element contains the copied text.');
        said('  That is the important finding: the editor is VIRTUALISED — only');
        said('  visible lines exist in the DOM — or the source is held in JS');
        said('  state, not markup. Either way DOM scraping cannot get the full');
        said('  source, and capture will need a different approach.');
        const containerLen = normalise(document.querySelector(CONTAINER_SELECTOR)?.textContent).length;
        said('  container text length ' + containerLen + ' vs copied ' + needle.length +
          (containerLen < needle.length ? '  → container holds LESS: virtualised.' : ''));
      } else {
        const element = best.element;
        said('  ' + (best.exact ? 'EXACT MATCH' : 'CONTAINS IT (extra ' + best.score + ' chars)'));
        said('  <' + element.tagName.toLowerCase() + '>');
        said('  class : ' + preview(element.getAttribute('class')));
        said('  id    : ' + preview(element.getAttribute('id')));
        for (const attribute of element.attributes) {
          if (attribute.name.startsWith('data-') || attribute.name.startsWith('aria-') || attribute.name === 'role') {
            said('  ' + attribute.name + ' = ' + preview(attribute.value));
          }
        }
        // A selector path back up to the container.
        const steps = [];
        let node = element;
        while (node && !node.matches(CONTAINER_SELECTOR) && steps.length < 8) {
          const cls = String(node.getAttribute('class') || '').split(/\s+/).filter(Boolean);
          steps.unshift(node.tagName.toLowerCase() + (cls.length ? '.' + cls.slice(0, 2).join('.') : ''));
          node = node.parentElement;
        }
        said('  path from container: ' + (steps.join(' > ') || '(the container itself)'));
        said('  depth below container: ' + best.depth);
        said('');
        said('  ==> SUGGESTED source selector to try in lib/extract.ts:');
        const cls = String(element.getAttribute('class') || '').split(/\s+/).filter(Boolean);
        said(cls.length
          ? "      '." + cls[0] + "',"
          : "      '" + element.tagName.toLowerCase() + "',");
      }
      said('=============== END COPY OBSERVATION ===============');
      console.log(log.join('\n'));
      try { copy(log.join('\n')); console.log('(observation copied to clipboard)'); } catch { /* manual */ }
      restore();
    };

    // Intercept every route text can take to the clipboard, call through so the
    // real copy still happens, and restore afterwards.
    const originalWriteText = navigator.clipboard && navigator.clipboard.writeText;
    const originalExec = document.execCommand;
    const onCopy = (event) => {
      const text = event.clipboardData && event.clipboardData.getData('text/plain');
      if (text) analyse(text, 'copy event');
    };

    function restore() {
      if (originalWriteText) navigator.clipboard.writeText = originalWriteText;
      document.execCommand = originalExec;
      document.removeEventListener('copy', onCopy, true);
    }

    if (originalWriteText) {
      navigator.clipboard.writeText = function patched(text) {
        try { analyse(String(text), 'navigator.clipboard.writeText'); } catch (error) { console.error(error); }
        return originalWriteText.call(navigator.clipboard, text);
      };
    }
    document.execCommand = function patched(command, ...rest) {
      const result = originalExec.call(document, command, ...rest);
      if (String(command).toLowerCase() === 'copy') {
        try { analyse(String(getSelection()), 'document.execCommand("copy")'); } catch (error) { console.error(error); }
      }
      return result;
    };
    document.addEventListener('copy', onCopy, true);

    console.log('Abrium: watching the clipboard. Now click claude.ai\'s Copy button on the artifact.');
    console.log('(run __abriumStopWatchCopy() to cancel without clicking)');
    globalThis.__abriumStopWatchCopy = restore;
    return 'Watching — click Copy now.';
  };

  return 'Abrium DOM report v2 printed above. Next: run __abriumWatchCopy()';
})();
