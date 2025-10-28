import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES, DEFAULT_CONFIG } from '../config/contracts.js';
import { web3Provider } from '../utils/web3Provider.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';

export interface CreateEscrowParams {
  jobId: string;
  buyer: string;
  seller: string;
  arbiter: string;
  amount: string;
  deadline: number;
  buyerFeeBps?: number;
  vendorFeeBps?: number;
  disputeFeeBps?: number;
  rewardRateBps?: number;
}

export class FactoryService {
  /**
   * Get factory contract instance
   */
  private getFactoryContract(signer?: ethers.Wallet): ethers.Contract {
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
  async createEscrow(params: CreateEscrowParams, privateKey: string): Promise<{
    escrowAddress: string;
    transactionHash: string;
  }> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const factory = this.getFactoryContract(wallet);

      const jobIdBytes = ethers.id(params.jobId);
      const feeBps = (params.buyerFeeBps || DEFAULT_CONFIG.buyerFeeBps) + 
                     (params.vendorFeeBps || DEFAULT_CONFIG.vendorFeeBps);

      logger.info(`Creating escrow for job ${params.jobId}`);

      const tx = await factory.createEscrow(
        jobIdBytes,
        params.buyer,
        params.seller,
        params.arbiter,
        DEFAULT_CONFIG.feeRecipient,
        feeBps,
        ethers.ZeroAddress, // Native BNB
        ethers.parseEther(params.amount),
        params.deadline,
        params.buyerFeeBps || DEFAULT_CONFIG.buyerFeeBps,
        params.vendorFeeBps || DEFAULT_CONFIG.vendorFeeBps,
        params.disputeFeeBps || DEFAULT_CONFIG.disputeFeeBps,
        params.rewardRateBps || DEFAULT_CONFIG.rewardRateBps,
        { gasLimit: 2000000 }
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
    privateKey: string,
    salt: string
  ): Promise<{
    escrowAddress: string;
    transactionHash: string;
  }> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const factory = this.getFactoryContract(wallet);

      const jobIdBytes = ethers.id(params.jobId);
      const feeBps = (params.buyerFeeBps || DEFAULT_CONFIG.buyerFeeBps) + 
                     (params.vendorFeeBps || DEFAULT_CONFIG.vendorFeeBps);
      const saltBytes = ethers.id(salt);

      logger.info(`Creating deterministic escrow for job ${params.jobId} with salt ${salt}`);

      const tx = await factory.createEscrowDeterministic(
        jobIdBytes,
        params.buyer,
        params.seller,
        params.arbiter,
        DEFAULT_CONFIG.feeRecipient,
        feeBps,
        ethers.ZeroAddress,
        ethers.parseEther(params.amount),
        params.deadline,
        params.buyerFeeBps || DEFAULT_CONFIG.buyerFeeBps,
        params.vendorFeeBps || DEFAULT_CONFIG.vendorFeeBps,
        params.disputeFeeBps || DEFAULT_CONFIG.disputeFeeBps,
        params.rewardRateBps || DEFAULT_CONFIG.rewardRateBps,
        saltBytes,
        { gasLimit: 2000000 }
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
}

export const factoryService = new FactoryService();

