import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '../../config/contracts.js';
import { web3Provider } from '../../utils/web3Provider.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { jobMilestoneService } from '../database/job.milestone.service.js';
import { chainTxsService } from '../database/chainTxs.service.js';
import { jobService } from '../database/job.service.js';
import { EscrowTxData } from '../../types/escrow.js';

export interface EscrowInfo {
  buyer: string;
  vendor: string;
  arbiter: string;
  feeRecipient: string;
  rewardToken: string;
  rewardRatePer1e18: bigint;
  amount: bigint;
  buyerFeeReserve: bigint;
  disputeFeeAmount: bigint;
  buyerFeeBps: bigint;
  vendorFeeBps: bigint;
  disputeFeeBps: bigint;
  rewardRateBps: bigint;
  createdAt: bigint;
  fundedAt: bigint;
  deadline: bigint;
  disputeFeeDeadline: bigint;
  disputeInitiator: string;
  buyerPaidDisputeFee: boolean;
  vendorPaidDisputeFee: boolean;
  cid: string;
  contentHash: string;
  proposedCID: string;
  proposedContentHash: string;
  buyerApproved: boolean;
  vendorApproved: boolean;
  state: number;
}

export class EscrowService {
  /**
   * Get escrow contract instance
   */
  private getEscrowContract(escrowAddress: string, signer?: ethers.Wallet): ethers.Contract {
    if (!escrowAddress || escrowAddress === '') {
      throw new AppError('Escrow address is required', 400, 'ESCROW_ADDRESS_REQUIRED');
    }

    if (!ethers.isAddress(escrowAddress)) {
      throw new AppError('Invalid escrow address format', 400, 'INVALID_ESCROW_ADDRESS');
    }

    const provider = web3Provider.getProvider();
    return new ethers.Contract(escrowAddress, CONTRACT_ABIS.Escrow, signer || provider);
  }

  /**
   * Get all escrow information
   */
  async getEscrowInfo(escrowAddress: string): Promise<EscrowInfo> {
    try {
      const contract = this.getEscrowContract(escrowAddress);
      const info = await contract.getAllInfo();

      logger.info(`Fetched escrow info for ${escrowAddress}`);

      return {
        buyer: info.buyer,
        vendor: info.vendor,
        arbiter: info.arbiter,
        feeRecipient: info.feeRecipient,
        rewardToken: info.rewardToken,
        rewardRatePer1e18: info.rewardRatePer1e18,
        amount: info.amount,
        buyerFeeReserve: info.buyerFeeReserve,
        disputeFeeAmount: info.disputeFeeAmount,
        buyerFeeBps: info.buyerFeeBps,
        vendorFeeBps: info.vendorFeeBps,
        disputeFeeBps: info.disputeFeeBps,
        rewardRateBps: info.rewardRateBps,
        createdAt: info.createdAt,
        fundedAt: info.fundedAt,
        deadline: info.deadline,
        disputeFeeDeadline: info.disputeFeeDeadline,
        disputeInitiator: info.disputeInitiator,
        buyerPaidDisputeFee: info.buyerPaidDisputeFee,
        vendorPaidDisputeFee: info.vendorPaidDisputeFee,
        cid: info.cid,
        contentHash: info.contentHash,
        proposedCID: info.proposedCID,
        proposedContentHash: info.proposedContentHash,
        buyerApproved: info.buyerApproved,
        vendorApproved: info.vendorApproved,
        state: info.state,
      };
    } catch (error: any) {
      logger.error('Error fetching escrow info:', error);
      throw new AppError(`Failed to fetch escrow info: ${error.message}`, 500);
    }
  }

  /**
   * Fund escrow (buyer)
   */
  async fundEscrow(job_milestone_id: string, privateKey: string, value: string): Promise<string> {
    try {
      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }

      const existingJob = await jobService.getJobById(exsitingJobMilestone.job_id);
      if (!existingJob) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }

      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Funding escrow ${escrowAddress} with ${value} BNB`);

      const tx = await contract.fund({
        value: ethers.parseEther(value),
        gasLimit: 500000,
      });

      await tx.wait();

      logger.info(`Escrow funded successfully: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(job_milestone_id, {
        status: 'funded',
      });

