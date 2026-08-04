const fs = require('fs');
const content = fs.readFileSync('design-reference/Abrium.html', 'utf-8');
const scriptStart = '<script type="__bundler/template">';
const scriptEnd = '</script>';
const startIndex = content.indexOf(scriptStart);
if (startIndex > -1) {
    const jsonStrStart = content.indexOf('\n', startIndex) + 1;
    const jsonStrEnd = content.indexOf('\n', jsonStrStart);
    const jsonStr = content.substring(jsonStrStart, jsonStrEnd);
    fs.writeFileSync('design-reference/extracted.html', JSON.parse(jsonStr));
    console.log('Extracted successfully');
} else {
    console.log('No template found');
}
