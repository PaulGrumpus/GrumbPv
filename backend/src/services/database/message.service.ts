import { logger } from "../../utils/logger.js";
import { AppError } from "../../middlewares/errorHandler.js";
import { PrismaClient, messages, msg_type } from "@prisma/client";
import { newMessageParam } from "../../types/message.js";

export class MessageService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async createMessage(message: newMessageParam): Promise<messages> {
        try {
            const newMessage = await this.prisma.messages.create({
                data: {
                    sender_id: message.user_id,
                    conversation_id: message.conversation_id,
                    body_text: message.body_text as string,
                    kind: message.kind as msg_type,
                    attachment_id: message.attachment_id,
                    reply_to_msg_id: message.reply_to_msg_id,
                },
            });
            return newMessage;
        }
        catch (error) {
            logger.error('Error creating message', { error });
            throw new AppError('Error creating message', 500, 'MESSAGE_CREATE_FAILED');
        }
    }

    public async getMessageById(id: string): Promise<messages> {
        try {
            const message = await this.prisma.messages.findUnique({
                where: { id },
            });
            if (!message) {
                throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
            }
            return message;
        }
        catch (error) {
            logger.error('Error getting message by id', { error });
            throw new AppError('Error getting message by id', 500, 'MESSAGE_GET_BY_ID_FAILED');
        }
    }

    public async getMessagesByConversationId(conversationId: string): Promise<messages[]> {
        try {
            const messages = await this.prisma.messages.findMany({
                where: { conversation_id: conversationId },
            });
            return messages;
        }
        catch (error) {
            logger.error('Error getting messages by conversation id', { error });
            throw new AppError('Error getting messages by conversation id', 500, 'MESSAGES_GET_BY_CONVERSATION_ID_FAILED');
        }
    }

    public async updateMessage(id: string, message: messages): Promise<messages> {
        try {
            const updatedMessage = await this.prisma.messages.update({
                where: { id },
                data: message,
            });
            return updatedMessage;
        }
        catch (error) {
            logger.error('Error updating message', { error });
            throw new AppError('Error updating message', 500, 'MESSAGE_UPDATE_FAILED');
        }
    }

    public async deleteMessage(id: string): Promise<void> {
        try {
            await this.prisma.messages.delete({
                where: { id },
            });
        }
        catch (error) {
            logger.error('Error deleting message', { error });
            throw new AppError('Error deleting message', 500, 'MESSAGE_DELETE_FAILED');
        }
    }
}

export const messageService = new MessageService();