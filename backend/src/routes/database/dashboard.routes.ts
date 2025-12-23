import { Router } from 'express';
import { dashboardController } from '../../controllers/database/dashbord.controller.js';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';

const router = Router();

router.post(
  '/by-user-id/:user_id',
  [param('user_id').isString().notEmpty(), body('role').isString().notEmpty()],
  validate([param('user_id'), body('role')]),
  dashboardController.getDashboardInfoByUserId.bind(dashboardController)
);

export default router;
