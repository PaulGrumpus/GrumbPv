import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, job_milestones } from '@prisma/client';
import { userService } from './user.service.js';
import { jobService } from './job.service.js';

export class JobMilestoneService {
    private prisma: PrismaClient;

    public constructor() {
        this.prisma = new PrismaClient();
    }

    public async createJobMilestone(jobMilestone: Prisma.job_milestonesUncheckedCreateInput): Promise<job_milestones> {
        try {
            console.log('jobMilestone', jobMilestone);
            if(!jobMilestone.job_id || !jobMilestone.order_index || !jobMilestone.title || !jobMilestone.freelancer_id) {
                throw new AppError('Job ID, order index, title and freelancer ID are required', 400, 'JOB_ID_ORDER_INDEX_TITLE_FREELANCER_ID_REQUIRED');
            }
            const existingJob = await jobService.getJobById(jobMilestone.job_id);
            if (!existingJob) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
                        
            const existingFreelancer = await userService.getUserById(jobMilestone.freelancer_id as string);
            if (!existingFreelancer) {
                throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
            }            
            if(existingFreelancer.role !== 'freelancer') {
                throw new AppError('Freelancer is not a freelancer', 400, 'FREELANCER_IS_NOT_A_FREELANCER');
            }

            if(jobMilestone.due_at) {
                const dueDate = jobMilestone.due_at instanceof Date ? jobMilestone.due_at : new Date(jobMilestone.due_at as string);
                const now = new Date();
                const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                
                if(isNaN(dueDate.getTime())) {
                    throw new AppError('Invalid due date format', 400, 'INVALID_DUE_DATE_FORMAT');
                }
                
                if(dueDate < now) {
                    throw new AppError('Due date is in the past', 400, 'DUE_DATE_IN_PAST');
                }
                if(dueDate > oneYearFromNow) {
                    throw new AppError('Due date is more than 1 year in the future', 400, 'DUE_DATE_MORE_THAN_1_YEAR_IN_FUTURE');
                }
                if(existingJob.deadline_at && dueDate >= existingJob.deadline_at) {
                    throw new AppError('Due date is greater than the job deadline', 400, 'DUE_DATE_GREATER_THAN_JOB_DEADLINE');
                }
                if(existingJob.created_at && dueDate <= existingJob.created_at) {
                    throw new AppError('Due date is less than the job creation date', 400, 'DUE_DATE_LESS_THAN_JOB_CREATION_DATE');
                }
            }
            const existingJobMilestone = await this.prisma.job_milestones.findFirst({
                where: { job_id: jobMilestone.job_id, order_index: jobMilestone.order_index },
            });
            if (existingJobMilestone) {
                throw new AppError('Job milestone already exists', 400, 'JOB_MILESTONE_ALREADY_EXISTS');
            }
            const newJobMilestone = await this.prisma.job_milestones.create({
                data: jobMilestone,
            });
            return newJobMilestone;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating job milestone', { error });
            throw new AppError('Error creating job milestone', 500, 'DB_JOB_MILESTONE_CREATION_FAILED');
        }
    }

    public async updateJobMilestone(id: string, jobMilestone: Prisma.job_milestonesUncheckedUpdateInput): Promise<job_milestones> {
        try {
            if(!id) {
                throw new AppError('Job milestone ID is required', 400, 'JOB_MILESTONE_ID_REQUIRED');
            }
            const existingJobMilestone = await this.prisma.job_milestones.findUnique({
                where: { id },
            });
            if (!existingJobMilestone) {
                throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
            }
            const jobIdForValidation = (jobMilestone.job_id as string) || existingJobMilestone.job_id;
            const existingJob = await jobService.getJobById(jobIdForValidation);
            if (!existingJob) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }   

            const freelancerIdForValidation = (jobMilestone.freelancer_id as string) || existingJobMilestone.freelancer_id;
            const existingFreelancer = await userService.getUserById(freelancerIdForValidation);
            if (!existingFreelancer) {
                throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
            }
            if(existingFreelancer.role !== 'freelancer') {
                throw new AppError('Freelancer is not a freelancer', 400, 'FREELANCER_IS_NOT_A_FREELANCER');
            }

            if(jobMilestone.due_at) {
                const dueDate = jobMilestone.due_at instanceof Date ? jobMilestone.due_at : new Date(jobMilestone.due_at as string);
                const now = new Date();
                const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                
                if(isNaN(dueDate.getTime())) {
                    throw new AppError('Invalid due date format', 400, 'INVALID_DUE_DATE_FORMAT');
                }
                
                if(dueDate < now) {
                    throw new AppError('Due date is in the past', 400, 'DUE_DATE_IN_PAST');
                }
                if(dueDate > oneYearFromNow) {
                    throw new AppError('Due date is more than 1 year in the future', 400, 'DUE_DATE_MORE_THAN_1_YEAR_IN_FUTURE');
                }
            }
            const updatedJobMilestone = await this.prisma.job_milestones.update({
                where: { id },
                data: {
                    ...jobMilestone,
                    updated_at: new Date(),
                },
            });
            return updatedJobMilestone;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error updating job milestone', { error });
            throw new AppError('Error updating job milestone', 500, 'DB_JOB_MILESTONE_UPDATE_FAILED');
        }
    }

    //  make this admin only
    public async deleteJobMilestone(id: string): Promise<void> {
        try {
            if(!id) {
                throw new AppError('Job milestone ID is required', 400, 'JOB_MILESTONE_ID_REQUIRED');
            }
            const existingJobMilestone = await this.prisma.job_milestones.findUnique({
                where: { id },
            });
            if (!existingJobMilestone) {
                throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
            }
            await this.prisma.job_milestones.delete({
                where: { id },
            });
            return;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error deleting job milestone', { error });
            throw new AppError('Error deleting job milestone', 500, 'DB_JOB_MILESTONE_DELETION_FAILED');
        }
    }

    public async getJobMilestoneById(id: string): Promise<job_milestones> {
        try {
            if(!id) {
                throw new AppError('Job milestone ID is required', 400, 'JOB_MILESTONE_ID_REQUIRED');
            }
            const existingJobMilestone = await this.prisma.job_milestones.findUnique({
                where: { id },
            });
            if (!existingJobMilestone) {
                throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
            }
            return existingJobMilestone;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting job milestone by id', { error });
            throw new AppError('Error getting job milestone by id', 500, 'DB_JOB_MILESTONE_GET_BY_ID_FAILED');
        }
    }

    public async getJobMilestonesByJobId(job_id: string): Promise<job_milestones[]> {
        try {
            if(!job_id) {
                throw new AppError('Job ID is required', 400, 'JOB_ID_REQUIRED');
            }
            const existingJob = await jobService.getJobById(job_id);
            if (!existingJob) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            const existingJobMilestones = await this.prisma.job_milestones.findMany({
                where: { job_id },
            });
            return existingJobMilestones;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting job milestones by job id', { error });
            throw new AppError('Error getting job milestones by job id', 500, 'DB_JOB_MILESTONES_GET_BY_JOB_ID_FAILED');
        }
    }

    public async getJobMilestones(): Promise<job_milestones[]> {
        try {
            const existingJobMilestones = await this.prisma.job_milestones.findMany();
            return existingJobMilestones;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting job milestones', { error });
            throw new AppError('Error getting job milestones', 500, 'DB_JOB_MILESTONES_GET_FAILED');
        }
    }
}
export const jobMilestoneService = new JobMilestoneService();