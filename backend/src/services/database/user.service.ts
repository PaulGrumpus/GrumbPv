import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, users } from '@prisma/client';

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
}

export const userService = new UserService();