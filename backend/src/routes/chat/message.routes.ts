import { Router } from 'express';
import { param, body } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { messageController } from '../../controllers/chat/message.controller.js';

const messageRouter = Router();

messageRouter.post(
  '/date-range/:startDate/:endDate',
  [
    param('startDate').isDate().notEmpty(),
    param('endDate').isDate().notEmpty(),
    body('conversationIds').isArray().notEmpty(),
  ],
  validate([param('startDate'), param('endDate'), body('conversationIds')]),
  messageController.getMessagesByDateRangeAndConversationIds.bind(messageController)
);

messageRouter.post(
  '/all',
  [body('conversationIds').isArray().notEmpty()],
  validate([body('conversationIds')]),
  messageController.getAllMessagesByConversationIds.bind(messageController)
);

export default messageRouter;