      await chainTxsService.createChainTx(
        'fund_escrow',
        97,
        wallet.address,
        escrowAddress,
        tx.hash,
        'success',
        existingJob.client_id
      );

      return tx.hash;
    } catch (error: any) {
      logger.error('Error funding escrow:', error);
      throw new AppError(`Failed to fund escrow: ${error.message}`, 500);
    }
  }

  async buildFundEscrowTx(
    job_milestone_id: string,
    userId: string,
    chainId: number
  ): Promise<EscrowTxData> {
    const exsitingJobMilestone =
      await jobMilestoneService.getJobMilestoneById(job_milestone_id);
    if (!exsitingJobMilestone) {
      throw new AppError('Job milestone not found', 404);
    }

    const amount = exsitingJobMilestone.amount.toString();
  
    const escrowAddress = exsitingJobMilestone.escrow;
    if (!escrowAddress) {
      throw new AppError('Escrow not found', 404);
    }
  
    const existingJob =
      await jobService.getJobById(exsitingJobMilestone.job_id);
    if (!existingJob) {
      throw new AppError('Job not found', 404);
    }
  
    // OPTIONAL: enforce who can fund
    if (existingJob.client_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }
  
    const iface = new ethers.Interface(CONTRACT_ABIS.Escrow);
  
    const data = iface.encodeFunctionData('fund', []);
  
    return {
      to: escrowAddress,
      data,
      value: ethers.parseEther(amount).toString(),
      chainId: chainId
    };
  }

  /**
   * Deliver work (vendor)
   */
  async deliverWork(
    job_milestone_id: string,
    privateKey: string,
    cid: string,
    contentHash?: string
  ): Promise<string> {
    try {
      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }

      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      // Convert contentHash to bytes32 format
      // contentHash should already be a 32-byte keccak256 hash from the controller
      let hashBytes: string;
      if (contentHash) {
        try {
          // Validate and convert to bytes32
          const hashBytesArray = ethers.getBytes(contentHash);

          if (hashBytesArray.length !== 32) {
            logger.warn(
              `contentHash is not 32 bytes (${hashBytesArray.length} bytes), padding/truncating`
            );
            if (hashBytesArray.length > 32) {
              // Truncate to first 32 bytes
              hashBytes = ethers.hexlify(hashBytesArray.slice(0, 32));
            } else {
              // Pad to 32 bytes
              hashBytes = ethers.zeroPadValue(ethers.hexlify(hashBytesArray), 32);
            }
          } else {
            // Already 32 bytes, use as-is
            hashBytes = ethers.hexlify(hashBytesArray);
          }
        } catch (error) {
          logger.warn(`Invalid contentHash format, using ZeroHash: ${contentHash}`);
          hashBytes = ethers.ZeroHash;
        }
      } else {
        hashBytes = ethers.ZeroHash;
      }

      logger.info(`Delivering work for escrow ${escrowAddress}, CID: ${cid}`);

      const tx = await contract.deliver(cid, hashBytes, { gasLimit: 500000 });
      await tx.wait();

      logger.info(`Work delivered successfully: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(job_milestone_id, {
        status: 'delivered',
      });

      await chainTxsService.createChainTx(
        'deliver_work',
        97,
        wallet.address,
        escrowAddress,
        tx.hash,
        'success',
        exsitingJobMilestone.freelancer_id
      );

      return tx.hash;
    } catch (error: any) {
      logger.error('Error delivering work:', error);
      throw new AppError(`Failed to deliver work: ${error.message}`, 500);
    }
  }

  async buildDeliverWorkTx(
    job_milestone_id: string,
    userId: string,
    chainId: number,
    cid: string,
    contentHash?: string
  ): Promise<EscrowTxData> {
    const exsitingJobMilestone =
      await jobMilestoneService.getJobMilestoneById(job_milestone_id);
    if (!exsitingJobMilestone) {
      throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
    }

    const escrowAddress = exsitingJobMilestone.escrow;
    if (!escrowAddress) {
      throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
    }

    // OPTIONAL: enforce who can deliver
    if (exsitingJobMilestone.freelancer_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Convert contentHash to bytes32 format
    // contentHash should already be a 32-byte keccak256 hash from the controller
    let hashBytes: string;
    if (contentHash) {
      try {
        // Validate and convert to bytes32
        const hashBytesArray = ethers.getBytes(contentHash);

        if (hashBytesArray.length !== 32) {
          logger.warn(
            `contentHash is not 32 bytes (${hashBytesArray.length} bytes), padding/truncating`
          );
          if (hashBytesArray.length > 32) {
            // Truncate to first 32 bytes
            hashBytes = ethers.hexlify(hashBytesArray.slice(0, 32));
          } else {
            // Pad to 32 bytes
            hashBytes = ethers.zeroPadValue(ethers.hexlify(hashBytesArray), 32);
          }
        } else {
          // Already 32 bytes, use as-is
          hashBytes = ethers.hexlify(hashBytesArray);
        }
      } catch (error) {
        logger.warn(`Invalid contentHash format, using ZeroHash: ${contentHash}`);
        hashBytes = ethers.ZeroHash;
      }
    } else {
      hashBytes = ethers.ZeroHash;
    }

    const iface = new ethers.Interface(CONTRACT_ABIS.Escrow);
    const data = iface.encodeFunctionData('deliver', [cid, hashBytes]);

    return {
      to: escrowAddress,
      data,
      value: '0',
      chainId
    };
  }

  /**
   * Approve work (buyer)
   */
  async approveWork(job_milestone_id: string, privateKey: string, cid: string): Promise<string> {
    try {
      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const existingJob = await jobService.getJobById(exsitingJobMilestone.job_id);
      if (!existingJob) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }

      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Approving work for escrow ${escrowAddress}, CID: ${cid}`);

      const tx = await contract.approve(cid, { gasLimit: 500000 });
      await tx.wait();

      logger.info(`Work approved successfully: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(job_milestone_id, {
        status: 'approved',
      });

      await chainTxsService.createChainTx(
        'approve_work',
        97,
        wallet.address,
        escrowAddress,
        tx.hash,
        'success',
        existingJob.client_id
      );

      return tx.hash;
    } catch (error: any) {
      logger.error('Error approving work:', error);
      throw new AppError(`Failed to approve work: ${error.message}`, 500);
    }
  }

  /**
   * Withdraw funds (vendor)
   */
  async withdrawFunds(job_milestone_id: string, privateKey: string): Promise<string> {
    try {
      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }

      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Withdrawing funds from escrow ${escrowAddress}`);

      const tx = await contract.withdraw({ gasLimit: 1000000 });
      await tx.wait();

      logger.info(`Funds withdrawn successfully: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(job_milestone_id, {
        status: 'released',
      });

      await chainTxsService.createChainTx(
        'withdraw_funds',
        97,
        wallet.address,
        escrowAddress,
        tx.hash,
        'success',
        exsitingJobMilestone.freelancer_id
      );

      return tx.hash;
    } catch (error: any) {
      logger.error('Error withdrawing funds:', error);
      throw new AppError(`Failed to withdraw funds: ${error.message}`, 500);
    }
  }

  /**
   * Initiate dispute
   */
  async initiateDispute(job_milestone_id: string, privateKey: string): Promise<string> {
    try {
      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const existingJob = await jobService.getJobById(exsitingJobMilestone.job_id);
      if (!existingJob) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }

      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      // Get dispute fee amount
      const info = await this.getEscrowInfo(escrowAddress);
      let disputeFee = 0n;
      if (info.buyer === wallet.address) {
        disputeFee = 0n;
      } else {
        disputeFee = info.disputeFeeAmount;
      }

      logger.info(`Initiating dispute for escrow ${escrowAddress}`);

      const tx = await contract.initiateDispute({
        value: disputeFee,
        gasLimit: 500000,
      });
      await tx.wait();

      logger.info(`Dispute initiated successfully: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(job_milestone_id, {
        status: 'disputedWithoutCounterSide',
      });

      await chainTxsService.createChainTx(
        'initiate_dispute',
        97,
        wallet.address,
        escrowAddress,
        tx.hash,
        'success',
        wallet.address === info.buyer ? existingJob.client_id : exsitingJobMilestone.freelancer_id
      );

      return tx.hash;
    } catch (error: any) {
      logger.error('Error initiating dispute:', error);
      throw new AppError(`Failed to initiate dispute: ${error.message}`, 500);
    }
  }

  /**
   * Pay dispute fee (counterparty)
   */
  async venderPayDisputeFee(job_milestone_id: string, privateKey: string): Promise<string> {
    try {
      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }

      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      const info = await this.getEscrowInfo(escrowAddress);
      const disputeFee = info.disputeFeeAmount;

      logger.info(`Paying dispute fee for escrow ${escrowAddress}`);

      const tx = await contract.payDisputeFee({
        value: disputeFee,
        gasLimit: 500000,
      });
      await tx.wait();

      logger.info(`Dispute fee paid successfully: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(job_milestone_id, {
        status: 'disputedWithCounterSide',
      });

      await chainTxsService.createChainTx(
        'pay_dispute_fee',
        97,
        wallet.address,
        escrowAddress,
        tx.hash,
        'success',
        exsitingJobMilestone.freelancer_id
      );

      return tx.hash;
    } catch (error: any) {
      logger.error('Error paying dispute fee:', error);
      throw new AppError(`Failed to pay dispute fee: ${error.message}`, 500);
    }
  }

  /**
   * Buyer join the
   */
  async buyerJoinDispute(job_milestone_id: string, privateKey: string): Promise<string> {
    try {
      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const existingJob = await jobService.getJobById(exsitingJobMilestone.job_id);
      if (!existingJob) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }

      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Buyer join the dispute for escrow ${escrowAddress}`);

      const tx = await contract.payDisputeFee({
        value: 0,
        gasLimit: 500000,
      });
      await tx.wait();

      logger.info(`Dispute fee paid successfully: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(job_milestone_id, {
        status: 'disputedWithCounterSide',
      });

      await chainTxsService.createChainTx(
        'buyer_join_dispute',
        97,
        wallet.address,
        escrowAddress,
        tx.hash,
        'success',
        existingJob.client_id
      );

      return tx.hash;
    } catch (error: any) {
      logger.error('Error paying dispute fee:', error);
      throw new AppError(`Failed to pay dispute fee: ${error.message}`, 500);
    }
  }

  /**
   * Resolve dispute (arbiter)
   */
  async resolveDispute(job_milestone_id: string, favorBuyer: boolean): Promise<string> {
    try {
      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(job_milestone_id);
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      const escrowAddress = exsitingJobMilestone.escrow;
      if (!escrowAddress) {
        throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
      }

      const privateKey = CONTRACT_ADDRESSES.ArbiterPrivateKey;
      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Resolving dispute for escrow ${escrowAddress}, favor buyer: ${favorBuyer}`);

      const tx = favorBuyer
        ? await contract.resolveToBuyer({ gasLimit: 1000000 })
        : await contract.resolveToVendor({ gasLimit: 1000000 });

      await tx.wait();

      logger.info(`Dispute resolved successfully: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(job_milestone_id, {
        status: favorBuyer ? 'resolvedToBuyer' : 'resolvedToVendor',
      });
      return tx.hash;
    } catch (error: any) {
      logger.error('Error resolving dispute:', error);
      throw new AppError(`Failed to resolve dispute: ${error.message}`, 500);
    }
  }
}

export const escrowService = new EscrowService();
