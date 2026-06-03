import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { config } from './config';
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase } from './db/client';
import { errorMiddleware } from './middlewares/error.middleware';
import { rabbitMQService } from './services/rabbitmq.service';

// Import routes
import healthRoutes from './routes/health.routes';
import settingsRoutes from './routes/settings.routes';
import mappingsRoutes from './routes/mappings.routes';
import quepasaRoutes from './routes/quepasa.routes';
import quepasaWebhookRoutes from './routes/quepasa-webhook.routes';
import quepasaMappingsRoutes from './routes/quepasa-mappings.routes';
import twilioMappingsRoutes from './routes/twilio-mappings.routes';
import metricsRoutes from './routes/metrics.routes';
import logsRoutes from './routes/logs.routes';
import mediaRoutes from './routes/media.routes';
import typebotIntegrationRoutes from './routes/typebot-integration.routes';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import projectsRoutes from './routes/projects.routes';
import atendimentosRoutes from './routes/atendimentos.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/health' || req.url === '/api/health',
    },
  })
);

// Routes
app.use('/', healthRoutes); // for docker healthcheck
app.use('/api', healthRoutes);

// Mount on /api
app.use('/api', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', projectsRoutes); 
app.use('/api', atendimentosRoutes); 
app.use('/api', mediaRoutes);
app.use('/api', settingsRoutes);
app.use('/api', mappingsRoutes);
app.use('/api', quepasaRoutes);
app.use('/api', quepasaWebhookRoutes);
app.use('/api', quepasaMappingsRoutes);
app.use('/api', twilioMappingsRoutes);
app.use('/api', metricsRoutes);
app.use('/api', logsRoutes);
app.use('/api', typebotIntegrationRoutes);

// Mount on / (to support Proxies that strip /api)
app.use('/', authRoutes);
app.use('/', usersRoutes);
app.use('/', projectsRoutes); 
app.use('/', atendimentosRoutes); 
app.use('/', mediaRoutes);
app.use('/', settingsRoutes);
app.use('/', mappingsRoutes);
app.use('/', quepasaRoutes);
app.use('/', quepasaWebhookRoutes);
app.use('/', quepasaMappingsRoutes);
app.use('/', twilioMappingsRoutes);
app.use('/', metricsRoutes);
app.use('/', logsRoutes);
app.use('/', typebotIntegrationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorMiddleware);

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');

  await disconnectDatabase();

  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
async function start() {
  try {
    await connectDatabase();

    if (process.env.RABBITMQ_ENABLED === 'true' && process.env.RABBITMQ_URL) {
      await rabbitMQService.connect(process.env.RABBITMQ_URL);
      logger.info('RabbitMQ integration initialized');
    }

    app.listen(config.port, () => {
      logger.info(
        {
          port: config.port,
          env: config.env,
        },
        'Server started successfully'
      );
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

start();

export default app;
