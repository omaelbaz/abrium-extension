/**
 * claude.ai DOM inspector v3.1 — paste into the DevTools console ON a claude.ai
 * conversation page that has a Markdown/Document artifact open in CODE view.
 *
 * WHY THIS EXISTS
 * The container selector `div[aria-label*="rtifact"]` that worked for React
 * fails for Markdown artifacts (returns 0). We need to find the correct
 * container and source selectors for Markdown/Document types.
 *
 * v3.1 update: Intercepts navigator.clipboard.write (ClipboardItem array) in
 * addition to .writeText, as claude.ai's Copy button on Markdown artifacts
 * may be preserving rich content formats.
 *
 * WHAT IT DOES
 * - Searches for broad aria-label keywords (artifact, code, document, readme, markdown).
 * - Scans all data-testid values to find robust identifiers.
 * - Performs a structural class-inventory scan.
 * - Uses the clipboard-observation technique to find where the raw markdown lives.
 * - SAFE: structure only, no network calls, truncates previews to 120 chars.
 *
 * HOW TO RUN
 * 1. Open a claude.ai conversation with a Markdown/Document artifact.
 * 2. Open the artifact panel in CODE view (not Preview).
 * 3. DevTools → Console → paste this whole file → Enter.
 * 4. Read PART 1 output, then follow PART 2 instructions (run __abriumWatchCopy() and click Copy).
 */

