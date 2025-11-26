import path from 'node:path';
import { unlink } from 'node:fs/promises';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, user_role, users } from '@prisma/client';
import { generateToken } from '../../utils/jwt.js';

const IMAGE_PUBLIC_PREFIX = '/uploads/images';
type UploadedFile = {
    filename?: string;
    mimetype: string;
    size: number;
};

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

    public async updateUser(
        id: string,
        user: Prisma.usersUncheckedUpdateInput,
        uploadedImage?: UploadedFile,
    ): Promise<string> {
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
            const { image_id: rawImageInput, ...userData } = user;

            let normalizedImageId: string | null | undefined;

            if (uploadedImage) {
                await this.removeExistingImage(existingUser.image_id);
                normalizedImageId = await this.persistUploadedFile(uploadedImage);
            } else {
                normalizedImageId = await this.normalizeExistingImageReference(rawImageInput);
            }
            const now = new Date();
            const updateData: Prisma.usersUncheckedUpdateInput = {
                ...this.normalizeUserFields(userData),
                updated_at: now,
            };

            if (normalizedImageId !== undefined) {
                updateData.image_id = normalizedImageId;
            }            

            const updatedUser = await this.prisma.users.update({
                where: { id },
                data: updateData,
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
    
    public async getUserByAddress(address: string): Promise<string> {
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
            const token = generateToken(user);
            return token;
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

    private normalizeUserFields(
        userData: Prisma.usersUncheckedUpdateInput,
    ): Prisma.usersUncheckedUpdateInput {
        const normalized: Record<string, unknown> = {};
        const allowedKeys: Array<keyof Prisma.usersUncheckedUpdateInput> = [
            'address',
            'chain',
            'email',
            'role',
            'display_name',
            'bio',
            'country_code',
            'is_verified',
        ];

        for (const key of allowedKeys) {
            const value = userData[key];

            if (value === undefined) {
                continue;
            }

            if (value === null) {
                normalized[key as string] = null;
                continue;
            }

            if (key === 'is_verified') {
                normalized[key as string] = this.parseBooleanFlag(value);
                continue;
            }

            normalized[key as string] = value;
        }

        return normalized as Prisma.usersUncheckedUpdateInput;
    }

    private parseBooleanFlag(value: unknown): boolean {
        if (typeof value === 'boolean') {
            return value;
        }

        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (normalized === 'true' || normalized === '1') {
                return true;
            }
            if (normalized === 'false' || normalized === '0') {
                return false;
            }
        }

        throw new AppError('Invalid value for is_verified', 400, 'INVALID_IS_VERIFIED_FLAG');
    }

    private async removeExistingImage(imageId?: string | null): Promise<void> {
        if (!imageId) {
            return;
        }

        const existingImage = await this.prisma.files.findUnique({
            where: { id: imageId },
        });

        if (!existingImage) {
            return;
        }

        const absolutePath = path.resolve(
            process.cwd(),
            existingImage.url.startsWith('/') ? existingImage.url.slice(1) : existingImage.url,
        );

        try {
            await unlink(absolutePath);
        } catch (error) {
            const err = error as NodeJS.ErrnoException;
            if (err.code !== 'ENOENT') {
                logger.warn('Failed to remove existing user image from disk', {
                    imageId,
                    absolutePath,
                    error,
                });
            }
        }

        await this.prisma.files.delete({
            where: { id: imageId },
        });
    }

    private async persistUploadedFile(file: UploadedFile): Promise<string> {
        if (!file.filename) {
            throw new AppError('Invalid uploaded image', 400, 'INVALID_IMAGE_FILE');
        }

        const fileRecord = await this.prisma.files.create({
            data: {
                url: `${IMAGE_PUBLIC_PREFIX}/${file.filename}`,
                mime_type: file.mimetype,
                size_bytes: file.size,
            },
        });

        return fileRecord.id;
    }

    private async normalizeExistingImageReference(
        imageInput?: Prisma.usersUncheckedUpdateInput['image_id'],
    ): Promise<string | null | undefined> {
        if (typeof imageInput === 'undefined') {
            return undefined;
        }

        if (imageInput === null) {
            return null;
        }

        if (typeof imageInput === 'string') {
            await this.ensureImageExists(imageInput);
            return imageInput;
        }

        if (this.isNullableStringFieldOperation(imageInput)) {
            const { set } = imageInput;
            if (typeof set === 'string') {
                await this.ensureImageExists(set);
                return set;
            }
            if (set === null) {
                return null;
            }
        }

        return undefined;
    }

    private async ensureImageExists(imageId: string): Promise<void> {
        const image = await this.prisma.files.findUnique({
            where: { id: imageId },
        });

        if (!image) {
            throw new AppError('Image not found', 404, 'IMAGE_NOT_FOUND');
        }
    }

    private isNullableStringFieldOperation(
        value: unknown,
    ): value is Prisma.NullableStringFieldUpdateOperationsInput {
        return typeof value === 'object' && value !== null && 'set' in value;
    }
}

export const userService = new UserService();