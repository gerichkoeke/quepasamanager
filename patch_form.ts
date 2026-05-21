import * as fs from 'fs';

let content = fs.readFileSync('temp_repo/web/src/pages/Sessions.tsx', 'utf8');
const newForm = fs.readFileSync('newForm.txt', 'utf8');

const targetForm = /<form onSubmit=\{handleConfigureTypebot\} className="space-y-4">[\s\S]*?<\/form>/;

content = content.replace(targetForm, newForm);

// Also change modal title "Configurar Integração Typebot" to "Configurar Bot & API"
content = content.replace('title="Configurar Integração Typebot"', 'title="Configurar Bot & API"');

fs.writeFileSync('temp_repo/web/src/pages/Sessions.tsx', content);
