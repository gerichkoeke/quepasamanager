import * as fs from 'fs';
let code = fs.readFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', 'utf8');

const target = `              await chatwootClient.sendMessage(chatwootConfig, conversationId, '🤖 Bot foi pausado / Transferido para humano.', 'outgoing');
            }`;

const logic = `              await chatwootClient.sendMessage(chatwootConfig, conversationId, '🤖 Bot foi pausado / Transferido para humano.', 'outgoing');
              
              // Handle team routing directly in Chatwoot
              try {
                const axios = require('axios');
                const baseUrl = chatwootConfig.baseUrl.replace(/\\/$/, '');
                const headers = { 'api_access_token': chatwootConfig.apiAccessToken, 'Content-Type': 'application/json' };
                // Get teams
                const teamsRes = await axios.get(\`\${baseUrl}/api/v1/accounts/\${chatwootConfig.accountId}/teams\`, { headers });
                const teams = teamsRes.data;
                const supportTeam = teams.find((t: any) => t.name.toLowerCase() === 'suporte-tecnico' || t.name.toLowerCase() === 'suporte tecnico');
                if (supportTeam) {
                   await axios.post(\`\${baseUrl}/api/v1/accounts/\${chatwootConfig.accountId}/conversations/\${conversationId}/assignments\`, { team_id: supportTeam.id }, { headers });
                   logger.info({ teamId: supportTeam.id, conversationId }, 'Assigned conversation to suporte-tecnico team rules');
                } else {
                   logger.warn('Team "suporte-tecnico" not found in Chatwoot.');
                }
              } catch (e: any) {
                 logger.error({ error: e.message }, 'Failed to assign conversation to Chatwoot team');
              }
            }`;

code = code.replace(target, logic);
fs.writeFileSync('temp_repo/api/src/routes/quepasa-webhook.routes.ts', code);
