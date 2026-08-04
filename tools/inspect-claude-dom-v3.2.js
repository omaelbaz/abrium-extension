/**
 * claude.ai DOM inspector v3.2 — paste into the DevTools console ON a claude.ai
 * conversation page that has a Markdown/Document artifact open in CODE view.
 *
 * WHY THIS EXISTS
 * v3.1 showed that the text is copied correctly via clipboard.write(), but a
 * naive DOM textContent match failed. This could be virtualization, OR it could
 * be invisible characters, line numbers, or DOM structure breaking the text match.
 *
 * WHAT IT DOES
 * - Locates the artifact panel directly using surrounding UI elements (Copy buttons, etc).
 * - Finds candidate editor elements (large text, contenteditable, editor classes).
 * - Dumps textContent and innerHTML (up to 1000 chars) for visual comparison.
 * - Analyzes for zero-width chars, non-breaking spaces, and ::before/::after content.
 * - SAFE: no network calls.
 *
 * HOW TO RUN
 * 1. Open the claude.ai conversation with the Markdown/Document artifact.
 * 2. Open the artifact panel in CODE view (not Preview).
 * 3. DevTools → Console → paste this whole file → Enter.
 * 4. Share the structural findings. You can redact the actual markdown content
 *    if you wish; the element paths and class names are the important part.
 */

