import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES, DEFAULT_CONFIG } from '../../config/contracts.js';
import { web3Provider } from '../../utils/web3Provider.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import {
  checkWalletBalance,
  validateDeadline,
  validateFeeBps,
  validateAddress,
} from '../../utils/validation.js';
import { jobMilestoneService } from '../database/job.milestone.service.js';
import { jobService } from '../database/job.service.js';
import { userService } from '../database/user.service.js';
import { chainTxsService } from '../database/chainTxs.service.js';

export interface CreateEscrowParams {
  job_milestone_id: string;
}

export class FactoryService {
  /**
   * Get factory contract instance
   */
  private getFactoryContract(signer?: ethers.Wallet): ethers.Contract {
    if (!CONTRACT_ADDRESSES.factory || CONTRACT_ADDRESSES.factory === '') {
      throw new AppError(
        'Factory address not configured. Please set FACTORY_ADDRESS in .env file',
        500,
        'FACTORY_ADDRESS_NOT_SET'
      );
    }

    const provider = web3Provider.getProvider();
    return new ethers.Contract(
      CONTRACT_ADDRESSES.factory,
      CONTRACT_ABIS.EscrowFactory,
      signer || provider
    );
  }

  /**
   * Create a new escrow
   */
  async createEscrow(params: CreateEscrowParams): Promise<{
    escrowAddress: string;
    transactionHash: string;
  }> {
    try {
      // Use DEPLOYER_PRIVATE_KEY from .env
      const privateKey = CONTRACT_ADDRESSES.privateKey;

      if (!privateKey || privateKey === '') {
        throw new AppError(
          'DEPLOYER_PRIVATE_KEY not configured in .env',
          500,
          'DEPLOYER_PRIVATE_KEY_NOT_SET'
        );
      }

      // Validate FEE_RECIPIENT is configured
      if (!DEFAULT_CONFIG.feeRecipient || DEFAULT_CONFIG.feeRecipient === '') {
        throw new AppError(
          'FEE_RECIPIENT_ADDRESS not configured in .env',
          500,
          'FEE_RECIPIENT_NOT_SET'
        );
      }
      if (!DEFAULT_CONFIG.arbiter || DEFAULT_CONFIG.arbiter === '') {
        throw new AppError('ARBITER_ADDRESS not configured in .env', 500, 'ARBITER_NOT_SET');
      }

      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(
        params.job_milestone_id
      );
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      if (exsitingJobMilestone.escrow) {
        throw new AppError('Escrow already exists', 400, 'ESCROW_ALREADY_EXISTS');
      }

      const existingJob = await jobService.getJobById(exsitingJobMilestone.job_id);
      if (!existingJob) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }

      const client = await userService.getUserById(existingJob.client_id);
      if (!client || client.address === null) {
        throw new AppError('Client wallet not found', 404, 'CLIENT_WALLET_NOT_FOUND');
      }

      const freelancer = await userService.getUserById(exsitingJobMilestone.freelancer_id);
      if (!freelancer || freelancer.address === null) {
        throw new AppError('Freelancer wallet not found', 404, 'FREELANCER_WALLET_NOT_FOUND');
      }

      if (!exsitingJobMilestone.due_at) {
        throw new AppError('Deadline not found', 404, 'DEADLINE_NOT_FOUND');
      }

      const deadline =
        exsitingJobMilestone.due_at instanceof Date
          ? exsitingJobMilestone.due_at
          : new Date(exsitingJobMilestone.due_at);

      // Convert deadline to Unix timestamp (seconds)
      const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);

      // Validate addresses
      validateAddress(client.address, 'buyer');
      validateAddress(freelancer.address, 'seller');
      validateAddress(DEFAULT_CONFIG.arbiter, 'arbiter');
      validateAddress(DEFAULT_CONFIG.feeRecipient, 'feeRecipient');

      // Validate deadline
      validateDeadline(deadlineTimestamp);

      // Validate fees
      const buyerFeeBps = DEFAULT_CONFIG.buyerFeeBps;
      const vendorFeeBps = DEFAULT_CONFIG.vendorFeeBps;
      const feeBps = buyerFeeBps + vendorFeeBps;
      validateFeeBps(buyerFeeBps, vendorFeeBps, feeBps);

      const wallet = web3Provider.getWallet(privateKey);

      // Check wallet has enough BNB for gas
      await checkWalletBalance(wallet.address, ethers.parseEther('0.01'));

      const factory = this.getFactoryContract(wallet);

      const jobIdBytes = ethers.id(exsitingJobMilestone.id);

      // Convert amount from Decimal to string
      const amountString = exsitingJobMilestone.amount.toString();

      logger.info(`Creating escrow for job milestone ${exsitingJobMilestone.id}`);

