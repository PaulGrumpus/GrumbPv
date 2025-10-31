import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, jobs } from '@prisma/client';
import { userService } from './user.service.js';

export class JobService {
    private prisma: PrismaClient;

    public constructor() {
        this.prisma = new PrismaClient();
    }

    public async createJob(job: Prisma.jobsUncheckedCreateInput): Promise<jobs> {
        try {
            if(!job.title || !job.description_md || !job.client_id) {
                throw new AppError('Title, description and client ID are required', 400, 'TITLE_DESCRIPTION_CLIENT_ID_REQUIRED');
            }
            if(job.budget_min_usd && job.budget_max_usd && Number(job.budget_min_usd) > Number(job.budget_max_usd)) {
                throw new AppError('Budget minimum is greater than budget maximum', 400, 'BUDGET_MIN_GREATER_THAN_MAX');
            }
            if(job.budget_min_usd && Number(job.budget_min_usd) < 0) {
                throw new AppError('Budget minimum is less than 0', 400, 'BUDGET_MIN_LESS_THAN_0');
            }
            if(job.budget_max_usd && Number(job.budget_max_usd) < 0) {
                throw new AppError('Budget maximum is less than 0', 400, 'BUDGET_MAX_LESS_THAN_0');
            }
            const existingClient = await userService.getUserById(job.client_id);
            if (!existingClient) {
                throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
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
            const newJob = await this.prisma.jobs.create({
                data: job,
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

    public async updateJob(id: string, job: Prisma.jobsUncheckedUpdateInput): Promise<jobs> {
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
            if(!job.title || !job.description_md || !job.client_id) {
                throw new AppError('Title, description and client ID are required', 400, 'TITLE_DESCRIPTION_CLIENT_ID_REQUIRED');
            }
            if(job.budget_min_usd && job.budget_max_usd && Number(job.budget_min_usd) > Number(job.budget_max_usd)) {
                throw new AppError('Budget minimum is greater than budget maximum', 400, 'BUDGET_MIN_GREATER_THAN_MAX');
            }
            if(job.budget_min_usd && Number(job.budget_min_usd) < 0) {
                throw new AppError('Budget minimum is less than 0', 400, 'BUDGET_MIN_LESS_THAN_0');
            }
            if(job.budget_max_usd && Number(job.budget_max_usd) < 0) {
                throw new AppError('Budget maximum is less than 0', 400, 'BUDGET_MAX_LESS_THAN_0');
            }
            const existingClient = await userService.getUserById(job.client_id as string);
            if (!existingClient) {
                throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
            }
            const updatedJob = await this.prisma.jobs.update({
                where: { id },
                data: job,
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
}

export const jobService = new JobService();