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
const logger = createLogger('api-gateway');
const PORT = process.env['PORT'] ?? 4000;

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
app.use(rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false }));

// ── SOCKET.IO ────────────────────────────────
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient } from '@unkora/database';

export const httpServer = createServer(app);
export const io = new SocketServer(httpServer, {
  cors: { origin: (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000').split(','), credentials: true },
  transports: ['websocket', 'polling'],
});

const pubClient = getRedisClient();
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on('join:order', (num: string) => void socket.join(`order:${num}`));
  socket.on('join:admin', () => void socket.join('admin:dashboard'));
  socket.on('join:vendor', (id: string) => void socket.join(`vendor:${id}`));
  socket.on('join:flash-sale', (id: string) => void socket.join(`flash-sale:${id}`));
  socket.on('chat:message', (d: { orderId: string; message: string; userId: string; role: string }) => {
    io.to(`chat:${d.orderId}`).emit('chat:message', { id: Date.now().toString(), ...d, timestamp: new Date().toISOString() });
  });
  socket.on('chat:typing', (d: { orderId: string; userId: string; isTyping: boolean }) => {
    socket.to(`chat:${d.orderId}`).emit('chat:typing', d);
  });
  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// TODO: Mount service routes here
// import { router } from './routes';
// app.use('/api', router);

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`${'api-gateway'} running on port ${PORT}`);
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
