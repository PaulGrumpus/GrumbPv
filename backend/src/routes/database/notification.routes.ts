import { Router } from 'express';
import { notificationController } from '../../controllers/database/notification.controller.js';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';

const router = Router();

router.post(
  '/by-user-id/:user_id',
  [param('user_id').isString().notEmpty(), body('read').isBoolean().optional()],
  validate([param('user_id'), body('read')]),
  notificationController.getNotificationsByUserIdWithFilters.bind(notificationController)
);

router.post(
  '/:id',
  [param('id').isString().notEmpty(), body('read_at').isString().notEmpty()],
  validate([param('id'), body('read_at')]),
  notificationController.updateNotification.bind(notificationController)
);

router.post(
  '/mark-all-as-read/:user_id',
  [param('user_id').isString().notEmpty()],
  validate([param('user_id')]),
  notificationController.markAllNotificationsAsRead.bind(notificationController)
);

export default router;
