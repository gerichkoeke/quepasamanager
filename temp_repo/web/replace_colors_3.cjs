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
    let original = content;

    content = content.replace(/dark:border-gray-800/g, "dark:border-cw-border-dark");
    content = content.replace(/border-gray-200/g, "border-cw-border-light");

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated border paths in', filePath);
    }
  }
});
