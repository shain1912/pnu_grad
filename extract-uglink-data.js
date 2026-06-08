const fs = require('fs');
const path = require('path');

const srcFile = path.resolve(__dirname, 'frontend', 'src', 'lib', 'uglink_dashboard_raw.html');
const destFile = path.resolve(__dirname, 'frontend', 'src', 'lib', 'uglink_data.js');

if (fs.existsSync(srcFile)) {
  const content = fs.readFileSync(srcFile, 'utf8');
  // Look for const D = { ... }
  const match = content.match(/const\s+D\s*=\s*(\{[\s\S]*?\});\s*\/\/ ──/);
  if (match && match[1]) {
    fs.writeFileSync(destFile, `export const D = ${match[1]};`, 'utf8');
    console.log("Successfully extracted D data to", destFile);
  } else {
    // Attempt fallback match if format is slightly different
    const fallbackMatch = content.match(/const\s+D\s*=\s*(\{[\s\S]*?\});/);
    if (fallbackMatch && fallbackMatch[1]) {
      fs.writeFileSync(destFile, `export const D = ${fallbackMatch[1]};`, 'utf8');
      console.log("Successfully extracted D data (fallback) to", destFile);
    } else {
      console.error("Could not find const D pattern in the HTML file.");
    }
  }
} else {
  console.error("Source HTML file does not exist at:", srcFile);
}
