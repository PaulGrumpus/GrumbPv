import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, escrow_state_history } from '@prisma/client';
import { userService } from './user.service.js';
import { escrowService } from './escrow.service.js';

export class EscrowStateHistoryService {
    private prisma: PrismaClient;

    public constructor() {
        this.prisma = new PrismaClient();
    }

    public async createEscrowStateHistory(escrow_state_history: Prisma.escrow_state_historyUncheckedCreateInput): Promise<escrow_state_history> {
        try {
            if(!escrow_state_history.escrow_id || !escrow_state_history.tx_hash) {
                throw new AppError('Escrow ID and tx hash are required', 400, 'ESCROW_ID_AND_TX_HASH_REQUIRED');
            }
            const existingEscrow = await escrowService.getEscrowById(escrow_state_history.escrow_id);
            if (!existingEscrow) {
                throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
            }
            if(escrow_state_history.actor_user_id) {
                const existingActor = await userService.getUserById(escrow_state_history.actor_user_id);
                if (!existingActor) {
                    throw new AppError('Actor not found', 404, 'ACTOR_NOT_FOUND');
                }
            }
            const existingEscrowStateHistory = await this.prisma.escrow_state_history.findFirst({
                where: {
                    escrow_id: escrow_state_history.escrow_id,
                    tx_hash: escrow_state_history.tx_hash,
                },
            });
            if (existingEscrowStateHistory) {
                throw new AppError('Escrow state history already exists', 400, 'ESCROW_STATE_HISTORY_ALREADY_EXISTS');
            }
            const newEscrowStateHistory = await this.prisma.escrow_state_history.create({
                data: escrow_state_history,
            });
            return newEscrowStateHistory;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating escrow state history', { error });
            throw new AppError('Error creating escrow state history', 500, 'DB_ESCROW_STATE_HISTORY_CREATION_FAILED');
        }
    }

    public async getEscrowStateHistoryById(id: string): Promise<escrow_state_history> {
        try {
            if(!id) {
                throw new AppError('Escrow state history ID is required', 400, 'ESCROW_STATE_HISTORY_ID_REQUIRED');
            }
            const existingEscrowStateHistory = await this.prisma.escrow_state_history.findUnique({
                where: { id },
            });
            if (!existingEscrowStateHistory) {
                throw new AppError('Escrow state history not found', 404, 'ESCROW_STATE_HISTORY_NOT_FOUND');
            }
            return existingEscrowStateHistory;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting escrow state history by ID', { error });
            throw new AppError('Error getting escrow state history by ID', 500, 'DB_ESCROW_STATE_HISTORY_GET_BY_ID_FAILED');
        }
    }

    public async getEscrowStateHistoryByTxHash(tx_hash: string): Promise<escrow_state_history> {
        try {
            if(!tx_hash) {
                throw new AppError('Tx hash is required', 400, 'TX_HASH_REQUIRED');
            }
            const existingEscrowStateHistory = await this.prisma.escrow_state_history.findFirst({
                where: { tx_hash },
            });
            if (!existingEscrowStateHistory) {
                throw new AppError('Escrow state history not found', 404, 'ESCROW_STATE_HISTORY_NOT_FOUND');
            }
            return existingEscrowStateHistory;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting escrow state history by tx hash', { error });
            throw new AppError('Error getting escrow state history by tx hash', 500, 'DB_ESCROW_STATE_HISTORY_GET_BY_TX_HASH_FAILED');
        }
    }

    public async getEscrowStateHistoryByEscrowId(escrow_id: string): Promise<escrow_state_history[]> {
        try {
            if(!escrow_id) {
                throw new AppError('Escrow ID is required', 400, 'ESCROW_ID_REQUIRED');
            }
            const existingEscrowStateHistories = await this.prisma.escrow_state_history.findMany({
                where: { escrow_id },
            });
            return existingEscrowStateHistories;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting escrow state history by escrow ID', { error });
            throw new AppError('Error getting escrow state history by escrow ID', 500, 'DB_ESCROW_STATE_HISTORY_GET_BY_ESCROW_ID_FAILED');
        }
    }

    public async getAllEscrowStateHistories(): Promise<escrow_state_history[]> {
        try {
            const existingEscrowStateHistories = await this.prisma.escrow_state_history.findMany();
            return existingEscrowStateHistories;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting all escrow state histories', { error });
            throw new AppError('Error getting all escrow state histories', 500, 'DB_ESCROW_STATE_HISTORY_GET_ALL_FAILED');
        }
    }
}

export const escrowStateHistoryService = new EscrowStateHistoryService();