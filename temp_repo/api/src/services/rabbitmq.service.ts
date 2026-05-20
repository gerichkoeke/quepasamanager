import * as amqp from 'amqplib';
import { logger } from '../utils/logger';

export class RabbitMQService {
  private connection: any | null = null;
  private channel: any | null = null;

  isConnected(): boolean {
    return !!this.connection && !!this.channel;
  }

  async connect(url: string) {
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      logger.info('Connected to RabbitMQ');

      this.connection.on('error', (err: any) => {
        logger.error({ error: err }, 'RabbitMQ connection error');
      });

      this.connection.on('close', () => {
        logger.info('RabbitMQ connection closed');
        this.connection = null;
        this.channel = null;
      });

    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to connect to RabbitMQ');
    }
  }

  async setupQueue(queueName: string, messageHandler: (msg: any | null) => void) {
    if (!this.channel) {
      logger.warn('Cannot setup queue: RabbitMQ channel not available');
      return;
    }

    try {
      await this.channel.assertQueue(queueName, { durable: true });
      logger.info(`RabbitMQ waiting for messages in queue: ${queueName}`);

      await this.channel.consume(queueName, (msg: any) => {
        if (msg) {
          try {
            messageHandler(msg);
            this.channel?.ack(msg);
          } catch (error) {
            logger.error({ error }, 'Error processing RabbitMQ message');
            // Reject and requeue or discard based on policy, discarding for now
            this.channel?.nack(msg, false, false); 
          }
        }
      });
    } catch (error: any) {
      logger.error({ error: error.message, queue: queueName }, 'Failed to setup RabbitMQ queue');
    }
  }

  async publishMessage(queueName: string, data: any) {
    if (!this.channel) {
      logger.warn('Cannot publish: RabbitMQ channel not available');
      return false;
    }

    try {
      await this.channel.assertQueue(queueName, { durable: true });
      return this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
        persistent: true
      });
    } catch (error: any) {
      logger.error({ error: error.message, queue: queueName }, 'Failed to publish RabbitMQ message');
      return false;
    }
  }
}

export const rabbitMQService = new RabbitMQService();
