/**
 * claude.ai DOM inspector v4 — Title discovery for Code/HTML/SVG artifacts
 * 
 * WHY THIS EXISTS
 * Code, HTML, and SVG artifacts are capturing successfully, but their title is
 * falling back to "Untitled artifact". React artifacts have an <h2>, and Markdown
 * artifacts use data-prose-review-dockey, but we need to find where the title
 * lives for Code/HTML/SVG.
 *
 * HOW TO RUN
 * 1. Open a claude.ai conversation with a Code, HTML, or SVG artifact.
 * 2. Open the artifact panel in CODE view (not Preview).
 * 3. Open DevTools -> Console -> paste this whole file -> Enter.
 * 4. Copy the output and share it.
 */

(() => {
  const out = [];
  const say = (line = '') => out.push(line);
  
  say('=============== ABRIUM DOM REPORT v4 (TITLE DISCOVERY) ===============');
  
  // 1. Locate the artifact panel
  // We know Code/HTML/SVG capture successfully, which means they likely match
  // div[aria-label*="rtifact"] or similar. We'll find all candidate containers.
  const containers = [...document.querySelectorAll('div[aria-label*="rtifact"], [data-skill-file-viewer="true"], [data-testid="artifact-panel"]')];
  
  if (containers.length === 0) {
    say('! NO artifact containers found. Please ensure the artifact panel is open.');
  } else {
    say(`Found ${containers.length} potential artifact container(s).`);
    
    containers.forEach((container, i) => {
      say(`\n--- Container ${i + 1} ---`);
      say(`Tag: ${container.tagName}, Classes: ${container.className}, AriaLabel: ${container.getAttribute('aria-label')}`);
      
      // Look for any text nodes that might be the title (ignore huge code blocks)
      const textNodes = [];
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent.trim();
        // Ignore empty, huge, or line number text
        if (text.length > 2 && text.length < 100) {
          // Ignore if it's inside a pre or code block
          if (!node.parentElement.closest('pre, code, .code-block__code')) {
            textNodes.push(node.parentElement);
          }
        }
      }
      
      // Deduplicate elements
      const uniqueElements = [...new Set(textNodes)];
      
      if (uniqueElements.length === 0) {
        say('  No distinct short text elements found outside of code blocks.');
      } else {
        say('  Potential Title Elements (Text):');
        uniqueElements.forEach(el => {
          let path = [];
          let p = el;
          for(let j=0; j<4 && p && p !== container; j++) {
            let cls = String(p.getAttribute('class') || '').split(/\s+/).slice(0,2).join('.');
            path.unshift(`${p.tagName.toLowerCase()}${cls ? '.'+cls : ''}`);
            p = p.parentElement;
          }
          say(`    - Text: "${el.textContent.trim()}"`);
          say(`      Path: ${path.join(' > ')}`);
        });
      }
      
      // Also look for elements with aria-label or title attributes inside the container
      const labelled = [...container.querySelectorAll('[aria-label], [title]')];
      if (labelled.length > 0) {
        say('\n  Elements with aria-label or title attributes:');
        labelled.forEach(el => {
          const al = el.getAttribute('aria-label');
          const t = el.getAttribute('title');
          if (al) say(`    - [aria-label="${al}"] on <${el.tagName.toLowerCase()}>`);
          if (t) say(`    - [title="${t}"] on <${el.tagName.toLowerCase()}>`);
        });
      }
    });
  }

  // 2. Also search the entire page for "Download" buttons and inspect their siblings
  // (In case the title is only in the chat UI, as mentioned "next to the Download button in the chat")
  say('\n--- Chat / Download Button Proximity ---');
  const allSvgs = [...document.querySelectorAll('svg')];
  // Find svgs that look like download icons or buttons containing them
  const buttons = [...document.querySelectorAll('button')];
  let downloadButtons = buttons.filter(b => b.textContent.toLowerCase().includes('download') || b.getAttribute('aria-label')?.toLowerCase().includes('download'));
  
  if (downloadButtons.length > 0) {
    downloadButtons.forEach((btn, i) => {
      say(`  Found Download button ${i + 1}:`);
      let parent = btn.parentElement;
      if (parent) {
        say(`    Parent textContent: "${parent.textContent.replace(/\n/g, ' ').trim().slice(0, 100)}"`);
        const siblings = [...parent.children];
        siblings.forEach(sib => {
          if (sib !== btn && sib.textContent.trim().length > 0 && sib.textContent.trim().length < 100) {
            say(`    Sibling text: "${sib.textContent.trim()}" (Tag: <${sib.tagName.toLowerCase()}>)`);
          }
        });
      }
    });
  } else {
    say('  No explicit "Download" buttons found by text/aria-label.');
  }

  say('=============== END REPORT v4 ===============');
  
  console.log(out.join('\n'));
  try { copy(out.join('\n')); console.log('(report copied to clipboard)'); } catch { /* manual */ }
  
  return 'Abrium v4 analysis complete. The report has been copied to your clipboard.';
})();
