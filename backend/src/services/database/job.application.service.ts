import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import {
  Prisma,
  job_applications_docs,
  jobs,
  users as User,
  notification_entity,
  notification_type,
  job_status,
} from '@prisma/client';
import { jobService } from './job.service.js';
import { jobMilestoneService } from './job.milestone.service.js';
import { userService } from './user.service.js';
import { prisma } from '../../prisma.js';
import { factoryService } from '../contract/factory.service.js';
import { notificationService } from './notification.service.js';

interface UpdateJobApplicationResult extends job_applications_docs {
  escrow_address: string;
}

export class JobApplicationService {
  private prisma = prisma;

  public async createJobApplication(
    jobApplication: Prisma.job_applications_docsUncheckedCreateInput
  ): Promise<job_applications_docs> {
    try {
      const existingJobApplications = await this.prisma.job_applications_docs.findMany({
        where: {
          job_id: jobApplication.job_id,
          freelancer_id: jobApplication.freelancer_id,
          client_id: jobApplication.client_id,
        },
      });
      if (!existingJobApplications.every((application) => application.job_milestone_id !== null)) {
        throw new AppError(
          'Job application already Accepted',
          400,
          'JOB_APPLICATION_ALREADY_ACCEPTED'
        );
      }
      const createResult = await this.prisma.job_applications_docs.create({
        data: jobApplication,
      });
      await notificationService.createNotification({
        user_id: jobApplication.client_id,
        actor_user_id: jobApplication.freelancer_id,
        type: notification_type.REQUIREMENT_DOCS_CONFIRMED,
        entity_type: notification_entity.job_application_doc,
        entity_id: createResult.id,
        title: 'Job Requirement Docs created',
        body: 'Your job requirement docs have been created',
        payload: Prisma.JsonNull,
        read_at: null,
        created_at: new Date(),
      });
      await notificationService.createNotification({
        user_id: jobApplication.freelancer_id,
        actor_user_id: jobApplication.client_id,
        type: notification_type.REQUIREMENT_DOCS_CREATED,
        entity_type: notification_entity.job_application_doc,
        entity_id: createResult.id,
        title: 'Job Requirement Docs created',
        body: 'Your job requirement docs have been created',
        payload: Prisma.JsonNull,
        read_at: null,
        created_at: new Date(),
      });
      return createResult;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error creating job application', { error });
      throw new AppError(
        'Error creating job application',
        500,
        'DB_JOB_APPLICATION_CREATION_FAILED'
      );
    }
  }

  public async updateJobApplication(
    id: string,
    userId: string,
    jobApplication: Prisma.job_applications_docsUncheckedUpdateInput
  ): Promise<UpdateJobApplicationResult> {
    try {
      if (!id) {
        throw new AppError('Job application ID is required', 400, 'JOB_APPLICATION_ID_REQUIRED');
      }
      if (!userId) {
        throw new AppError('User ID is required', 400, 'USER_ID_REQUIRED');
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
      let escrow;
      let milestone;
      if (updateResult.freelancer_confirm && updateResult.client_confirm) {
        const jobInfo = await jobService.getJobById(updateResult.job_id);
        if (!jobInfo) {
          throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
        }
        const jobMilestones = await jobMilestoneService.getJobMilestonesByJobId(
          updateResult.job_id
        );
        const lastOrderIndex =
          jobMilestones.length > 0 ? jobMilestones[jobMilestones.length - 1].order_index : 0;
        milestone = await jobMilestoneService.createJobMilestone({
          job_id: updateResult.job_id,
          title: `Agreement - ${jobInfo.title}`,
          amount:
            updateResult.budget ??
            (Number(jobInfo.budget_min_usd) + Number(jobInfo.budget_max_usd)) / 2,
          due_at: new Date(updateResult.end_date ?? new Date(jobInfo.deadline_at ?? new Date())),
          freelancer_id: updateResult.freelancer_id,
          token_symbol: updateResult.token_symbol ?? jobInfo.token_symbol ?? 'BNB',
          order_index: lastOrderIndex + 1,
        });
        if (!milestone) {
          throw new AppError('Failed to create milestone', 500, 'FAILED_TO_CREATE_MILESTONE');
        }
        await this.prisma.job_applications_docs.update({
          where: { id },
          data: { job_milestone_id: milestone.id },
        });
        if (milestone.token_symbol !== 'BNB') {
          throw new AppError('Only BNB is supported for now', 400, 'ONLY_BNB_SUPPORTED');
        }
        if (jobInfo.status === job_status.open) {
          await jobService.updateJobStatusById(updateResult.job_id, job_status.in_progress);
        }
        escrow = await factoryService.createEscrow({
          job_milestone_id: milestone.id,
        });
        if (!escrow) {
          throw new AppError('Failed to create escrow', 500, 'FAILED_TO_CREATE_ESCROW');
        }
      }
      await notificationService.createNotification({
        user_id: updateResult.client_id,
        actor_user_id: userId,
        type: notification_type.REQUIREMENT_DOCS_CONFIRMED,
        entity_type: notification_entity.job_application_doc,
        entity_id: updateResult.id,
        title: 'Job Requirement Docs Confirmed',
        body: `Your job requirement docs have been confirmed ${userId === updateResult.client_id ? 'by the client' : 'by the freelancer'}`,
        payload: Prisma.JsonNull,
        read_at: null,
        created_at: new Date(),
      });
      await notificationService.createNotification({
        user_id: updateResult.freelancer_id,
        actor_user_id: userId,
        type: notification_type.REQUIREMENT_DOCS_CONFIRMED,
        entity_type: notification_entity.job_application_doc,
        entity_id: updateResult.id,
        title: 'Job Requirement Docs Confirmed',
        body: `Your job requirement docs have been confirmed ${userId === updateResult.client_id ? 'by the client' : 'by the freelancer'}`,
        payload: Prisma.JsonNull,
        read_at: null,
        created_at: new Date(),
      });
      return {
        ...(updateResult as job_applications_docs),
        job_milestone_id: milestone?.id ?? null,
        escrow_address: escrow?.escrowAddress ?? '',
      };
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
      throw new AppError(
        'Error getting job application by id',
        500,
        'DB_JOB_APPLICATION_GET_BY_ID_FAILED'
      );
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
        throw new AppError(
          'Job application not found for this job milestone',
          404,
          'JOB_APPLICATION_NOT_FOUND_FOR_THIS_JOB_MILESTONE'
        );
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
      throw new AppError(
        'Error getting job application by job milestone id',
        500,
        'DB_JOB_APPLICATION_GET_BY_JOB_MILESTONE_ID_FAILED'
      );
    }
  }

  public async getJobApplicationsByUserId(user_id: string): Promise<job_applications_docs[]> {
    try {
      const existingJobApplications = await this.prisma.job_applications_docs.findMany({
        where: { freelancer_id: user_id },
      });
      return existingJobApplications;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting job applications by user id', { error });
      throw new AppError(
        'Error getting job applications by user id',
        500,
        'DB_JOB_APPLICATIONS_GET_BY_USER_ID_FAILED'
      );
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
      throw new AppError(
        'Error deleting job applications by job id',
        500,
        'DB_JOB_APPLICATIONS_DELETE_BY_JOB_ID_FAILED'
      );
    }
  }
}

export const jobApplicationService = new JobApplicationService();
