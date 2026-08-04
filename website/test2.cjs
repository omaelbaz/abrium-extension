const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('./test_template.html', 'utf8');
const $ = cheerio.load(html);
console.log("h1:", $('h1').text().trim());
console.log("h2s:");
$('h2').each((i, el) => {
    console.log(i + ": " + $(el).text().trim());
});
