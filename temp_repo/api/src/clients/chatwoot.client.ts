import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface ChatwootContact {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  identifier?: string;
  thumbnail?: string;
  additional_attributes?: Record<string, any>;
  custom_attributes?: Record<string, any>;
}

interface ChatwootConversation {
  id: number;
  inbox_id: number;
  messages: any[];
  contact: ChatwootContact;
}

interface ChatwootMessage {
  id: number;
  content: string;
  message_type: 'incoming' | 'outgoing';
  content_type: 'text' | 'input_select' | 'cards' | 'form';
  created_at: string;
  private: boolean;
  attachment?: any;
}

interface CreateContactRequest {
  inbox_id: number;
  name: string;
  phone_number?: string;  // Optional - not used for groups
  identifier?: string;
  additional_attributes?: Record<string, any>;
  custom_attributes?: Record<string, any>;
}

interface CreateMessageRequest {
  content: string;
  message_type: 'incoming' | 'outgoing';
  private?: boolean;
  content_type?: 'text' | 'input_select' | 'cards' | 'form';
  external_id?: string;
  content_attributes?: {
    in_reply_to?: number;
  };
}

export interface ChatwootConfig {
  baseUrl: string;
  apiAccessToken: string;
  accountId: string;
  inboxId: string;
}

class ChatwootClient {
  /**
   * Create axios client with config
   */
  private createClient(config: ChatwootConfig): AxiosInstance {
    const baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash

    return axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api_access_token': config.apiAccessToken,
      },
    });
  }

  /**
   * Create or get contact by phone number
   */
  async findOrCreateContact(config: ChatwootConfig, phoneNumber: string, name?: string): Promise<ChatwootContact> {
    const client = this.createClient(config);

    try {
      // Check if this is a WhatsApp group
      const isGroup = phoneNumber.includes('@g.us');

      let cleanPhoneNumber = phoneNumber;
      let identifier = phoneNumber;

      if (isGroup) {
        // For groups, use the full group ID as identifier (WITH @g.us so webhooks can detect it)
        identifier = phoneNumber; // Keep full ID with @g.us
        cleanPhoneNumber = phoneNumber.replace(/@g\.us$/i, ''); // Just the numeric ID
        logger.info({ originalPhone: phoneNumber, identifier, isGroup: true }, 'Processing WhatsApp group for Chatwoot');
      } else {
        // For individual contacts, sanitize phone number
        cleanPhoneNumber = phoneNumber
          .replace(/@s\.whatsapp\.net$/i, '')
          .replace(/@c\.us$/i, '');

        // Ensure phone number starts with + for international format
        if (!cleanPhoneNumber.startsWith('+')) {
          cleanPhoneNumber = `+${cleanPhoneNumber}`;
        }
        identifier = cleanPhoneNumber;
        logger.info({ originalPhone: phoneNumber, cleanPhone: cleanPhoneNumber }, 'Sanitized phone number for Chatwoot');
      }

      // Try to search for existing contact by identifier
      const searchResponse = await client.get(`/api/v1/accounts/${config.accountId}/contacts/search`, {
        params: {
          q: identifier,
        },
      });

      // If contact exists, return it
      if (searchResponse.data.payload && searchResponse.data.payload.length > 0) {
        const contact = searchResponse.data.payload[0];
        logger.info({ contactId: contact.id, identifier, isGroup }, 'Found existing Chatwoot contact');
        return contact;
      }

      // Contact doesn't exist, create it
      const contactData: CreateContactRequest = {
        inbox_id: parseInt(config.inboxId),
        name: name || identifier,
        identifier: identifier,
      };

      // Only add phone_number for non-groups (phone numbers must be E.164 format)
      if (!isGroup) {
        contactData.phone_number = cleanPhoneNumber;
      }

      const createResponse = await client.post(`/api/v1/accounts/${config.accountId}/contacts`, contactData);

      logger.info({ contactId: createResponse.data.payload.contact.id, phoneNumber }, 'Created new Chatwoot contact');
      return createResponse.data.payload.contact;
    } catch (error: any) {
      logger.error({
        error: error.message,
        phoneNumber,
        statusCode: error.response?.status,
        errorData: error.response?.data,
        errorDetails: JSON.stringify(error.response?.data)
      }, 'Failed to find or create Chatwoot contact');
      throw new Error(`Failed to find or create contact: ${error.message}`);
    }
  }

  /**
   * Create a new conversation for a contact
   */
  async createConversation(config: ChatwootConfig, contactIdentifier: string): Promise<ChatwootConversation> {
    const client = this.createClient(config);

    try {
      // Get inbox identifier for the API inbox
      const inboxResponse = await client.get(`/api/v1/accounts/${config.accountId}/inboxes/${config.inboxId}`);
      const inboxIdentifier = inboxResponse.data.inbox_identifier;

      if (!inboxIdentifier) {
        throw new Error('Inbox identifier not found');
      }

      const response = await client.post(
        `/public/api/v1/inboxes/${inboxIdentifier}/contacts/${contactIdentifier}/conversations`,
        {}
      );

      logger.info({ conversationId: response.data.id, contactIdentifier }, 'Created new Chatwoot conversation');
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, contactIdentifier }, 'Failed to create Chatwoot conversation');
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
  }

  /**
   * Get or create conversation for a contact (by phone number)
   */
  async findOrCreateConversation(config: ChatwootConfig, phoneNumber: string, name?: string, reopenClosedTickets?: boolean): Promise<{ conversation: ChatwootConversation; contact: ChatwootContact }> {
    const client = this.createClient(config);

    try {
      // Find or create contact
      const contact = await this.findOrCreateContact(config, phoneNumber, name);

      // Check if contact has an open conversation
      const conversationsResponse = await client.get(`/api/v1/accounts/${config.accountId}/conversations`, {
        params: {
          inbox_id: config.inboxId,
          status: 'open',
        },
      });

      // Find conversation with this contact
      const existingConversation = conversationsResponse.data.data.payload.find(
        (conv: any) => conv.meta?.sender?.phone_number === phoneNumber || conv.meta?.sender?.id === contact.id
      );

      if (existingConversation) {
        logger.info({ conversationId: existingConversation.id, phoneNumber }, 'Found existing open conversation');
        return { conversation: existingConversation, contact };
      }

      // If reopenClosedTickets is enabled, search for closed conversations
      if (reopenClosedTickets) {
        logger.info({ phoneNumber, contactId: contact.id, reopenClosedTickets: true }, 'Searching for closed conversations to reopen');

        const closedConversationsResponse = await client.get(`/api/v1/accounts/${config.accountId}/conversations`, {
          params: {
            inbox_id: config.inboxId,
            status: 'resolved',
          },
        });

        // Find closed conversation with this contact
        const closedConversation = closedConversationsResponse.data.data.payload.find(
          (conv: any) => conv.meta?.sender?.phone_number === phoneNumber || conv.meta?.sender?.id === contact.id
        );

        if (closedConversation) {
          // Reopen the closed conversation
          await this.reopenConversation(config, closedConversation.id);
          logger.info({ conversationId: closedConversation.id, phoneNumber, contactId: contact.id }, '🔄 Reopened closed conversation for returning customer');

          // Fetch the conversation again to get the updated status and complete object
          const reopenedConversationsResponse = await client.get(`/api/v1/accounts/${config.accountId}/conversations`, {
            params: {
              inbox_id: config.inboxId,
              status: 'open',
            },
          });

          const reopenedConversation = reopenedConversationsResponse.data.data.payload.find(
            (conv: any) => conv.id === closedConversation.id
          );

          if (reopenedConversation) {
            logger.info({ conversationId: reopenedConversation.id }, '✅ Fetched reopened conversation, ready to send message');
            return { conversation: reopenedConversation, contact };
          }

          // Fallback: return the closed conversation object (should still work)
          logger.warn({ conversationId: closedConversation.id }, '⚠️  Could not fetch reopened conversation, using original object');
          return { conversation: closedConversation, contact };
        }

        logger.info({ phoneNumber, contactId: contact.id }, 'No closed conversation found, will create new one');
      }

      // No open conversation found, create new one using contact ID
      // Use createConversationV2 which works with contact_id instead of identifier
      // This avoids issues with old identifiers that may contain WhatsApp suffixes
      const conversation = await this.createConversationV2(config, contact.id);

      logger.info({ conversationId: conversation.id, contactId: contact.id }, 'Created new conversation for contact');
      return { conversation, contact };
    } catch (error: any) {
      logger.error({ error: error.message, phoneNumber }, 'Failed to find or create conversation');
      throw new Error(`Failed to find or create conversation: ${error.message}`);
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(config: ChatwootConfig, conversationId: number, content: string, messageType: 'incoming' | 'outgoing' = 'incoming', externalId?: string, inReplyTo?: number): Promise<ChatwootMessage> {
    const client = this.createClient(config);

    try {
      const messageData: CreateMessageRequest = {
        content,
        message_type: messageType,
        private: false,
        content_type: 'text',
      };

      if (externalId) {
        messageData.external_id = externalId;
      }

      if (inReplyTo) {
        messageData.content_attributes = {
          in_reply_to: inReplyTo,
        };
      }

      const response = await client.post(
        `/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`,
        messageData
      );

      logger.info({ conversationId, messageType, contentLength: content.length, externalId, inReplyTo }, 'Sent message to Chatwoot');
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, conversationId }, 'Failed to send message to Chatwoot');
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Process incoming WhatsApp message and create/update Chatwoot conversation
   */
  async processIncomingMessage(config: ChatwootConfig, phoneNumber: string, message: string, senderName?: string, externalId?: string, inReplyTo?: number, reopenClosedTickets?: boolean): Promise<{ conversationId: number; messageId: number }> {
    try {
      // Find or create conversation
      const { conversation, contact } = await this.findOrCreateConversation(config, phoneNumber, senderName, reopenClosedTickets);

      // Send incoming message with external ID (Quepasa message ID) and reply-to
      const chatwootMessage = await this.sendMessage(config, conversation.id, message, 'incoming', externalId, inReplyTo);

      logger.info({ conversationId: conversation.id, messageId: chatwootMessage.id, phoneNumber, externalId, inReplyTo }, 'Processed incoming WhatsApp message in Chatwoot');

      return {
        conversationId: conversation.id,
        messageId: chatwootMessage.id,
      };
    } catch (error: any) {
      logger.error({ error: error.message, phoneNumber }, 'Failed to process incoming message');
      throw new Error(`Failed to process incoming message: ${error.message}`);
    }
  }

  /**
   * List all inboxes in the account
   */
  async listInboxes(config: ChatwootConfig): Promise<any[]> {
    const client = this.createClient(config);

    try {
      const response = await client.get(`/api/v1/accounts/${config.accountId}/inboxes`);
      return response.data.payload || [];
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      logger.error({ error: errorDetail }, 'Failed to list Chatwoot inboxes');
      throw new Error(`Failed to list inboxes: ${errorDetail}`);
    }
  }

  /**
   * Find inbox by exact name match
   */
  async findInboxByName(config: ChatwootConfig, name: string): Promise<any | null> {
    try {
      const inboxes = await this.listInboxes(config);
      const inbox = inboxes.find((inbox: any) => inbox.name === name);

      if (inbox) {
        logger.info({ inboxId: inbox.id, name }, 'Found existing Chatwoot inbox by name');
        return inbox;
      }

      return null;
    } catch (error: any) {
      logger.error({ error: error.message, name }, 'Failed to find inbox by name');
      return null;
    }
  }

  /**
   * Create an API inbox in Chatwoot (or return existing one if name matches)
   */
  async createInbox(config: ChatwootConfig, name: string, webhookUrl: string): Promise<any> {
    const client = this.createClient(config);

    try {
      // Check if inbox with this name already exists
      const existingInbox = await this.findInboxByName(config, name);
      if (existingInbox) {
        logger.info({ inboxId: existingInbox.id, name }, 'Using existing Chatwoot inbox (name match)');
        return existingInbox;
      }

      // Create API channel first, Chatwoot will automatically create an inbox for it
      // In newer Chatwoot versions, the /inboxes endpoint with channel nested params might not work properly
      const response = await client.post(`/api/v1/accounts/${config.accountId}/channels/api_channels`, {
        api_channel: {
          name,
          webhook_url: webhookUrl,
        }
      });
      
      // The response payload contains the channel. For API channels in newer Chatwoot, it often returns the inbox directly or channel object
      // We need to fetch the inbox ID. 
      // If the response contains an inbox object directly:
      if (response.data?.inbox?.id) {
        logger.info({ inboxId: response.data.inbox.id, name }, 'Created new Chatwoot API channel and inbox');
        return response.data.inbox;
      }
      if (response.data?.id && response.data?.channel_type) {
        // If it returned the inbox directly at root
        return response.data;
      }

      // Let's list inboxes to find the one that was just created if it didn't return it directly
      const currentInboxes = await this.listInboxes(config);
      const newInbox = currentInboxes.find((i: any) => i.name === name);
      
      if (newInbox) {
         logger.info({ inboxId: newInbox.id, name }, 'Created new Chatwoot API channel and found inbox');
         return newInbox;
      }
      
      logger.warn({ data: response.data, name }, 'API channel created but inbox not found in response');
      return response.data;
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      logger.error({ error: errorDetail, name }, 'Failed to create Chatwoot inbox');
      throw new Error(`Failed to create inbox: ${errorDetail}`);
    }
  }

  /**
   * Create an account webhook in Chatwoot
   */
  async createWebhook(config: ChatwootConfig, webhookUrl: string, subscriptions: string[]): Promise<any> {
    const client = this.createClient(config);

    try {
      // First, check if webhook already exists
      const existingWebhooks = await client.get(`/api/v1/accounts/${config.accountId}/webhooks`);
      const webhooks = existingWebhooks.data.payload || [];
      const existing = webhooks.find((w: any) => w.url === webhookUrl);

      if (existing) {
        logger.info({ webhookId: existing.id, webhookUrl }, 'Chatwoot webhook already exists');
        return existing;
      }

      // Create new webhook
      const response = await client.post(`/api/v1/accounts/${config.accountId}/webhooks`, {
        webhook: {
          url: webhookUrl,
          subscriptions: subscriptions
        }
      });

      logger.info({ webhookId: response.data.payload?.id, webhookUrl }, 'Created new Chatwoot webhook');
      return response.data;
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      logger.error({ error: errorDetail, webhookUrl }, 'Failed to create Chatwoot webhook');
      throw new Error(`Failed to create webhook: ${errorDetail}`);
    }
  }

  /**
   * Add all available agents to an inbox
   */
  async addAllAgentsToInbox(config: ChatwootConfig, inboxId: number | string): Promise<void> {
    const client = this.createClient(config);

    try {
      // Fetch all agents
      const agentsResponse = await client.get(`/api/v1/accounts/${config.accountId}/agents`);
      const agents = agentsResponse.data || [];
      const agentIds = agents.map((agent: any) => agent.id);

      if (agentIds.length > 0) {
        // Add agents to inbox
        await client.post(`/api/v1/accounts/${config.accountId}/inbox_members`, {
          inbox_id: inboxId,
          user_ids: agentIds
        });
        logger.info({ inboxId, agentCount: agentIds.length }, 'Added agents to Chatwoot inbox');
      } else {
        logger.warn({ inboxId }, 'No agents found to add to Chatwoot inbox');
      }
    } catch (error: any) {
      logger.error({ error: error.message, inboxId }, 'Failed to add agents to Chatwoot inbox');
      // Non-fatal, just log it
    }
  }

  /**
   * Update contact with custom attributes
   */
  async updateContactAttributes(config: ChatwootConfig, contactId: number, customAttributes: Record<string, any>): Promise<ChatwootContact> {
    const client = this.createClient(config);

    try {
      const response = await client.put(`/api/v1/accounts/${config.accountId}/contacts/${contactId}`, {
        custom_attributes: customAttributes,
      });

      logger.info({ contactId, attributes: Object.keys(customAttributes) }, 'Updated contact custom attributes');
      return response.data.payload.contact;
    } catch (error: any) {
      logger.error({ error: error.message, contactId }, 'Failed to update contact attributes');
      throw new Error(`Failed to update contact attributes: ${error.message}`);
    }
  }

  /**
   * Send message with attachments (media)
   */
  async sendMessageWithMedia(
    config: ChatwootConfig,
    conversationId: number,
    content: string,
    mediaUrl: string,
    messageType: 'incoming' | 'outgoing' = 'incoming',
    externalId?: string
  ): Promise<ChatwootMessage> {
    const client = this.createClient(config);

    try {
      const messageData = {
        content,
        message_type: messageType,
        private: false,
        attachments: [{ file_url: mediaUrl }],
        external_id: externalId,
      };

      const response = await client.post(
        `/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`,
        messageData
      );

      logger.info({ conversationId, messageType, hasMedia: true, externalId }, 'Sent message with media to Chatwoot');
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, conversationId, mediaUrl }, 'Failed to send message with media');
      throw new Error(`Failed to send message with media: ${error.message}`);
    }
  }

  /**
   * Get contact by custom attribute
   */
  async findContactByCustomAttribute(config: ChatwootConfig, attributeKey: string, attributeValue: string): Promise<ChatwootContact | null> {
    const client = this.createClient(config);

    try {
      const response = await client.get(`/api/v1/accounts/${config.accountId}/contacts/search`, {
        params: { q: attributeValue },
      });

      const contacts = response.data.payload || [];
      const contact = contacts.find((c: ChatwootContact) =>
        c.custom_attributes && c.custom_attributes[attributeKey] === attributeValue
      );

      if (contact) {
        logger.info({ contactId: contact.id, attributeKey, attributeValue }, 'Found contact by custom attribute');
        return contact;
      }

      return null;
    } catch (error: any) {
      logger.error({ error: error.message, attributeKey, attributeValue }, 'Failed to find contact by custom attribute');
      return null;
    }
  }

  /**
   * Create conversation with custom attributes
   */
  async createConversationV2(config: ChatwootConfig, contactId: number, customAttributes?: Record<string, any>): Promise<ChatwootConversation> {
    const client = this.createClient(config);

    try {
      const payload: any = {
        inbox_id: parseInt(config.inboxId),
        contact_id: contactId,
        status: 'open',
      };

      if (customAttributes) {
        payload.custom_attributes = customAttributes;
      }

      const response = await client.post(`/api/v1/accounts/${config.accountId}/conversations`, payload);

      logger.info({ conversationId: response.data.id, contactId }, 'Created conversation with custom attributes');
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, contactId }, 'Failed to create conversation');
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
  }

  /**
   * Find open conversation for contact
   */
  async findOpenConversation(config: ChatwootConfig, contactId: number): Promise<ChatwootConversation | null> {
    const client = this.createClient(config);

    try {
      const response = await client.get(`/api/v1/accounts/${config.accountId}/conversations`, {
        params: {
          inbox_id: config.inboxId,
          status: 'open',
        },
      });

      const conversations = response.data.data?.payload || [];
      const conversation = conversations.find((conv: any) => conv.meta?.sender?.id === contactId);

      if (conversation) {
        logger.info({ conversationId: conversation.id, contactId }, 'Found open conversation for contact');
        return conversation;
      }

      return null;
    } catch (error: any) {
      logger.error({ error: error.message, contactId }, 'Failed to find open conversation');
      return null;
    }
  }

  /**
   * Reopen a closed conversation
   */
  async reopenConversation(config: ChatwootConfig, conversationId: number): Promise<ChatwootConversation> {
    const client = this.createClient(config);

    try {
      const response = await client.post(
        `/api/v1/accounts/${config.accountId}/conversations/${conversationId}/toggle_status`,
        {
          status: 'open',
        }
      );

      logger.info({ conversationId }, '🔄 Reopened closed conversation');
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, conversationId }, 'Failed to reopen conversation');
      throw new Error(`Failed to reopen conversation: ${error.message}`);
    }
  }

  /**
   * Send message with file upload (using Buffer)
   */
  async sendMessageWithFileUpload(
    config: ChatwootConfig,
    conversationId: number,
    content: string,
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    messageType: 'incoming' | 'outgoing' = 'incoming',
    externalId?: string,
    inReplyTo?: number
  ): Promise<ChatwootMessage> {
    const FormData = require('form-data');
    const axios = require('axios');

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('message_type', messageType);
      formData.append('private', 'false');
      formData.append('attachments[]', fileBuffer, {
        filename,
        contentType: mimeType,
      });

      if (externalId) {
        formData.append('external_id', externalId);
      }

      if (inReplyTo) {
        formData.append('content_attributes[in_reply_to]', inReplyTo.toString());
      }

      const baseUrl = config.baseUrl.replace(/\/$/, '');
      const response = await axios.post(
        `${baseUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'api_access_token': config.apiAccessToken,
          },
          timeout: 30000,
        }
      );

      logger.info({ conversationId, messageType, hasFile: true, filename, mimeType, externalId, inReplyTo }, 'Sent message with file upload to Chatwoot');
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message, conversationId, filename }, 'Failed to send message with file upload');
      throw new Error(`Failed to send message with file: ${error.message}`);
    }
  }

  /**
   * Get message by ID to retrieve external_id
   */
  async getMessage(config: ChatwootConfig, conversationId: number, messageId: number): Promise<any> {
    const client = this.createClient(config);

    try {
      const response = await client.get(
        `/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`
      );

      const messages = response.data.payload || [];
      const message = messages.find((m: any) => m.id === messageId);

      if (message) {
        // DEBUG: Log full message structure to understand what fields Chatwoot returns
        logger.info({
          conversationId,
          messageId,
          externalId: message.external_id,
          sourceId: message.source_id,
          allFields: Object.keys(message)
        }, '🔍 DEBUG: Full message structure from Chatwoot');
        return message;
      }

      logger.warn({ conversationId, messageId }, 'Message not found in Chatwoot');
      return null;
    } catch (error: any) {
      logger.error({ error: error.message, conversationId, messageId }, 'Failed to get message from Chatwoot');
      return null;
    }
  }

  /**
   * Update contact avatar from URL
   * Downloads the image from URL and uploads it to Chatwoot
   */
  async updateContactAvatar(config: ChatwootConfig, contactId: number, imageUrl: string): Promise<void> {
    const FormData = require('form-data');
    const axios = require('axios');

    try {
      // Download image from URL
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers['content-type'] || 'image/jpeg';

      // Determine file extension from content type
      const extensionMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };
      const extension = extensionMap[contentType] || 'jpg';
      const filename = `avatar.${extension}`;

      // Create form data with avatar
      const formData = new FormData();
      formData.append('avatar', imageBuffer, {
        filename,
        contentType,
      });

      const baseUrl = config.baseUrl.replace(/\/$/, '');
      await axios.put(
        `${baseUrl}/api/v1/accounts/${config.accountId}/contacts/${contactId}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'api_access_token': config.apiAccessToken,
          },
          timeout: 30000,
        }
      );

      logger.info({ contactId, imageUrl, contentType }, '📸 Updated contact avatar in Chatwoot');
    } catch (error: any) {
      // Don't throw error - avatar is optional
      logger.warn({ error: error.message, contactId, imageUrl }, 'Failed to update contact avatar (non-critical)');
    }
  }
}

// Export singleton instance
export const chatwootClient = new ChatwootClient();
