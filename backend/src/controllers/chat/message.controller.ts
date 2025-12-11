import { Request, Response, NextFunction } from 'express';
import { messageService } from '../../services/database/message.service.js';
import { msg_type, newMessageParam } from '../../types/message.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class MessageController {
    public async createMessage(params: newMessageParam) {
        try {
            const result = await messageService.createMessage({
                user_id: params.user_id,
                conversation_id: params.conversation_id,
                body_text: params.body_text as string,
                kind: params.kind as msg_type,
            });
            if (!result) {
                throw new AppError('Message not created', 400, 'MESSAGE_NOT_CREATED');
            }
            return result;
        }
        catch (error) {
            throw new AppError('Error creating message', 500, 'MESSAGE_CREATE_FAILED');
        }
    }

    public async getMessageById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await messageService.getMessageById(id);
            res.json({
                success: true,
                data: result,
                message: 'Message retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getMessagesByConversationId(req: Request, res: Response, next: NextFunction) {
        try {
            const { conversationId } = req.params;
            const result = await messageService.getMessagesByConversationId(conversationId);
            res.json({
                success: true,
                data: result,
                message: 'Messages retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getMessagesByDateRangeAndConversationIds(req: Request, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.params;
            const { conversationIds } = req.body;
            const result = await messageService.getMessagesByDateRangeAndConversationId(new Date(startDate), new Date(endDate), conversationIds);
            if (!result) {
                throw new AppError('Messages not found', 404, 'MESSAGES_NOT_FOUND');
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

    public async getAllMessagesByConversationIds(req: Request, res: Response, next: NextFunction) {
        try {
            const { conversationIds } = req.body;

            console.log("test-conversationIds", conversationIds);

            const result = await messageService.getAllMessagesByConversationIds(conversationIds);
            if (!result) {
                throw new AppError('Messages not found', 404, 'MESSAGES_NOT_FOUND');
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

    public async updateMessageById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ...params } = req.body;
            const result = await messageService.updateMessage(id, params);
            res.json({
                success: true,
                data: result,
                message: 'Message updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async deleteMessageById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await messageService.deleteMessage(id);
            res.json({
                success: true,
                data: result,
                message: 'Message deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}

export const messageController = new MessageController();