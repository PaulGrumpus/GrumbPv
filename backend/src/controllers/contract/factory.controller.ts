import { Request, Response, NextFunction } from 'express';
import { factoryService } from '../../services/contract/factory.service.js';

export class FactoryController {
  /**
   * Create new escrow
   */
  async createEscrow(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...params } = req.body;

      const result = await factoryService.createEscrow(params);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Escrow created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create deterministic escrow
   */
  async createDeterministicEscrow(req: Request, res: Response, next: NextFunction) {
    try {
      const { salt, ...params } = req.body;

      const result = await factoryService.createDeterministicEscrow(params, salt);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Deterministic escrow created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Predict escrow address
   */
  async predictAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { salt } = req.params;

      const address = await factoryService.predictEscrowAddress(salt);

      res.json({
        success: true,
        data: { predictedAddress: address },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if escrow was created by factory
   */
  async isEscrowCreated(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;

      const isCreated = await factoryService.isEscrowCreated(address);

      res.json({
        success: true,
        data: { isCreated },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get factory owner
   */
  async getOwner(_req: Request, res: Response, next: NextFunction) {
    try {
      const owner = await factoryService.getFactoryOwner();

      res.json({
        success: true,
        data: { owner },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Setup rewards for an escrow
   */
  async setupEscrowRewards(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { rewardTokenAddress, rewardRate } = req.body;

      const result = await factoryService.setupEscrowRewards(
        address,
        rewardTokenAddress,
        rewardRate
      );

      res.json({
        success: true,
        data: result,
        message: 'Rewards configured successfully for escrow',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const factoryController = new FactoryController();
