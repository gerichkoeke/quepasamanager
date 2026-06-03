import { Router } from 'express';
import { quepasaClient } from '../clients/quepasa.client';
import { authMiddleware } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';
import { prisma } from '../db/client';

const router = Router();

router.get('/campaigns', authMiddleware, async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { instances: true, _count: { select: { contacts: true } } }
    });
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/campaigns/:id', authMiddleware, async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { instances: true, contacts: true }
    });
    if (!campaign) return res.status(404).json({ error: 'Not found' });
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/campaigns', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, source, rotationMode, minDelay, maxDelay, pauseEvery, pauseDuration, messageContent, selectedInstances, contacts } = req.body;
    
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        source,
        rotationMode,
        minDelay,
        maxDelay,
        pauseEvery,
        pauseDuration,
        messageContent,
        instances: {
          create: selectedInstances.map((i: string) => ({ instanceId: i }))
        },
        contacts: {
          create: contacts.map((c: any) => ({
            name: c.name,
            phone: c.phone
          }))
        }
      },
      include: { instances: true, contacts: true }
    });
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/campaigns/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, source, rotationMode, minDelay, maxDelay, pauseEvery, pauseDuration, messageContent, selectedInstances, contacts } = req.body;
    
    // update campaign fields
    await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        name, description, source, rotationMode, minDelay, maxDelay, pauseEvery, pauseDuration, messageContent
      }
    });

    if (selectedInstances) {
      await prisma.campaignInstance.deleteMany({ where: { campaignId: req.params.id } });
      await prisma.campaignInstance.createMany({
        data: selectedInstances.map((i: string) => ({ campaignId: req.params.id, instanceId: i }))
      });
    }

    if (contacts) {
      await prisma.campaignContact.deleteMany({ where: { campaignId: req.params.id } });
      await prisma.campaignContact.createMany({
        data: contacts.map((c: any) => ({
          campaignId: req.params.id,
          name: c.name,
          phone: c.phone,
          selected: c.selected !== undefined ? c.selected : true,
          runStatus: c.runStatus || 'Aguardando',
          error: c.error,
          sentAt: c.sentAt ? new Date(c.sentAt) : null
        }))
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { instances: true, contacts: true }
    });
    res.json(campaign);
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to update campaign');
    res.status(500).json({ error: error.message });
  }
});

router.delete('/campaigns/:id', authMiddleware, async (req, res, next) => {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
