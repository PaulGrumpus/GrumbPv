import { Router } from 'express';
import { notificationController } from '../../controllers/database/notification.controller.js';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';

const router = Router();

router.post('/by-user-id/:user_id', 
    [
        param('user_id').isString().notEmpty(),
        body('read').isBoolean().optional(),
    ],
    validate([param('user_id'), body('read')]),
    notificationController.getNotificationsByUserIdWithFilters.bind(notificationController)
);

router.post('/:id', 
    [
        param('id').isString().notEmpty(),
        body('read_at').isDate().notEmpty(),
    ],
    validate([param('id'), body('read_at')]),
    notificationController.updateNotification.bind(notificationController)
);

export default router;