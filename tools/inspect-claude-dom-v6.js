/**
 * claude.ai DOM inspector v6 — Download Button "download" Attribute Discovery
 * 
 * WHY THIS EXISTS
 * We are testing a universal hypothesis: does the "Download" button in the artifact 
 * panel use standard HTML (`<a download="filename.svg" href="...">`) to suggest 
 * the filename? If so, this could replace type-specific hacks (like iframe[title]) 
 * with a single, clean extraction rule.
 *
 * HOW TO RUN
 * 1. Open a claude.ai conversation with an SVG artifact.
 * 2. Ensure the artifact panel is OPEN.
 * 3. Open DevTools -> Console -> paste this whole file -> Enter.
 * 4. (Optional but helpful) Repeat steps 1-3 on an HTML artifact for comparison!
 * 5. Copy the output and share it.
 */

(() => {
  const out = [];
  const say = (line = '') => out.push(line);
  
  say('=============== ABRIUM DOM REPORT v6 (DOWNLOAD ATTR DISCOVERY) ===============');
  
  // 1. Locate the artifact panel
  const containers = [...document.querySelectorAll('div[aria-label*="rtifact"], [data-skill-file-viewer="true"], [data-testid="artifact-panel"]')];
  
  if (containers.length === 0) {
    say('! NO artifact containers found. Please ensure the artifact panel is open.');
  } else {
    say(`Found ${containers.length} potential artifact container(s).`);
    
    containers.forEach((container, i) => {
      say(`\n--- Container ${i + 1} ---`);
      
      // Look for download buttons by common aria-label patterns or text content
      const allButtonsAndAnchors = [...container.querySelectorAll('button, a, [role="button"]')];
      
      const downloadElements = allButtonsAndAnchors.filter(el => {
        const text = (el.textContent || '').toLowerCase();
        const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
        const testId = (el.getAttribute('data-testid') || '').toLowerCase();
        
        return text.includes('download') || ariaLabel.includes('download') || testId.includes('download');
      });

      if (downloadElements.length === 0) {
        say('  No elements found containing "download" in text, aria-label, or data-testid.');
        
        // Fallback: Just look at ALL anchor tags in the container
        const anchors = [...container.querySelectorAll('a')];
        say(`  Fallback: Found ${anchors.length} total anchor <a> tags in container.`);
        anchors.forEach((a, idx) => {
          const download = a.getAttribute('download');
          if (download) {
            say(`    [${idx + 1}] Found <a> with download="${download}"! (href: ${a.getAttribute('href') ? 'PRESENT' : 'NOT PRESENT'})`);
          }
        });
      } else {
        say(`  Found ${downloadElements.length} element(s) appearing to be a Download button.`);
        
        downloadElements.forEach((el, idx) => {
          say(`  [${idx + 1}] <${el.tagName.toLowerCase()}>`);
          say(`      aria-label: ${el.getAttribute('aria-label')}`);
          say(`      data-testid: ${el.getAttribute('data-testid')}`);
          
          // Check if this element IS an anchor
          if (el.tagName.toLowerCase() === 'a') {
            const dl = el.getAttribute('download');
            say(`      download attr: ${dl !== null ? '"' + dl + '"' : 'NOT PRESENT'}`);
            say(`      href attr: ${el.getAttribute('href') ? 'PRESENT' : 'NOT PRESENT'}`);
          }
          
          // Check closest ancestor <a>
          const closestA = el.closest('a');
          if (closestA && closestA !== el) {
            const dl = closestA.getAttribute('download');
            say(`      Closest ancestor <a> has download attr: ${dl !== null ? '"' + dl + '"' : 'NOT PRESENT'}`);
            say(`      Closest ancestor <a> has href attr: ${closestA.getAttribute('href') ? 'PRESENT' : 'NOT PRESENT'}`);
          } else if (!closestA && el.tagName.toLowerCase() !== 'a') {
            say(`      No <a> ancestor found for this button.`);
          }
        });
      }
    });
  }

  say('=============== END REPORT v6 ===============');
  
  console.log(out.join('\n'));
  try { copy(out.join('\n')); console.log('(report copied to clipboard)'); } catch { /* manual */ }
  
  return 'Abrium v6 analysis complete. The report has been copied to your clipboard.';
})();
