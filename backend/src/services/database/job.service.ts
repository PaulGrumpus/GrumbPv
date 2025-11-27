import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, jobs, job_status } from '@prisma/client';
import { userService } from './user.service.js';
import {
    persistUploadedImage,
    removeStoredImage,
    type UploadedImage,
} from '../../utils/imageStorage.js';

export class JobService {
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

    public async createJob(
        job: Prisma.jobsUncheckedCreateInput,
        file?: UploadedImage,
    ): Promise<jobs> {
        try {
            if(!job.title || !job.description_md || !job.client_id || !job.status) {
                throw new AppError('Title, description, client ID and status are required', 400, 'TITLE_DESCRIPTION_CLIENT_ID_STATUS_REQUIRED');
            }

            const budgetMin = this.toNumber(job.budget_min_usd);
            const budgetMax = this.toNumber(job.budget_max_usd);
            
            if (budgetMin !== null && budgetMin <= 0) {
                throw new AppError('Budget minimum is less than or equal to 0', 400, 'BUDGET_MIN_LESS_THAN_OR_EQUAL_TO_0');
            }
            if (budgetMax !== null && budgetMax <= 0) {
                throw new AppError('Budget maximum is less than or equal to 0', 400, 'BUDGET_MAX_LESS_THAN_OR_EQUAL_TO_0');
            }
            if (budgetMin !== null && budgetMax !== null && budgetMin >= budgetMax) {
                throw new AppError('Budget minimum is greater than or equal to budget maximum', 400, 'BUDGET_MIN_GREATER_THAN_OR_EQUAL_TO_MAX');
            }
            if(job.status !== job_status.draft && job.status !== job_status.open && job.status !== job_status.in_review && job.status !== job_status.in_progress && job.status !== job_status.completed && job.status !== job_status.cancelled) {
                throw new AppError('Status is not valid. Valid statuses are draft, open, in_review, in_progress, completed and cancelled', 400, 'STATUS_NOT_VALID');
            }
            const existingClient = await userService.getUserById(job.client_id);
            if (!existingClient) {
                throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
            }
            if(job.deadline_at) {
                const deadlineDate = job.deadline_at instanceof Date ? job.deadline_at : new Date(job.deadline_at);
                const now = new Date();
                const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                
                if(isNaN(deadlineDate.getTime())) {
                    throw new AppError('Invalid deadline date format', 400, 'INVALID_DEADLINE_FORMAT');
                }
                
                if(deadlineDate < now) {
                    throw new AppError('Deadline is in the past', 400, 'DEADLINE_IN_PAST');
                }
                if(deadlineDate > oneYearFromNow) {
                    throw new AppError('Deadline is more than 1 year in the future', 400, 'DEADLINE_MORE_THAN_1_YEAR_IN_FUTURE');
                }
            }
            const existingJob = await this.prisma.jobs.findFirst({
                where: {
                    title: job.title,
                    client_id: job.client_id,
                },
            });
            if (existingJob) {
                throw new AppError('Job already exists', 400, 'JOB_ALREADY_EXISTS');
            }

            const normalizedImageId = await this.resolveImageId(
                null,
                job.image_id,
                file,
            );

            const createData: Prisma.jobsUncheckedCreateInput = {
                ...this.normalizeJobFields(job),
                ...(normalizedImageId !== undefined ? { image_id: normalizedImageId as string } : null),
                tags: this.normalizeTags(job.tags),
            } as Prisma.jobsUncheckedCreateInput;

            console.log("normalizedImageId", normalizedImageId, file);

            const normalizedTags = this.normalizeTags(job.tags);
            console.log("normalizedTags", normalizedTags);

            console.log("Job", job);

            const newJob = await this.prisma.jobs.create({
                data: createData,
            });
            return newJob;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating job', { error });
            throw new AppError('Error creating job', 500, 'DB_JOB_CREATION_FAILED');
        }
    }

    public async updateJob(
        id: string,
        job: Prisma.jobsUncheckedUpdateInput,
        file?: UploadedImage,
    ): Promise<jobs> {
        try {
            if(!id) {
                throw new AppError('Job ID is required', 400, 'JOB_ID_REQUIRED');
            }
            const existingJob = await this.prisma.jobs.findUnique({
                where: { id },
            });
            if (!existingJob) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            if(!job.title || !job.description_md || !job.client_id || !job.status) {
                throw new AppError('Title, description, client ID and status are required', 400, 'TITLE_DESCRIPTION_CLIENT_ID_STATUS_REQUIRED');
            }
            if(job.status !== job_status.draft && job.status !== job_status.open && job.status !== job_status.in_review && job.status !== job_status.in_progress && job.status !== job_status.completed && job.status !== job_status.cancelled) {
                throw new AppError('Status is not valid. Valid statuses are draft, open, in_review, in_progress, completed and cancelled', 400, 'STATUS_NOT_VALID');
            }
            const budgetMin = this.toNumber(job.budget_min_usd);
            const budgetMax = this.toNumber(job.budget_max_usd);
            
            if (budgetMin !== null && budgetMin <= 0) {
                throw new AppError('Budget minimum is less than or equal to 0', 400, 'BUDGET_MIN_LESS_THAN_OR_EQUAL_TO_0');
            }
            if (budgetMax !== null && budgetMax <= 0) {
                throw new AppError('Budget maximum is less than or equal to 0', 400, 'BUDGET_MAX_LESS_THAN_OR_EQUAL_TO_0');
            }
            if (budgetMin !== null && budgetMax !== null && budgetMin >= budgetMax) {
                throw new AppError('Budget minimum is greater than or equal to budget maximum', 400, 'BUDGET_MIN_GREATER_THAN_OR_EQUAL_TO_MAX');
            }
            const existingClient = await userService.getUserById(job.client_id as string);
            if (!existingClient) {
                throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
            }
            if(job.deadline_at) {
                const deadlineDate = job.deadline_at instanceof Date ? job.deadline_at : new Date(job.deadline_at as string);
                const now = new Date();
                const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                
                if(isNaN(deadlineDate.getTime())) {
                    throw new AppError('Invalid deadline date format', 400, 'INVALID_DEADLINE_FORMAT');
                }
                
                if(deadlineDate < now) {
                    throw new AppError('Deadline is in the past', 400, 'DEADLINE_IN_PAST');
                }
                if(deadlineDate > oneYearFromNow) {
                    throw new AppError('Deadline is more than 1 year in the future', 400, 'DEADLINE_MORE_THAN_1_YEAR_IN_FUTURE');
                }
            }
            const normalizedImageId = await this.resolveImageId(
                existingJob.image_id,
                job.image_id,
                file,
            );

            const updatedJob = await this.prisma.jobs.update({
                where: { id },
                data: {
                    ...this.normalizeJobFields(job),
                    ...(normalizedImageId !== undefined ? { image_id: normalizedImageId as string } : {}),
                },
            });
            return updatedJob;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error updating job', { error });
            throw new AppError('Error updating job', 500, 'DB_JOB_UPDATE_FAILED');
        }
    }

