import { Router } from 'express';
import { prisma } from '../db/client';
import { quepasaClient } from '../clients/quepasa.client';
import { chatwootClient } from '../clients/chatwoot.client';
import { logger } from '../utils/logger';
import { rabbitMQService } from '../services/rabbitmq.service';

const router = Router();

/**
 * Helper to safely extract phone number or identifier from various Chatwoot webhook event payloads
 */
const extractChatwootPhoneNumber = (payload: any): string => {
  return payload.meta?.sender?.phone_number ||
         payload.meta?.sender?.identifier ||
         payload.conversation?.meta?.sender?.phone_number ||
         payload.conversation?.meta?.sender?.identifier ||
         payload.sender?.phone_number ||
         payload.sender?.identifier ||
         'unknown';
};

/**
 * Webhook endpoint to receive incoming messages from Quepasa (with token in path)
 * Quepasa sends WhatsApp messages here, we forward them to Chatwoot
 * URL format: /webhooks/quepasa/{quepasaToken}
 */
router.post('/webhooks/quepasa/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const payload = req.body;

    logger.info({ hasToken: !!token, payloadKeys: Object.keys(payload), payload: JSON.stringify(payload) }, 'Received webhook from Quepasa with token');

    // Extract message data from Quepasa webhook
    let fromNumber = payload.chat?.id || payload.from || payload.chatId || payload.chat?.phone;

    // CRITICAL FIX: Meta/WhatsApp is migrating to @lid (Linked Device IDs).
    // If we receive an @lid, we must convert it back to the standard phone number,
    // otherwise Chatwoot will create a new duplicate conversation in "Não atribuídas".
    if (fromNumber && typeof fromNumber === 'string' && fromNumber.includes('@lid') && payload.chat?.phone) {
        const cleanPhone = payload.chat.phone.replace(/[^0-9]/g, '');
        fromNumber = `${cleanPhone}@s.whatsapp.net`;
        logger.info({ originalLid: payload.chat?.id, newFromNumber: fromNumber }, '🔄 Converted @lid to standard phone number format');
    }

    let messageText = payload.text || payload.body || payload.message?.text || '';
    const fromMe = payload.fromme || payload.fromMe || false; // Note: Quepasa uses lowercase 'fromme'
    const senderName = payload.chat?.title || payload.senderName || payload.pushname || fromNumber;

    // Check if message has media attachment
    const messageType = payload.type || 'text';
    const hasAttachment = !!payload.attachment;
    const messageId = payload.id;
    const inreplyQuepasaId = payload.inreply; // ID of the message being replied to

    // Extract message timestamp (Quepasa sends timestamp in seconds or milliseconds)
    const messageTimestamp = payload.timestamp || payload.time || payload.t;

    // Reject messages without timestamp ONLY if they also lack content (likely sync/status events)
    if (!messageTimestamp && !messageText && !hasAttachment) {
      logger.warn(
        { fromNumber, messageType, hasMessageId: !!messageId, payloadKeys: Object.keys(payload) },
        '⚠️ Ignoring empty message without timestamp - likely sync/status event during connection'
      );
      return res.json({ success: true, message: 'Message without timestamp and content ignored (sync event)' });
    }

    // Filter out non-message event types (status updates, read receipts, presence, contact sync, etc.)
    const ignoredEventTypes = ['ack', 'read', 'delivered', 'presence', 'status', 'typing', 'recording', 'contact'];
    if (messageType && ignoredEventTypes.includes(messageType.toLowerCase())) {
      logger.info(
        { fromNumber, messageType },
        '🔕 Ignoring non-message event type (sync/status event)'
      );
      return res.json({ success: true, message: `Non-message event type ignored: ${messageType}` });
    }

    // DEBUG: Log message ID from Quepasa payload
    logger.info({ messageId, hasMessageId: !!messageId, payloadId: payload.id, inreply: inreplyQuepasaId }, '📋 DEBUG: Message ID from Quepasa');

    // Check if this is a reply to another message (WhatsApp → Chatwoot)
    let chatwootReplyToId: number | undefined;
    if (inreplyQuepasaId) {
      try {
        const messageMapping = await prisma.messageMapping.findFirst({
          where: {
            quepasaMessageId: inreplyQuepasaId,
          },
        });

        if (messageMapping) {
          chatwootReplyToId = messageMapping.chatwootMessageId;
          logger.info({ inreplyQuepasaId, chatwootReplyToId }, '✅ Found Chatwoot message ID from database for WhatsApp reply');
        } else {
          logger.warn({ inreplyQuepasaId }, 'No message mapping found in database for this Quepasa reply');
        }
      } catch (error: any) {
        logger.warn({ error: error.message, inreplyQuepasaId }, 'Failed to lookup Chatwoot message ID from database');
      }
    }

    // Check if this is a group message (Protected against crash)
    const isGroup = (fromNumber && fromNumber.includes('@g.us')) || payload.isGroup;

    // For group messages, prepend participant info (who sent the message)
    if (isGroup && payload.participant) {
      const participantName = payload.participant.title || payload.participant.name || 'Membro';
      const participantPhone = payload.participant.phone || payload.participant.id || '';

      // Prepend participant info to message
      const participantInfo = `📱 *${participantName}*${participantPhone ? ` (${participantPhone})` : ''}`;
      messageText = messageText ? `${participantInfo}\n${messageText}` : participantInfo;

      logger.info({ participantName, participantPhone, isGroup }, 'Group message with participant info');
    }

    // Log incoming event
    await prisma.eventLog.create({
      data: {
        direction: 'in',
        provider: 'quepasa',
        sessionId: token || 'quepasa',
        peer: fromNumber || 'unknown',
        payload: payload,
      },
    });

    if (rabbitMQService.isConnected()) {
      rabbitMQService.publishMessage('quepasa_events', {
        provider: 'quepasa',
        direction: 'in',
        token,
        fromNumber,
        messageText,
        isGroup,
        messageType,
        hasAttachment,
        messageId,
        messageTimestamp,
        payload
      }).catch(err => {
         logger.error({ error: err.message }, 'Failed to publish to RabbitMQ quepasa_events');
      });
    }

    // Validate required fields (accept messages with attachment but no text)
    if (!fromNumber) {
      logger.warn({ payload }, 'Incomplete Quepasa webhook payload - missing phone number');
      return res.status(400).json({ error: 'Invalid webhook payload - missing phone number' });
    }

    // Must have either text or attachment
    if (!messageText && !hasAttachment) {
      logger.warn({ payload }, 'Incomplete Quepasa webhook payload - no text or attachment');
      return res.status(400).json({ error: 'Invalid webhook payload - no content' });
    }

    if (!token) {
      logger.warn({ payload }, 'No token in Quepasa webhook URL');
      return res.status(400).json({ error: 'Missing token in URL path' });
    }

    // Ignore messages sent by bot owner (fromMe = true)
    if (fromMe) {
      logger.info({ fromNumber, fromMe }, 'Ignoring message from bot owner');
      return res.json({ success: true, message: 'Message from owner ignored' });
    }

    // Find QuepasaMapping by Quepasa token
    const quepasaMapping = await prisma.quepasaMapping.findFirst({
      where: {
        quepasaToken: token,
        active: true,
      },
      select: {
        id: true,
        quepasaToken: true,
        phoneNumber: true,
        name: true,
        chatwootBaseUrl: true,
        chatwootApiToken: true,
        chatwootAccountId: true,
        chatwootInboxId: true,
        useTypebot: true,
        typebotFlowId: true,
        typebotHost: true,
        typebotApiKey: true,
        closingMessage: true,
        returnWebhookUrl: true,
        enableGroups: true,
        reopenClosedTickets: true,
        showAgentName: true,
        maxMessageAgeMinutes: true,
        active: true,
      },
    });

    if (!quepasaMapping) {
      logger.warn({ token }, 'No active Quepasa mapping found for token');
      return res.status(404).json({ error: 'Quepasa mapping not found for this token' });
    }

    // Now check message age
    if (messageTimestamp) {
      let messageDate: Date;

      if (messageTimestamp > 10000000000) {
        messageDate = new Date(messageTimestamp);
      } else {
        messageDate = new Date(messageTimestamp * 1000);
      }

      const now = new Date();
      const ageMinutes = (now.getTime() - messageDate.getTime()) / (1000 * 60);

      if (ageMinutes > quepasaMapping.maxMessageAgeMinutes) {
        logger.info(
          { fromNumber, messageTimestamp, ageMinutes: ageMinutes.toFixed(2), maxAge: quepasaMapping.maxMessageAgeMinutes, mappingId: quepasaMapping.id },
          '⏰ Ignoring old message (likely from sync after connection)'
        );
        return res.json({ success: true, message: 'Old message ignored (from sync)' });
      }
    }

    // Check idempotency
    if (messageId) {
      const existingMessage = await prisma.processedMessage.findUnique({
        where: {
          quepasaMappingId_externalId_source: {
            quepasaMappingId: quepasaMapping.id,
            externalId: messageId,
            source: 'quepasa',
          },
        },
      });

      if (existingMessage) {
        logger.info(
          { messageId, fromNumber, processedAt: existingMessage.processedAt },
          '✅ Message already processed (idempotency check) - ignoring'
        );
        return res.json({ success: true, message: 'Message already processed' });
      }
    }

    // Check if groups are enabled
    if (isGroup && !quepasaMapping.enableGroups) {
      logger.info({ fromNumber, isGroup, mappingId: quepasaMapping.id }, 'Ignoring group message - groups not enabled for this mapping');
      return res.json({ success: true, message: 'Group message ignored (groups not enabled)' });
    }

    // Process Typebot
    if (quepasaMapping.useTypebot && quepasaMapping.typebotFlowId && !isGroup) {
      try {
        const { typebotClient } = require('../clients/typebot.client');
        await typebotClient.initialize();

        const userId = fromNumber.replace(/\D/g, '');

        let typebotSessionId: string | undefined;
        let letTypebotHandle = true;

        const existingSession = await prisma.typebotSession.findFirst({
          where: { phone: userId }
        });

        if (existingSession?.botPaused) {
           letTypebotHandle = false;
           logger.info({ userId }, 'Typebot paused, handing over to Chatwoot');
        } else {
           logger.info({ userId }, 'Sending message to Typebot');

           let typebotResponse;
           if (!existingSession) {
             typebotResponse = await typebotClient.startChat(
               quepasaMapping.typebotFlowId,
               userId,
               messageText,
               quepasaMapping.typebotHost,
               quepasaMapping.typebotApiKey || undefined
             );
             await prisma.typebotSession.create({
                data: {
                  sessionId: quepasaMapping.quepasaToken,
                  phone: userId,
                  typebotSessionId: typebotResponse.sessionId,
                  lastMessageId: messageId || '',
                }
             });
           } else {
             typebotResponse = await typebotClient.continueChat(
               existingSession.typebotSessionId,
               messageText,
               quepasaMapping.typebotHost,
               quepasaMapping.typebotApiKey || undefined
             );
           }

           await quepasaClient.initialize();
           let chatId = fromNumber;

           for (const tMsg of typebotResponse.messages) {
               if (tMsg.type === 'text') {
                 await quepasaClient.sendTextMessage(token, chatId, tMsg.content);
               } else {
                 await quepasaClient.sendMediaMessage(token, chatId, {
                   url: tMsg.content,
                   mime: tMsg.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
                   filename: 'media',
                   text: tMsg.caption
                 });
               }
           }
           return res.json({ success: true, processedByTypebot: true });
        }
      } catch (err: any) {
        logger.error({ error: err.message }, 'Typebot processing failed, falling back to chatwoot');
      }
    }

    // Build Chatwoot config
    const chatwootConfig = {
      baseUrl: quepasaMapping.chatwootBaseUrl,
      apiAccessToken: quepasaMapping.chatwootApiToken,
      accountId: quepasaMapping.chatwootAccountId,
      inboxId: quepasaMapping.chatwootInboxId,
    };

    // Process message in Chatwoot
    try {
      let result: { conversationId: number; messageId: number };

      if (hasAttachment && messageId) {
        logger.info({ messageId, messageType, fromNumber }, 'Processing media message');
        await quepasaClient.initialize();
        const media = await quepasaClient.downloadMedia(token, messageId);

        if (messageType === 'location' || media.mimeType.includes('location')) {
          logger.info({ messageId, messageType, mimeType: media.mimeType, fromNumber }, '📍 Processing location message');

          const locationData = media.buffer.toString('utf-8');
          const geoMatch = locationData.match(/geo:([-\d.]+),([-\d.]+)/i) || locationData.match(/([-\d.]+),([-\d.]+)/);

          if (geoMatch) {
            const latitude = geoMatch[1];
            const longitude = geoMatch[2];
            const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const locationMessage = `📍 Localização compartilhada:\n${mapsLink}`;
            const displayName = isGroup ? `${senderName} (Grupo)` : senderName;
            result = await chatwootClient.processIncomingMessage(chatwootConfig, fromNumber, locationMessage, displayName, messageId, chatwootReplyToId, quepasaMapping.reopenClosedTickets);
          } else {
            const displayName = isGroup ? `${senderName} (Grupo)` : senderName;
            result = await chatwootClient.processIncomingMessage(chatwootConfig, fromNumber, `📍 Localização: ${locationData}`, displayName, messageId, chatwootReplyToId, quepasaMapping.reopenClosedTickets);
          }
        } else if (messageType === 'vcard' || media.mimeType.includes('vcard') || media.mimeType.includes('contact')) {
          logger.info({ messageId, messageType, mimeType: media.mimeType, fromNumber }, '👤 Processing vCard contact message');
          const vcardData = media.buffer.toString('utf-8');

          try {
            const nameMatch = vcardData.match(/FN:(.+)/i);
            const contactName = nameMatch ? nameMatch[1].trim() : 'Contato';
            const phoneMatches = vcardData.matchAll(/TEL[^:]*:(.+)/gi);
            const phones: string[] = [];
            for (const match of phoneMatches) {
              phones.push(match[1].trim());
            }
            const emailMatch = vcardData.match(/EMAIL[^:]*:(.+)/i);
            const email = emailMatch ? emailMatch[1].trim() : null;
            const orgMatch = vcardData.match(/ORG:(.+)/i);
            const organization = orgMatch ? orgMatch[1].trim() : null;

            let contactMessage = `👤 Contato compartilhado:\n\n**Nome:** ${contactName}\n`;
            if (phones.length > 0) {
              contactMessage += `**Telefone(s):**\n`;
              phones.forEach(phone => { contactMessage += `  • ${phone}\n`; });
            }
            if (email) { contactMessage += `**Email:** ${email}\n`; }
            if (organization) { contactMessage += `**Empresa:** ${organization}\n`; }

            const displayName = isGroup ? `${senderName} (Grupo)` : senderName;
            result = await chatwootClient.processIncomingMessage(chatwootConfig, fromNumber, contactMessage, displayName, messageId, chatwootReplyToId, quepasaMapping.reopenClosedTickets);
          } catch (error: any) {
            const displayName = isGroup ? `${senderName} (Grupo)` : senderName;
            result = await chatwootClient.processIncomingMessage(chatwootConfig, fromNumber, `👤 Contato compartilhado:\n${vcardData}`, displayName, messageId, chatwootReplyToId, quepasaMapping.reopenClosedTickets);
          }
        } else {
          const displayName = isGroup ? `${senderName} (Grupo)` : senderName;
          const { conversation, contact } = await chatwootClient.findOrCreateConversation(
            chatwootConfig,
            fromNumber,
            displayName,
            quepasaMapping.reopenClosedTickets
          );

          const extension = media.mimeType.split('/')[1]?.split(';')[0] || 'bin';
          const filename = `${messageType}_${Date.now()}.${extension}`;

          const chatwootMessage = await chatwootClient.sendMessageWithFileUpload(
            chatwootConfig,
            conversation.id,
            messageText || '', 
            media.buffer,
            filename,
            media.mimeType,
            'incoming',
            messageId,  
            chatwootReplyToId  
          );

          result = {
            conversationId: conversation.id,
            messageId: chatwootMessage.id,
          };

          if (fromNumber) {
            (async () => {
              try {
                const profilePictureUrl = await quepasaClient.getProfilePictureUrl(token, fromNumber);
                if (profilePictureUrl) {
                  await chatwootClient.updateContactAvatar(chatwootConfig, contact.id, profilePictureUrl);
                }
              } catch (error: any) {}
            })();
          }
        }
      } else {
        const displayName = isGroup ? `${senderName} (Grupo)` : senderName;
        result = await chatwootClient.processIncomingMessage(chatwootConfig, fromNumber, messageText, displayName, messageId, chatwootReplyToId, quepasaMapping.reopenClosedTickets);
      }

      if (fromNumber) {
        (async () => {
          try {
            const { contact } = await chatwootClient.findOrCreateConversation(chatwootConfig, fromNumber, senderName, quepasaMapping.reopenClosedTickets);
            await quepasaClient.initialize();
            const profilePictureUrl = await quepasaClient.getProfilePictureUrl(token, fromNumber);
            if (profilePictureUrl) {
              await chatwootClient.updateContactAvatar(chatwootConfig, contact.id, profilePictureUrl);
            }
          } catch (error: any) {}
        })();
      }

      if (messageId && result.messageId) {
        try {
          await prisma.messageMapping.create({
            data: {
              chatwootMessageId: result.messageId,
              quepasaMessageId: messageId,
              conversationId: result.conversationId,
            },
          });
        } catch (error: any) {}
      }

      await prisma.eventLog.create({
        data: {
          direction: 'out',
          provider: 'chatwoot',
          sessionId: token,
          peer: fromNumber,
          payload: {
            conversationId: result.conversationId,
            messageId: result.messageId,
            text: messageText,
            messageType,
            hasAttachment,
          },
        },
      });

      if (messageId) {
        try {
          await prisma.processedMessage.create({
            data: {
              quepasaMappingId: quepasaMapping.id,
              externalId: messageId,
              source: 'quepasa',
              direction: 'incoming',
            },
          });
        } catch (error: any) {}
      }

      res.json({
        success: true,
        conversationId: result.conversationId,
        messageId: result.messageId,
      });
    } catch (error: any) {
      logger.error({ error: error.message, fromNumber, quepasaToken: token }, 'Failed to process message in Chatwoot');
      await prisma.eventLog.create({
        data: {
          direction: 'out',
          provider: 'chatwoot',
          sessionId: token,
          peer: fromNumber,
          payload: {
            error: error.message,
            errorType: 'chatwoot_processing_failed',
          },
        },
      });
      return res.status(500).json({ success: false, error: error.message });
    }
  } catch (error: any) {
    logger.error({ error }, 'Quepasa webhook processing failed');
    next(error);
  }
});

