const fs = require('fs');
let utils = fs.readFileSync('./src/i18n/utils.ts', 'utf8');
utils = utils.replace('\\n', '');
fs.writeFileSync('./src/i18n/utils.ts', utils, 'utf8');
