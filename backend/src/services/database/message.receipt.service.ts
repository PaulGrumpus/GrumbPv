import { logger } from "../../utils/logger.js";
import { AppError } from "../../middlewares/errorHandler.js";
import { PrismaClient, message_receipts, read_state } from "@prisma/client";
import { newMessageReceiptParam } from "../../types/message.receipt.js";

export class MessageReceiptService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async createMessageReceipt(messageReceipt: newMessageReceiptParam): Promise<message_receipts> {
        try {
            const newMessageReceipt = await this.prisma.message_receipts.create({
                data: {
                    message_id: messageReceipt.message_id,
                    user_id: messageReceipt.user_id,
                    state: messageReceipt.state as read_state,
                },
            });
            return newMessageReceipt;
        }
        catch (error) {
            logger.error('Error creating message receipt', { error });
            throw new AppError('Error creating message receipt', 500, 'MESSAGE_RECEIPT_CREATE_FAILED');
        }
    }

    public async getMessageReceiptById(id: string): Promise<message_receipts> {
        try {
            const messageReceipt = await this.prisma.message_receipts.findUnique({
                where: { id },
            });
            if (!messageReceipt) {
                throw new AppError('Message receipt not found', 404, 'MESSAGE_RECEIPT_NOT_FOUND');
            }
            return messageReceipt;
        }
        catch (error) {
            logger.error('Error getting message receipt by id', { error });
            throw new AppError('Error getting message receipt by id', 500, 'MESSAGE_RECEIPT_GET_BY_ID_FAILED');
        }
    }

    public async getMessageReceiptsByMessageId(messageId: string): Promise<message_receipts[]> {
        try {
            const messageReceipts = await this.prisma.message_receipts.findMany({
                where: { message_id: messageId },
            });
            return messageReceipts;
        }
        catch (error) {
            logger.error('Error getting message receipts by message id', { error });
            throw new AppError('Error getting message receipts by message id', 500, 'MESSAGE_RECEIPTS_GET_BY_MESSAGE_ID_FAILED');
        }
    }

    public async getMessageReceiptsByUserId(userId: string): Promise<message_receipts[]> {
        try {
            const messageReceipts = await this.prisma.message_receipts.findMany({
                where: { user_id: userId },
            });
            return messageReceipts;
        }
        catch (error) {
            logger.error('Error getting message receipts by user id', { error });
            throw new AppError('Error getting message receipts by user id', 500, 'MESSAGE_RECEIPTS_GET_BY_USER_ID_FAILED');
        }
    }

    public async getMessageReceiptsByMessageIdAndUserId(messageId: string, userId: string): Promise<message_receipts> {
        try {
            const messageReceipt = await this.prisma.message_receipts.findUnique({
                where: { message_id_user_id_state: { message_id: messageId, user_id: userId, state: "read" } },
            });
            if (!messageReceipt) {
                throw new AppError('Message receipt not found', 404, 'MESSAGE_RECEIPT_NOT_FOUND');
            }
            return messageReceipt;
        }
        catch (error) {
            logger.error('Error getting message receipt by message id and user id', { error });
            throw new AppError('Error getting message receipt by message id and user id', 500, 'MESSAGE_RECEIPT_GET_BY_MESSAGE_ID_AND_USER_ID_FAILED');
        }
    }

    public async updateMessageReceipt(message_id: string, user_id: string, state: read_state): Promise<message_receipts> {
        try {
            const updatedMessageReceipt = await this.prisma.message_receipts.update({
                where: { message_id_user_id_state: { message_id: message_id, user_id: user_id, state: state } },
                data: {
                    state: state,
                },
            });
            return updatedMessageReceipt;
        }
        catch (error) {
            logger.error('Error updating message receipt', { error });
            throw new AppError('Error updating message receipt', 500, 'MESSAGE_RECEIPT_UPDATE_FAILED');
        }
    }

    public async deleteMessageReceipt(id: string): Promise<void> {
        try {
            await this.prisma.message_receipts.delete({
                where: { id },
            });
        }
        catch (error) {
            logger.error('Error deleting message receipt', { error });
            throw new AppError('Error deleting message receipt', 500, 'MESSAGE_RECEIPT_DELETE_FAILED');
        }
    }
}

export const messageReceiptService = new MessageReceiptService();