/**
 * FALLBACK: Webhook endpoint without token
 */
router.post('/webhooks/quepasa', async (req, res, next) => {
  try {
    const payload = req.body;
    logger.info({ payloadKeys: Object.keys(payload) }, 'Received webhook from Quepasa');

    const quepasaPhoneNumber = payload.trackid || payload.extra?.phoneNumber;

    let fromNumber = payload.chat?.id || payload.from || payload.chatId || payload.chat?.phone;

    // CRITICAL FIX FOR LID
    if (fromNumber && typeof fromNumber === 'string' && fromNumber.includes('@lid') && payload.chat?.phone) {
        const cleanPhone = payload.chat.phone.replace(/[^0-9]/g, '');
        fromNumber = `${cleanPhone}@s.whatsapp.net`;
    }

    const messageText = payload.text || payload.body || payload.message?.text || '';
    const fromMe = payload.fromme || payload.fromMe || false;
    const senderName = payload.chat?.title || payload.senderName || payload.pushname || fromNumber;

    await prisma.eventLog.create({
      data: {
        direction: 'in',
        provider: 'quepasa',
        sessionId: quepasaPhoneNumber || 'quepasa',
        peer: fromNumber || 'unknown',
        payload: payload,
      },
    });

    if (!fromNumber || !messageText) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    if (fromMe) {
      return res.json({ success: true, message: 'Message from owner ignored' });
    }

    const isGroup = (fromNumber && fromNumber.includes('@g.us')) || payload.isGroup;

    if (!quepasaPhoneNumber) {
      return res.status(400).json({ error: 'Missing Quepasa phone number identifier' });
    }

    const quepasaMapping = await prisma.quepasaMapping.findFirst({
      where: { phoneNumber: quepasaPhoneNumber, active: true },
      select: {
        id: true, quepasaToken: true, phoneNumber: true, name: true,
        chatwootBaseUrl: true, chatwootApiToken: true, chatwootAccountId: true, chatwootInboxId: true,
        reopenClosedTickets: true, showAgentName: true, active: true,
      },
    });

    if (!quepasaMapping) {
      return res.status(404).json({ error: 'Quepasa mapping not found' });
    }

    const chatwootConfig = {
      baseUrl: quepasaMapping.chatwootBaseUrl,
      apiAccessToken: quepasaMapping.chatwootApiToken,
      accountId: quepasaMapping.chatwootAccountId,
      inboxId: quepasaMapping.chatwootInboxId,
    };

    try {
      const displayName = isGroup ? `${senderName} (Grupo)` : senderName;
      const result = await chatwootClient.processIncomingMessage(chatwootConfig, fromNumber, messageText, displayName, undefined, undefined, quepasaMapping.reopenClosedTickets);

      await prisma.eventLog.create({
        data: {
          direction: 'out',
          provider: 'chatwoot',
          sessionId: quepasaPhoneNumber,
          peer: fromNumber,
          payload: { conversationId: result.conversationId, messageId: result.messageId, text: messageText },
        },
      });

      res.json({ success: true, conversationId: result.conversationId, messageId: result.messageId });
    } catch (error: any) {
      await prisma.eventLog.create({
        data: {
          direction: 'out',
          provider: 'chatwoot',
          sessionId: quepasaPhoneNumber,
          peer: fromNumber,
          payload: { error: error.message, errorType: 'chatwoot_processing_failed' },
        },
      });
      return res.status(500).json({ success: false, error: error.message });
    }
  } catch (error: any) {
    next(error);
  }
});

