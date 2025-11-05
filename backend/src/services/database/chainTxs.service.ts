import { chain_txs, PrismaClient } from '@prisma/client';
import { AppError } from '../../middlewares/errorHandler.js';
import { userService } from './user.service.js';
import { logger } from '../../utils/logger.js';

export class ChainTxsService {
    private prisma: PrismaClient;

    public constructor() {
        this.prisma = new PrismaClient();
    }

    async createChainTx(purpose: string, chain_id: number, from_address: string, to_address: string, tx_hash: string, status: string, user_id: string): Promise<chain_txs> {

        try {
            if (!tx_hash || !from_address || !to_address || !user_id) {
                throw new AppError('Tx hash, from address, to address, and user id are required', 400, 'TX_HASH_FROM_ADDRESS_TO_ADDRESS_USER_ID_REQUIRED');
            }

            const validUserId = await userService.getUserById(user_id);
            if (!validUserId) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }

            const existingChainTx = await this.prisma.chain_txs.findUnique({
                where: { tx_hash },
            });
            if (existingChainTx) {
                throw new AppError('Chain tx already exists', 400, 'CHAIN_TX_ALREADY_EXISTS');
            }

            return this.prisma.chain_txs.create({
                data: {
                    purpose,
                    chain_id,
                    from_address,
                    to_address,
                    tx_hash,
                    status,
                    user_id,
                },
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating chain tx', { error });
            throw new AppError('Error creating chain tx', 500, 'DB_CHAIN_TX_CREATION_FAILED');
        }
    }

    async deleteChainTx(id: string): Promise<void> {
        try {
            if (!id) {
                throw new AppError('Id is required', 400, 'ID_REQUIRED');
            }
            await this.prisma.chain_txs.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error deleting chain tx', { error });
            throw new AppError('Error deleting chain tx', 500, 'DB_CHAIN_TX_DELETION_FAILED');
        }
    }

    async getChainTxByTxHash(tx_hash: string): Promise<chain_txs | null> {
        try {
            if (!tx_hash) {
                throw new AppError('Tx hash is required', 400, 'TX_HASH_REQUIRED');
            }

            const validTxHash = await this.prisma.chain_txs.findUnique({
                where: { tx_hash },
            });
            
            return validTxHash;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting chain tx by tx hash', { error });
            throw new AppError('Error getting chain tx by tx hash', 500, 'DB_CHAIN_TX_GET_BY_TX_HASH_FAILED');
        }
    }

    async getChainTxById(id: string): Promise<chain_txs | null> {
        try {
            if (!id) {
                throw new AppError('Id is required', 400, 'ID_REQUIRED');
            }
            const validId = await this.prisma.chain_txs.findUnique({
                where: { id },
            });
            if (!validId) {
                throw new AppError('Chain tx not found', 404, 'CHAIN_TX_NOT_FOUND');
            }
            return validId;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting chain tx by id', { error });
            throw new AppError('Error getting chain tx by id', 500, 'DB_CHAIN_TX_GET_BY_ID_FAILED');
        }
    }

    async getChainTxsByUserId(user_id: string): Promise<chain_txs[] | null> {
        try {
            if (!user_id) {
                throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
            }
            const validUserId = await userService.getUserById(user_id);
            if (!validUserId) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            const chainTxs = await this.prisma.chain_txs.findMany({
                where: { user_id },
                orderBy: { created_at: 'desc' },
            });
            return chainTxs;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting chain txs by user id', { error });
            throw new AppError('Error getting chain txs by user id', 500, 'DB_CHAIN_TXS_GET_BY_USER_ID_FAILED');
        }
    }
}

export const chainTxsService = new ChainTxsService();