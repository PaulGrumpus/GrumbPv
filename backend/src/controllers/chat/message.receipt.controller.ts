import { Request, Response, NextFunction } from 'express';
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

    public async getMessageReceiptById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await messageReceiptService.getMessageReceiptById(id);
            if (!result) {
                throw new AppError('Message receipt not found', 404, 'MESSAGE_RECEIPT_NOT_FOUND');
            }
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getMessageReceiptsByMessageId(req: Request, res: Response, next: NextFunction) {
        try {
            const { messageId } = req.params;
            const result = await messageReceiptService.getMessageReceiptsByMessageId(messageId);
            if (!result) {
                throw new AppError('Message receipts not found', 404, 'MESSAGE_RECEIPTS_NOT_FOUND');
            }
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getMessageReceiptsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const result = await messageReceiptService.getMessageReceiptsByUserId(userId);
            if (!result) {
                throw new AppError('Message receipts not found', 404, 'MESSAGE_RECEIPTS_NOT_FOUND');    
            }
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getMessageReceiptsByMessageIdAndUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { messageId, userId } = req.params;
            const result = await messageReceiptService.getMessageReceiptsByMessageIdAndUserId(messageId, userId);
            if (!result) {
                throw new AppError('Message receipt not found', 404, 'MESSAGE_RECEIPT_NOT_FOUND');
            }
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getMessageReceiptsByDateRange(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.params;
            const result = await messageReceiptService.getMessageReceiptsByDateRange(new Date(startDate), new Date(endDate));
            if (!result) {
                throw new AppError('Message receipts not found', 404, 'MESSAGE_RECEIPTS_NOT_FOUND');
            }
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getAllMessageReceipts(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await messageReceiptService.getAllMessageReceipts();
            if (!result) {
                throw new AppError('Message receipts not found', 404, 'MESSAGE_RECEIPTS_NOT_FOUND');
            }
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}

export const messageReceiptController = new MessageReceiptController();