import { Router } from 'express';
import { quepasaClient } from '../clients/quepasa.client';
import { authMiddleware } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';
import { prisma } from '../db/client';

const router = Router();

router.post('/campaigns/send', authMiddleware, async (req, res, next) => {
  try {
    const { instanceId, phone, message } = req.body;
    let quepasaToken = '';
    
    if (instanceId.startsWith('qp_')) {
      const mappingId = instanceId.replace('qp_', '');
      const mapping = await prisma.quepasaMapping.findUnique({ where: { id: mappingId } });
      if (!mapping || !mapping.quepasaToken) return res.status(404).json({ error: 'Instance not found' });
      quepasaToken = mapping.quepasaToken;
    } else {
      quepasaToken = instanceId;
    }

    const cleanNumber = phone.replace(/\D/g, '');
    let chatId = phone;
    if (cleanNumber.length > 8) {
      chatId = `${cleanNumber}@s.whatsapp.net`;
    }

    const result = await quepasaClient.sendTextMessage(quepasaToken, chatId, message);
    res.json({ success: true, result });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to send campaign message');
    res.status(500).json({ error: error.message });
  }
});

export default router;
