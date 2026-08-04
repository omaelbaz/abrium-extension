const { JSDOM } = require('jsdom');
JSDOM.fromFile('design-reference/Abrium.html', {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'file:///' + __dirname.replace(/\\/g, '/') + '/design-reference/Abrium.html'
}).then(dom => {
    setTimeout(() => {
        const bodyHtml = dom.window.document.body.innerHTML;
        console.log('Body length:', bodyHtml.length);
        console.log('Contains heroTitle?', bodyHtml.includes('Save, search and reuse Claude artifacts instantly.'));
        console.log('H1 text:', dom.window.document.querySelector('h1') ? dom.window.document.querySelector('h1').textContent : 'no h1');
    }, 3000);
}).catch(err => console.error(err));
