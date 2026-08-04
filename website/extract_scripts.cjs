const fs = require('fs');
const html = fs.readFileSync('./design-reference/Abrium.html', 'utf8');
const scriptMatches = html.matchAll(/<script type="([^"]+)">\n?(.*?)\n?<\/script>/gs);
for (const match of scriptMatches) {
    console.log("Script type:", match[1]);
    console.log("Length:", match[2].length);
    if (match[1] !== "__bundler/template") {
        console.log("Starts with:", match[2].substring(0, 150));
    }
}
