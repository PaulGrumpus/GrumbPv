import express from 'express';
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
import walletRoutes from './routes/database/wallet.routes.js';
import userRoutes from './routes/database/user.routes.js';
import jobBidRoutes from './routes/database/job.bid.routes.js';
import chainTxRoutes from './routes/database/chainTx.routes.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allow Swagger UI to load
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BSC Escrow API Docs',
}));

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
app.use(`${API_PREFIX}/database/wallets`, walletRoutes);
app.use(`${API_PREFIX}/database/jobs`, jobRoutes);
app.use(`${API_PREFIX}/database/job-milestones`, jobMilestoneRoutes);
app.use(`${API_PREFIX}/database/job-bids`, jobBidRoutes);
app.use(`${API_PREFIX}/database/chain-txs`, chainTxRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server after DB connection
async function bootstrap() {
  const db = DatabaseService.getInstance();
  await db.connect();

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 API: http://localhost:${PORT}${API_PREFIX}`);
    logger.info(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
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

