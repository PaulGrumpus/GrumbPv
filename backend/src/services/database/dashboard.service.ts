import { prisma } from '../../prisma.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';

class DashboardService {
  public async getDashboardData(userId: string, role: 'client' | 'freelancer') {
    try {
      const jobsPromise =
        role === 'client'
          ? prisma.jobs.findMany({
              where: { client_id: userId },
              orderBy: {created_at: 'desc'},
              select: {
                id: true,
                title: true,
                description_md: true,
                status: true,
                created_at: true,
                location: true,
                tags: true,
                image_id: true,
                deadline_at: true,
                budget_min_usd: true,
                budget_max_usd: true,
                token_symbol: true,
                is_remote: true,

                bids: {
                  select: {
                    id: true,
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
                  },
                },

                jobApplicationsDocs: {
                  select: {
                    id: true,
                    budget: true,
                    start_date: true,
                    end_date: true,
                    deliverables: true,
                    out_of_scope: true,
                    token_symbol: true,
                    client_confirm: true,
                    freelancer_confirm: true,
                    job_milestone_id: true,
                    freelancer_id: true,
                  },
                },

                milestones: {
                  select: {
                    id: true,
                    title: true,
                    status: true,
                    amount: true,
                    order_index: true,
                    escrow: true,
                    due_at: true,
                    freelancer_id: true,
                    created_at: true,
                    ipfs: true,
                  },
                },
              },
            })
          : prisma.jobs.findMany({
            where: {
              milestones: {
                some: {
                  freelancer_id: userId
                }
              }
            },
            select: {
              id: true,
              title: true,
              description_md: true,
              status: true,
              created_at: true,
              location: true,
              tags: true,
              image_id: true,
              deadline_at: true,
              budget_min_usd: true,
              budget_max_usd: true,
              token_symbol: true,
              is_remote: true,
          
              client: {
                select: {
                  id: true,
                  display_name: true,
                  image_id: true,
                  email: true
                }
              },
          
              milestones: {
                where: {
                  freelancer_id: userId
                },
                select: {
                  id: true,
                  title: true,
                  status: true,
                  amount: true,
                  escrow: true,
                  due_at: true,
                  order_index: true,
                  created_at:true,
                  ipfs: true,
                }
              },
          
              jobApplicationsDocs: {
                where: {
                  freelancer_id: userId,
                  job_milestone_id: {
                    not: null
                  }
                },
                select: {
                  id: true,
                  budget: true,
                  start_date: true,
                  end_date: true,
                  deliverables: true,
                  out_of_scope: true,
                  token_symbol: true,
                  client_confirm: true,
                  freelancer_confirm: true,
                  job_milestone_id: true,
                  client_id: true
                }
              }
            }
          });

      const bidsPromise =
        role === 'freelancer'
          ? prisma.job_bids.findMany({
              where: { freelancer_id: userId },
              orderBy: {created_at: 'desc'},
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
                    budget_max_usd: true,
                    budget_min_usd: true,
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
          : Promise.resolve([]);

      const gigsPromise =
        role === 'freelancer'
          ? prisma.gigs.findMany({
              where: { freelancer_id: userId },
              orderBy: {created_at: 'desc'}
            })
          : Promise.resolve([]);

      const conversationsPromise = prisma.conversations.findMany({
        where: {
          participants: {
            some: { user_id: userId },
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            orderBy: { created_at: 'asc' },
            take: 100,
            include: {
              receipts: true,
            },
          },
        },
      });

      
      const notificationsPromise = prisma.notifications.findMany({
        where: {
          AND: [
            { user_id: userId },
            { read_at: null }
          ]
        },
        orderBy: { created_at: "desc" },
        take: 50
      });

      const [jobs, bids, gigs, conversations, notifications] = await Promise.all([
        jobsPromise,
        bidsPromise,
        gigsPromise,
        conversationsPromise,
        notificationsPromise,
      ]);

      // Transform conversations to map receipts to messageReceipt for frontend compatibility
      const transformedConversations = conversations.map(conversation => ({
        ...conversation,
        messages: conversation.messages.map(({ receipts, ...message }) => ({
          ...message,
          messageReceipt: receipts || [],
        })),
      }));

      return {
        jobs,
        bids, // ✅ freelancer bid results live here
        gigs,
        conversations: transformedConversations,
        notifications,
      };
    } catch (error) {
      logger.error('Error getting dashboard data', { error });
      throw new AppError('Error getting dashboard data', 500, 'DASHBOARD_GET_DATA_FAILED');
    }
  }
}

export const dashboardService = new DashboardService();
