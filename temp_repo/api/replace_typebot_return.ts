import fs from 'fs';

const file = 'temp_repo/api/src/routes/quepasa-webhook.routes.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace Typebot returns
code = code.replace(
  `           if (!isHandoff) {\n             return res.json({ success: true, processedByTypebot: true, message: 'Message handled strictly by Typebot' });\n           }`,
  `           if (!isHandoff && !quepasaMapping.syncBotMessagesToChatwoot) {\n             return res.json({ success: true, processedByTypebot: true, message: 'Message handled strictly by Typebot' });\n           }`
);

// Append Nativebot handling at the bottom of Chatwoot block
const typebotEndBlock = `        return res.json({ success: true, processedByTypebot: true, conversationId: result.conversationId, messageId: result.messageId });
      }`;

const addition = `        if (!isHandoff) {
          return res.json({ success: true, processedByTypebot: true, conversationId: result.conversationId, messageId: result.messageId });
        }
      }

      // FORWARD NATIVE BOT MESSAGES TO CHATWOOT AND RETURN
      if (nativeBotHandled && typeof nativeBotMessagesToForward !== 'undefined' && nativeBotMessagesToForward.length > 0) {
        if (quepasaMapping.syncBotMessagesToChatwoot) {
          for (const msg of nativeBotMessagesToForward) {
            await chatwootClient.sendMessage(chatwootConfig, result.conversationId, \`🤖 Bot:\\n\${msg}\`, 'outgoing');
            await prisma.eventLog.create({ data: { direction: 'out', provider: 'nativebot', sessionId: token, peer: fromNumber, payload: { text: msg } }});
          }
        }
        return res.json({ success: true, processedByNativeBot: true, conversationId: result.conversationId, messageId: result.messageId });
      }`;

code = code.replace(typebotEndBlock, addition);

fs.writeFileSync(file, code);
console.log("Success phase 2");
