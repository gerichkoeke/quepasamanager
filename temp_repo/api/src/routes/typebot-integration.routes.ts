import { Router } from 'express';
import { z } from 'zod';
import { quepasaClient } from '../clients/quepasa.client';
import { logger } from '../utils/logger';
import { prisma } from '../db/client';

const router = Router();

// Middleware to extract and validate token
const tokenMiddleware = async (req: any, res: any, next: any) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    // fallback to query parameter
    if (!token && req.query.token) {
      token = req.query.token as string;
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
    }

    const mapping = await prisma.quepasaMapping.findFirst({
      where: {
        OR: [
          { quepasaToken: token },
          { id: token }
        ]
      }
    });

    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found for the provided token' });
    }

    req.quepasaMapping = mapping;
    next();
  } catch (err: any) {
    logger.error({ error: err.message }, 'Failed in token middleware');
    res.status(500).json({ error: 'Internal server error validating token' });
  }
};

// Endpoint to handle sending messages via Quepasa (for Typebot Integration blocked flows)
router.post('/sendList', tokenMiddleware, async (req: any, res: any, next: any) => {
  try {
    const { number, type, message, title, footer, buttonText, sections } = req.body;
    
    if (!number) {
      return res.status(400).json({ error: '"number" field is required' });
    }

    // Convert string number to WhatsApp chat ID if not formatted
    let cleanNumber = number.replace(/\D/g, '');
    const chatId = `${cleanNumber}@s.whatsapp.net`;

    if (type === 'list') {
      const result = await quepasaClient.sendListMessage(
        req.quepasaMapping.quepasaToken,
        chatId,
        message || title || "Menu",
        buttonText || "Options",
        footer || title || "",
        sections || []
      );

      return res.json({ success: true, result });
    } else {
      return res.status(400).json({ error: 'Unsupported message type' });
    }
    
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to send list message via integration api');
    res.status(500).json({ error: error.message });
  }
});

// A versatile endpoint specifically mimicking standard Quepasa send if needed:
router.post('/message/send', tokenMiddleware, async (req: any, res: any, next: any) => {
  try {
    const payload = req.body;
    const bodyContent = payload; 
    let cleanNumber = payload.number ? payload.number.replace(/\D/g, '') : undefined;
    const chatId = cleanNumber ? `${cleanNumber}@s.whatsapp.net` : payload.chatId;

    if (!chatId) return res.status(400).json({ error: 'Missing number or chatId' });

    if (payload.type === 'list') {
      const result = await quepasaClient.sendListMessage(
        req.quepasaMapping.quepasaToken,
        chatId,
        payload.message || payload.title || "Menu",
        payload.buttonText || "Options",
        payload.footer || payload.title || "",
        payload.sections || []
      );
      return res.json({ success: true, result });
    } 
    else if (payload.type === 'image' || payload.type === 'video' || payload.type === 'document' || payload.type === 'audio') {
      const result = await quepasaClient.sendMediaMessage(
        req.quepasaMapping.quepasaToken,
        chatId,
        {
          content: payload.media.split(',')[1] || payload.media,
          mimetype: payload.mimetype || 'application/octet-stream',
          filename: payload.fileName || 'file',
          text: payload.caption
        }
      );
      return res.json({ success: true, result });
    }
    else {
      // Default to text
      const textMessage = payload.message || payload.text;
      if (!textMessage) return res.status(400).json({ error: 'Message text is missing' });
      
      const result = await quepasaClient.sendTextMessage(
        req.quepasaMapping.quepasaToken,
        chatId,
        textMessage
      );
      return res.json({ success: true, result });
    }
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to send message via integration api');
    res.status(500).json({ error: error.message });
  }
});

export default router;
