import { logger } from "../../utils/logger.js";
import { AppError } from "../../middlewares/errorHandler.js";
import { conversation_participants, conversations, users } from "@prisma/client";
import { newConversationParam, convo_type } from "../../types/conversation.js";
import { prisma } from "../../prisma.js";

export class ConversationService {
    private prisma = prisma;

    public async createConversation(params: newConversationParam): Promise<conversations> {
        try {
            console.log('params', params);
            const newConversation = await this.prisma.conversations.create({
                data: {
                    type: params.type as convo_type,
                    job_id: params.job_id ?? null,
                    created_at: new Date(),
                    escrow: params.escrow,
                    gig_id: params.gig_id ?? null,
                    job_application_doc_id: params.job_application_doc_id ?? null,
                },
            });
            if (!newConversation) {
                throw new AppError('Conversation not created', 400, 'CONVERSATION_NOT_CREATED');
            }
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