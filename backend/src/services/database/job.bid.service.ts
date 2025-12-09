import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, job_bids } from '@prisma/client';
import { userService } from './user.service.js';
import { jobService } from './job.service.js';

export class JobBidService {
  private prisma: PrismaClient;

  public constructor() {
    this.prisma = new PrismaClient();
  }

  public async createJobBid(jobBid: Prisma.job_bidsUncheckedCreateInput): Promise<job_bids> {
    try {
      if (!jobBid.job_id || !jobBid.freelancer_id) {
        throw new AppError(
          'Job ID and freelancer ID are required',
          400,
          'JOB_ID_FREELANCER_ID_REQUIRED'
        );
      }
      const existingJob = await jobService.getJobById(jobBid.job_id);
      if (!existingJob) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }
      const existingFreelancer = await userService.getUserById(jobBid.freelancer_id);
      if (!existingFreelancer) {
        throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
      }
      if (existingFreelancer.role !== 'freelancer') {
        throw new AppError('Bidder is not a freelancer', 400, 'BIDDER_IS_NOT_A_FREELANCER');
      }
      const existingJobBid = await this.prisma.job_bids.findFirst({
        where: { job_id: jobBid.job_id, freelancer_id: jobBid.freelancer_id },
      });
      if (existingJobBid) {
        throw new AppError('Job bid already exists', 400, 'JOB_BID_ALREADY_EXISTS');
      }
      const newJobBid = await this.prisma.job_bids.create({
        data: jobBid,
      });
      return newJobBid;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error creating job bid', { error });
      throw new AppError('Error creating job bid', 500, 'DB_JOB_BID_CREATION_FAILED');
    }
  }

  public async updateJobBid(
    id: string,
    jobBid: Prisma.job_bidsUncheckedUpdateInput
  ): Promise<job_bids> {
    try {
      if (!id) {
        throw new AppError('Job bid ID is required', 400, 'JOB_BID_ID_REQUIRED');
      }
      const existingJobBid = await this.prisma.job_bids.findUnique({
        where: { id },
      });
      if (!existingJobBid) {
        throw new AppError('Job bid not found', 404, 'JOB_BID_NOT_FOUND');
      }
      if (!jobBid.job_id || !jobBid.freelancer_id) {
        throw new AppError(
          'Job ID and freelancer ID are required',
          400,
          'JOB_ID_FREELANCER_ID_REQUIRED'
        );
      }
      const existingJob = await jobService.getJobById(jobBid.job_id as string);
      if (!existingJob) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }
      const existingFreelancer = await userService.getUserById(jobBid.freelancer_id as string);
      if (!existingFreelancer) {
        throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
      }
      if (existingFreelancer.role !== 'freelancer') {
        throw new AppError('Bidder is not a freelancer', 400, 'BIDDER_IS_NOT_A_FREELANCER');
      }
      console.log("job_application_doc_id", jobBid.job_application_doc_id);
      const updatedJobBid = await this.prisma.job_bids.update({
        where: { id },
        data: {
          ...jobBid,
          updated_at: new Date(),
        },
      });
      return updatedJobBid;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error updating job bid', { error });
      throw new AppError('Error updating job bid', 500, 'DB_JOB_BID_UPDATE_FAILED');
    }
  }

  //  make this admin only
  public async deleteJobBid(id: string): Promise<void> {
    try {
      if (!id) {
        throw new AppError('Job bid ID is required', 400, 'JOB_BID_ID_REQUIRED');
      }
      const existingJobBid = await this.prisma.job_bids.findUnique({
        where: { id },
      });
      if (!existingJobBid) {
        throw new AppError('Job bid not found', 404, 'JOB_BID_NOT_FOUND');
      }
      await this.prisma.job_bids.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error deleting job bid', { error });
      throw new AppError('Error deleting job bid', 500, 'DB_JOB_BID_DELETION_FAILED');
    }
  }

  public async getJobBidById(id: string): Promise<job_bids> {
    try {
      if (!id) {
        throw new AppError('Job bid ID is required', 400, 'JOB_BID_ID_REQUIRED');
      }
      const existingJobBid = await this.prisma.job_bids.findUnique({
        where: { id },
      });
      if (!existingJobBid) {
        throw new AppError('Job bid not found', 404, 'JOB_BID_NOT_FOUND');
      }
      return existingJobBid;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting job bid by id', { error });
      throw new AppError('Error getting job bid by id', 500, 'DB_JOB_BID_GET_BY_ID_FAILED');
    }
  }

  public async getJobBidsByJobId(job_id: string): Promise<job_bids[]> {
    try {
      if (!job_id) {
        throw new AppError('Job ID is required', 400, 'JOB_ID_REQUIRED');
      }
      const existingJob = await jobService.getJobById(job_id);
      if (!existingJob) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }
      const existingJobBids = await this.prisma.job_bids.findMany({
        where: { job_id },
      });
      return existingJobBids;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting job bids by job id', { error });
      throw new AppError(
        'Error getting job bids by job id',
        500,
        'DB_JOB_BIDS_GET_BY_JOB_ID_FAILED'
      );
    }
  }

  public async getJobBidsByFreelancerId(freelancer_id: string): Promise<job_bids[]> {
    try {
      if (!freelancer_id) {
        throw new AppError('Freelancer ID is required', 400, 'FREELANCER_ID_REQUIRED');
      }
      const existingFreelancer = await userService.getUserById(freelancer_id as string);
      if (!existingFreelancer) {
        throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
      }
      const existingJobBids = await this.prisma.job_bids.findMany({
        where: { freelancer_id },
      });
      return existingJobBids;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting job bids by freelancer id', { error });
      throw new AppError(
        'Error getting job bids by freelancer id',
        500,
        'DB_JOB_BIDS_GET_BY_FREELANCER_ID_FAILED'
      );
    }
  }

  public async getJobBids(): Promise<job_bids[]> {
    try {
      const existingJobBids = await this.prisma.job_bids.findMany();
      return existingJobBids;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting job bids', { error });
      throw new AppError('Error getting job bids', 500, 'DB_JOB_BIDS_GET_FAILED');
    }
  }
}

export const jobBidService = new JobBidService();