(() => {
  const MAX_PREVIEW = 1000;
  const out = [];
  const say = (line = '') => out.push(line);
  
  // Custom preview that highlights hidden chars and normalizes newlines
  const preview = (text) => {
    if (typeof text !== 'string') return 'null';
    let str = text.slice(0, MAX_PREVIEW);
    str = str.replace(/\u200B/g, '[ZWSP:U+200B]')
             .replace(/\u00A0/g, '[NBSP:U+00A0]')
             .replace(/\u200C/g, '[ZWNJ:U+200C]')
             .replace(/\u200D/g, '[ZWJ:U+200D]')
             .replace(/\r/g, '[CR]')
             .replace(/\n/g, '\\n');
    return str;
  };

  const FINGERPRINTS = [
    { name: 'CodeMirror 6', test: (c) => /(^|\s)cm-/.test(c) },
    { name: 'CodeMirror 5', test: (c) => /CodeMirror/.test(c) },
    { name: 'Monaco / VS Code', test: (c) => /monaco-|view-line|view-lines/.test(c) },
    { name: 'Prism / highlight.js', test: (c) => /(^|\s)token(\s|$)|hljs/.test(c) },
    { name: 'Shiki', test: (c) => /shiki|line(\s|$)/.test(c) },
    { name: 'Ace', test: (c) => /ace_/.test(c) },
  ];

  say('=============== ABRIUM DOM REPORT v3.2 (STRUCTURAL/NON-MATCHING) ===============');
  
  /* ---- 1. Locate the panel container ---- */
  say('---- LOCATING ARTIFACT PANEL ----');
  
  // Use the Copy button or Code tab as an anchor
  const anchors = [...document.querySelectorAll('[data-testid="action-bar-copy"], [data-testid="artifact-code-tab"]')];
  let container = null;
  
  if (anchors.length > 0) {
    say(`Found ${anchors.length} anchor element(s). Walking up to find a shared container...`);
    let node = anchors[0];
    
    // Walk up looking for an aria-label matching document keywords, or stop at a reasonable depth
    for (let i = 0; i < 12 && node && node !== document.body; i++) {
      if (node.hasAttribute('aria-label') && /artifact|document|readme|markdown/i.test(node.getAttribute('aria-label'))) {
        container = node;
        break;
      }
      node = node.parentElement;
    }
    
    // Fallback: if no aria-label matched, just take the 7th ancestor
    if (!container) {
      node = anchors[0];
      for (let i = 0; i < 7 && node && node !== document.body; i++) node = node.parentElement;
      container = node;
    }
  } else {
    say('No anchor elements found. Falling back to analyzing the whole body.');
    container = document.body;
  }
  
  say(`Container selected: <${container.tagName.toLowerCase()}> class="${container.className}" aria-label="${container.getAttribute('aria-label')}"`);
  say('');

  /* ---- 2. Find Candidate Editor Elements ---- */
  say('---- CANDIDATE EDITOR ELEMENTS ----');
  const allElements = [...container.querySelectorAll('*')];
  const candidates = new Set();
  
  for (const el of allElements) {
    const textLen = (el.textContent || '').length;
    const isContentEditable = el.hasAttribute('contenteditable') && el.getAttribute('contenteditable') !== 'false';
    const isTextBox = el.getAttribute('role') === 'textbox';
    
    const className = typeof el.className === 'string' ? el.className : String(el.getAttribute('class') || '');
    let matchedFingerprint = false;
    for (const fp of FINGERPRINTS) {
      if (fp.test(className)) {
        matchedFingerprint = fp.name;
        break;
      }
    }
    
    // Heuristic: has substantial text, is editable, or matches editor classes
    if (textLen > 50 || isContentEditable || isTextBox || matchedFingerprint) {
       candidates.add({ el, textLen, matchedFingerprint, isContentEditable, isTextBox });
    }
  }
  
  // Sort candidates by text length, filter out the container itself or very high level wrappers
  // We want the most precise, deep elements that hold a chunk of text.
  const sortedCandidates = [...candidates]
    .sort((a, b) => b.textLen - a.textLen)
    // Filter down to elements holding up to roughly the expected size, or at least smaller than the whole page
    .filter(c => c.textLen > 100 && c.textLen < 5000)
    .slice(0, 5);
    
  say(`Found ${candidates.size} potential candidates. Analyzing top ${sortedCandidates.length} (sized between 100-5000 chars):`);
  say('');
  
  sortedCandidates.forEach((c, index) => {
    const el = c.el;
    const tag = el.tagName.toLowerCase();
    const cls = el.className;
    say(`  [Candidate ${index + 1}] <${tag} class="${cls}">`);
    say(`    Length: ${c.textLen} chars`);
    say(`    Fingerprint: ${c.matchedFingerprint || 'None'}`);
    say(`    Editable: ${c.isContentEditable} | Role: ${el.getAttribute('role') || 'none'}`);
    
    // Dump textContent with invisible chars highlighted
    say(`    .textContent : ${preview(el.textContent)}`);
    
    // Dump innerHTML structure
    let htmlStr = el.innerHTML.slice(0, MAX_PREVIEW);
    // basic HTML normalization for readability in the console
    htmlStr = htmlStr.replace(/\n/g, '\\n');
    say(`    .innerHTML   : ${htmlStr}`);
    
    // Diagnostics for common text extraction disruptors
    const children = [...el.querySelectorAll('*')];
    
    // 1. Line numbers interleaved
    const lineElements = children.filter(child => {
      const c = typeof child.className === 'string' ? child.className : '';
      return /line-number|cm-lineNumbers|view-line|number/i.test(c);
    });
    if (lineElements.length > 0) {
      say(`    ! Found ${lineElements.length} elements that look like line numbers inside this candidate.`);
    }
    
    // 2. CSS pseudo-element injection
    let pseudoInjects = 0;
    for (const child of children) {
      try {
        const b = window.getComputedStyle(child, '::before').content;
        const a = window.getComputedStyle(child, '::after').content;
        if ((b && b !== 'none' && b !== '""' && b !== 'normal') || 
            (a && a !== 'none' && a !== '""' && a !== 'normal')) {
          pseudoInjects++;
        }
      } catch(e) {}
    }
    if (pseudoInjects > 0) {
      say(`    ! Found ${pseudoInjects} child elements using ::before/::after CSS content injection.`);
    }
    
    // Walk up a bit to show structural context
    const path = [];
    let p = el;
    for(let i=0; i<6 && p && p !== document.body; i++) {
      const pCls = String(p.getAttribute('class') || '').split(/\s+/).slice(0,2).join('.');
      path.unshift(`${p.tagName.toLowerCase()}${pCls ? '.'+pCls : ''}`);
      p = p.parentElement;
    }
    say(`    Context path: ${path.join(' > ')}`);
    say('');
  });

  say('=============== END REPORT v3.2 ===============');
  say('Note for Omar: Since this script dumps larger blocks of text (~1000 chars) to');
  say('help visualize the DOM structure, you may redact the actual Markdown content');
  say('before sharing. The structural findings (element paths, class names, line number');
  say('warnings, and HTML structure) are what matter most for solving this issue.');
  
  console.log(out.join('\n'));
  try { copy(out.join('\n')); console.log('(report copied to clipboard)'); } catch { /* manual */ }
  
  return 'Abrium v3.2 analysis complete. The report has been copied to your clipboard.';
})();
