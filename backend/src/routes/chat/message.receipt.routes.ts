import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { messageReceiptController } from '../../controllers/chat/message.receipt.controller.js';

const messageReceiptRouter = Router();

messageReceiptRouter.get(
  '/by-id/:id',
  [param('id').isString().notEmpty()],
  validate([param('id')]),
  messageReceiptController.getMessageReceiptById.bind(messageReceiptController)
);

messageReceiptRouter.get(
  '/by-message-id/:messageId',
  [param('messageId').isString().notEmpty()],
  validate([param('messageId')]),
  messageReceiptController.getMessageReceiptsByMessageId.bind(messageReceiptController)
);

messageReceiptRouter.get(
  '/by-user-id/:userId',
  [param('userId').isString().notEmpty()],
  validate([param('userId')]),
  messageReceiptController.getMessageReceiptsByUserId.bind(messageReceiptController)
);

messageReceiptRouter.get(
  '/by-message-id-and-user-id/:messageId/:userId',
  [param('messageId').isString().notEmpty(), param('userId').isString().notEmpty()],
  validate([param('messageId'), param('userId')]),
  messageReceiptController.getMessageReceiptsByMessageIdAndUserId.bind(messageReceiptController)
);

messageReceiptRouter.get(
  '/date-range/:startDate/:endDate',
  [param('startDate').isDate().notEmpty(), param('endDate').isDate().notEmpty()],
  validate([param('startDate'), param('endDate')]),
  messageReceiptController.getMessageReceiptsByDateRange.bind(messageReceiptController)
);

messageReceiptRouter.get(
  '/all',
  messageReceiptController.getAllMessageReceipts.bind(messageReceiptController)
);

export default messageReceiptRouter;
