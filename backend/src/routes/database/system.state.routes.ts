import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { systemStateController } from '../../controllers/database/system.state.controller.js';

const router = Router();

router.post('/increase-fund', 
    [body('amount').isNumeric().notEmpty()],
    validate([body('amount')]),
    systemStateController.increaseFund.bind(systemStateController));

router.post('/increase-withdraw', 
    [body('amount').isNumeric().notEmpty()],
    validate([body('amount')]),
    systemStateController.increaseWithdraw.bind(systemStateController));

export default router;