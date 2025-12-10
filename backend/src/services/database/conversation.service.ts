import { logger } from "../../utils/logger.js";
import { AppError } from "../../middlewares/errorHandler.js";
import { PrismaClient, conversation_participants, conversations, users } from "@prisma/client";
import { newConversationParam, convo_type } from "../../types/conversation.js";

export class ConversationService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async createConversation(conversation: newConversationParam): Promise<conversations> {
        try {
            const newConversation = await this.prisma.conversations.create({
                data: {
                    type: conversation.type as convo_type,
                    job_id: conversation.job_id ?? undefined,
                    created_at: conversation.created_at,
                    escrow: conversation.escrow,
                    gigsId: conversation.gigs_id ?? undefined,
                },
            });
            return newConversation;
        }
        catch (error) {
            logger.error('Error creating conversation', { error });
            throw new AppError('Error creating conversation', 500, 'CONVERSATION_CREATE_FAILED');
        }
    }

    public async getConversationById(id: string): Promise<
    { conversation: conversations, participants: conversation_participants[], clientInfo: users, freelancerInfo: users | null }> {
        try {
            const conversation = await this.prisma.conversations.findUnique({
                where: { id },
            });
            if (!conversation) {
                throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
            }
            const jobInfo = await this.prisma.jobs.findUnique({
                where: { id: conversation.job_id ?? "" },
            });
            if (!jobInfo) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            const participants = await this.prisma.conversation_participants.findMany({
                where: { conversation_id: id },
            });
            const clientInfo = await this.prisma.users.findUnique({
                where: { id: jobInfo.client_id },
            });
            if (!clientInfo) {
                throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
            }
            const freelancerInfo = await this.prisma.users.findUnique({
                where: { id: participants.find((participant) => participant.user_id !== jobInfo.client_id)?.user_id ?? "" },
            });
            if (!freelancerInfo) {
                throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
            }
            return { conversation, participants, clientInfo, freelancerInfo };
        }
        catch (error) {
            logger.error('Error getting conversation by id', { error });
            throw new AppError('Error getting conversation by id', 500, 'CONVERSATION_GET_BY_ID_FAILED');
        }
    }

    public async updateConversationById(id: string, conversation: conversations): Promise<conversations> {
        try {
            const updatedConversation = await this.prisma.conversations.update({
                where: { id },
                data: conversation,
            });
            return updatedConversation;
        }
        catch (error) {
            logger.error('Error updating conversation by id', { error });
            throw new AppError('Error updating conversation by id', 500, 'CONVERSATION_UPDATE_BY_ID_FAILED');
        }
    }

    public async getConversationsByUserId(userId: string): Promise<{ conversation: conversations, participants: conversation_participants[], clientInfo: users, freelancerInfo: users | null }[]> {
        try {
            const conversations = await this.prisma.conversations.findMany({
                where: { participants: { some: { user_id: userId } } },
            });
            const participants = await this.prisma.conversation_participants.findMany({
                where: { conversation_id: { in: conversations.map((conversation) => conversation.id) } },
            });
            const conversationsData = await Promise.all(conversations.map(async (conversation) => {
                const jobInfo = await this.prisma.jobs.findUnique({
                    where: { id: conversation.job_id ?? "" },
                });
                if (!jobInfo) {
                    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
                }
                const clientInfo = await this.prisma.users.findUnique({
                    where: { id: jobInfo.client_id },
                });
                if (!clientInfo) {
                    throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
                }
                const freelancerInfo = await this.prisma.users.findUnique({
                    where: { id: participants.find((participant) => participant.conversation_id === conversation.id && participant.user_id !== jobInfo.client_id)?.user_id ?? "" },
                });
                if (!freelancerInfo) {
                    throw new AppError('Freelancer not found', 404, 'FREELANCER_NOT_FOUND');
                }
                return { conversation, clientInfo, freelancerInfo };
            }));
            return conversationsData.map((conversationData) => ({
                conversation: conversationData.conversation,
                participants: participants.filter((participant) => participant.conversation_id === conversationData.conversation.id),
                clientInfo: conversationData.clientInfo,
                freelancerInfo: conversationData.freelancerInfo,
            }));
        }
        catch (error) {
            logger.error('Error getting conversations by user id', { error });
            throw new AppError('Error getting conversations by user id', 500, 'CONVERSATIONS_GET_BY_USER_ID_FAILED');
        }
    }

    public async deleteConversation(id: string): Promise<void> {
        try {
            await this.prisma.conversations.delete({
                where: { id },
            });
        }
        catch (error) {
            logger.error('Error deleting conversation', { error });
            throw new AppError('Error deleting conversation', 500, 'CONVERSATION_DELETE_FAILED');
        }
    }


}

export const conversationService = new ConversationService();