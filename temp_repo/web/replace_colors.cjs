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

    // Dark Mode Replacements
    content = content.replace(/dark:bg-\[#0B0F19\]/gi, 'dark:bg-cw-bg-dark');
    content = content.replace(/dark:bg-\[#111322\]/gi, 'dark:bg-cw-bg-dark');
    
    content = content.replace(/dark:bg-\[#15172b\]/gi, 'dark:bg-cw-surface-dark');
    content = content.replace(/dark:bg-\[#1C1E2C\]/gi, 'dark:bg-cw-surface-dark');
    content = content.replace(/dark:bg-\[#1a1d36\]/gi, 'dark:bg-cw-surface-dark');

    // Light Mode background
    content = content.replace(/bg-slate-50/g, 'bg-cw-bg-light');
    content = content.replace(/bg-gray-50/g, 'bg-cw-bg-light');
    
    // Light mode surfaces (some might already be bg-white, which is fine, but lets keep it bg-white)

    // Layout Specific Fixes
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
