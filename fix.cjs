const fs = require('fs');
let code = fs.readFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', 'utf8');
code = code.replace(/useTypebot: true,\\n        useNativeBot: true,\\n        botWelcomeMessage: true,\\n        botOptions: true,\\n        botInvalidMessage: true,\\n        provider: true,\\n        officialPhoneId: true,\\n        officialApiToken: true,\\n        officialWabaId: true,/g, 'useTypebot: true,\n        useNativeBot: true,\n        botWelcomeMessage: true,\n        botOptions: true,\n        botInvalidMessage: true,\n        provider: true,\n        officialPhoneId: true,\n        officialApiToken: true,\n        officialWabaId: true,');
fs.writeFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', code);
