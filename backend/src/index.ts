import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { swaggerSpec } from './config/swagger.js';
import escrowRoutes from './routes/contract/escrow.routes.js';
import factoryRoutes from './routes/contract/factory.routes.js';
import rewardRoutes from './routes/contract/reward.routes.js';
import healthRoutes from './routes/health.routes.js';
import jobRoutes from './routes/database/job.routes.js';
import jobMilestoneRoutes from './routes/database/job.milestone.routes.js';
import { DatabaseService } from './services/database/database.service.js';
import userRoutes from './routes/database/user.routes.js';
import jobBidRoutes from './routes/database/job.bid.routes.js';
import chainTxRoutes from './routes/database/chainTx.routes.js';
import gigRoutes from './routes/database/gig.routes.js';
import jobApplicationRoutes from './routes/database/job.application.routes.js';
import conversationRoutes from './routes/chat/conversation.routes.js';
import conversationParticipantRoutes from './routes/chat/conversation.participant.routes.js';
import messageRoutes from './routes/chat/message.routes.js';
import messageReceiptRoutes from './routes/chat/message.receipt.routes.js';
import notificationRoutes from './routes/database/notification.routes.js';
import dashboardRoutes from './routes/database/dashboard.routes.js';
import contactRoutes from './routes/contact.routes.js';
import http from 'http';
import { Server } from 'socket.io';
import { socket_router } from './routes/socket.routes.js';
import { notification_socket_route } from './routes/notification.socket.route.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const REQUEST_BODY_LIMIT = process.env.REQUEST_BODY_LIMIT || '10mb';

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Swagger UI to load
  })
);
app.use(cors());
app.use(compression());
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Rate limiting
app.use(rateLimiter);

// Swagger Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BSC Escrow API Docs',
  })
);

// Swagger JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/contract/escrow`, escrowRoutes);
app.use(`${API_PREFIX}/contract/factory`, factoryRoutes);
app.use(`${API_PREFIX}/contract/rewards`, rewardRoutes);
app.use(`${API_PREFIX}/database/users`, userRoutes);
app.use(`${API_PREFIX}/database/jobs`, jobRoutes);
app.use(`${API_PREFIX}/database/job-milestones`, jobMilestoneRoutes);
app.use(`${API_PREFIX}/database/job-bids`, jobBidRoutes);
app.use(`${API_PREFIX}/database/chain-txs`, chainTxRoutes);
app.use(`${API_PREFIX}/database/gigs`, gigRoutes);
app.use(`${API_PREFIX}/database/job-applications`, jobApplicationRoutes);
app.use(`${API_PREFIX}/database/conversations`, conversationRoutes);
app.use(`${API_PREFIX}/database/conversation-participants`, conversationParticipantRoutes);
app.use(`${API_PREFIX}/database/messages`, messageRoutes);
app.use(`${API_PREFIX}/database/message-receipts`, messageReceiptRoutes);
app.use(`${API_PREFIX}/database/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/database/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/contact`, contactRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server after DB connection
async function bootstrap() {
  const db = DatabaseService.getInstance();
  await db.connect();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket_router(socket, io);
    notification_socket_route(socket, io);
  });

  httpServer.listen(PORT, () => {
    logger.info(`🚀 HTTP Server running on port ${PORT}`);
    logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 API: http://localhost:${PORT}${API_PREFIX}`);
    logger.info(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
    logger.info(`📡 WebSocket: ws://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    await db.disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void bootstrap();

// Graceful shutdown
// Signals handled in bootstrap

export default app;
