const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('./design-reference/Artifact Vault.html', 'utf8');
const $ = cheerio.load(html);
console.log('h1:', $('h1').text().trim());
