import fs from 'fs';
const file = 'temp_repo/api/src/routes/quepasa-mappings.routes.ts';
const content = fs.readFileSync(file, 'utf8');
fs.writeFileSync(file, content.replace(/\\n/g, '\n'));
