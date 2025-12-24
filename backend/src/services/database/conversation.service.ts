import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import {
  conversations,
  notification_entity,
  notification_type,
  Prisma,
} from '@prisma/client';
import { newConversationParam, convo_type } from '../../types/conversation.js';
import { prisma } from '../../prisma.js';
import { notificationService } from './notification.service.js';

export class ConversationService {
  private prisma = prisma;

  public async createConversation(params: newConversationParam): Promise<conversations> {
    try {
      const existingConversation = await this.prisma.conversations.findFirst({
        where: {
          AND: [
            { participants: { some: { user_id: params.client_id } } },
            { participants: { some: { user_id: params.freelancer_id } } },
          ],
        },
      });

      if (existingConversation) {
        const updatePayload: {
          job_id?: string | null;
          gig_id?: string | null;
          job_application_doc_id?: string | null;
          escrow?: string | null;
        } = {};

        if (params.job_id !== undefined) {
          updatePayload.job_id = params.job_id;
        }

        if (params.gig_id !== undefined) {
          updatePayload.gig_id = params.gig_id;
        }

        if (params.job_application_doc_id !== undefined) {
          updatePayload.job_application_doc_id = params.job_application_doc_id;
        }

        if (params.escrow !== undefined) {
          updatePayload.escrow = params.escrow;
        }

        if (Object.keys(updatePayload).length === 0) {
          return existingConversation;
        }

        const updatedConversation = await this.prisma.conversations.update({
          where: { id: existingConversation.id },
          data: updatePayload,
          include: {
            participants: {
              include: {
                user: true,
              },
            },
            messages: {
              orderBy: { created_at: 'asc' },
              take: 100,
            },
          },
        });

        await notificationService.createNotification({
          user_id: params.freelancer_id,
          actor_user_id: params.client_id,
          type: notification_type.CHAT_UPDATED,
          entity_type: notification_entity.conversation,
          entity_id: updatedConversation.id,
          title: 'Chat updated',
          body: 'You have a chat updated',
        });

        return updatedConversation;
      }

      const newConversation = await this.prisma.conversations.create({
        data: {
          type: params.type as convo_type,
          job_id: params.job_id ?? null,
          created_at: new Date(),
          escrow: params.escrow,
          gig_id: params.gig_id ?? null,
          job_application_doc_id: params.job_application_doc_id ?? null,
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            orderBy: { created_at: 'asc' },
            take: 0,
          },
        },
      });

      if (!newConversation) {
        throw new AppError('Conversation not created', 400, 'CONVERSATION_NOT_CREATED');
      }

      await notificationService.createNotification({
        user_id: params.freelancer_id,
        actor_user_id: params.client_id,
        type: notification_type.CHAT_CREATED,
        entity_type: notification_entity.conversation,
        entity_id: newConversation.id,
        title: 'New conversation started',
        body: 'You have a new conversation started',
        payload: Prisma.JsonNull,
        read_at: null,
        created_at: new Date(),
      });

      return newConversation;
    } catch (error) {
      logger.error('Error creating conversation', { error });
      throw new AppError('Error creating conversation', 500, 'CONVERSATION_CREATE_FAILED');
    }
  }

  public async getConversationById(id: string){
    try {
      const existingConversation = await prisma.conversations.findMany({
        where: {
          id
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
          },
        },
      });

      return existingConversation;
    } catch (error) {
      logger.error('Error getting conversation by id', { error });
      throw new AppError('Error getting conversation by id', 500, 'CONVERSATION_GET_BY_ID_FAILED');
    }
  }

  public async updateConversationById(
    id: string,
    conversation: conversations
  ): Promise<conversations> {
    try {
      const updatedConversation = await this.prisma.conversations.update({
        where: { id },
        data: conversation,
      });
      return updatedConversation;
    } catch (error) {
      logger.error('Error updating conversation by id', { error });
      throw new AppError(
        'Error updating conversation by id',
        500,
        'CONVERSATION_UPDATE_BY_ID_FAILED'
      );
    }
  }

  public async deleteConversation(id: string): Promise<void> {
    try {
      await this.prisma.conversations.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('Error deleting conversation', { error });
      throw new AppError('Error deleting conversation', 500, 'CONVERSATION_DELETE_FAILED');
    }
  }
}

export const conversationService = new ConversationService();
