const fs = require('fs');
const files = [
  'temp_repo/api/src/routes/mappings.routes.ts',
  'temp_repo/api/src/routes/quepasa-mappings.routes.ts',
  'temp_repo/api/src/routes/quepasa.routes.ts',
];
files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/astrahub\.seudominio\.com\.br/g, 'quepasahub.armazem.cloud');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  } else {
    console.log('Not found', file);
  }
});
