/**
 * claude.ai DOM inspector v3.4 — paste into the DevTools console ON a claude.ai
 * conversation page that has a Markdown/Document artifact open in CODE view.
 *
 * WHY THIS EXISTS
 * v3.3 scanned the document body but size ranking favored large page chrome.
 * v3.4 uses VISUAL POSITION (filtering for elements on the right half of the screen)
 * and proximity to the known size (~516 chars) to zero in on the artifact panel.
 * It also searches directly for the known first line.
 *
 * WHAT IT DOES
 * - Filters elements by visible position (right half of the screen).
 * - Ranks candidates by text length proximity to 516 chars.
 * - Searches directly for "# Project Name" in textContent.
 * - Analyzes for zero-width chars, non-breaking spaces, ::before/::after.
 * - SAFE: no network calls.
 *
 * HOW TO RUN
 * 1. Open the claude.ai conversation with the Markdown/Document artifact.
 * 2. Open the artifact panel in CODE view (not Preview).
 * 3. IMPORTANT: Ensure your browser window is reasonably wide so the layout
 *    is split left/right, and the artifact panel is on the right.
 * 4. DevTools → Console → paste this whole file → Enter.
 */

(() => {
  const MAX_PREVIEW = 1000;
  const TARGET_LEN = 516;
  const SEARCH_PHRASE = '# Project Name';
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

  say('=============== ABRIUM DOM REPORT v3.4 (VISUAL + PROXIMITY) ===============');
  
  /* ---- 1. Direct Content Match ---- */
  say('---- DIRECT CONTENT MATCH ("' + SEARCH_PHRASE + '") ----');
  const allElements = [...document.querySelectorAll('*')];
  const directMatches = [];
  
  for (const el of allElements) {
    const text = el.textContent || '';
    if (text.includes(SEARCH_PHRASE)) {
      directMatches.push(el);
    }
  }
  
  // Sort by smallest textLength to find the tightest wrapping element
  directMatches.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
  
  if (directMatches.length === 0) {
    say(`  ! NO element found containing "${SEARCH_PHRASE}".`);
    say(`    (Virtualization or structural fragmentation is highly likely if even this fails)`);
  } else {
    say(`  Found ${directMatches.length} elements containing "${SEARCH_PHRASE}".`);
    const bestMatch = directMatches[0];
    say(`  Tightest match length: ${(bestMatch.textContent || '').length} chars`);
    
    const path = [];
    let p = bestMatch;
    for(let i=0; i<10 && p && p !== document.body; i++) {
      const pCls = String(p.getAttribute('class') || '').split(/\s+/).slice(0,2).join('.');
      path.unshift(`${p.tagName.toLowerCase()}${pCls ? '.'+pCls : ''}`);
      p = p.parentElement;
    }
    say(`  Ancestor path (10 levels up): ${path.join(' > ')}`);
  }
  say('');

  /* ---- 2. Visual Position Filter ---- */
  say('---- VISUAL POSITION FILTER (Right half of screen) ----');
  const halfWidth = window.innerWidth / 2;
  const candidates = [];
  
  for (const el of allElements) {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    // Must be on the right side of the screen
    const isRightSide = rect.left > halfWidth;
    
    if (isVisible && isRightSide) {
      const textLen = (el.textContent || '').length;
      candidates.push({ el, textLen });
    }
  }
  
  say(`  Total elements on right half: ${candidates.length}`);
  say('');
  
  /* ---- 3. Rank by Proximity to TARGET_LEN ---- */
  say(`---- CANDIDATES RANKED BY SIZE PROXIMITY TO ${TARGET_LEN} CHARS ----`);
  
  candidates.sort((a, b) => Math.abs(a.textLen - TARGET_LEN) - Math.abs(b.textLen - TARGET_LEN));
  
  const topCandidates = candidates.slice(0, 10);
  
  topCandidates.forEach((c, index) => {
    const el = c.el;
    const tag = el.tagName.toLowerCase();
    const cls = typeof el.className === 'string' ? el.className : String(el.getAttribute('class') || '');
    
    say(`  [Candidate ${index + 1}] <${tag} class="${cls}">`);
    say(`    Length: ${c.textLen} chars (Difference: ${Math.abs(c.textLen - TARGET_LEN)})`);
    say(`    Role: ${el.getAttribute('role') || 'none'} | Editable: ${el.hasAttribute('contenteditable') && el.getAttribute('contenteditable') !== 'false'}`);
    
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

  say('=============== END REPORT v3.4 ===============');
  say('Note for Omar: You may redact the actual Markdown content strings before');
  say('sharing. The structural findings, element paths, class names, and sizes');
  say('are the important parts.');
  
  console.log(out.join('\n'));
  try { copy(out.join('\n')); console.log('(report copied to clipboard)'); } catch { /* manual */ }
  
  return 'Abrium v3.4 analysis complete. The report has been copied to your clipboard.';
})();