/**
 * Webhook endpoint to receive outgoing messages from Chatwoot (with token in path)
 */
router.post('/webhooks/chatwoot/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const payload = req.body;

    logger.info({ event: payload.event, hasToken: !!token }, 'Received webhook from Chatwoot with token');
    const peerNumber = extractChatwootPhoneNumber(payload);

    await prisma.eventLog.create({
      data: {
        direction: 'in', provider: 'chatwoot', sessionId: token || 'chatwoot', peer: peerNumber, payload: payload,
      },
    });

    if (payload.event === 'conversation_status_changed' && payload.status === 'resolved') {
      const quepasaMapping = await prisma.quepasaMapping.findFirst({ where: { quepasaToken: token, active: true } });
      if (quepasaMapping) {
        const payloadInboxId = payload.inbox?.id || payload.conversation?.inbox_id;
        if (payloadInboxId && payloadInboxId.toString() !== quepasaMapping.chatwootInboxId) {
          return res.json({ success: true, message: 'Event ignored - different inbox' });
        }
        let phoneNumber = extractChatwootPhoneNumber(payload);
        if (phoneNumber && phoneNumber !== 'unknown') {
          let chatId = phoneNumber.includes('@g.us') ? phoneNumber : phoneNumber.replace(/@.*$/, '').replace(/^\+/, '');
          await quepasaClient.initialize();
          if (quepasaMapping.closingMessage) {
            await quepasaClient.sendTextMessage(token, chatId, quepasaMapping.closingMessage);
          }
          if (quepasaMapping.returnWebhookUrl) {
            try {
              const axios = require('axios');
              await axios.post(quepasaMapping.returnWebhookUrl, { event: 'ticket_resolved', chatId, mappingId: quepasaMapping.id, conversationId: payload.conversation?.id });
            } catch (err: any) {}
          }
        }
      }
      return res.json({ success: true, message: 'Processed resolved conversation' });
    }

    if (payload.event !== 'message_created') {
      return res.json({ success: true, message: 'Event ignored' });
    }

    const messageType = payload.message_type || payload.content_attributes?.message_type;
    let messageContent = payload.content || '';
    const conversationId = payload.conversation?.id;
    const phoneNumber = extractChatwootPhoneNumber(payload);
    const attachments = payload.attachments || [];
    const hasAttachments = attachments.length > 0;
    const agentName = payload.sender?.name || payload.sender?.available_name || payload.conversation?.meta?.assignee?.name || 'Atendente';
    const inReplyTo = payload.content_attributes?.in_reply_to || payload.in_reply_to;
    const chatwootMessageId = payload.id; 
    let quepasaReplyId: string | undefined;

    if (messageType !== 'outgoing') {
      return res.json({ success: true, message: 'Not an outgoing message' });
    }

    if (!phoneNumber || phoneNumber === 'unknown') {
      return res.status(400).json({ error: 'Invalid webhook payload - missing phone number' });
    }
    if (!messageContent && !hasAttachments) {
      return res.status(400).json({ error: 'Invalid webhook payload - no content' });
    }

    const quepasaMapping = await prisma.quepasaMapping.findFirst({
      where: { quepasaToken: token, active: true },
      select: { id: true, quepasaToken: true, phoneNumber: true, name: true, chatwootBaseUrl: true, chatwootApiToken: true, chatwootAccountId: true, chatwootInboxId: true, showAgentName: true, active: true },
    });

    if (!quepasaMapping) {
      return res.status(404).json({ error: 'Quepasa mapping not found for this token' });
    }

    const payloadInboxId = payload.inbox?.id || payload.conversation?.inbox_id;
    if (payloadInboxId && payloadInboxId.toString() !== quepasaMapping.chatwootInboxId) {
      return res.json({ success: true, message: 'Event ignored - different inbox' });
    }

    if (quepasaMapping.showAgentName && messageContent && agentName) {
      messageContent = `*${agentName}:*\n${messageContent}`;
    }

    const chatwootConfig = { baseUrl: quepasaMapping.chatwootBaseUrl, apiAccessToken: quepasaMapping.chatwootApiToken, accountId: quepasaMapping.chatwootAccountId, inboxId: quepasaMapping.chatwootInboxId };

    if (inReplyTo && conversationId) {
      try {
        const messageMapping = await prisma.messageMapping.findUnique({ where: { chatwootMessageId: parseInt(inReplyTo) } });
        if (messageMapping) { quepasaReplyId = messageMapping.quepasaMessageId; }
      } catch (error: any) {}
    }

    await quepasaClient.initialize();
    let isGroup = phoneNumber.includes('@g.us');
    let chatId = phoneNumber;

    if (isGroup) {
      chatId = phoneNumber;
    } else if (!phoneNumber.includes('@') && !phoneNumber.startsWith('+') && phoneNumber.length > 10) {
      isGroup = true;
      chatId = `${phoneNumber}@g.us`;
    } else {
      chatId = phoneNumber.replace(/@.*$/, '').replace(/^\+/, '');
    }

    try {
      let result;
      if (hasAttachments) {
        const attachment = attachments[0];
        const mediaUrl = attachment.data_url || attachment.file_url;
        const urlExtension = mediaUrl.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1]?.toLowerCase();
        const mimeTypeMap: Record<string, string> = { 'mp3': 'audio/mpeg', 'ogg': 'audio/ogg', 'oga': 'audio/ogg', 'opus': 'audio/opus', 'wav': 'audio/wav', 'mp4': 'video/mp4', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'pdf': 'application/pdf' };
        let mimeType = (urlExtension && mimeTypeMap[urlExtension]) || attachment.file_type || 'application/octet-stream';
        const filename = attachment.file_name || `file.${urlExtension || 'bin'}`;

        if (attachment.file_type === 'audio' || mimeType.startsWith('audio')) {
          const axios = require('axios');
          const { convertAudioToPTT } = require('../utils/audio');
          const { config } = require('../config');

          const audioResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
          const audioBuffer = Buffer.from(audioResponse.data);
          const { filePath: convertedFilePath, duration } = await convertAudioToPTT(audioBuffer);
          const convertedFilename = require('path').basename(convertedFilePath);
          const publicUrl = `${config.systemBaseUrl}/api/media/${convertedFilename}`;

          result = await quepasaClient.sendAudioByURL(quepasaMapping.quepasaToken, chatId, publicUrl);

          const { unlink } = require('fs/promises');
          setTimeout(async () => {
            try { await unlink(convertedFilePath); } catch (error: any) {}
          }, 180000); 
        } else {
          result = await quepasaClient.sendMediaMessage(quepasaMapping.quepasaToken, chatId, { url: mediaUrl, mime: mimeType, filename: filename, text: messageContent });
        }
      } else {
        result = await quepasaClient.sendTextMessage(quepasaMapping.quepasaToken, chatId, messageContent, quepasaReplyId);
      }

      const quepasaMessageId = result.message?.id;
      if (chatwootMessageId && quepasaMessageId && conversationId) {
        try {
          await prisma.messageMapping.create({
            data: { chatwootMessageId: chatwootMessageId, quepasaMessageId: quepasaMessageId, conversationId: conversationId },
          });
        } catch (error: any) {}
      }

      await prisma.eventLog.create({
        data: {
          direction: 'out', provider: 'quepasa', sessionId: quepasaMapping.phoneNumber, peer: chatId,
          payload: { conversationId, text: messageContent, hasAttachments, attachmentCount: attachments.length, quepasaResponse: JSON.parse(JSON.stringify(result)) },
        },
      });

      res.json({ success: true, quepasaMessageId: result.message?.id });
    } catch (error: any) {
      await prisma.eventLog.create({
        data: { direction: 'out', provider: 'quepasa', sessionId: quepasaMapping.phoneNumber, peer: chatId, payload: { error: error.message, errorType: 'quepasa_send_failed', conversationId } },
      });
      return res.status(500).json({ success: false, error: error.message });
    }
  } catch (error: any) {
    next(error);
  }
});

