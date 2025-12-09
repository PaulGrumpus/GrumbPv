import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, gigs } from '@prisma/client';
import { userService } from './user.service.js';
import {
  persistUploadedImage,
  removeStoredImage,
  type UploadedImage,
} from '../../utils/imageStorage.js';

export class GigService {
  private prisma: PrismaClient;

  public constructor() {
    this.prisma = new PrismaClient();
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    // Handle Prisma Decimal type
    if (value && typeof value.toNumber === 'function') return value.toNumber();
    return parseFloat(String(value));
  }

  public async createGig(
    gig: Prisma.gigsUncheckedCreateInput,
    file?: UploadedImage
  ): Promise<gigs> {
    try {
      if (!gig.title || !gig.description_md || !gig.freelancer_id) {
        throw new AppError(
          'Title, description and freelancer ID are required',
          400,
          'TITLE_DESCRIPTION_FREELANCER_ID_REQUIRED'
        );
      }

      const budgetMin = this.toNumber(gig.budget_min_usd);
      const budgetMax = this.toNumber(gig.budget_max_usd);

      if (budgetMin !== null && budgetMin <= 0) {
        throw new AppError(
          'Budget minimum is less than or equal to 0',
          400,
          'BUDGET_MIN_LESS_THAN_OR_EQUAL_TO_0'
        );
      }
      if (budgetMax !== null && budgetMax <= 0) {
        throw new AppError(
          'Budget maximum is less than or equal to 0',
          400,
          'BUDGET_MAX_LESS_THAN_OR_EQUAL_TO_0'
        );
      }
      if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
        throw new AppError(
          'Budget minimum is greater than or qual to budget maximum',
          400,
          'BUDGET_MIN_GREATER_THAN_OR_EQUAL_TO_MAX'
        );
      }
      const existingFreelancer = await userService.getUserById(gig.freelancer_id);
      if (!existingFreelancer) {
        throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
      }
      const existingGig = await this.prisma.gigs.findFirst({
        where: {
          title: gig.title,
          freelancer_id: gig.freelancer_id,
        },
      });
      if (existingGig) {
        throw new AppError('Gig already exists', 400, 'GIG_ALREADY_EXISTS');
      }

      const normalizedImageId = await this.resolveImageId(null, gig.image_id, file);

      const createData: Prisma.gigsUncheckedCreateInput = {
        ...this.normalizeGigFields(gig),
        ...(normalizedImageId !== undefined ? { image_id: normalizedImageId as string } : null),
        tags: [gig.tags ?? ''],
      } as Prisma.gigsUncheckedCreateInput;

      console.log('createData', createData);

      const newGig = await this.prisma.gigs.create({
        data: createData,
      });
      return newGig;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error creating gig', { error });
      throw new AppError('Error creating gig', 500, 'DB_GIG_CREATION_FAILED');
    }
  }

  public async updateGig(
    id: string,
    gig: Prisma.gigsUncheckedUpdateInput,
    file?: UploadedImage
  ): Promise<gigs> {
    try {
      if (!id) {
        throw new AppError('Gig ID is required', 400, 'GIG_ID_REQUIRED');
      }
      const existingGig = await this.prisma.gigs.findUnique({
        where: { id },
      });
      if (!existingGig) {
        throw new AppError('Gig not found', 404, 'GIG_NOT_FOUND');
      }
      if (!gig.title || !gig.description_md || !gig.freelancer_id) {
        throw new AppError(
          'Title, description and freelancer ID are required',
          400,
          'TITLE_DESCRIPTION_FREELANCER_ID_REQUIRED'
        );
      }
      const budgetMin = this.toNumber(gig.budget_min_usd);
      const budgetMax = this.toNumber(gig.budget_max_usd);

      if (budgetMin !== null && budgetMin <= 0) {
        throw new AppError(
          'Budget minimum is less than or equal to 0',
          400,
          'BUDGET_MIN_LESS_THAN_OR_EQUAL_TO_0'
        );
      }
      if (budgetMax !== null && budgetMax <= 0) {
        throw new AppError(
          'Budget maximum is less than or equal to 0',
          400,
          'BUDGET_MAX_LESS_THAN_OR_EQUAL_TO_0'
        );
      }
      if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
        throw new AppError(
          'Budget minimum is greater than or qual to budget maximum',
          400,
          'BUDGET_MIN_GREATER_THAN_OR_EQUAL_TO_MAX'
        );
      }
      const existingFreelancer = await userService.getUserById(gig.freelancer_id as string);
      if (!existingFreelancer) {
        throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
      }

      const normalizedImageId = await this.resolveImageId(existingGig.image_id, gig.image_id, file);

      const updatedGig = await this.prisma.gigs.update({
        where: { id },
        data: {
          ...this.normalizeGigFields(gig),
          ...(normalizedImageId !== undefined ? { image_id: normalizedImageId as string } : {}),
        },
      });
      return updatedGig;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error updating gig', { error });
      throw new AppError('Error updating gig', 500, 'DB_GIG_UPDATE_FAILED');
    }
  }

  //  make this admin only
  public async deleteGig(id: string): Promise<void> {
    try {
      if (!id) {
        throw new AppError('Gig ID is required', 400, 'GIG_ID_REQUIRED');
      }
      const existingGig = await this.prisma.gigs.findUnique({
        where: { id },
      });
      if (!existingGig) {
        throw new AppError('Gig not found', 404, 'GIG_NOT_FOUND');
      }
      await this.prisma.jobs.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error deleting gig', { error });
      throw new AppError('Error deleting gig', 500, 'DB_GIG_DELETION_FAILED');
    }
  }

  public async getGigById(id: string): Promise<gigs> {
    try {
      if (!id) {
        throw new AppError('Gig ID is required', 400, 'GIG_ID_REQUIRED');
      }
      const gig = await this.prisma.gigs.findUnique({
        where: { id },
      });
      if (!gig) {
        throw new AppError('Gig not found', 404, 'GIG_NOT_FOUND');
      }
      return gig;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting gig by id', { error });
      throw new AppError('Error getting gig by id', 500, 'DB_GIG_GET_BY_ID_FAILED');
    }
  }

  public async getGigsByFreelancerId(freelancer_id: string): Promise<gigs[]> {
    try {
      if (!freelancer_id) {
        throw new AppError('Freelancer ID is required', 400, 'FREELANCER_ID_REQUIRED');
      }
      const gigs = await this.prisma.gigs.findMany({
        where: { freelancer_id },
      });
      if (!gigs) {
        throw new AppError('Gigs not found', 404, 'GIGS_NOT_FOUND');
      }
      return gigs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting gigs by freelancer id', { error });
      throw new AppError(
        'Error getting gigs by freelancer id',
        500,
        'DB_GIGS_GET_BY_FREELANCER_ID_FAILED'
      );
    }
  }

  public async getGigs(): Promise<gigs[]> {
    try {
      const gigs = await this.prisma.gigs.findMany();
      if (!gigs) {
        throw new AppError('Gigs not found', 404, 'GIGS_NOT_FOUND');
      }
      return gigs;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting gigs', { error });
      throw new AppError('Error getting gigs', 500, 'DB_GIGS_GET_FAILED');
    }
  }

  private async normalizeExistingImageReference(
    imageInput?: Prisma.gigsUncheckedUpdateInput['image_id']
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

  private normalizeGigFields(
    gigData: Prisma.gigsUncheckedUpdateInput
  ): Prisma.gigsUncheckedUpdateInput {
    const normalized: Record<string, unknown> = {};
    const allowedKeys: Array<keyof Prisma.gigsUncheckedUpdateInput> = [
      'title',
      'description_md',
      'budget_min_usd',
      'budget_max_usd',
      'token_symbol',
      'tags',
      'link',
      'freelancer_id',
      'image_id',
    ];

    for (const key of allowedKeys) {
      const value = gigData[key];

      if (value === undefined) {
        continue;
      }

      if (value === null) {
        normalized[key as string] = null;
        continue;
      }

      normalized[key as string] = value;
    }

    return normalized as Prisma.gigsUncheckedUpdateInput;
  }

  private isNullableStringFieldOperation(
    value: unknown
  ): value is Prisma.NullableStringFieldUpdateOperationsInput {
    return typeof value === 'object' && value !== null && 'set' in value;
  }

  private async resolveImageId(
    existingImageId: string | null,
    rawImageInput: Prisma.gigsUncheckedUpdateInput['image_id'],
    uploadedImage?: UploadedImage
  ): Promise<string | null | undefined> {
    if (uploadedImage) {
      await removeStoredImage(existingImageId);
      return persistUploadedImage(uploadedImage);
    }

    return this.normalizeExistingImageReference(rawImageInput);
  }

  // private normalizeTags(input: unknown): string[] {
  //     if (!input) return [];
  //     if (Array.isArray(input)) return input.map((tag) => String(tag));
  //     if (typeof input === 'string') {
  //         try {
  //             const parsed = JSON.parse(input);
  //             if (Array.isArray(parsed)) return parsed.map((tag) => String(tag));
  //         } catch {
  //             // fall through
  //         }
  //         return [input];
  //     }
  //     return [String(input)];
  // }
}

export const gigService = new GigService();
