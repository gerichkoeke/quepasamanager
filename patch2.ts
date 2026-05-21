import * as fs from 'fs';
let code = fs.readFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', 'utf8');

const webhookTarget = `    // Check for Typebot manual triggers
    if (phoneNumber && messageContent) {
      const textContent = messageContent.trim().toLowerCase();
      // Only trigger if an agent types /pausar, OR if the bot sends "falar com humano"
      if (textContent === '/pausar' || textContent === 'falar com humano' || textContent === '/humano') {
        let targetPhone = phoneNumber.replace(/\\D/g, '');
        
        // Find if typebot applies
        // NOTE: we need to use 'prisma' from the outer scope, which we can't in this string replacement?
        // Wait, 'prisma' is required at the top of the file, so it's in scope.
        const tSession = await prisma.typebotSession.findFirst({ where: { phone: targetPhone } });
        if (tSession && !tSession.botPaused) {
          logger.info({ targetPhone }, 'Pausing typebot manually');
          await prisma.typebotSession.updateMany({ where: { phone: targetPhone }, data: { botPaused: true } });
          
          if (messageType !== 'outgoing') {
            await quepasaClient.initialize();
            await quepasaClient.sendTextMessage(token, phoneNumber, 'Seu atendimento foi transferido para um humano.');
          }
          
          if (conversationId) {
            const quepasaMapping = await prisma.quepasaMapping.findFirst({ where: { quepasaToken: token, active: true } });
            if (quepasaMapping) {
              const chatwootConfig = { baseUrl: quepasaMapping.chatwootBaseUrl, apiAccessToken: quepasaMapping.chatwootApiToken, accountId: quepasaMapping.chatwootAccountId, inboxId: quepasaMapping.chatwootInboxId };
              await chatwootClient.sendMessage(chatwootConfig, conversationId, '🤖 Bot foi pausado / Transferido para humano.', 'outgoing');
            }
          }
          if (textContent === '/pausar') {
             return res.json({ success: true, message: 'Bot paused successfully' });
          }
        }
      }
    }

    // Only process outgoing messages (agent responses)
    if (messageType !== 'outgoing') {`;

const parts = code.split(webhookTarget);
if (parts.length > 2) {
    // Only put the target back into the first one. Remove from the second one!
    code = parts[0] + webhookTarget + parts[1] + `    // Only process outgoing messages (agent responses)\n    if (messageType !== 'outgoing') {` + parts[2];
}

fs.writeFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', code);
