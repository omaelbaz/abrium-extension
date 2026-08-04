/**
 * claude.ai DOM inspector v3.3 — paste into the DevTools console ON a claude.ai
 * conversation page that has a Markdown/Document artifact open in CODE view.
 *
 * WHY THIS EXISTS
 * v3.2's container-finding fell back to a generic div and its size filter
 * silently excluded candidates. v3.3 removes the filter, shows the top 15
 * candidates regardless of size, and traces paths from ALL anchor elements
 * (e.g. all 5 copy buttons on the page) to find the true container.
 *
 * WHAT IT DOES
 * - Traces ancestors for every copy button / code tab found.
 * - Collects candidates (textLen > 20, editable, textbox, or fingerprint).
 * - Dumps textContent and innerHTML (up to 1000 chars) for the top 15.
 * - Analyzes for zero-width chars, non-breaking spaces, ::before/::after.
 * - SAFE: no network calls.
 *
 * HOW TO RUN
 * 1. Open the claude.ai conversation with the Markdown/Document artifact.
 * 2. Open the artifact panel in CODE view (not Preview).
 * 3. DevTools → Console → paste this whole file → Enter.
 */

(() => {
  const MAX_PREVIEW = 1000;
  const out = [];
  const say = (line = '') => out.push(line);
  
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

  say('=============== ABRIUM DOM REPORT v3.3 ===============');
  
  /* ---- 1. Analyze ALL Anchors ---- */
  say('---- LOCATING ARTIFACT PANEL(S) FROM ANCHORS ----');
  
  const anchors = [...document.querySelectorAll('[data-testid="action-bar-copy"], [data-testid="artifact-code-tab"]')];
  say(`Found ${anchors.length} anchor element(s) (Copy buttons or Code tabs).`);
  
  let bestContainer = null;

  anchors.forEach((anchor, index) => {
    const anchorCls = typeof anchor.className === 'string' ? anchor.className : String(anchor.getAttribute('class') || '');
    say(`  [Anchor ${index + 1}] <${anchor.tagName.toLowerCase()} class="${anchorCls}"> aria-label="${anchor.getAttribute('aria-label')}" data-testid="${anchor.getAttribute('data-testid')}"`);
    
    let node = anchor;
    let foundLabel = false;
    // Walk up 15 levels to find an artifact container
    for (let i = 0; i < 15 && node && node !== document.body; i++) {
      const ariaLabel = node.getAttribute('aria-label');
      const hasKeywords = ariaLabel && /artifact|document|readme|markdown/i.test(ariaLabel);
      
      const pCls = String(node.getAttribute('class') || '').split(/\s+/).slice(0,2).join('.');
      const pTag = node.tagName.toLowerCase();
      
      if (hasKeywords) {
        say(`    ^${i} MATCH! <${pTag}.${pCls}> aria-label="${ariaLabel}"`);
        foundLabel = true;
        // The first matched container becomes our root search area
        if (!bestContainer) {
          bestContainer = node;
        }
        break;
      }
      node = node.parentElement;
    }
    if (!foundLabel) {
      say(`    No aria-label keyword match within 15 levels up.`);
    }
    say('');
  });
  
  if (!bestContainer) {
    say('No named container found from anchors. Falling back to document.body search.');
    bestContainer = document.body;
  } else {
    say(`Container selected for deep search: <${bestContainer.tagName.toLowerCase()}> class="${bestContainer.className}" aria-label="${bestContainer.getAttribute('aria-label')}"`);
  }
  say('');

  /* ---- 2. Find Candidate Editor Elements ---- */
  say('---- CANDIDATE EDITOR ELEMENTS ----');
  const allElements = [...bestContainer.querySelectorAll('*')];
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
    
    if (textLen > 20 || isContentEditable || isTextBox || matchedFingerprint) {
       candidates.add({ el, textLen, matchedFingerprint, isContentEditable, isTextBox });
    }
  }
  
  // No arbitrary size limits. Just sort by size and pick top 15.
  const sortedCandidates = [...candidates]
    .sort((a, b) => b.textLen - a.textLen)
    .slice(0, 15);
    
  say(`Found ${candidates.size} potential candidates in container. Analyzing top ${sortedCandidates.length} by text length:`);
  say('');
  
  sortedCandidates.forEach((c, index) => {
    const el = c.el;
    const tag = el.tagName.toLowerCase();
    const cls = typeof el.className === 'string' ? el.className : String(el.getAttribute('class') || '');
    say(`  [Candidate ${index + 1}] <${tag} class="${cls}">`);
    say(`    Length: ${c.textLen} chars`);
    say(`    Fingerprint: ${c.matchedFingerprint || 'None'}`);
    say(`    Editable: ${c.isContentEditable} | Role: ${el.getAttribute('role') || 'none'}`);
    
    say(`    .textContent : ${preview(el.textContent)}`);
    
    let htmlStr = el.innerHTML.slice(0, MAX_PREVIEW);
    htmlStr = htmlStr.replace(/\n/g, '\\n');
    say(`    .innerHTML   : ${htmlStr}`);
    
    const children = [...el.querySelectorAll('*')];
    const lineElements = children.filter(child => {
      const chClass = typeof child.className === 'string' ? child.className : String(child.getAttribute('class') || '');
      return /line-number|cm-lineNumbers|view-line|number/i.test(chClass);
    });
    if (lineElements.length > 0) {
      say(`    ! Found ${lineElements.length} elements that look like line numbers inside this candidate.`);
    }
    
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

  say('=============== END REPORT v3.3 ===============');
  say('Note for Omar: You may redact the actual Markdown content strings before');
  say('sharing. The structural findings, element paths, class names, and sizes');
  say('are the important parts.');
  
  console.log(out.join('\n'));
  try { copy(out.join('\n')); console.log('(report copied to clipboard)'); } catch { /* manual */ }
  
  return 'Abrium v3.3 analysis complete. The report has been copied to your clipboard.';
})();
