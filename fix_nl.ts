import * as fs from "fs";

let content = fs.readFileSync('temp_repo/api/src/routes/quepasa-mappings.routes.ts', 'utf8');

content = content.replace(/\\n        useNativeBot/g, '\n        useNativeBot');
content = content.replace(/\\n        botWelcomeMessage/g, '\n        botWelcomeMessage');
content = content.replace(/\\n        botOptions/g, '\n        botOptions');
content = content.replace(/\\n        botInvalidMessage/g, '\n        botInvalidMessage');
content = content.replace(/\\n        provider/g, '\n        provider');
content = content.replace(/\\n        officialPhoneId/g, '\n        officialPhoneId');
content = content.replace(/\\n        officialApiToken/g, '\n        officialApiToken');
content = content.replace(/\\n        officialWabaId/g, '\n        officialWabaId');

fs.writeFileSync('temp_repo/api/src/routes/quepasa-mappings.routes.ts', content);
