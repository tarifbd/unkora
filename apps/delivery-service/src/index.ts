import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { createLogger, errorHandler } from '@unkora/utils';

const app = express();
const logger = createLogger('delivery-service');
const PORT = process.env['PORT'] ?? 4007;

// Sentry
if (process.env['SENTRY_DSN']) {
  Sentry.init({ dsn: process.env['SENTRY_DSN'], environment: process.env['NODE_ENV'] });
}

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env['CORS_ORIGIN']?.split(',') ?? '*', credentials: true }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'delivery-service', timestamp: new Date().toISOString() });
});

import { deliveryRouter } from './routes/delivery.routes';
app.use('/delivery', deliveryRouter);

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`${'delivery-service'} running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => { process.exit(1); }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});

export default app;
