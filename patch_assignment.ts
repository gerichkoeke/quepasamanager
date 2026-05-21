import * as fs from 'fs';

let content = fs.readFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', 'utf8');

const replacement = `
        if ((req as any).nativeBotTeamId && result && result.conversationId) {
          try {
            const axios = require('axios');
            const teamId = (req as any).nativeBotTeamId;
            const baseUrl = chatwootConfig.baseUrl.replace(/\\/$/, '');
            const headers = { 'api_access_token': chatwootConfig.apiAccessToken, 'Content-Type': 'application/json' };
            await axios.post(\`\${baseUrl}/api/v1/accounts/\${chatwootConfig.accountId}/conversations/\${result.conversationId}/assignments\`, { team_id: teamId }, { headers });
            logger.info({ conversationId: result.conversationId, teamId }, 'Assigned conversation to team via Native Bot');
          } catch(e) {
            logger.error('Failed to assign team via Native Bot');
          }
        }
`;

content = content.replace(
  /logger\.info\(\s*\{ conversationId: result\.conversationId, messageId: result\.messageId, fromNumber, quepasaToken: token \},\s*'Text message forwarded to Chatwoot'\s*\);/g,
  `logger.info({ conversationId: result.conversationId, messageId: result.messageId, fromNumber, quepasaToken: token }, 'Text message forwarded to Chatwoot');` + replacement
);

fs.writeFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', content);
