import bcrypt from 'bcryptjs';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { job_status, milestone_status, user_role } from '@prisma/client';
import { generateToken } from '../../utils/jwt.js';
import { prisma } from '../../prisma.js';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface JobFilterParams extends PaginationParams {
  status?: job_status | 'disputed' | 'expired';
}

export class AdminService {
  private prisma = prisma;

  /**
   * Admin login with email and password
   */
  public async adminLogin(email: string, password: string): Promise<string> {
    try {
      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'EMAIL_PASSWORD_REQUIRED');
      }

      const user = await this.prisma.users.findFirst({
        where: { email },
      });

      if (!user) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      if (user.role !== user_role.admin) {
        throw new AppError('Access denied. Admin role required.', 403, 'FORBIDDEN');
      }

      if (!user.password || !bcrypt.compareSync(password, user.password)) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      const token = generateToken(user);
      return token;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error during admin login', { error });
      throw new AppError('Error during admin login', 500, 'ADMIN_LOGIN_FAILED');
    }
  }

  /**
   * Get all users with pagination and search
   */
  public async getAllUsers(params: PaginationParams = {}) {
    try {
      const { page = 1, limit = 20, search } = params;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { display_name: { contains: search, mode: 'insensitive' as const } },
              { address: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        this.prisma.users.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            email: true,
            address: true,
            display_name: true,
            role: true,
            is_verified: true,
            image_id: true,
            country_code: true,
            created_at: true,
            updated_at: true,
            finished_job_num: true,
            total_fund: true,
          },
        }),
        this.prisma.users.count({ where }),
      ]);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting users', { error });
      throw new AppError('Error getting users', 500, 'ADMIN_GET_USERS_FAILED');
    }
  }

  /**
   * Get user details by ID
   */
  public async getUserDetails(userId: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          address: true,
          display_name: true,
          bio: true,
          role: true,
          is_verified: true,
          image_id: true,
          country_code: true,
          chain: true,
          created_at: true,
          updated_at: true,
          finished_job_num: true,
          total_fund: true,
          fund_cycle: true,
          fund_num: true,
          _count: {
            select: {
              jobs: true,
              bids: true,
              milestones: true,
              conversations: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting user details', { error });
      throw new AppError('Error getting user details', 500, 'ADMIN_GET_USER_DETAILS_FAILED');
    }
  }

  /**
   * Get all gigs with pagination and search
   */
  public async getAllGigs(params: PaginationParams = {}) {
    try {
      const { page = 1, limit = 20, search } = params;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description_md: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [gigs, total] = await Promise.all([
        this.prisma.gigs.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.gigs.count({ where }),
      ]);

      // Fetch freelancer info for each gig
      const freelancerIds = [...new Set(gigs.map((g) => g.freelancer_id))];
      const freelancers = await this.prisma.users.findMany({
        where: { id: { in: freelancerIds } },
        select: {
          id: true,
          display_name: true,
          email: true,
          image_id: true,
        },
      });
      const freelancerMap = new Map(freelancers.map((f) => [f.id, f]));

      const gigsWithFreelancer = gigs.map((gig) => ({
        ...gig,
        freelancer: freelancerMap.get(gig.freelancer_id) || null,
      }));

      return {
        data: gigsWithFreelancer,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting gigs', { error });
      throw new AppError('Error getting gigs', 500, 'ADMIN_GET_GIGS_FAILED');
    }
  }

  /**
   * Get gig details by ID
   */
  public async getGigDetails(gigId: string) {
    try {
      const gig = await this.prisma.gigs.findUnique({
        where: { id: gigId },
        include: {
          conversations: {
            select: {
              id: true,
              created_at: true,
              _count: {
                select: { messages: true },
              },
            },
          },
        },
      });

      if (!gig) {
        throw new AppError('Gig not found', 404, 'GIG_NOT_FOUND');
      }

      // Fetch freelancer info separately
      const freelancer = await this.prisma.users.findUnique({
        where: { id: gig.freelancer_id },
        select: {
          id: true,
          display_name: true,
          email: true,
          image_id: true,
          address: true,
          is_verified: true,
        },
      });

      return {
        ...gig,
        freelancer,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting gig details', { error });
      throw new AppError('Error getting gig details', 500, 'ADMIN_GET_GIG_DETAILS_FAILED');
    }
  }

  /**
   * Get all jobs with pagination, search, and status filter
   */
  public async getAllJobs(params: JobFilterParams = {}) {
    try {
      const { page = 1, limit = 20, search, status } = params;
      const skip = (page - 1) * limit;
      const now = new Date();

      // Disputed status is determined by milestone status, not job status
      const disputeStatuses = [
        milestone_status.disputedByClient,
        milestone_status.disputedByFreelancer,
        milestone_status.disputedWithCounterSide,
      ];

      let where: any = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description_md: { contains: search, mode: 'insensitive' as const } },
        ];
      }

      // Handle "disputed" as a special filter
      if (status === 'disputed') {
        where.milestones = {
          some: {
            status: { in: disputeStatuses },
          },
        };
      } else if (status === 'cancelled') {
        // Job is cancelled if job.status is cancelled OR any milestone has status cancelled
        const cancelledCondition = {
          OR: [
            { status: job_status.cancelled },
            { milestones: { some: { status: milestone_status.cancelled } } },
          ],
        };
        if (search && where.OR) {
          where = { AND: [where, cancelledCondition] };
        } else {
          where = cancelledCondition;
        }
      } else if (status === 'expired') {
        where.status = job_status.open;
        where.deadline_at = { lt: now };
      } else if (status) {
        where.status = status;
        if (status === job_status.open) {
          where.OR = [
            { deadline_at: null },
            { deadline_at: { gte: now } },
          ];
        }
      }

      const [jobs, total] = await Promise.all([
        this.prisma.jobs.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            client: {
              select: {
                id: true,
                display_name: true,
                email: true,
                image_id: true,
              },
            },
            _count: {
              select: {
                bids: true,
                milestones: true,
              },
            },
            milestones: {
              select: {
                status: true,
              },
            },
          },
        }),
        this.prisma.jobs.count({ where }),
      ]);

      // Add hasDispute and hasCancelledMilestone flags to each job
      const jobsWithDisputeFlag = jobs.map((job) => ({
        ...job,
        hasDispute: job.milestones.some((m) =>
          (disputeStatuses as milestone_status[]).includes(m.status)
        ),
        hasCancelledMilestone: job.milestones.some((m) => m.status === milestone_status.cancelled),
      }));

      return {
        data: jobsWithDisputeFlag,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting jobs', { error });
      throw new AppError('Error getting jobs', 500, 'ADMIN_GET_JOBS_FAILED');
    }
  }

  /**
   * Get comprehensive job details including bidders, milestones, and dispute info
   */
  public async getJobDetails(jobId: string) {
    try {
      const disputeStatuses = [
        milestone_status.disputedByClient,
        milestone_status.disputedByFreelancer,
        milestone_status.disputedWithCounterSide,
      ];

      const job = await this.prisma.jobs.findUnique({
        where: { id: jobId },
        include: {
          client: {
            select: {
              id: true,
              display_name: true,
              email: true,
              image_id: true,
              address: true,
              is_verified: true,
            },
          },
          bids: {
            include: {
              freelancer: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                  image_id: true,
                  address: true,
                  is_verified: true,
                  finished_job_num: true,
                  total_fund: true,
                },
              },
            },
            orderBy: { created_at: 'desc' },
          },
          milestones: {
            include: {
              freelancer: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                  image_id: true,
                },
              },
            },
            orderBy: { order_index: 'asc' },
          },
          conversations: {
            select: {
              id: true,
              created_at: true,
              escrow: true,
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      display_name: true,
                      email: true,
                      role: true,
                    },
                  },
                },
              },
            },
          },
          jobApplicationsDocs: {
            select: {
              id: true,
              deliverables: true,
              out_of_scope: true,
              budget: true,
              token_symbol: true,
              start_date: true,
              end_date: true,
              client_confirm: true,
              freelancer_confirm: true,
              created_at: true,
            },
          },
        },
      });

      if (!job) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }

      // Check if job has disputed or cancelled milestones
      const disputedMilestones = job.milestones.filter((m) =>
        (disputeStatuses as milestone_status[]).includes(m.status)
      );
      const hasDispute = disputedMilestones.length > 0;
      const hasCancelledMilestone = job.milestones.some((m) => m.status === milestone_status.cancelled);

      // If there's a dispute, get the chat history for the related conversation
      let disputeChatHistory: any[] = [];
      if (hasDispute && job.conversations.length > 0) {
        const conversationIds = job.conversations.map((c) => c.id);
        
        disputeChatHistory = await this.prisma.messages.findMany({
          where: {
            conversation_id: { in: conversationIds },
          },
          include: {
            sender: {
              select: {
                id: true,
                display_name: true,
                email: true,
                role: true,
                image_id: true,
              },
            },
          },
          orderBy: { created_at: 'asc' },
        });
      }

      return {
        ...job,
        hasDispute,
        hasCancelledMilestone,
        disputedMilestones,
        disputeChatHistory,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting job details', { error });
      throw new AppError('Error getting job details', 500, 'ADMIN_GET_JOB_DETAILS_FAILED');
    }
  }

  /**
   * Get all conversations with pagination
   */
  public async getAllConversations(params: PaginationParams = {}) {
    try {
      const { page = 1, limit = 20, search } = params;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              {
                participants: {
                  some: {
                    user: {
                      OR: [
                        { display_name: { contains: search, mode: 'insensitive' as const } },
                        { email: { contains: search, mode: 'insensitive' as const } },
                      ],
                    },
                  },
                },
              },
              { job: { title: { contains: search, mode: 'insensitive' as const } } },
              { gig: { title: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {};

      const [conversations, total] = await Promise.all([
        this.prisma.conversations.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    display_name: true,
                    email: true,
                    image_id: true,
                    role: true,
                  },
                },
              },
            },
            job: {
              select: {
                id: true,
                title: true,
              },
            },
            gig: {
              select: {
                id: true,
                title: true,
              },
            },
            _count: {
              select: { messages: true },
            },
          },
        }),
        this.prisma.conversations.count({ where }),
      ]);

      return {
        data: conversations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting conversations', { error });
      throw new AppError('Error getting conversations', 500, 'ADMIN_GET_CONVERSATIONS_FAILED');
    }
  }

  /**
   * Get conversation details with messages
   */
  public async getConversationDetails(conversationId: string) {
    try {
      const conversation = await this.prisma.conversations.findUnique({
        where: { id: conversationId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                  image_id: true,
                  role: true,
                  address: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              client_id: true,
            },
          },
          gig: {
            select: {
              id: true,
              title: true,
              freelancer_id: true,
            },
          },
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  display_name: true,
                  email: true,
                  image_id: true,
                  role: true,
                },
              },
            },
            orderBy: { created_at: 'asc' },
          },
        },
      });

      if (!conversation) {
        throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
      }

      return conversation;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting conversation details', { error });
      throw new AppError('Error getting conversation details', 500, 'ADMIN_GET_CONVERSATION_DETAILS_FAILED');
    }
  }

  /**
   * Get dashboard statistics
   */
  public async getDashboardStats() {
    try {
      const now = new Date();
      const disputeStatuses = [
        milestone_status.disputedByClient,
        milestone_status.disputedByFreelancer,
        milestone_status.disputedWithCounterSide,
      ];

      const [
        totalUsers,
        totalJobs,
        totalGigs,
        totalConversations,
        jobsByStatus,
        disputedJobsCount,
        cancelledJobsCount,
        openJobsCount,
        expiredJobsCount,
        totalFundClients,
        totalWithdrawFreelancers,
        recentUsers,
        recentJobs,
      ] = await Promise.all([
        this.prisma.users.count(),
        this.prisma.jobs.count(),
        this.prisma.gigs.count(),
        this.prisma.conversations.count(),
        this.prisma.jobs.groupBy({
          by: ['status'],
          _count: true,
        }),
        this.prisma.jobs.count({
          where: {
            milestones: {
              some: {
                status: { in: disputeStatuses },
              },
            },
          },
        }),
        this.prisma.jobs.count({
          where: {
            OR: [
              { status: job_status.cancelled },
              { milestones: { some: { status: milestone_status.cancelled } } },
            ],
          },
        }),
        this.prisma.jobs.count({
          where: {
            status: job_status.open,
            OR: [{ deadline_at: null }, { deadline_at: { gte: now } }],
          },
        }),
        this.prisma.jobs.count({
          where: {
            status: job_status.open,
            deadline_at: { lt: now },
          },
        }),
        (async () => {
          const res = await this.prisma.system_states.findUnique({
            where: { key: 'default' },
          });
          if (res) return res;
          return this.prisma.system_states.create({
            data: { key: 'default', fund: 0, withdraw: 0 },
          });
        })(),
        (async () => {
          const res = await this.prisma.system_states.findUnique({
            where: { key: 'default' },
          });
          if (res) return res;
          return this.prisma.system_states.create({
            data: { key: 'default', fund: 0, withdraw: 0 },
          });
        })(),
        this.prisma.users.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            display_name: true,
            email: true,
            role: true,
            created_at: true,
          },
        }),
        this.prisma.jobs.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            created_at: true,
            deadline_at: true,
            milestones: { select: { status: true } },
          },
        }),
      ]);

      const totalFund = totalFundClients?.fund != null ? Number(totalFundClients.fund) : 0;
      const totalWithdraw = totalWithdrawFreelancers?.withdraw != null ? Number(totalWithdrawFreelancers.withdraw) : 0;

      const jobsByStatusMap = jobsByStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      );
      jobsByStatusMap.cancelled = cancelledJobsCount;

      const recentJobsWithCancelled = recentJobs.map(({ milestones, ...job }) => ({
        ...job,
        isCancelledByMilestone: milestones.some((m) => m.status === milestone_status.cancelled),
      }));

      return {
        counts: {
          users: totalUsers,
          jobs: totalJobs,
          gigs: totalGigs,
          conversations: totalConversations,
          disputedJobs: disputedJobsCount,
          cancelledJobs: cancelledJobsCount,
          openJobs: openJobsCount,
          expiredJobs: expiredJobsCount,
          totalFund,
          totalWithdraw,
        },
        jobsByStatus: jobsByStatusMap,
        recentUsers,
        recentJobs: recentJobsWithCancelled,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error getting dashboard stats', { error });
      throw new AppError('Error getting dashboard stats', 500, 'ADMIN_GET_STATS_FAILED');
    }
  }
}

export const adminService = new AdminService();
