import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import { Prisma, PrismaClient, users, user_wallets } from '@prisma/client';

export class UserService {
    private prisma: PrismaClient;

    public constructor() {
        this.prisma = new PrismaClient();
    }

    public async createUser(user: Prisma.usersCreateInput): Promise<users> {
        try {
            if(!user.handle || !user.email) {
                throw new AppError('Handle and email are required', 400, 'HANDLE_EMAIL_REQUIRED');
            }
            const existingUser = await this.prisma.users.findUnique({
                where: {
                    handle: user.handle,
                },
            });
            if (existingUser) {
                throw new AppError('User already exists', 400, 'USER_ALREADY_EXISTS');
            }
            const existingUserByEmail = await this.prisma.users.findUnique({
                where: {
                    email: user.email,
                },
            });
            if (existingUserByEmail) {
                throw new AppError('User with this email already exists', 400, 'USER_EMAIL_ALREADY_EXISTS');
            }
            const newUser = await this.prisma.users.create({
                data: user,
            });
            return newUser;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating user', { error });
            throw new AppError('Error creating user', 500, 'DB_USER_CREATION_FAILED');
        }
    }

    public async updateUser(id: string, user: Prisma.usersUpdateInput): Promise<users> {
        try {       
            if(!id) {
                throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
            }
            if(!user.handle || !user.email) {
                throw new AppError('Handle and email are required', 400, 'HANDLE_EMAIL_REQUIRED');
            }
            const existingUser = await this.prisma.users.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            const now = new Date();
            const updatedUser = await this.prisma.users.update({
                where: { id },
                data: {
                    ...user,
                    updated_at: now,
                },
            });
            return updatedUser;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error updating user', { error });
            throw new AppError('Error updating user', 500, 'DB_USER_UPDATE_FAILED');
        }
    }

    public async deleteUser(id: string): Promise<void> {
        try {
            if(!id) {
                throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
            }
            const existingUser = await this.prisma.users.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            await this.prisma.users.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error deleting user', { error });
            throw new AppError('Error deleting user', 500, 'DB_USER_DELETION_FAILED');
        }
    }
    
    public async getUserByHandle(handle: string): Promise<users> {
        try {
            if(!handle) {
                throw new AppError('Handle is required', 400, 'HANDLE_REQUIRED');
            }
            const user = await this.prisma.users.findUnique({
                where: { handle },
            });
            if (!user) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting user by handle', { error });
            throw new AppError('Error getting user by handle', 500, 'DB_USER_GET_BY_HANDLE_FAILED');
        }
    }

    public async getUserByEmail(email: string): Promise<users> {
        try {
            if (!email) {
                throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
            }
            const user = await this.prisma.users.findUnique({
                where: { email },
            });
            if (!user) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting user by email', { error });
            throw new AppError('Error getting user by email', 500, 'DB_USER_GET_BY_EMAIL_FAILED');
        }
    }

    public async getUserById(id: string): Promise<users> {
        try {
            if (!id) {
                throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
            }
            const user = await this.prisma.users.findUnique({
                where: { id },
            });
            if (!user) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting user by id', { error });
            throw new AppError('Error getting user by id', 500, 'DB_USER_GET_BY_ID_FAILED');
        }
    }

    public async getUsers(): Promise<users[]> {
        try {
            const users = await this.prisma.users.findMany();
            return users;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting users', { error });
            throw new AppError('Error getting users', 500, 'DB_USERS_GET_FAILED');
        }
    }

    // user-wallets service methods
    public async createUserWallet(userWallet: Prisma.user_walletsCreateInput): Promise<user_wallets> {
        try {
            if(!userWallet.chain_id || !userWallet.address) {
                throw new AppError('Chain ID and address are required', 400, 'CHAIN_ID_ADDRESS_REQUIRED');
            }
            const existingUserWallet = await this.prisma.user_wallets.findUnique({
                where: { chain_id_address: { chain_id: userWallet.chain_id, address: userWallet.address } },
            });
            if (existingUserWallet) {
                throw new AppError('User wallet already exists', 400, 'USER_WALLET_ALREADY_EXISTS');
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
            if(!userWallet.chain_id || !userWallet.address) {
                throw new AppError('Chain ID and address are required', 400, 'CHAIN_ID_ADDRESS_REQUIRED');
            }
            const existingUserWallet = await this.prisma.user_wallets.findUnique({
                where: { id },
            });
            if (!existingUserWallet) {
                throw new AppError('User wallet not found', 404, 'USER_WALLET_NOT_FOUND');
            }
            const updatedUserWallet = await this.prisma.user_wallets.update({
                where: { id },
                data: userWallet,
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
}

export const userService = new UserService();