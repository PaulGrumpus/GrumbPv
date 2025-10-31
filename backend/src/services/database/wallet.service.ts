import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { chain_type, Prisma, PrismaClient, user_wallets } from '@prisma/client';
import { userService } from './user.service.js';

export class WalletService {
    private prisma: PrismaClient;

    public constructor() {
        this.prisma = new PrismaClient();
    }

    public async createUserWallet(userWallet: Prisma.user_walletsUncheckedCreateInput): Promise<user_wallets> {
        try {
            if(!userWallet.chain_id || !userWallet.address) {
                throw new AppError('Chain ID and address are required', 400, 'CHAIN_ID_ADDRESS_REQUIRED');
            }
            if(userWallet.chain !== chain_type.evm ){
                throw new AppError('Invalid chain', 400, 'INVALID_CHAIN');
            }
            const existingUserWallet = await this.prisma.user_wallets.findUnique({
                where: { chain_id_address: { chain_id: userWallet.chain_id, address: userWallet.address } },
            });
            if (existingUserWallet) {
                throw new AppError('User wallet already exists', 400, 'USER_WALLET_ALREADY_EXISTS');
            }
            const existingUser = await userService.getUserById(userWallet.user_id as string);
            if (!existingUser) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            const newUserWallet = await this.prisma.user_wallets.create({
                data: userWallet,
            });
            return newUserWallet;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating user wallet', { error });
            throw new AppError('Error creating user wallet', 500, 'DB_USER_WALLET_CREATION_FAILED');
        }
    }

    public async updateUserWallet(id: string, userWallet: Prisma.user_walletsUncheckedUpdateInput): Promise<user_wallets> {
        try {
            if(!id) {
                throw new AppError('User wallet ID is required', 400, 'USER_WALLET_ID_REQUIRED');
            }
            if(userWallet.chain && userWallet.chain !== chain_type.evm ){
                throw new AppError('Invalid chain', 400, 'INVALID_CHAIN');
            }
            if(userWallet.user_id) {
                const existingUser = await userService.getUserById(userWallet.user_id as string);
                if(!existingUser) {
                    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
                }
            }
            const existingUserWallet = await this.prisma.user_wallets.findUnique({
                where: { id },
            });
            if (!existingUserWallet) {
                throw new AppError('User wallet not found', 404, 'USER_WALLET_NOT_FOUND');
            }
            const now = new Date();
            const updatedUserWallet = await this.prisma.user_wallets.update({
                where: { id },
                data: {
                    ...userWallet,
                    updated_at: now,
                },
            });
            return updatedUserWallet;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error updating user wallet', { error });
            throw new AppError('Error updating user wallet', 500, 'DB_USER_WALLET_UPDATE_FAILED');
        }
    }

    public async deleteUserWallet(id: string): Promise<void> {
        try {
            if(!id) {
                throw new AppError('User wallet ID is required', 400, 'USER_WALLET_ID_REQUIRED');
            }
            const existingUserWallet = await this.prisma.user_wallets.findUnique({
                where: { id },
            });
            if (!existingUserWallet) {
                throw new AppError('User wallet not found', 404, 'USER_WALLET_NOT_FOUND');
            }
            await this.prisma.user_wallets.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error deleting user wallet', { error });
            throw new AppError('Error deleting user wallet', 500, 'DB_USER_WALLET_DELETION_FAILED');
        }
    }

    public async deleteUserWalletByUserId(userId: string): Promise<void> {
        try {
            if(!userId) {
                throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
            }
            await this.prisma.user_wallets.deleteMany({
                where: { user_id: userId },
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error deleting user wallet by user id', { error });
            throw new AppError('Error deleting user wallet by user id', 500, 'DB_USER_WALLET_DELETE_BY_USER_ID_FAILED');
        }
    }

    public async getUserWalletsByUserId(userId: string): Promise<user_wallets[]> {
        try {
            if (!userId) {
                throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
            }
            const userWallets = await this.prisma.user_wallets.findMany({
                where: { user_id: userId },
            });
            if (!userWallets) {
                throw new AppError('User wallets not found', 404, 'USER_WALLETS_NOT_FOUND');
            }
            return userWallets;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting user wallets by user id', { error });
            throw new AppError('Error getting user wallets by user id', 500, 'DB_USER_WALLETS_GET_BY_USER_ID_FAILED');
        }
    }

    public async getUserWalletById(id: string): Promise<user_wallets> {
        try {
            if (!id) {
                throw new AppError('User wallet ID is required', 400, 'USER_WALLET_ID_REQUIRED');
            }
            const userWallet = await this.prisma.user_wallets.findUnique({
                where: { id },
            });
            if (!userWallet) {
                throw new AppError('User wallet not found', 404, 'USER_WALLET_NOT_FOUND');
            }
            return userWallet;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting user wallet by id', { error });
            throw new AppError('Error getting user wallet by id', 500, 'DB_USER_WALLET_GET_BY_ID_FAILED');
        }
    }

    public async getUserWalletByChainIdAndAddress(chainId: number, address: string): Promise<user_wallets> {
        try {
            if (!chainId) {
                throw new AppError('Chain ID is required', 400, 'CHAIN_ID_REQUIRED');
            }
            if (!address) {
                throw new AppError('Address is required', 400, 'ADDRESS_REQUIRED');
            }
            const userWallet = await this.prisma.user_wallets.findUnique({
                where: { chain_id_address: { chain_id: chainId, address } },
            });
            if (!userWallet) {
                throw new AppError('User wallet not found', 404, 'USER_WALLET_NOT_FOUND');
            }
            return userWallet;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting user wallet by chain id and address', { error });
            throw new AppError('Error getting user wallet by chain id and address', 500, 'DB_USER_WALLET_GET_BY_CHAIN_ID_AND_ADDRESS_FAILED');
        }
    }

    public async getWallets(): Promise<user_wallets[]> {
        try {
            const wallets = await this.prisma.user_wallets.findMany();
            return wallets;
        } catch (error) {
            if (error instanceof AppError) {
            throw error;
        }
        logger.error('Error getting wallets', { error });
        throw new AppError('Error getting wallets', 500, 'DB_WALLETS_GET_FAILED');
    }
}
}

export const walletService = new WalletService();