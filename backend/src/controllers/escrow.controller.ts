import { Request, Response, NextFunction } from 'express';
import { escrowService } from '../services/escrow.service.js';
import { ESCROW_STATES } from '../config/contracts.js';
import { logger } from '../utils/logger.js';

export class EscrowController {
  /**
   * Get escrow information
   */
  async getInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      
      const info = await escrowService.getEscrowInfo(address);
      
      res.json({
        success: true,
        data: {
          ...info,
          state: ESCROW_STATES[info.state as keyof typeof ESCROW_STATES],
          amount: info.amount.toString(),
          buyerFeeReserve: info.buyerFeeReserve.toString(),
          disputeFeeAmount: info.disputeFeeAmount.toString(),
          deadline: Number(info.deadline),
          createdAt: Number(info.createdAt),
          fundedAt: Number(info.fundedAt),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fund escrow
   */
  async fund(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { privateKey, value } = req.body;

      const txHash = await escrowService.fundEscrow(address, privateKey, value);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: 'Escrow funded successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deliver work
   */
  async deliver(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { privateKey, cid, contentHash } = req.body;

      const txHash = await escrowService.deliverWork(address, privateKey, cid, contentHash);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: 'Work delivered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve work
   */
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { privateKey, cid } = req.body;

      const txHash = await escrowService.approveWork(address, privateKey, cid);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: 'Work approved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Withdraw funds
   */
  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { privateKey } = req.body;

      const txHash = await escrowService.withdrawFunds(address, privateKey);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: 'Funds withdrawn successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel escrow
   */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { privateKey } = req.body;

      const txHash = await escrowService.cancelEscrow(address, privateKey);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: 'Escrow cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiate dispute
   */
  async initiateDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { privateKey } = req.body;

      const txHash = await escrowService.initiateDispute(address, privateKey);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: 'Dispute initiated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pay dispute fee
   */
  async payDisputeFee(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { privateKey } = req.body;

      const txHash = await escrowService.payDisputeFee(address, privateKey);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: 'Dispute fee paid successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { privateKey, favorBuyer } = req.body;

      const txHash = await escrowService.resolveDispute(address, privateKey, favorBuyer);

      res.json({
        success: true,
        data: { transactionHash: txHash },
        message: `Dispute resolved in favor of ${favorBuyer ? 'buyer' : 'vendor'}`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const escrowController = new EscrowController();

