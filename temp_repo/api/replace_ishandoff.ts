import fs from 'fs';

const file = 'temp_repo/api/src/routes/quepasa-webhook.routes.ts';
let code = fs.readFileSync(file, 'utf8');

// Move isHandoff up
code = code.replace(
  `let typebotHandled = false;`,
  `let typebotHandled = false;\n    let isHandoff = false;`
);

code = code.replace(
  /let isHandoff = false;/g,
  (match, offset) => offset > code.indexOf('let typebotHandled') + 100 ? `isHandoff = false;` : match
);

fs.writeFileSync(file, code);
console.log("Success phase 3");
