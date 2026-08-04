const fs = require('fs');
const html = fs.readFileSync('./design-reference/Abrium.html', 'utf8');
const templateMatch = html.match(/<script type=\"__bundler\/template\">\n(.*?)<\/script>/s);
if (templateMatch) {
    const templateStr = JSON.parse(templateMatch[1]);
    const idx = templateStr.indexOf('const EN');
    if (idx !== -1) {
        console.log(templateStr.substring(idx, idx + 2000));
    }
}
