const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const filePath = 'file:///' + path.resolve('design-reference/Abrium.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    const html = await page.content();
    require('fs').writeFileSync('rendered.html', html);
    
    console.log('Rendered length:', html.length);
    console.log('Contains heroTitle?', html.includes('Save, search and reuse Claude artifacts instantly.'));
    
    await browser.close();
})();
