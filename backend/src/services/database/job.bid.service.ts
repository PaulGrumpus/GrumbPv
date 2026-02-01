import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, bid_status, job_bids } from '@prisma/client';
import { userService } from './user.service.js';
import { jobService } from './job.service.js';
import { prisma } from '../../prisma.js';
import { notification_entity, notification_type } from '@prisma/client';
import { notificationService } from './notification.service.js';

export class JobBidService {
  private prisma = prisma;

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
      await notificationService.createNotification({
        user_id: existingJob.client_id,
        actor_user_id: newJobBid.freelancer_id,
        type: notification_type.BID_RECEIVED,
        entity_type: notification_entity.bid,
        entity_id: newJobBid.id,
        title: 'New job bid received',
        body: 'You have received a new job bid',
        payload: Prisma.JsonNull,
        read_at: null,
        created_at: new Date(),
      });
      await notificationService.createNotification({
        user_id: newJobBid.freelancer_id,
        type: notification_type.BID_SENT,
        entity_type: notification_entity.bid,
        entity_id: newJobBid.id,
        title: 'Job bid sent',
        body: 'You have sent a job bid',
        payload: Prisma.JsonNull,
        read_at: null,
        created_at: new Date(),
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
      if (existingJobBid.status === bid_status.declined) {
        throw new AppError('Job bid is already declined', 400, 'JOB_BID_IS_ALREADY_DECLINED');
      }
      if (existingJobBid.status === bid_status.withdrawn) {
        throw new AppError('Job bid is already withdrawn', 400, 'JOB_BID_IS_ALREADY_WITHDRAWN');
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
      const updatedJobBid = await this.prisma.job_bids.update({
        where: { id },
        data: {
          ...jobBid,
          updated_at: new Date(),
        },
      });
      await notificationService.createNotification({
        user_id: existingFreelancer.id,
        actor_user_id: existingJob.client_id,
        type:
          updatedJobBid.status === bid_status.accepted
            ? notification_type.BID_ACCEPTED
            : updatedJobBid.status === bid_status.declined
              ? notification_type.BID_DECLIEND
              : notification_type.BID_WITHDRAWN,
        entity_type: notification_entity.bid,
        entity_id: updatedJobBid.id,
        title:
          updatedJobBid.status === bid_status.accepted
            ? 'Job bid accepted'
            : updatedJobBid.status === bid_status.declined
              ? 'Job bid declined'
              : 'Job bid withdrawn',
        body:
          updatedJobBid.status === bid_status.accepted
            ? 'Your job bid has been accepted by the client.'
            : updatedJobBid.status === bid_status.declined
              ? 'Your job bid has been declined by the client.'
              : 'Your job bid has been withdrawn.',
        payload: Prisma.JsonNull,
        read_at: null,
        created_at: new Date(),
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

  public async getJobBidById(id: string) {
    try {
      const existingJobBid =
          prisma.job_bids.findFirst({
            where: { id },
            select: {
              id: true,
              bid_amount: true,
              cover_letter_md: true,
              period: true,
              status: true,
              created_at: true,
              token_symbol: true,

              job: {
                select: {
                  id: true,
                  title: true,
                  location: true,
                  budget_max: true,
                  budget_min: true,
                  deadline_at: true,
                  description_md: true,
                  tags: true,
                  status: true,
                  token_symbol: true,
                  client_id: true,
                },
              },
            },
          })
      return existingJobBid;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting job bid by id', { error });
      throw new AppError('Error getting job bid by id', 500, 'DB_JOB_BID_GET_BY_ID_FAILED');
    }
  }

  public async getJobBidForClientById(id: string) {
    try {
      const existingJobBid =
          prisma.job_bids.findFirst({
            where: { id },
            select: {
              id: true,
              job_id:true,
              bid_amount: true,
              token_symbol: true,
              cover_letter_md: true,
              period: true,
              status: true,
              freelancer: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                  address: true,
                  image_id: true,
                },
              },
            }
          })
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
        orderBy: { created_at: 'desc' },
        include: {
          freelancer: {
            select: {
              id: true,
              display_name: true,
              email: true,
              role: true,
              bio: true,
              address: true,
              chain: true,
              image_id: true,
              country_code: true,
            },
          },
        },
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
      // const existingFreelancer = await userService.getUserById(freelancer_id as string);
      // if (!existingFreelancer) {
      //   throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
      // }
      const existingJobBids = await this.prisma.job_bids.findMany({
        where: { freelancer_id },
        orderBy: { created_at: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description_md: true,
              location: true,
              tags: true,
              budget_min: true,
              budget_max: true,
              deadline_at: true,
            },
          },
        },
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
