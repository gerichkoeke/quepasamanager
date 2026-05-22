import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authMiddleware } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';
import { quepasaClient } from '../clients/quepasa.client';

import { rabbitMQService } from '../services/rabbitmq.service';

const router = Router();

// Toggle RabbitMQ Connection
router.post('/settings/rabbitmq/toggle', authMiddleware, async (req, res, next) => {
  try {
    const isConnected = rabbitMQService.isConnected();
    if (isConnected) {
      await rabbitMQService.disconnect();
      res.json({ success: true, message: 'RabbitMQ desconectado', connected: false });
    } else {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost';
      await rabbitMQService.connect(url);
      res.json({ success: true, message: 'RabbitMQ conectado', connected: rabbitMQService.isConnected() });
    }
  } catch (error) {
    next(error);
  }
});

const settingsSchema = z.object({
  quepasa_url: z.string().url().optional(),
  quepasa_user: z.string().email().optional(),
  quepasa_password: z.string().optional(),
});

// Get all settings
router.get('/settings', authMiddleware, async (req, res, next) => {
  try {
    const settings = await prisma.appSetting.findMany();

    const settingsMap = settings.reduce((acc: Record<string, string>, setting: any) => {
      // Don't expose sensitive keys - return empty string if exists
      if (setting.key.includes('api_key') || setting.key.includes('token') || setting.key.includes('password')) {
        acc[setting.key] = '';
      } else {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {} as Record<string, string>);

    res.json(settingsMap);
  } catch (error) {
    next(error);
  }
});

// Update settings
router.post('/settings', authMiddleware, async (req, res, next) => {
  try {
    const validated = settingsSchema.parse(req.body);

    // Filter out undefined and empty strings (to keep existing values for sensitive fields)
    const updates = Object.entries(validated).filter(
      ([_, value]) => value !== undefined && value !== ''
    );

    await Promise.all(
      updates.map(([key, value]) =>
        prisma.appSetting.upsert({
          where: { key },
          update: { value: value as string },
          create: { key, value: value as string },
        })
      )
    );

    logger.info({ keys: updates.map(([k]) => k) }, 'Settings updated');

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid settings data', details: (error as any).errors });
    }
    next(error);
  }
});

// Test Quepasa connection
router.get('/settings/test-quepasa', authMiddleware, async (req, res, next) => {
  try {
    const result = await quepasaClient.testConnection();
    res.json(result);
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Quepasa connection test failed');
    res.status(500).json({ success: false, message: 'Failed to connect to Quepasa' });
  }
});

// Get specific setting (must come after specific routes to avoid catching them)
router.get('/settings/:key', authMiddleware, async (req, res, next) => {
  try {
    const { key } = req.params;

    const setting = await prisma.appSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    // Don't expose sensitive keys
    const value =
      key.includes('api_key') || key.includes('token') || key.includes('password') ? (setting.value ? '***' : '') : setting.value;

    res.json({ key: setting.key, value });
  } catch (error) {
    next(error);
  }
});

export default router;
