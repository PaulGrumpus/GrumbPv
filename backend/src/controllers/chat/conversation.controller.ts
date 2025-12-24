import { Request, Response, NextFunction } from 'express';
import { conversationService } from '../../services/database/conversation.service.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class ConversationController {
  public async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...params } = req.body;
      if (params.job_id === '') {
        params.job_id = null;
      }
      if (params.gig_id === '') {
        params.gig_id = null;
      }
      if (params.job_application_doc_id === '') {
        params.job_application_doc_id = null;
      }

      if (params.client_id === '') {
        throw new AppError('Client ID is required', 400, 'CLIENT_ID_REQUIRED');
      }
      if (params.freelancer_id === '') {
        throw new AppError('Freelancer ID is required', 400, 'FREELANCER_ID_REQUIRED');
      }

      const result = await conversationService.createConversation(params);
      if (!result) {
        throw new AppError('Conversation not created', 400, 'CONVERSATION_NOT_CREATED');
      }
      res.json({
        success: true,
        data: result,
        message: 'Conversation created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async getConversationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await conversationService.getConversationById(id);
      if (!result) {
        throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
      }
      res.json({
        success: true,
        data: result,
        message: 'Conversation retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { ...params } = req.body;
      const result = await conversationService.updateConversationById(id, params);
      if (!result) {
        throw new AppError('Conversation not updated', 400, 'CONVERSATION_NOT_UPDATED');
      }
      res.json({
        success: true,
        data: result,
        message: 'Conversation updated successfully',
      });
    } catch (error) {
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
    } catch (error) {
      next(error);
    }
  }
}

export const conversationController = new ConversationController();
