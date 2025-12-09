import { Request, Response, NextFunction } from 'express';
import { rewardService } from '../../services/contract/reward.service.js';

export class RewardController {
  /**
   * Approve distributor to spend tokens
   */
  async approveDistributor(req: Request, res: Response, next: NextFunction) {
    try {
      const { privateKey, amount } = req.body;

      const txHash = await rewardService.approveDistributor(privateKey, amount);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: 'Distributor approved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current allowance
   */
  async getAllowance(_req: Request, res: Response, next: NextFunction) {
    try {
      const allowance = await rewardService.getCurrentAllowance();

      res.json({
        success: true,
        data: { allowance },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get source balance
   */
  async getSourceBalance(_req: Request, res: Response, next: NextFunction) {
    try {
      const balance = await rewardService.getSourceBalance();

      res.json({
        success: true,
        data: { balance },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authorize factory
   */
  async authorizeFactory(req: Request, res: Response, next: NextFunction) {
    try {
      const { privateKey } = req.body;

      const txHash = await rewardService.authorizeFactory(privateKey);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: 'Factory authorized successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if caller is authorized
   */
  async checkAuthorization(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;

      const isAuthorized = await rewardService.isAuthorized(address);

      res.json({
        success: true,
        data: { isAuthorized },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get distributor info
   */
  async getInfo(_req: Request, res: Response, next: NextFunction) {
    try {
      const info = await rewardService.getDistributorInfo();

      res.json({
        success: true,
        data: info,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const rewardController = new RewardController();
