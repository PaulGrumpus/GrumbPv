import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { escrowService } from '../../services/contract/escrow.service.js';
import { ESCROW_STATES } from '../../config/contracts.js';
import { pinata } from '../../utils/pinata.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { jobMilestoneService } from '../../services/database/job.milestone.service.js';
import { CID } from 'multiformats/cid';

export class EscrowController {
  /**
   * Get escrow information
   */
  async getInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { job_milestone_id } = req.params;

      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }
      const info = await escrowService.getEscrowInfo(escrowAddress);

      res.json({
        success: true,
        data: {
          ...info,
          rewardRatePer1e18: Number(info.rewardRatePer1e18),
          state: ESCROW_STATES[info.state as keyof typeof ESCROW_STATES],
          amount: Number(info.amount),
          buyerFeeReserve: Number(info.buyerFeeReserve),
          disputeFeeAmount: Number(info.disputeFeeAmount),
          buyerFeeBps: Number(info.buyerFeeBps),
          vendorFeeBps: Number(info.vendorFeeBps),
          disputeFeeBps: Number(info.disputeFeeBps),
          rewardRateBps: Number(info.rewardRateBps),
          disputeFeeDeadline: Number(info.disputeFeeDeadline),
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
      const { job_milestone_id } = req.params;
      const { userId, chainId } = req.body;

      const txData = await escrowService.buildFundEscrowTx(job_milestone_id, userId, chainId);

      res.json({
        success: true,
        data: txData,
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
      const { job_milestone_id } = req.params;
      const { privateKey, cid, contentHash } = req.body;

      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }

      const escrowInfo = await escrowService.getEscrowInfo(escrowAddress);
      if (!escrowInfo) {
        throw new AppError('Escrow info not found', 404, 'ESCROW_INFO_NOT_FOUND');
      }

      if (ESCROW_STATES[escrowInfo.state as keyof typeof ESCROW_STATES] !== 'Funded') {
        if (ESCROW_STATES[escrowInfo.state as keyof typeof ESCROW_STATES] === 'Delivered') {
          throw new AppError('Escrow is already delivered', 400, 'ESCROW_ALREADY_DELIVERED');
        } else {
          throw new AppError(
            'Escrow must be funded to deliver work',
            400,
            'ESCROW_MUST_BE_FUNDED_TO_DELIVER_WORK'
          );
        }
      }

      const file = req.file as Express.Multer.File | undefined;

      let finalCid = cid;
      let finalContentHash = contentHash;

      if (file) {
        try {
          const fileObj = new File([file.buffer], file.originalname, {
            type: file.mimetype || 'application/octet-stream',
          });

          const uploadResult = await pinata.upload.public.file(fileObj);

          finalCid = uploadResult.cid;

          // Extract multihash bytes and create a 32-byte content hash using keccak256
          const cidString = CID.parse(finalCid);
          const multihashBytes = Buffer.from(cidString.multihash.bytes);

          // Use keccak256 to create a proper 32-byte hash from the multihash
          finalContentHash = ethers.keccak256(ethers.hexlify(multihashBytes));

          const url = await pinata.gateways.public.convert(finalCid);

        } catch (pinataError) {
          throw new AppError(
            `Failed to upload file to Pinata: ${pinataError instanceof Error ? pinataError.message : 'Unknown error'}`,
            500,
            'PINATA_UPLOAD_ERROR'
          );
        }
      }

      if (!finalCid && !file) {
        throw new AppError('Either a file or CID must be provided', 400, 'MISSING_FILE_OR_CID');
      }

      const txHash = await escrowService.deliverWork(
        job_milestone_id,
        privateKey,
        finalCid,
        finalContentHash
      );

      res.json({
        success: true,
        data: { transactionHash: txHash, cid: finalCid },
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
      const { job_milestone_id } = req.params;
      const { privateKey, cid } = req.body;

      const txHash = await escrowService.approveWork(job_milestone_id, privateKey, cid);

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
      const { job_milestone_id } = req.params;
      const { privateKey } = req.body;

      const txHash = await escrowService.withdrawFunds(job_milestone_id, privateKey);

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
   * Initiate dispute
   */
  async initiateDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const { job_milestone_id } = req.params;
      const { privateKey } = req.body;

      const txHash = await escrowService.initiateDispute(job_milestone_id, privateKey);

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
  async venderPayDisputeFee(req: Request, res: Response, next: NextFunction) {
    try {
      const { job_milestone_id } = req.params;
      const { privateKey } = req.body;

      const txHash = await escrowService.venderPayDisputeFee(job_milestone_id, privateKey);

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
   * Buyer join the dispute
   */
  async buyerJoinDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const { job_milestone_id } = req.params;
      const { privateKey } = req.body;

      const txHash = await escrowService.buyerJoinDispute(job_milestone_id, privateKey);

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
      const { job_milestone_id } = req.params;
      const { favorBuyer } = req.body;

      const txHash = await escrowService.resolveDispute(job_milestone_id, favorBuyer);

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
