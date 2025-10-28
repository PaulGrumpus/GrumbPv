import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES, DEFAULT_CONFIG } from '../config/contracts.js';
import { web3Provider } from '../utils/web3Provider.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import { checkWalletBalance, validateDeadline, validateFeeBps, validateAddress } from '../utils/validation.js';

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

      // Validate addresses
      validateAddress(params.buyer, 'buyer');
      validateAddress(params.seller, 'seller');
      validateAddress(params.arbiter, 'arbiter');
      validateAddress(DEFAULT_CONFIG.feeRecipient, 'feeRecipient');

      // Validate deadline
      validateDeadline(params.deadline);

      // Validate fees
      const buyerFeeBps = params.buyerFeeBps || DEFAULT_CONFIG.buyerFeeBps;
      const vendorFeeBps = params.vendorFeeBps || DEFAULT_CONFIG.vendorFeeBps;
      const feeBps = buyerFeeBps + vendorFeeBps;
      validateFeeBps(buyerFeeBps, vendorFeeBps, feeBps);

      const wallet = web3Provider.getWallet(privateKey);
      
      // Check wallet has enough BNB for gas
      await checkWalletBalance(wallet.address, ethers.parseEther('0.01'));

      const factory = this.getFactoryContract(wallet);

      const jobIdBytes = ethers.id(params.jobId);

      logger.info(`Creating escrow for job ${params.jobId}`);

      // Log all parameters for debugging
      logger.info('Factory.createEscrow params:', {
        jobIdBytes,
        buyer: params.buyer,
        seller: params.seller,
        arbiter: params.arbiter,
        feeRecipient: DEFAULT_CONFIG.feeRecipient,
        feeBps,
        paymentToken: ethers.ZeroAddress,
        amountWei: ethers.parseEther(params.amount).toString(),
        deadline: params.deadline,
        buyerFeeBps: buyerFeeBps,
        vendorFeeBps: vendorFeeBps,
        disputeFeeBps: params.disputeFeeBps || DEFAULT_CONFIG.disputeFeeBps,
        rewardRateBps: params.rewardRateBps || DEFAULT_CONFIG.rewardRateBps,
        walletAddress: wallet.address,
        walletBalance: ethers.formatEther(await web3Provider.getBalance(wallet.address)) + ' BNB',
      });

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
        buyerFeeBps,
        vendorFeeBps,
        params.disputeFeeBps || DEFAULT_CONFIG.disputeFeeBps,
        params.rewardRateBps || DEFAULT_CONFIG.rewardRateBps,
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

