import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, user_role, users } from '@prisma/client';
import { generateToken } from '../../utils/jwt.js';

export class UserService {
    private prisma: PrismaClient;

    public constructor() {
        this.prisma = new PrismaClient();
    }

    public async createUserWithAddress(user: Prisma.usersCreateInput): Promise<string> {
        try {
            if(!user.address || !user.role) {
                throw new AppError('Address and role are required', 500, 'ADDRESS_ROLE_REQUIRED');
            }
            if(user.role !== user_role.client && user.role !== user_role.freelancer) {
                throw new AppError('Invalid role', 500, 'INVALID_USER_ROLE');
            }
            const existingUser = await this.prisma.users.findUnique({
                where: {
                    address: user.address,
                },
            });
            if (existingUser) {
                throw new AppError('User already exists', 500, 'USER_ALREADY_EXISTS');
            }
            const newUser = await this.prisma.users.create({
                data: user,
            });
            const token = generateToken(newUser);
            return token;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating user', { error });
            throw new AppError('Error creating user', 500, 'DB_USER_CREATION_FAILED');
        }
    }

    public async createUserWithEmail(user: Prisma.usersCreateInput): Promise<string> {
        try {
            if(!user.email || !user.role) {
                throw new AppError('Email and role are required', 400, 'EMAIL_ROLE_REQUIRED');
            }
            if(user.role !== user_role.client && user.role !== user_role.freelancer) {
                throw new AppError('Invalid role', 400, 'INVALID_ROLE');
            }
            const existingUser = await this.prisma.users.findUnique({
                where: {
                    email: user.email,
                },
            });
            if (existingUser) {
                throw new AppError('User already exists', 400, 'USER_ALREADY_EXISTS');
            }
            const newUser = await this.prisma.users.create({
                data: user,
            });
            const token = generateToken(newUser);
            return token;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating user', { error });
            throw new AppError('Error creating user', 500, 'DB_USER_CREATION_FAILED');
        }
    }

    public async updateUser(id: string, user: Prisma.usersUpdateInput): Promise<string> {
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
            const now = new Date();
            const updatedUser = await this.prisma.users.update({
                where: { id },
                data: {
                    ...user,
                    updated_at: now,
                },
            });
            const token = generateToken(updatedUser);
            return token;
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
    
    public async getUserByAddress(address: string): Promise<users> {
        try {
            if(!address) {
                throw new AppError('Address is required', 400, 'ADDRESS_REQUIRED');
            }
            const user = await this.prisma.users.findUnique({
                where: { address },
            });
            if (!user) {
                throw new AppError('User not found', 404, 'USER_NOT_FOUND');
            }
            return user;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting user by address', { error });
            throw new AppError('Error getting user by address', 500, 'DB_USER_GET_BY_ADDRESS_FAILED');
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