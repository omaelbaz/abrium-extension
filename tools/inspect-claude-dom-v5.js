/**
 * claude.ai DOM inspector v5 — SVG Specific Title Discovery
 * 
 * WHY THIS EXISTS
 * We previously discovered the iframe[title] extraction works for HTML artifacts, 
 * but SVG artifacts (like "simple_page.html" ? wait, "simple_page" was an SVG?) 
 * wait, the user said "a new SVG was captured, 729 B, still showed 'Untitled artifact'".
 * We need to see exactly how SVG Preview is rendered (<img>, <object>, inline <svg>) 
 * and where its title lives.
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
  
  say('=============== ABRIUM DOM REPORT v5 (SVG TITLE DISCOVERY) ===============');
  
  // 1. Locate the artifact panel
  const containers = [...document.querySelectorAll('div[aria-label*="rtifact"], [data-skill-file-viewer="true"], [data-testid="artifact-panel"]')];
  
  if (containers.length === 0) {
    say('! NO artifact containers found. Please ensure the artifact panel is open.');
  } else {
    say(`Found ${containers.length} potential artifact container(s).`);
    
    containers.forEach((container, i) => {
      say(`\n--- Container ${i + 1} ---`);
      
      // Look for SVGs, IMGs, IFRAMEs, OBJECTs
      const media = [...container.querySelectorAll('svg, img, iframe, object')];
      if (media.length > 0) {
        say(`Found ${media.length} media/preview elements:`);
        media.forEach((el, idx) => {
          say(`  [${idx + 1}] <${el.tagName.toLowerCase()}>`);
          // Dump all attributes
          const attrs = el.attributes;
          for (let j = 0; j < attrs.length; j++) {
            say(`      ${attrs[j].name}="${attrs[j].value}"`);
          }
        });
      } else {
        say('  No svg, img, iframe, or object elements found in container.');
      }
      
      // Look for any text nodes that might be the title
      const textNodes = [];
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent.trim();
        if (text.length > 2 && text.length < 100) {
          if (!node.parentElement.closest('pre, code, .code-block__code, svg')) {
            textNodes.push(node.parentElement);
          }
        }
      }
      
      const uniqueElements = [...new Set(textNodes)];
      if (uniqueElements.length > 0) {
        say('\n  Potential Title Elements (Text):');
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
    });
  }

  say('=============== END REPORT v5 ===============');
  
  console.log(out.join('\n'));
  try { copy(out.join('\n')); console.log('(report copied to clipboard)'); } catch { /* manual */ }
  
  return 'Abrium v5 analysis complete. The report has been copied to your clipboard.';
})();
