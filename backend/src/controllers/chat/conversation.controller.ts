import { Request, Response, NextFunction } from 'express';
import { conversationService } from '../../services/database/conversation.service';

export class ConversationController {
    public async createConversation(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;
            const result = await conversationService.createConversation(params);
            res.json({
                success: true,
                data: result,
                message: 'Conversation created successfully',
            });
        }
        catch (error) {
            next(error);
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