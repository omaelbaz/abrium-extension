const fs = require('fs');
const html = fs.readFileSync('./design-reference/Abrium.html', 'utf8');
const templateMatch = html.match(/<script type="__bundler\/template">\n(.*?)\n\s*<\/script>/s);
if (templateMatch && templateMatch[1]) {
    try {
        const parsed = JSON.parse(templateMatch[1]);
        console.log("Template length:", parsed.length);
        console.log("Starts with:", parsed.substring(0, 100));
        
        fs.writeFileSync('./test_template.html', parsed);
        console.log("Wrote to test_template.html");
    } catch(e) {
        console.error("JSON parse error", e);
    }
} else {
    console.log("No template found");
}
