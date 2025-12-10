import { messageReceiptService } from '../../services/database/message.receipt.service.js';
import { newMessageReceiptParam } from '../../types/message.receipt.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class MessageReceiptController {
    public async createMessageReceipt(params: newMessageReceiptParam) {
        try {
            const result = await messageReceiptService.createMessageReceipt(params);
            if (!result) {
                throw new AppError('Message receipt not created', 400, 'MESSAGE_RECEIPT_NOT_CREATED');
            }
            return result;
        }
        catch (error) {
            throw new AppError('Error creating message receipt', 500, 'MESSAGE_RECEIPT_CREATE_FAILED');
        }
    }

    public async updateMessageReceipt(params: newMessageReceiptParam) {
        try {
            const result = await messageReceiptService.updateMessageReceipt(params.user_id, params.message_id, params.state);
            if (!result) {
                throw new AppError('Message receipt not updated', 400, 'MESSAGE_RECEIPT_NOT_UPDATED');
            }
            return result;
        }
        catch (error) {
            throw new AppError('Error updating message receipt', 500, 'MESSAGE_RECEIPT_UPDATE_FAILED');
        }
    }

    public async getMessageReceiptById(id: string) {
        try {
            const result = await messageReceiptService.getMessageReceiptById(id);
            if (!result) {
                throw new AppError('Message receipt not found', 404, 'MESSAGE_RECEIPT_NOT_FOUND');
            }
            return result;
        }
        catch (error) {
            throw new AppError('Error getting message receipt by id', 500, 'MESSAGE_RECEIPT_GET_BY_ID_FAILED');
        }
    }

    public async getMessageReceiptsByMessageId(messageId: string) {
        try {
            const result = await messageReceiptService.getMessageReceiptsByMessageId(messageId);
            if (!result) {
                throw new AppError('Message receipts not found', 404, 'MESSAGE_RECEIPTS_NOT_FOUND');
            }
            return result;
        }
        catch (error) {
            throw new AppError('Error getting message receipts by message id', 500, 'MESSAGE_RECEIPTS_GET_BY_MESSAGE_ID_FAILED');
        }
    }

    public async getMessageReceiptsByUserId(userId: string) {
        try {
            const result = await messageReceiptService.getMessageReceiptsByUserId(userId);
            if (!result) {
                throw new AppError('Message receipts not found', 404, 'MESSAGE_RECEIPTS_NOT_FOUND');
            }
            return result;
        }
        catch (error) {
            throw new AppError('Error getting message receipts by user id', 500, 'MESSAGE_RECEIPTS_GET_BY_USER_ID_FAILED');
        }
    }

    public async getMessageReceiptsByMessageIdAndUserId(messageId: string, userId: string) {
        try {
            const result = await messageReceiptService.getMessageReceiptsByMessageIdAndUserId(messageId, userId);
            if (!result) {
                throw new AppError('Message receipt not found', 404, 'MESSAGE_RECEIPT_NOT_FOUND');
            }
            return result;
        }
        catch (error) {
            throw new AppError('Error getting message receipt by message id and user id', 500, 'MESSAGE_RECEIPT_GET_BY_MESSAGE_ID_AND_USER_ID_FAILED');
        }
    }
}

export const messageReceiptController = new MessageReceiptController();