      // Log all parameters for debugging
      logger.info('Factory.createEscrow params:', {
        jobIdBytes,
        buyer: client.address,
        seller: freelancer.address,
        arbiter: DEFAULT_CONFIG.arbiter,
        feeRecipient: DEFAULT_CONFIG.feeRecipient,
        feeBps,
        paymentToken: ethers.ZeroAddress,
        amountWei: ethers.parseEther(amountString).toString(),
        deadline: deadlineTimestamp,
        buyerFeeBps: buyerFeeBps,
        vendorFeeBps: vendorFeeBps,
        disputeFeeBps: DEFAULT_CONFIG.disputeFeeBps,
        rewardRateBps: DEFAULT_CONFIG.rewardRateBps,
        walletAddress: wallet.address,
        walletBalance: ethers.formatEther(await web3Provider.getBalance(wallet.address)) + ' BNB',
      });

      const tx = await factory.createEscrow(
        jobIdBytes,
        client.address, // buyer
        freelancer.address, // seller
        DEFAULT_CONFIG.arbiter,
        DEFAULT_CONFIG.feeRecipient,
        feeBps,
        ethers.ZeroAddress, // Native BNB
        ethers.parseEther(amountString),
        deadlineTimestamp,
        buyerFeeBps,
        vendorFeeBps,
        DEFAULT_CONFIG.disputeFeeBps,
        DEFAULT_CONFIG.rewardRateBps,
        {
          gasLimit: 3000000,
          gasPrice: ethers.parseUnits('10', 'gwei'), // BSC testnet gas price
        }
      );

      const receipt = await tx.wait();

