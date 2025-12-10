import { Request, Response, NextFunction } from 'express';
import { conversationService } from '../../services/database/conversation.service';
import { newConversationParam } from '../../types/conversation';
import { AppError } from '../../middlewares/errorHandler';

export class ConversationController {
    public async createConversation(params: newConversationParam) {
        try {
            const result = await conversationService.createConversation(params);
            if (!result) {
                throw new AppError('Conversation not created', 400, 'CONVERSATION_NOT_CREATED');
            }
            return result;
        }
        catch (error) {
            throw new AppError('Error creating conversation', 500, 'CONVERSATION_CREATE_FAILED');
        }
    }

    public async getConversationById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await conversationService.getConversationById(id);
            res.json({
                success: true,
                data: result,
                message: 'Conversation retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getConversationsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const result = await conversationService.getConversationsByUserId(userId);
            res.json({
                success: true,
                data: result,
                message: 'Conversation retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async updateConversation(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ...params } = req.body;
            const result = await conversationService.updateConversationById(id, params);
            res.json({
                success: true,
                data: result,
                message: 'Conversation updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async deleteConversation(req: Request, res: Response, next: NextFunction) {  
        try {
            const { id } = req.params;
            const result = await conversationService.deleteConversation(id);
            res.json({
                success: true,
                data: result,
                message: 'Conversation deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}

export const conversationController = new ConversationController();