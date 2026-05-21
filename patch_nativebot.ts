import * as fs from 'fs';

let content = fs.readFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', 'utf8');

const target = `    // Process Typebot if enabled and this is not a group message (Typebot usually for DMs)
    if (quepasaMapping.useTypebot && quepasaMapping.typebotFlowId && !isGroup) {`;

const newCode = `    // Process Native Bot if enabled
    if (quepasaMapping.useNativeBot && !isGroup) {
      try {
        let botSession = await prisma.nativeBotSession.findFirst({
          where: { quepasaMappingId: quepasaMapping.id, phone: fromNumber }
        });

        if (!botSession) {
          // Initialize session and send menu
          botSession = await prisma.nativeBotSession.create({
            data: {
              quepasaMappingId: quepasaMapping.id,
              phone: fromNumber,
              state: 'menu'
            }
          });

          let menuText = (quepasaMapping.botWelcomeMessage || 'Olá! Selecione uma opção:') + '\\n';
          if (quepasaMapping.botOptions) {
            const options = quepasaMapping.botOptions as any[];
            options.forEach(opt => {
              menuText += \`\\n\${opt.id} - \${opt.text}\`;
            });
          }

          logger.info({ phone: fromNumber, mappingId: quepasaMapping.id }, 'Sending native bot menu');
          await quepasaClient.initialize();
          await quepasaClient.sendTextMessage(quepasaMapping.quepasaToken, fromNumber, menuText);
          return res.json({ success: true, message: 'Native bot menu sent' });
        } else if (botSession.state === 'menu') {
          // Process menu choice
          const options = (quepasaMapping.botOptions as any[]) || [];
          const choiceId = (messageText || '').trim();
          const option = options.find(o => String(o.id) === choiceId);

          if (option) {
            // Pause bot
            await prisma.nativeBotSession.update({
              where: { id: botSession.id },
              data: { state: 'paused' }
            });
            
            logger.info({ phone: fromNumber, teamId: option.teamId }, 'Native bot menu choice selected, routing to team');
            
            // Let the message proceed to Chatwoot!
            // But we intercept Chatwoot conversation creation to assign the team.
            // Since we don't have a direct hook into creation, and we want it to show the user's message as first in Chatwoot...
            // It will fall through to Chatwoot logic below.
            // But we need a way to assign the team. The simplest is to assign it immediately after creating it in Chatwoot.
            // I'll attach a flag to the request so it handles team assignment below.
            (req as any).nativeBotTeamId = option.teamId;

          } else {
            // Invalid choice
            await quepasaClient.initialize();
            await quepasaClient.sendTextMessage(quepasaMapping.quepasaToken, fromNumber, quepasaMapping.botInvalidMessage || 'Opção inválida.');
            return res.json({ success: true, message: 'Native bot invalid option' });
          }
        }
      } catch (err: any) {
        logger.error({ error: err.message }, 'Error processing native bot');
      }
    }

    // Process Typebot if enabled and this is not a group message (Typebot usually for DMs)
    if (quepasaMapping.useTypebot && quepasaMapping.typebotFlowId && !isGroup) {`;

content = content.replace(target, newCode);

fs.writeFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', content);