/**
 * FALLBACK: Webhook endpoint without token 
 */
router.post('/webhooks/chatwoot', async (req, res, next) => {
  try {
    const payload = req.body;
    const inboxId = payload.inbox?.id?.toString() || payload.conversation?.inbox_id?.toString();
    const peerNumber = extractChatwootPhoneNumber(payload);

    await prisma.eventLog.create({
      data: { direction: 'in', provider: 'chatwoot', sessionId: inboxId || 'chatwoot', peer: peerNumber, payload: payload },
    });

    if (payload.event !== 'message_created') return res.json({ success: true, message: 'Event ignored' });

    const messageType = payload.message_type || payload.content_attributes?.message_type;
    let messageContent = payload.content || '';
    const conversationId = payload.conversation?.id;
    const phoneNumber = extractChatwootPhoneNumber(payload);
    const attachments = payload.attachments || [];
    const hasAttachments = attachments.length > 0;
    const agentName = payload.sender?.name || payload.sender?.available_name || payload.conversation?.meta?.assignee?.name || 'Atendente';
    const inReplyTo = payload.content_attributes?.in_reply_to || payload.in_reply_to;
    const chatwootMessageId = payload.id; 
    let quepasaReplyId: string | undefined;

    if (messageType !== 'outgoing') return res.json({ success: true, message: 'Not an outgoing message' });
    if (!phoneNumber || phoneNumber === 'unknown') return res.status(400).json({ error: 'Invalid webhook payload - missing phone number' });
    if (!messageContent && !hasAttachments) return res.status(400).json({ error: 'Invalid webhook payload - no content' });
    if (!inboxId) return res.status(400).json({ error: 'Missing inbox ID' });

    const quepasaMapping = await prisma.quepasaMapping.findFirst({
      where: { chatwootInboxId: inboxId, active: true },
      select: { id: true, quepasaToken: true, phoneNumber: true, name: true, chatwootBaseUrl: true, chatwootApiToken: true, chatwootAccountId: true, chatwootInboxId: true, showAgentName: true, active: true },
    });

    if (!quepasaMapping) return res.status(404).json({ error: 'Quepasa mapping not found for this inbox' });

    if (quepasaMapping.showAgentName && messageContent && agentName) {
      messageContent = `*${agentName}:*\n${messageContent}`;
    }

    const chatwootConfig = { baseUrl: quepasaMapping.chatwootBaseUrl, apiAccessToken: quepasaMapping.chatwootApiToken, accountId: quepasaMapping.chatwootAccountId, inboxId: quepasaMapping.chatwootInboxId };

    if (inReplyTo && conversationId) {
      try {
        const messageMapping = await prisma.messageMapping.findUnique({ where: { chatwootMessageId: parseInt(inReplyTo) } });
        if (messageMapping) { quepasaReplyId = messageMapping.quepasaMessageId; }
      } catch (error: any) {}
    }

    await quepasaClient.initialize();
    let isGroup = phoneNumber.includes('@g.us');
    let chatId = phoneNumber;

    if (isGroup) {
      chatId = phoneNumber;
    } else if (!phoneNumber.includes('@') && !phoneNumber.startsWith('+') && phoneNumber.length > 10) {
      isGroup = true;
      chatId = `${phoneNumber}@g.us`;
    } else {
      chatId = phoneNumber.replace(/@.*$/, '').replace(/^\+/, '');
    }

    try {
      let result;
      if (hasAttachments) {
        const attachment = attachments[0];
        const mediaUrl = attachment.data_url || attachment.file_url;
        let mimeType = attachment.file_type || 'application/octet-stream';
        const filename = attachment.file_name || 'file';

        if (attachment.file_type === 'audio' || mimeType.startsWith('audio')) {
          const axios = require('axios');
          const { convertAudioToPTT } = require('../utils/audio');
          const { config } = require('../config');

          const audioResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
          const audioBuffer = Buffer.from(audioResponse.data);
          const { filePath: convertedFilePath } = await convertAudioToPTT(audioBuffer);
          const convertedFilename = require('path').basename(convertedFilePath);
          const publicUrl = `${config.systemBaseUrl}/api/media/${convertedFilename}`;

          result = await quepasaClient.sendAudioByURL(quepasaMapping.quepasaToken, chatId, publicUrl);

          const { unlink } = require('fs/promises');
          setTimeout(async () => {
            try { await unlink(convertedFilePath); } catch (error: any) {}
          }, 180000);
        } else {
          result = await quepasaClient.sendMediaMessage(quepasaMapping.quepasaToken, chatId, { url: mediaUrl, mime: mimeType, filename: filename, text: messageContent });
        }
      } else {
        result = await quepasaClient.sendTextMessage(quepasaMapping.quepasaToken, chatId, messageContent, quepasaReplyId);
      }

      const quepasaMessageId = result.message?.id;
      if (chatwootMessageId && quepasaMessageId && conversationId) {
        try {
          await prisma.messageMapping.create({
            data: { chatwootMessageId: chatwootMessageId, quepasaMessageId: quepasaMessageId, conversationId: conversationId },
          });
        } catch (error: any) {}
      }

      await prisma.eventLog.create({
        data: { direction: 'out', provider: 'quepasa', sessionId: quepasaMapping.phoneNumber, peer: chatId, payload: { conversationId, text: messageContent, hasAttachments, attachmentCount: attachments.length, quepasaResponse: JSON.parse(JSON.stringify(result)) } },
      });

      res.json({ success: true, quepasaMessageId: result.message?.id });
    } catch (error: any) {
      await prisma.eventLog.create({
        data: { direction: 'out', provider: 'quepasa', sessionId: quepasaMapping.phoneNumber, peer: chatId, payload: { error: error.message, errorType: 'quepasa_send_failed', conversationId } },
      });
      return res.status(500).json({ success: false, error: error.message });
    }
  } catch (error: any) {
    next(error);
  }
});

export default router;