    //  make this admin only
    public async deleteJob(id: string): Promise<void> {
        try {
            if(!id) {
                throw new AppError('Job ID is required', 400, 'JOB_ID_REQUIRED');
            }
            const existingJob = await this.prisma.jobs.findUnique({
                where: { id },
            });
            if (!existingJob) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            await this.prisma.jobs.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error deleting job', { error });
            throw new AppError('Error deleting job', 500, 'DB_JOB_DELETION_FAILED');
        }
    }   

    public async getJobById(id: string): Promise<jobs> {
        try {
            if(!id) {
                throw new AppError('Job ID is required', 400, 'JOB_ID_REQUIRED');
            }
            const job = await this.prisma.jobs.findUnique({
                where: { id },
            });
            if (!job) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            return job;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting job by id', { error });
            throw new AppError('Error getting job by id', 500, 'DB_JOB_GET_BY_ID_FAILED');
        }
    }   

    public async getJobsByClientId(client_id: string): Promise<jobs[]> {
        try {
            if(!client_id) {
                throw new AppError('Client ID is required', 400, 'CLIENT_ID_REQUIRED');
            }
            const jobs = await this.prisma.jobs.findMany({
                where: { client_id },
            });
            if (!jobs) {
                throw new AppError('Jobs not found', 404, 'JOBS_NOT_FOUND');
            }
            return jobs;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting jobs by client id', { error });
            throw new AppError('Error getting jobs by client id', 500, 'DB_JOBS_GET_BY_CLIENT_ID_FAILED');
        }
    }

    public async getJobs(): Promise<jobs[]> {
        try {
            const jobs = await this.prisma.jobs.findMany();
            if (!jobs) {
                throw new AppError('Jobs not found', 404, 'JOBS_NOT_FOUND');
            }
            return jobs;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting jobs', { error });
            throw new AppError('Error getting jobs', 500, 'DB_JOBS_GET_FAILED');
        }
    }

    private async normalizeExistingImageReference(
        imageInput?: Prisma.jobsUncheckedUpdateInput['image_id'],
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

    private normalizeJobFields(
        jobData: Prisma.jobsUncheckedUpdateInput,
    ): Prisma.jobsUncheckedUpdateInput {
        const normalized: Record<string, unknown> = {};
        const allowedKeys: Array<keyof Prisma.jobsUncheckedUpdateInput> = [
            'title',
            'description_md',
            'budget_min_usd',
            'budget_max_usd',
            'location',
            'deadline_at',
            'client_id',
            'status',
            'image_id',
        ];

        for (const key of allowedKeys) {
            const value = jobData[key];

            if (value === undefined) {
                continue;
            }

            if (value === null) {
                normalized[key as string] = null;
                continue;
            }

            normalized[key as string] = value;
        }

        return normalized as Prisma.jobsUncheckedUpdateInput;
    }

    private isNullableStringFieldOperation(
        value: unknown,
    ): value is Prisma.NullableStringFieldUpdateOperationsInput {
        return typeof value === 'object' && value !== null && 'set' in value;
    }

    private async resolveImageId(
        existingImageId: string | null,
        rawImageInput: Prisma.jobsUncheckedUpdateInput['image_id'],
        uploadedImage?: UploadedImage,
    ): Promise<string | null | undefined> {
        if (uploadedImage) {
            await removeStoredImage(existingImageId);
            return persistUploadedImage(uploadedImage);
        }

        return this.normalizeExistingImageReference(rawImageInput);
    }

    private normalizeTags(input: unknown): string[] {
        if (!input) return [];
        if (Array.isArray(input)) return input.map((tag) => String(tag));
        if (typeof input === 'string') {
            try {
                const parsed = JSON.parse(input);
                if (Array.isArray(parsed)) return parsed.map((tag) => String(tag));
            } catch {
                // fall through
            }
            return [input];
        }
        return [String(input)];
    }
}



export const jobService = new JobService();