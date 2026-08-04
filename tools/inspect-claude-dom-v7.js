/**
 * claude.ai DOM inspector v7 — Artifact Header Bar Discovery
 * 
 * WHY THIS EXISTS
 * Prior diagnostics searched INSIDE the artifact container and found nothing. 
 * But every artifact panel has a visible header toolbar (with Code/Preview toggles, 
 * Copy, Download, and a truncated title). This means the header is likely OUTSIDE 
 * (a sibling or parent's sibling) the element we identified as the container.
 * This script dumps the DOM structure around the container to find that header.
 *
 * HOW TO RUN
 * 1. Open a claude.ai conversation with an SVG artifact.
 * 2. Ensure the artifact panel is OPEN.
 * 3. Open DevTools -> Console -> paste this whole file -> Enter.
 * 4. Copy the output and share it.
 */

(() => {
  const out = [];
  const say = (line = '') => out.push(line);
  
  say('=============== ABRIUM DOM REPORT v7 (HEADER BAR DISCOVERY) ===============');
  
  const containers = [...document.querySelectorAll('div[aria-label*="rtifact"], [data-skill-file-viewer="true"], [data-testid="artifact-panel"]')];
  
  if (containers.length === 0) {
    say('! NO artifact containers found. Please ensure the artifact panel is open.');
  } else {
    say(`Found ${containers.length} potential artifact container(s).`);
    
    containers.forEach((container, i) => {
      say(`\n--- Container ${i + 1} ---`);
      
      // Let's go up to 4 levels of ancestors and dump their siblings
      let current = container;
      for (let level = 1; level <= 4; level++) {
        const parent = current.parentElement;
        if (!parent || parent === document.body) break;
        
        say(`\n  [Level ${level} Ancestor]: <${parent.tagName.toLowerCase()}> class="${parent.className}"`);
        
        const siblings = [...parent.children].filter(c => c !== current);
        say(`    Found ${siblings.length} sibling(s) to the Level ${level - 1} node.`);
        
        siblings.forEach((sib, idx) => {
          say(`    Sibling ${idx + 1}: <${sib.tagName.toLowerCase()}> class="${sib.className}"`);
          
          // Dump all buttons in this sibling (likely the toolbar)
          const buttons = [...sib.querySelectorAll('button')];
          if (buttons.length > 0) {
            say(`      -> Contains ${buttons.length} button(s): ` + buttons.map(b => `'${b.textContent.trim() || b.getAttribute('aria-label')}'`).join(', '));
          }
          
          // Dump all short text nodes in this sibling (looking for the title)
          const walker = document.createTreeWalker(sib, NodeFilter.SHOW_TEXT, null, false);
          let node;
          const texts = [];
          while ((node = walker.nextNode())) {
            const text = node.textContent.trim();
            if (text.length > 2 && text.length < 100) {
              texts.push(`"${text}" (in <${node.parentElement.tagName.toLowerCase()}>)`);
            }
          }
          
          // Deduplicate texts
          const uniqueTexts = [...new Set(texts)];
          if (uniqueTexts.length > 0) {
            say(`      -> Contains Text: \n          ` + uniqueTexts.join('\n          '));
          } else {
            say(`      -> No short text nodes found.`);
          }
        });
        
        current = parent;
      }
    });
  }

  say('=============== END REPORT v7 ===============');
  
  console.log(out.join('\n'));
  try { copy(out.join('\n')); console.log('(report copied to clipboard)'); } catch { /* manual */ }
  
  return 'Abrium v7 analysis complete. The report has been copied to your clipboard.';
})();
