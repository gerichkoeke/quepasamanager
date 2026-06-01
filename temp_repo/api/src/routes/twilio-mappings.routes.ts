import { Router } from 'express';
import { PrismaClient } from '@prisma/prisma-client';
import axios from 'axios';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all mappings
router.get('/twilio-mappings', authMiddleware, async (req, res) => {
  try {
    const mappings = await prisma.twilioMapping.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Hide api token
    const safeMappings = mappings.map(m => {
      const { chatwootApiToken, authToken, ...rest } = m;
      return {
        ...rest,
        chatwootApiToken: chatwootApiToken ? '••••••••••••••' : undefined,
      };
    });

    res.json(safeMappings);
  } catch (error) {
    console.error('Error listing Twilio mappings:', error);
    res.status(500).json({ error: 'Failed to list mappings' });
  }
});

// Create mapping
router.post('/twilio-mappings', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    
    const mapping = await prisma.twilioMapping.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        useMessagingService: data.useMessagingService || false,
        accountSid: data.accountSid,
        authToken: data.authToken,
        chatwootBaseUrl: data.chatwootBaseUrl,
        chatwootApiToken: data.chatwootApiToken,
        chatwootAccountId: data.chatwootAccountId,
        active: data.active ?? true,
      }
    });

    const { chatwootApiToken: _, authToken: __, ...safeData } = mapping;
    res.json(safeData);
  } catch (error) {
    console.error('Error creating Twilio mapping:', error);
    res.status(500).json({ error: 'Failed to create mapping' });
  }
});

// Update mapping
router.put('/twilio-mappings/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = {
      name: data.name,
      phoneNumber: data.phoneNumber,
      useMessagingService: data.useMessagingService,
      accountSid: data.accountSid,
      chatwootBaseUrl: data.chatwootBaseUrl,
      chatwootAccountId: data.chatwootAccountId,
      active: data.active,
    };

    if (data.authToken && data.authToken !== '••••••••••••••') {
      updateData.authToken = data.authToken;
    }

    if (data.chatwootApiToken && data.chatwootApiToken !== '••••••••••••••') {
      updateData.chatwootApiToken = data.chatwootApiToken;
    }

    const mapping = await prisma.twilioMapping.update({
      where: { id },
      data: updateData
    });

    res.json(mapping);
  } catch (error) {
    console.error('Error updating Twilio mapping:', error);
    res.status(500).json({ error: 'Failed to update mapping' });
  }
});

// Delete mapping
router.delete('/twilio-mappings/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.twilioMapping.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting Twilio mapping:', error);
    res.status(500).json({ error: 'Failed to delete mapping' });
  }
});

// Setup Chatwoot Integration
router.post('/twilio-mappings/:id/setup-integration', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await prisma.twilioMapping.findUnique({ where: { id } });

    if (!mapping) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    if (!mapping.chatwootApiToken) {
      return res.status(400).json({ error: 'Chatwoot API Token is required' });
    }

    // Call Chatwoot to create Twilio inbox
    const chatwootClient = axios.create({
      baseURL: mapping.chatwootBaseUrl,
      headers: {
        'api_access_token': mapping.chatwootApiToken,
        'Content-Type': 'application/json'
      }
    });

    const inboxPayload = {
      name: mapping.name,
      channel: {
        type: 'twilio',
        phone_number: mapping.phoneNumber,
        account_sid: mapping.accountSid,
        auth_token: mapping.authToken,
        has_messaging_service: mapping.useMessagingService
      }
    };

    const response = await chatwootClient.post(`/api/v1/accounts/${mapping.chatwootAccountId}/inboxes`, inboxPayload);
    const inboxId = response.data.id;

    // Update mapping with inbox ID
    const updated = await prisma.twilioMapping.update({
      where: { id },
      data: { chatwootInboxId: String(inboxId) }
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error setting up integration:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to setup integration with Chatwoot' });
  }
});

export default router;