      // Parse EscrowCreated event to get the escrow address
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed?.name === 'EscrowCreated';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('EscrowCreated event not found');
      }

      const parsedEvent = factory.interface.parseLog(event);
      const escrowAddress = parsedEvent?.args.escrow;

      logger.info(`Escrow created at ${escrowAddress}, tx: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(exsitingJobMilestone.id, {
        escrow: escrowAddress,
      });

      await chainTxsService.createChainTx(
        'create_escrow',
        97,
        wallet.address,
        escrowAddress,
        tx.hash,
        'success',
        'system'
      );

      return {
        escrowAddress,
        transactionHash: tx.hash,
      };
    } catch (error: any) {
      logger.error('Error creating escrow:', error);
      throw new AppError(`Failed to create escrow: ${error.message}`, 500);
    }
  }

  /**
   * Create deterministic escrow
   */
  async createDeterministicEscrow(
    params: CreateEscrowParams,
    salt: string
  ): Promise<{
    escrowAddress: string;
    transactionHash: string;
  }> {
    try {
      const privateKey = CONTRACT_ADDRESSES.privateKey;
      const wallet = web3Provider.getWallet(privateKey);
      const factory = this.getFactoryContract(wallet);

      // Fetch job milestone and related data
      const exsitingJobMilestone = await jobMilestoneService.getJobMilestoneById(
        params.job_milestone_id
      );
      if (!exsitingJobMilestone) {
        throw new AppError('Job milestone not found', 404, 'JOB_MILESTONE_NOT_FOUND');
      }

      if (exsitingJobMilestone.escrow) {
        throw new AppError('Escrow already exists', 400, 'ESCROW_ALREADY_EXISTS');
      }

      const existingJob = await jobService.getJobById(exsitingJobMilestone.job_id);
      if (!existingJob) {
        throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
      }

      const client = await userService.getUserById(existingJob.client_id);
      if (!client || client.address === null) {
        throw new AppError('Client wallet not found', 404, 'CLIENT_WALLET_NOT_FOUND');
      }

      const freelancer = await userService.getUserById(exsitingJobMilestone.freelancer_id);
      if (!freelancer || freelancer.address === null) {
        throw new AppError('Freelancer wallet not found', 404, 'FREELANCER_WALLET_NOT_FOUND');
      }

      if (!exsitingJobMilestone.due_at) {
        throw new AppError('Deadline not found', 404, 'DEADLINE_NOT_FOUND');
      }

      const deadline =
        exsitingJobMilestone.due_at instanceof Date
          ? exsitingJobMilestone.due_at
          : new Date(exsitingJobMilestone.due_at);

      // Convert deadline to Unix timestamp (seconds)
      const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);

      const jobIdBytes = ethers.id(exsitingJobMilestone.id);
      const feeBps = DEFAULT_CONFIG.buyerFeeBps + DEFAULT_CONFIG.vendorFeeBps;
      const saltBytes = ethers.id(salt);

      // Convert amount from Decimal to string
      const amountString = exsitingJobMilestone.amount.toString();

      logger.info(
        `Creating deterministic escrow for job milestone ${exsitingJobMilestone.id} with salt ${salt}`
      );

      const tx = await factory.createEscrowDeterministic(
        jobIdBytes,
        client.address, // buyer
        freelancer.address, // seller
        DEFAULT_CONFIG.arbiter,
        DEFAULT_CONFIG.feeRecipient,
        feeBps,
        ethers.ZeroAddress,
        ethers.parseEther(amountString),
        deadlineTimestamp,
        DEFAULT_CONFIG.buyerFeeBps,
        DEFAULT_CONFIG.vendorFeeBps,
        DEFAULT_CONFIG.disputeFeeBps,
        DEFAULT_CONFIG.rewardRateBps,
        saltBytes,
        {
          gasLimit: 3000000,
          gasPrice: ethers.parseUnits('10', 'gwei'),
        }
      );

      const receipt = await tx.wait();

      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed?.name === 'EscrowCreated';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('EscrowCreated event not found');
      }

      const parsedEvent = factory.interface.parseLog(event);
      const escrowAddress = parsedEvent?.args.escrow;

      logger.info(`Deterministic escrow created at ${escrowAddress}, tx: ${tx.hash}`);

      await jobMilestoneService.updateJobMilestone(exsitingJobMilestone.id, {
        escrow: escrowAddress,
      });

      return {
        escrowAddress,
        transactionHash: tx.hash,
      };
    } catch (error: any) {
      logger.error('Error creating deterministic escrow:', error);
      throw new AppError(`Failed to create deterministic escrow: ${error.message}`, 500);
    }
  }

  /**
   * Predict escrow address
   */
  async predictEscrowAddress(salt: string): Promise<string> {
    try {
      const factory = this.getFactoryContract();
      const saltBytes = ethers.id(salt);

      const address = await factory.predictEscrowAddress(saltBytes);

      logger.info(`Predicted escrow address for salt ${salt}: ${address}`);
      return address;
    } catch (error: any) {
      logger.error('Error predicting escrow address:', error);
      throw new AppError(`Failed to predict escrow address: ${error.message}`, 500);
    }
  }

  /**
   * Check if escrow was created by factory
   */
  async isEscrowCreated(escrowAddress: string): Promise<boolean> {
    try {
      const factory = this.getFactoryContract();
      const isCreated = await factory.isEscrowCreated(escrowAddress);

      logger.info(`Escrow ${escrowAddress} created by factory: ${isCreated}`);
      return isCreated;
    } catch (error: any) {
      logger.error('Error checking if escrow created:', error);
      throw new AppError(`Failed to check if escrow created: ${error.message}`, 500);
    }
  }

  /**
   * Get factory owner
   */
  async getFactoryOwner(): Promise<string> {
    try {
      const factory = this.getFactoryContract();
      return await factory.owner();
    } catch (error: any) {
      logger.error('Error getting factory owner:', error);
      throw new AppError(`Failed to get factory owner: ${error.message}`, 500);
    }
  }

  /**
   * Setup rewards for an escrow contract
   * Configures reward token, rate, and distributor using arbiter's key from .env
   */
  async setupEscrowRewards(
    escrowAddress: string,
    rewardTokenAddress: string,
    rewardRate: string
  ): Promise<{
    setTokenTxHash: string;
    setRateTxHash: string;
    setDistributorTxHash?: string;
  }> {
    try {
      // Use ARBITER_PRIVATE_KEY from .env (escrow owner)
      const privateKey = CONTRACT_ADDRESSES.privateKey;
      const distributorAddress = CONTRACT_ADDRESSES.rewardDistributor;

      if (!privateKey || privateKey === '') {
        throw new AppError(
          'DEPLOYER_PRIVATE_KEY (arbiter key) not configured in .env',
          500,
          'ARBITER_KEY_NOT_SET'
        );
      }

      const wallet = web3Provider.getWallet(privateKey);

      // Get escrow contract
      const escrowABI = CONTRACT_ABIS.Escrow;
      const escrow = new ethers.Contract(escrowAddress, escrowABI, wallet);

      logger.info(`Setting up rewards for escrow ${escrowAddress}`);
      logger.info('Reward config:', {
        rewardToken: rewardTokenAddress,
        rewardRate,
        distributor: distributorAddress || 'Not set',
        arbiter: wallet.address,
      });

      // Set reward token
      logger.info('1. Setting reward token...');
      const tx1 = await escrow.setRewardToken(rewardTokenAddress, { gasLimit: 200000 });
      await tx1.wait();
      const setTokenTxHash = tx1.hash;
      logger.info(`✅ Reward token set: ${setTokenTxHash}`);

      // Set reward rate
      logger.info('2. Setting reward rate...');
      const tx2 = await escrow.setRewardRatePer1e18(rewardRate, { gasLimit: 200000 });
      await tx2.wait();
      const setRateTxHash = tx2.hash;
      logger.info(`✅ Reward rate set: ${setRateTxHash}`);

      // Set distributor (if configured in .env)
      let setDistributorTxHash: string | undefined;
      if (
        distributorAddress &&
        distributorAddress !== ethers.ZeroAddress &&
        distributorAddress !== ''
      ) {
        logger.info('3. Setting reward distributor...');
        const tx3 = await escrow.setRewardDistributor(distributorAddress, { gasLimit: 200000 });
        await tx3.wait();
        setDistributorTxHash = tx3.hash;
        logger.info(`✅ Reward distributor set: ${setDistributorTxHash}`);
      } else {
        logger.info('3. Skipping reward distributor (not configured in .env)');
      }

      logger.info('✅ Rewards setup complete');

      return {
        setTokenTxHash,
        setRateTxHash,
        setDistributorTxHash,
      };
    } catch (error: any) {
      logger.error('Error setting up escrow rewards:', error);
      throw new AppError(`Failed to setup escrow rewards: ${error.message}`, 500);
    }
  }
}

export const factoryService = new FactoryService();
