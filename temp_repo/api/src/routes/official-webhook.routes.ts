import { Router } from 'express';
import { prisma } from '../db/client';
import axios from 'axios';
import { logger } from '../utils/logger';

const router = Router();

// Endpoint for Meta to verify Webhook
router.get('/webhooks/official/:token', async (req, res) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = req.query['hub.verify_token'];

  if (mode === 'subscribe' && verifyToken === req.params.token) {
    logger.info('Official WhatsApp webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Endpoint to receive messages from Meta
router.post('/webhooks/official/:token', async (req, res) => {
  // Webhook payload from Meta
  const payload = req.body;
  res.sendStatus(200); // Always acknowledge quickly
  
  if (payload.object !== 'whatsapp_business_account') return;

  try {
    const mapping = await prisma.quepasaMapping.findUnique({
      where: { quepasaToken: req.params.token, active: true },
    });

    if (!mapping || mapping.provider !== 'official') {
      return;
    }

    // TODO: We need to pull the full typebot/chatwoot orchestration 
    // from quepasa-webhook.routes.ts and adapt for Facebook payload

  } catch (err) {
    logger.error({ err }, 'Error processing official webhook');
  }
});

export default router;