(() => {
  const MAX_PREVIEW = 120;
  const out = [];
  const say = (line = '') => out.push(line);
  const preview = (text) => JSON.stringify(String(text || '').replace(/\s+/g, ' ').trim().slice(0, MAX_PREVIEW));

  say('=============== ABRIUM DOM REPORT v3.1 (MARKDOWN/DOCS) ===============');
  say('url            : ' + location.href.replace(/\/chat\/[^/?#]+/, '/chat/<redacted>'));
  say('');

  /* ---- 1. Broad aria-label search ---- */
  say('---- BROAD ARIA-LABEL SEARCH ----');
  const keywords = ['artifact', 'code', 'document', 'readme', 'markdown'];
  const keywordHits = new Map();
  const allElements = [...document.querySelectorAll('*')];
  
  for (const el of allElements) {
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    if (!ariaLabel) continue;
    
    for (const kw of keywords) {
      if (ariaLabel.includes(kw)) {
        if (!keywordHits.has(kw)) keywordHits.set(kw, []);
        keywordHits.get(kw).push(el);
      }
    }
  }

  for (const kw of keywords) {
    const hits = keywordHits.get(kw) || [];
    say(`  Keyword "${kw}": ${hits.length} elements found`);
    hits.slice(0, 3).forEach((el, i) => {
      say(`    [${i+1}] <${el.tagName.toLowerCase()}> aria-label=${preview(el.getAttribute('aria-label'))} class=${preview(el.getAttribute('class'))}`);
    });
  }
  say('');

  /* ---- 2. data-testid inventory ---- */
  say('---- ALL data-testid VALUES ON PAGE ----');
  const testids = new Map();
  for (const el of document.querySelectorAll('[data-testid]')) {
    const value = el.getAttribute('data-testid');
    if (!testids.has(value)) testids.set(value, { count: 0, elements: [] });
    testids.get(value).count++;
    if (testids.get(value).elements.length < 1) testids.get(value).elements.push(el);
  }
  if (testids.size === 0) {
    say('  (none found)');
  } else {
    for (const [value, data] of [...testids.entries()].sort((a, b) => b[1].count - a[1].count)) {
      say(`  ${String(data.count).padStart(4)}  ${value}  (e.g., <${data.elements[0].tagName.toLowerCase()}> class=${preview(data.elements[0].getAttribute('class'))})`);
    }
  }
  say('');

  /* ---- 3. Structural class-inventory scan ---- */
  say('---- TOP 40 CLASS TOKENS (PAGE WIDE) ----');
  const classCounts = new Map();
  for (const el of allElements) {
    const raw = typeof el.className === 'string' ? el.className : String(el.getAttribute('class') || '');
    for (const token of raw.split(/\s+/).filter(Boolean)) {
      classCounts.set(token, (classCounts.get(token) ?? 0) + 1);
    }
  }
  const ranked = [...classCounts].sort((a, b) => b[1] - a[1]);
  for (const [token, count] of ranked.slice(0, 40)) {
    say(`  ${String(count).padStart(5)}  ${token}`);
  }
  say('');

  /* ---- 4. Copy button locations ---- */
  say('---- COPY BUTTONS (data-testid="action-bar-copy") ----');
  const copyButtons = [...document.querySelectorAll('[data-testid="action-bar-copy"]')];
  say('  Found: ' + copyButtons.length);
  copyButtons.forEach((btn, i) => {
    let node = btn;
    let depth = 0;
    while (node && depth < 10) {
      if (node.hasAttribute('aria-label') && node.getAttribute('aria-label').length > 0) {
        say(`    [${i+1}] ancestor (up ${depth}) with aria-label: <${node.tagName.toLowerCase()}> aria-label=${preview(node.getAttribute('aria-label'))}`);
        break;
      }
      node = node.parentElement;
      depth++;
    }
  });
  say('');

  say('=============== END REPORT v3.1 (PART 1) ===============');
  say('');
  say('>>> PART 2 — finding the exact source element. Two steps:');
  say('>>>   1. Run:  __abriumWatchCopy()');
  say('>>>   2. Click claude.ai\'s own Copy button on the Markdown artifact.');
  say('>>> This will trace exactly where the copied text lives in the DOM.');
  
  console.log(out.join('\n'));
  try { copy(out.join('\n')); console.log('(report copied to clipboard)'); } catch { /* manual */ }

  /* =====================================================================
     PART 2 — observe claude.ai's own copy, then locate its source element
     ===================================================================== */
  globalThis.__abriumWatchCopy = () => {
    const log = [];
    const said = (line = '') => { log.push(line); };

    const analyse = (text, via) => {
      said('=============== ABRIUM COPY OBSERVATION v3.1 ===============');
      said('captured via  : ' + via);
      said('length        : ' + text.length + ' chars');
      said('lines         : ' + text.split('\n').length);
      said('preview       : ' + preview(text));
      said('');

      const normalise = (value) => String(value || '').replace(/\s+/g, ' ').trim();
      const needle = normalise(text);

      let best = null;
      for (const element of document.querySelectorAll('*')) {
        const haystack = normalise(element.textContent);
        if (haystack.length === 0) continue;
        const exact = haystack === needle;
        const contains = !exact && haystack.includes(needle);
        if (!exact && !contains) continue;
        
        const score = exact ? 0 : haystack.length - needle.length;
        let depth = 0; let n = element; while(n) { depth++; n = n.parentElement; }

        if (!best || score < best.score || (score === best.score && depth > best.depth)) {
          best = { element, score, exact, depth };
        }
      }

      said('---- WHERE DOES THAT TEXT LIVE IN THE DOM? ----');
      if (!best) {
        said('  NO element contains the copied text. The editor is likely virtualised.');
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
        
        said('');
        said('  ---- PATH TRACE (upwards 10 levels looking for containers) ----');
        let node = element;
        for (let i = 0; i < 10 && node; i++) {
          const cls = String(node.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 3).join('.');
          const tag = node.tagName.toLowerCase();
          const attr = [
            node.hasAttribute('aria-label') ? 'aria-label=' + preview(node.getAttribute('aria-label')) : '',
            node.hasAttribute('data-testid') ? 'data-testid=' + preview(node.getAttribute('data-testid')) : '',
            node.hasAttribute('role') ? 'role=' + preview(node.getAttribute('role')) : ''
          ].filter(Boolean).join(' ');
          
          said(`    ^${i} <${tag}${cls ? '.'+cls : ''}> ${attr}`);
          node = node.parentElement;
        }

        said('');
        said('  ==> SUGGESTED source selector:');
        const cls = String(element.getAttribute('class') || '').split(/\s+/).filter(Boolean);
        said(cls.length ? "      '." + cls[0] + "'," : "      '" + element.tagName.toLowerCase() + "',");
      }
      said('=============== END COPY OBSERVATION ===============');
      console.log(log.join('\n'));
      try { copy(log.join('\n')); console.log('(observation copied to clipboard)'); } catch { /* manual */ }
    };

    const originalWriteText = navigator.clipboard && navigator.clipboard.writeText;
    const originalWrite = navigator.clipboard && navigator.clipboard.write;
    const originalExec = document.execCommand;
    
    const onCopy = (event) => {
      const text = event.clipboardData && event.clipboardData.getData('text/plain');
      if (text) analyse(text, 'copy event');
    };

    function restore() {
      if (originalWriteText) navigator.clipboard.writeText = originalWriteText;
      if (originalWrite) navigator.clipboard.write = originalWrite;
      document.execCommand = originalExec;
      document.removeEventListener('copy', onCopy, true);
    }

    if (originalWriteText) {
      navigator.clipboard.writeText = function patched(text) {
        try { analyse(String(text), 'navigator.clipboard.writeText'); } catch (error) { console.error(error); }
        return originalWriteText.call(navigator.clipboard, text);
      };
    }
    
    if (originalWrite) {
      navigator.clipboard.write = function patched(data) {
        try {
          if (Array.isArray(data)) {
            let foundText = false;
            for (const item of data) {
              if (item.types && Array.from(item.types).includes('text/plain')) {
                foundText = true;
                item.getType('text/plain')
                  .then(blob => blob.text())
                  .then(text => analyse(text, 'navigator.clipboard.write'))
                  .catch(e => console.error('Abrium: failed to read Blob text', e));
              }
            }
            if (!foundText) {
              const outLog = [];
              outLog.push('=============== ABRIUM COPY OBSERVATION v3.1 ===============');
              outLog.push('captured via  : navigator.clipboard.write');
              outLog.push('NO text/plain type exists on any ClipboardItem.');
              outLog.push('Available types: ' + JSON.stringify(data.map(i => Array.from(i.types || []))));
              outLog.push('This is a real finding: plain-text extraction from copy interception won\'t work here.');
              outLog.push('=============== END COPY OBSERVATION ===============');
              console.log(outLog.join('\n'));
              try { copy(outLog.join('\n')); } catch { /* manual */ }
            }
          }
        } catch (error) {
          console.error(error);
        }
        return originalWrite.apply(navigator.clipboard, arguments);
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

    console.log('Abrium v3.1: watching the clipboard. Now click claude.ai\'s Copy button on the Markdown artifact.');
    console.log('(run __abriumStopWatchCopy() to cancel without clicking)');
    globalThis.__abriumStopWatchCopy = restore;
    return 'Watching — click Copy now.';
  };

  return 'Abrium DOM report v3.1 printed above. Next: run __abriumWatchCopy()';
})();
