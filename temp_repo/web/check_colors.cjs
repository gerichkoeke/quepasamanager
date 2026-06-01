const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let opt = path.join(dir, f);
    if (fs.statSync(opt).isDirectory()) {
      walk(opt, callback);
    } else {
      callback(opt);
    }
  });
}

walk('./temp_repo/web/src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');

    const regex = /bg-\[\#[0-9a-fA-F]+\]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match[0] !== 'bg-[#4F46E5]' && match[0] !== 'bg-[#000000]' && match[0] !== 'bg-[#25D366]') {
        console.log(`Found: ${match[0]} in ${filePath}`);
      }
    }
  }
});
