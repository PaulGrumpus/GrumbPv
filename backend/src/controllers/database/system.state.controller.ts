import { Request, Response, NextFunction } from 'express';
import { systemStateService } from '../../services/database/systemState.service.js';
import { Decimal } from '@prisma/client/runtime/client.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class SystemStateController {
  async increaseFund(req: Request, res: Response, next: NextFunction) {
    try {
      const amount = req.body.amount;
      if (!amount || typeof amount !== 'number') {
        throw new AppError('Amount is required', 400, 'AMOUNT_REQUIRED');
      }
      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400, 'AMOUNT_MUST_BE_GREATER_THAN_0');
      }
      const systemState = await systemStateService.increaseFund(new Decimal(amount));
      res.json({
        success: true,
        data: systemState,
        message: 'Fund increased successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async increaseWithdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const amount = req.body.amount;
      if (!amount || typeof amount !== 'number') {
        throw new AppError('Amount is required', 400, 'AMOUNT_REQUIRED');
      }
      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400, 'AMOUNT_MUST_BE_GREATER_THAN_0');
      }
      const systemState = await systemStateService.increaseWithdraw(new Decimal(amount));
      res.json({
        success: true,
        data: systemState,
        message: 'Withdraw increased successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const systemStateController = new SystemStateController();