const fs = require('fs');
let ui = fs.readFileSync('./src/i18n/ui.ts', 'utf8');
ui = ui.replace(/\\n/g, '\n');
ui = ui.replace(/\\"/g, '"');
fs.writeFileSync('./src/i18n/ui.ts', ui, 'utf8');
