import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  adminToken: process.env.ADMIN_TOKEN || 'change-this-secure-token',

  database: {
    url: process.env.DATABASE_URL || '',
  },

  typebot: {
    host: process.env.TYPEBOT_HOST || '',
    flowId: process.env.TYPEBOT_FLOW_ID || '',
    apiKey: process.env.TYPEBOT_API_KEY || '',
    basePath: process.env.TYPEBOT_API_BASE_PATH || '/api/v1',
    endpoints: {
      incoming: process.env.TYPEBOT_INCOMING_ENDPOINT || '/typebots/{flowId}/startChat',
    },
  },

  webhook: {
    baseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:3000',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  systemBaseUrl: process.env.SYSTEM_BASE_URL || 'http://localhost:3000',
};
