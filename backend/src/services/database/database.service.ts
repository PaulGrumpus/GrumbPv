import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { prisma } from "../../prisma.js";

export class DatabaseService {
  private static instance: DatabaseService;
  private prisma = prisma;

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('✅ Database connected');
    } catch (error) {
      logger.error('❌ Database connection failed', { error });
      throw new AppError('Database connection failed', 500, 'DB_CONNECTION_FAILED');
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('🔌 Database disconnected');
    } catch (error) {
      logger.error('⚠️  Error during database disconnect', { error });
    }
  }
  
  public client(): typeof prisma {
    return this.prisma;
  }
}
