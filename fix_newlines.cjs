const fs = require('fs');

function fixNewlines(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\\n        /g, '\\n        ');
}

fixNewlines('temp_repo/api/src/routes/quepasa-mappings.routes.ts');
