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

    content = content.replace(/bg-\[#15172b\]/gi, "bg-cw-surface-light dark:bg-cw-surface-dark");
    content = content.replace(/bg-\[#1C1E2C\]/gi, "bg-cw-surface-light dark:bg-cw-surface-dark");
    content = content.replace(/bg-\[#1a1d36\]/gi, "bg-cw-surface-light dark:bg-cw-surface-dark");

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
