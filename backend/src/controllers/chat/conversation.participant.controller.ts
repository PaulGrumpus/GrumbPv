import { conversationParticipantService } from '../../services/database/conversation.participant.service.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { NextFunction, Request, Response } from 'express';

export class ConversationParticipantController {
    public async createConversationParticipant(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;
            const result = await conversationParticipantService.createConversationParticipant(params);
            if (!result) {
                throw new AppError('Conversation participant not created', 400, 'CONVERSATION_PARTICIPANT_NOT_CREATED');
            }
            res.json({
                success: true,
                data: result,
                message: 'Conversation participant created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getConversationParticipantById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await conversationParticipantService.getConversationParticipantById(id);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getConversationParticipantsByConversationId(req: Request, res: Response, next: NextFunction) {
        try {
            const { conversationId } = req.params;
            const result = await conversationParticipantService.getConversationParticipantsByConversationId(conversationId);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getConversationParticipantsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const result = await conversationParticipantService.getConversationParticipantsByUserId(userId);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async getConversationParticipantsByConversationIdAndUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { conversationId, userId } = req.params;
            const result = await conversationParticipantService.getConversationParticipantsByConversationIdAndUserId(conversationId, userId);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async updateConversationParticipant(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ...params } = req.body;
            const result = await conversationParticipantService.updateConversationParticipant(id, params);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async deleteConversationParticipant(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await conversationParticipantService.deleteConversationParticipant(id);
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

export const conversationParticipantController = new ConversationParticipantController();