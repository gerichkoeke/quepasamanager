import { prisma } from './client';
import { logger } from '../utils/logger';

async function seed() {
  try {
    logger.info('Starting database seed...');

    // Seed default settings
    await prisma.appSetting.upsert({
      where: { key: 'quepasa_url' },
      update: {},
      create: {
        key: 'quepasa_url',
        value: process.env.QUEPASA_URL || '',
      },
    });

    await prisma.appSetting.upsert({
      where: { key: 'quepasa_user' },
      update: {},
      create: {
        key: 'quepasa_user',
        value: process.env.QUEPASA_USER || '',
      },
    });

    await prisma.appSetting.upsert({
      where: { key: 'typebot_host' },
      update: {},
      create: {
        key: 'typebot_host',
        value: process.env.TYPEBOT_HOST || '',
      },
    });

    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error({ error }, 'Seed failed');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
