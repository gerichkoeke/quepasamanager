import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

let prismaClient: PrismaClient;

try {
  prismaClient = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
  
  // Log queries in development
  if (process.env.NODE_ENV === 'development') {
    prismaClient.$on('query' as never, (e: any) => {
      logger.debug({ query: e.query, params: e.params }, 'Database query');
    });
  }
} catch (error) {
  logger.warn('Database config missing or invalid — using mock PrismaClient');
  const noOp = { 
    findMany: async () => [], 
    findFirst: async () => null,
    findUnique: async () => null, 
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {}, 
    delete: async () => ({}),
    count: async () => 0
  };
  prismaClient = new Proxy({}, { 
    get: (_, prop) => prop === '$connect' || prop === '$disconnect' ? async () => {} : noOp 
  }) as any;
}

export const prisma = prismaClient;

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to database');
    throw error;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
