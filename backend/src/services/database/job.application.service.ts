import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, job_applications_docs, jobs, users as User } from '@prisma/client';
import { jobService } from './job.service.js';
import { jobMilestoneService } from './job.milestone.service.js';
import { userService, } from './user.service.js';

export class JobApplicationService {
    private prisma: PrismaClient;

    public constructor() {
        this.prisma = new PrismaClient();
    }

    public async createJobApplication(jobApplication: Prisma.job_applications_docsUncheckedCreateInput): Promise<job_applications_docs> {
        try {
            const existingJobApplications = await this.prisma.job_applications_docs.findMany({
                where: { job_id: jobApplication.job_id, freelancer_id: jobApplication.freelancer_id, client_id: jobApplication.client_id },
            });
            if (!existingJobApplications.every((application) => application.job_milestone_id !== null)) {
                throw new AppError('Job application already Accepted', 400, 'JOB_APPLICATION_ALREADY_ACCEPTED');
            }
            const createResult = await this.prisma.job_applications_docs.create({
                data: jobApplication,
            });
            return createResult;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating job application', { error });
            throw new AppError('Error creating job application', 500, 'DB_JOB_APPLICATION_CREATION_FAILED');
        }
    }

    public async updateJobApplication(id: string, jobApplication: Prisma.job_applications_docsUncheckedUpdateInput): Promise<job_applications_docs> {
        try {
            if (!id) {
                throw new AppError('Job application ID is required', 400, 'JOB_APPLICATION_ID_REQUIRED');
            }
            const existingJobApplication = await this.prisma.job_applications_docs.findUnique({
                where: { id },
            });
            if (!existingJobApplication) {
                throw new AppError('Job application not found', 404, 'JOB_APPLICATION_NOT_FOUND');
            }
            const updateResult = await this.prisma.job_applications_docs.update({
                where: { id },
                data: jobApplication,
            });
            return updateResult;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error updating job application', { error });
            throw new AppError('Error updating job application', 500, 'DB_JOB_APPLICATION_UPDATE_FAILED');
        }
    }

    public async getJobApplicationById(id: string): Promise<{
        job_info: jobs;
        client_info: User;
        freelancer_info: User;
        job_application_info: job_applications_docs;
    }> {
        try {
            if (!id) {
                throw new AppError('Job application ID is required', 400, 'JOB_APPLICATION_ID_REQUIRED');
            }
            const existingJobApplication = await this.prisma.job_applications_docs.findUnique({
                where: { id },
            });
            if (!existingJobApplication) {
                throw new AppError('Job application not found', 404, 'JOB_APPLICATION_NOT_FOUND');
            }
            const jobInfo = await jobService.getJobById(existingJobApplication.job_id);
            if (!jobInfo) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            const clientInfo = await userService.getUserById(existingJobApplication.client_id);
            if (!clientInfo) {
                throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
            }
            const freelancerInfo = await userService.getUserById(existingJobApplication.freelancer_id);
            if (!freelancerInfo) {
                throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
            }
            return {
                job_application_info: existingJobApplication,
                job_info: jobInfo,
                client_info: clientInfo,
                freelancer_info: freelancerInfo,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting job application by id', { error });
            throw new AppError('Error getting job application by id', 500, 'DB_JOB_APPLICATION_GET_BY_ID_FAILED');
        }
    }

    public async getJobApplicationByJobMilestoneId(jobMilestoneId: string): Promise<{
        job_application_info: job_applications_docs;
        job_info: jobs;
        client_info: User;
        freelancer_info: User;
    }> {
        try {
            if (!jobMilestoneId) {
                throw new AppError('Job milestone ID is required', 400, 'JOB_MILESTONE_ID_REQUIRED');
            }
            const existingJobMilestone = await jobMilestoneService.getJobMilestoneById(jobMilestoneId);
            if (!existingJobMilestone) {
                throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
            }
            const existingJobApplication = await this.prisma.job_applications_docs.findFirst({
                where: { job_milestone_id: jobMilestoneId },
            });
            if (!existingJobApplication) {
                throw new AppError('Job application not found for this job milestone', 404, 'JOB_APPLICATION_NOT_FOUND_FOR_THIS_JOB_MILESTONE');
            }
            const jobInfo = await jobService.getJobById(existingJobApplication.job_id);
            if (!jobInfo) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            const clientInfo = await userService.getUserById(existingJobApplication.client_id);
            if (!clientInfo) {
                throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
            }
            const freelancerInfo = await userService.getUserById(existingJobApplication.freelancer_id);
            if (!freelancerInfo) {
                throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
            }
            return {
                job_application_info: existingJobApplication,
                job_info: jobInfo,
                client_info: clientInfo,
                freelancer_info: freelancerInfo,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting job application by job milestone id', { error });
            throw new AppError('Error getting job application by job milestone id', 500, 'DB_JOB_APPLICATION_GET_BY_JOB_MILESTONE_ID_FAILED');
        }
    }

    public async deleteJobApplication(id: string): Promise<void> {
        try {
            if (!id) {
                throw new AppError('Job application ID is required', 400, 'JOB_APPLICATION_ID_REQUIRED');
            }
            const existingJobApplication = await this.prisma.job_applications_docs.findUnique({
                where: { id },
            });
            if (!existingJobApplication) {
                throw new AppError('Job application not found', 404, 'JOB_APPLICATION_NOT_FOUND');
            }
            await this.prisma.job_applications_docs.delete({
                where: { id },
            });
            return;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error deleting job application', { error });
            throw new AppError('Error deleting job application', 500, 'DB_JOB_APPLICATION_DELETE_FAILED');
        }
    }

    public async deleteJobApplicationsByJobId(jobId: string): Promise<void> {
        try {
            if (!jobId) {
                throw new AppError('Job ID is required', 400, 'JOB_ID_REQUIRED');
            }
            const existingJob = await jobService.getJobById(jobId);
            if (!existingJob) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            await this.prisma.job_applications_docs.deleteMany({
                where: { job_id: jobId },
            });
            return;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error deleting job applications by job id', { error });
            throw new AppError('Error deleting job applications by job id', 500, 'DB_JOB_APPLICATIONS_DELETE_BY_JOB_ID_FAILED');
        }
    }
}

export const jobApplicationService = new JobApplicationService();