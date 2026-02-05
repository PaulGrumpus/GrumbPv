import bcrypt from 'bcryptjs';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, user_role, users } from '@prisma/client';
import { generateToken } from '../../utils/jwt.js';
import {
  removeStoredImage,
  persistUploadedImage,
  type UploadedImage,
} from '../../utils/imageStorage.js';
import { prisma } from '../../prisma.js';
import { emailService } from '../email/email.service.js';

const PASSWORD_SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS || 10);

export class UserService {
  private prisma = prisma;

  public async createUserWithAddress(user: Prisma.usersCreateInput): Promise<string> {
    try {
      if (!user.address || !user.role) {
        throw new AppError('Address and role are required', 500, 'ADDRESS_ROLE_REQUIRED');
      }
      if (user.role !== user_role.client && user.role !== user_role.freelancer) {
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
      const hashedPassword = await this.hashPasswordIfPresent(user.password);
      const newUser = await this.prisma.users.create({
        data: {
          ...user,
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
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
      if (!user.email || !user.role || !user.password) {
        throw new AppError(
          'Email, password and role are required',
          400,
          'EMAIL_ROLE_PASSWORD_REQUIRED'
        );
      }
      if (user.role !== user_role.client && user.role !== user_role.freelancer && user.role !== user_role.admin) {
        throw new AppError('Invalid role', 400, 'INVALID_ROLE');
      }
      const existingUser = await this.prisma.users.findFirst({
        where: {
          email: user.email,
        },
      });
      if (existingUser) {
        throw new AppError('User already exists', 400, 'USER_ALREADY_EXISTS');
      }
      const hashedPassword = await this.hashPasswordIfPresent(user.password);
      const imageId = user.image_id ? user.image_id : 'default.jpg';

      const newUser = await this.prisma.users.create({
        data: {
          ...user,
          ...(hashedPassword ? { password: hashedPassword } : {}),
          image_id: imageId,
        },
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
    uploadedImage?: UploadedImage
  ): Promise<string> {
    try {
      logger.info('update user id', id);
      if (!id) {
        throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
      }
      const existingUser = await this.prisma.users.findUnique({
        where: { id },
      });
      if (!existingUser) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      const { image_id: rawImageInput, ...userData } = user;

      let removeExistingImage = true;
      if (existingUser.image_id === 'default.jpg') {
        removeExistingImage = false;
      }

      const normalizedImageId = await this.resolveImageId(
        existingUser.image_id,
        rawImageInput,
        uploadedImage,
        removeExistingImage
      );
      const now = new Date();

      const updateData: Prisma.usersUncheckedUpdateInput = {
        ...this.normalizeUserFields(userData),
        updated_at: now,
      };

      if (
        typeof updateData.password === 'string' &&
        bcrypt.compareSync(updateData.password || '', existingUser.password || '')
      ) {
        throw new AppError(
          'Current password and new password should not be same',
          400,
          'CURRENT_PASSWORD_AND_NEW_PASSWORD_SHOULD_NOT_BE_SAME'
        );
      }

      if (typeof updateData.password === 'string' && updateData.password.length > 0) {
        updateData.password =
          (await this.hashPasswordIfPresent(updateData.password)) ?? updateData.password;
      }

      if (normalizedImageId !== undefined) {
        updateData.image_id = normalizedImageId as string;
      }

      if (updateData.address) {
        const exsitingWalletAddress = await this.prisma.users.findUnique({
          where: { address: updateData.address as string },
        });
        if (exsitingWalletAddress && existingUser.address !== exsitingWalletAddress.address) {
          throw new AppError(
            'Wallet address already exists! Connected to another wallet account!',
            400,
            'WALLET_ADDRESS_ALREADY_CONNECTED_TO_ANOTHER_ACCOUNT'
          );
        }
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
      if (!id) {
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
      if (!address) {
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

  public async getUserByEmailAndPassword(email: string, password: string): Promise<string> {
    try {
      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'EMAIL_PASSWORD_REQUIRED');
      }
      const user = await this.prisma.users.findFirst({
        where: { email },
      });
      if (!user) {
        throw new AppError('Invalid email', 400, 'INVALID_EMAIL');
      }
      if (user.password && !bcrypt.compareSync(password, user.password)) {
        throw new AppError('Invalid password', 400, 'INVALID_PASSWORD');
      }
      const token = generateToken(user);
      return token;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting user by email', { error });
      throw new AppError('Error getting user by email', 500, 'DB_USER_GET_BY_EMAIL_FAILED');
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

  public async resetPassword(email: string): Promise<boolean> {
    try {
      if (!email) {
        throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
      }
      const user = await this.prisma.users.findFirst({
        where: { email },
      });
      if (!user) {
        throw new AppError('Invalid email', 400, 'INVALID_EMAIL');
      }
      await emailService.sendEmail({
        to: user.email as string,
        subject: 'Password Reset Request',
        template: 'notification',
        data: {
          name: user.display_name as string,
          body: 'A password reset request has been sent to your email address. Please click the link to reset your password.',
          actionUrl: `${process.env.FRONTEND_URL}/resetPassword?id=${user.id}`,
          actionText: 'Reset Password',
        },
      });
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error resetting password', { error });
      throw new AppError('Error resetting password', 500, 'DB_USER_RESET_PASSWORD_FAILED');
    }
  }

  public async updateUserPassword(id: string, password: string): Promise<boolean> {
    logger.info('update user password id', id);
    try {
      if (!id || !password) {
        throw new AppError('User ID and password are required', 400, 'USER_ID_PASSWORD_REQUIRED');
      }
      const user = await this.prisma.users.findUnique({
        where: { id },
      });
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      const hashedPassword = await this.hashPasswordIfPresent(password);
      await this.prisma.users.update({
        where: { id },
        data: { password: hashedPassword },
      });
      return true;
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error updating user password', { error });
      throw new AppError('Error updating user password', 500, 'DB_USER_PASSWORD_UPDATE_FAILED');
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

  public async updateUserFunds(id: string, total_fund: number, finished_job_num: number): Promise<boolean> {
    try {
      if (!id || !total_fund || !finished_job_num) {
        throw new AppError('User ID, total fund and finished job number are required', 400, 'USER_ID_TOTAL_FUND_FINISHED_JOB_NUM_REQUIRED');
      }
      await this.prisma.users.update({
        where: { id },
        data: { total_fund, finished_job_num },
      });
      return true;
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error updating user funds', { error });
      throw new AppError('Error updating user funds', 500, 'DB_USER_FUNDS_UPDATE_FAILED');
    }
  }

  public async updateClientFundTime(id: string, fund_cycle: number): Promise<boolean> {
    try {
      if (!id || !fund_cycle) {
        throw new AppError('User ID and fund cycle are required', 400, 'USER_ID_FUND_CYCLE_REQUIRED');
      }
      const user = await this.prisma.users.findFirst({
        where: { id },
      });
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      const newFundCycle = user.fund_cycle ? Number(user.fund_cycle) + fund_cycle : fund_cycle;
      await this.prisma.users.update({
        where: { id },
        data: { fund_cycle: newFundCycle, fund_num: user.fund_num ? Number(user.fund_num) + 1 : 1 },
      });
      return true;
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error updating client fund time', { error });
      throw new AppError('Error updating client fund time', 500, 'DB_CLIENT_FUND_TIME_UPDATE_FAILED');
    }
  }

  private async hashPasswordIfPresent(password?: string | null): Promise<string | undefined> {
    if (!password) {
      return undefined;
    }

    return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  }

  private normalizeUserFields(
    userData: Prisma.usersUncheckedUpdateInput
  ): Prisma.usersUncheckedUpdateInput {
    const normalized: Record<string, unknown> = {};
    const allowedKeys: Array<keyof Prisma.usersUncheckedUpdateInput> = [
      'address',
      'chain',
      'email',
      'password',
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

  private async normalizeExistingImageReference(
    imageInput?: Prisma.usersUncheckedUpdateInput['image_id']
  ): Promise<string | null | undefined> {
    if (typeof imageInput === 'undefined') {
      return undefined;
    }

    if (imageInput === null) {
      return null;
    }

    if (typeof imageInput === 'string') {
      return imageInput;
    }

    if (this.isNullableStringFieldOperation(imageInput)) {
      const { set } = imageInput;
      if (typeof set === 'string') {
        return set;
      }
      if (set === null) {
        return null;
      }
    }

    return undefined;
  }

  private isNullableStringFieldOperation(
    value: unknown
  ): value is Prisma.NullableStringFieldUpdateOperationsInput {
    return typeof value === 'object' && value !== null && 'set' in value;
  }

  private async resolveImageId(
    existingImageId: string | null,
    rawImageInput: Prisma.usersUncheckedUpdateInput['image_id'],
    uploadedImage?: UploadedImage,
    removeExistingImage?: boolean
  ): Promise<string | null | undefined> {
    if (uploadedImage) {
      if (removeExistingImage) {
        await removeStoredImage(existingImageId);
      }
      return persistUploadedImage(uploadedImage);
    }

    return this.normalizeExistingImageReference(rawImageInput);
  }
}

export const userService = new UserService();
