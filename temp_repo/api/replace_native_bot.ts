import fs from 'fs';

const file = 'temp_repo/api/src/routes/quepasa-webhook.routes.ts';
let code = fs.readFileSync(file, 'utf8');

// Add the variables
code = code.replace(
  `    let typebotSessionId: string | undefined;`,
  `    // Native Bot state
    let nativeBotMessagesToForward: string[] = [];
    let nativeBotHandled = false;
    const sendNativeText = async (token: string, phone: string, text: string) => {
      nativeBotMessagesToForward.push(text);
      return quepasaClient.sendTextMessage(token, phone, text);
    };
    const sendNativeBtn = async (token: string, phone: string, text: string, btns: string[], title: string) => {
      nativeBotMessagesToForward.push(text + '\\n\\n' + btns.map(b=>'👉 ' + b).join('\\n'));
      return quepasaClient.sendButtonMessage(token, phone, text, btns, title);
    };
    
    let typebotSessionId: string | undefined;`
);

// We need to replace `quepasaClient.sendTextMessage(` and `quepasaClient.sendButtonMessage(` 
const startTag = 'if (quepasaMapping.useNativeBot && !isGroup) {';
const endTag = 'if (quepasaMapping.useTypebot && quepasaMapping.typebotFlowId && !isGroup) {';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end bounds.");
  process.exit(1);
}

let nativeBotCode = code.substring(startIndex, endIndex);

nativeBotCode = nativeBotCode.replace(/await quepasaClient\.sendTextMessage\(/g, 'await sendNativeText(');
nativeBotCode = nativeBotCode.replace(/await quepasaClient\.sendButtonMessage\(/g, 'await sendNativeBtn(');

// Replace early returns
nativeBotCode = nativeBotCode.replace(
  `return res.json({ success: true, message: 'Native bot menu sent' });`,
  `nativeBotHandled = true;\n          if (!quepasaMapping.syncBotMessagesToChatwoot) { return res.json({ success: true, message: 'Native bot menu sent' }); }`
);

nativeBotCode = nativeBotCode.replace(
  `return res.json({ success: true, message: 'Native bot session closed by user' });`,
  `nativeBotHandled = true;\n            if (!quepasaMapping.syncBotMessagesToChatwoot) { return res.json({ success: true, message: 'Native bot session closed by user' }); }`
);

nativeBotCode = nativeBotCode.replace(
  `return res.json({ success: true, message: 'Native bot invalid option / resent menu' });`,
  `nativeBotHandled = true;\n            if (!quepasaMapping.syncBotMessagesToChatwoot) { return res.json({ success: true, message: 'Native bot invalid option / resent menu' }); }`
);

// Set nativeBotHandled for the cases that didn't have early returns but still generated a message!
nativeBotCode = nativeBotCode.replace(
  `await sendNativeText(quepasaMapping.quepasaToken, fromNumber, option.submenuText);`,
  `await sendNativeText(quepasaMapping.quepasaToken, fromNumber, option.submenuText);\n                nativeBotHandled = true;`
);

nativeBotCode = nativeBotCode.replace(
  `Aguarde, em breve um de nossos atendentes falará com você.\`);`,
  `Aguarde, em breve um de nossos atendentes falará com você.\`);\n                nativeBotHandled = true;`
);

code = code.substring(0, startIndex) + nativeBotCode + code.substring(endIndex);
fs.writeFileSync(file, code);
console.log("Success");
