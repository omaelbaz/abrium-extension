const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('./design-reference/Abrium.html', 'utf8');
const $ = cheerio.load(html);
console.log($('h1').text().trim());
