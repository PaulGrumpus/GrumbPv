import { logger } from "../../utils/logger.js";
import { AppError } from "../../middlewares/errorHandler.js";
import { PrismaClient, conversation_participants } from "@prisma/client";
import { newConversationParticipantParam } from "../../types/conversation.participant.js";

export class ConversationParticipantService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async createConversationParticipant(conversationParticipant: newConversationParticipantParam): Promise<conversation_participants> {
        try {
            const newConversationParticipant = await this.prisma.conversation_participants.create({
                data: {
                    conversation_id: conversationParticipant.conversation_id,
                    user_id: conversationParticipant.user_id,
                    is_muted: conversationParticipant.is_muted,
                    is_pinned: conversationParticipant.is_pinned,
                    blocked_until: conversationParticipant.blocked_until ?? undefined,
                    last_read_msg_id: conversationParticipant.last_read_msg_id ?? undefined,
                },
            });
            return newConversationParticipant;
        }
        catch (error) {
            logger.error('Error creating conversation participant', { error });
            throw new AppError('Error creating conversation participant', 500, 'CONVERSATION_PARTICIPANT_CREATE_FAILED');
        }
    }

    public async getConversationParticipantById(id: string): Promise<conversation_participants> {
        try {
            const conversationParticipant = await this.prisma.conversation_participants.findUnique({
                where: { id },
            });
            if (!conversationParticipant) {
                throw new AppError('Conversation participant not found', 404, 'CONVERSATION_PARTICIPANT_NOT_FOUND');
            }
            return conversationParticipant;
        }
        catch (error) {
            logger.error('Error getting conversation participant by id', { error });
            throw new AppError('Error getting conversation participant by id', 500, 'CONVERSATION_PARTICIPANT_GET_BY_ID_FAILED');
        }
    }

    public async getConversationParticipantsByConversationId(conversationId: string): Promise<conversation_participants[]> {
        try {
            const conversationParticipants = await this.prisma.conversation_participants.findMany({
                where: { conversation_id: conversationId },
            });
            return conversationParticipants;
        }
        catch (error) {
            logger.error('Error getting conversation participants by conversation id', { error });
            throw new AppError('Error getting conversation participants by conversation id', 500, 'CONVERSATION_PARTICIPANTS_GET_BY_CONVERSATION_ID_FAILED');
        }
    }

    public async getConversationParticipantsByUserId(userId: string): Promise<conversation_participants[]> {
        try {
            const conversationParticipants = await this.prisma.conversation_participants.findMany({
                where: { user_id: userId },
            });
            return conversationParticipants;
        }
        catch (error) {
            logger.error('Error getting conversation participants by user id', { error });
            throw new AppError('Error getting conversation participants by user id', 500, 'CONVERSATION_PARTICIPANTS_GET_BY_USER_ID_FAILED');
        }
    }

    public async getConversationParticipantsByConversationIdAndUserId(conversationId: string, userId: string): Promise<conversation_participants> {
        try {
            const conversationParticipant = await this.prisma.conversation_participants.findUnique({
                where: { conversation_id_user_id: { conversation_id: conversationId, user_id: userId } },
            });
            if (!conversationParticipant) {
                throw new AppError('Conversation participant not found', 404, 'CONVERSATION_PARTICIPANT_NOT_FOUND');
            }
            return conversationParticipant;
        }
        catch (error) {
            logger.error('Error getting conversation participant by conversation id and user id', { error });
            throw new AppError('Error getting conversation participant by conversation id and user id', 500, 'CONVERSATION_PARTICIPANT_GET_BY_CONVERSATION_ID_AND_USER_ID_FAILED');
        }
    }

    public async updateConversationParticipant(id: string, conversationParticipant: conversation_participants): Promise<conversation_participants> {
        try {
            const updatedConversationParticipant = await this.prisma.conversation_participants.update({
                where: { id },
                data: conversationParticipant,
            });
            return updatedConversationParticipant;
        }
        catch (error) {
            logger.error('Error updating conversation participant', { error });
            throw new AppError('Error updating conversation participant', 500, 'CONVERSATION_PARTICIPANT_UPDATE_FAILED');
        }
    }
}

export const conversationParticipantService = new ConversationParticipantService();