import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '../../config/contracts.js';
import { web3Provider } from '../../utils/web3Provider.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';

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
      throw new AppError(
        'Escrow address is required',
        400,
        'ESCROW_ADDRESS_REQUIRED'
      );
    }
    
    if (!ethers.isAddress(escrowAddress)) {
      throw new AppError(
        'Invalid escrow address format',
        400,
        'INVALID_ESCROW_ADDRESS'
      );
    }
    
    const provider = web3Provider.getProvider();
    return new ethers.Contract(
      escrowAddress,
      CONTRACT_ABIS.Escrow,
      signer || provider
    );
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
  async fundEscrow(escrowAddress: string, privateKey: string, value: string): Promise<string> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Funding escrow ${escrowAddress} with ${value} BNB`);

      const tx = await contract.fund({
        value: ethers.parseEther(value),
        gasLimit: 500000,
      });

      await tx.wait();

      logger.info(`Escrow funded successfully: ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error funding escrow:', error);
      throw new AppError(`Failed to fund escrow: ${error.message}`, 500);
    }
  }

  /**
   * Deliver work (vendor)
   */
  async deliverWork(
    escrowAddress: string,
    privateKey: string,
    cid: string,
    contentHash?: string
  ): Promise<string> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      const hashBytes = contentHash 
        ? ethers.zeroPadValue(contentHash, 32)
        : ethers.ZeroHash;

      logger.info(`Delivering work for escrow ${escrowAddress}, CID: ${cid}`);

      const tx = await contract.deliver(cid, hashBytes, { gasLimit: 500000 });
      await tx.wait();

      logger.info(`Work delivered successfully: ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error delivering work:', error);
      throw new AppError(`Failed to deliver work: ${error.message}`, 500);
    }
  }

  /**
   * Approve work (buyer)
   */
  async approveWork(escrowAddress: string, privateKey: string, cid: string): Promise<string> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Approving work for escrow ${escrowAddress}, CID: ${cid}`);

      const tx = await contract.approve(cid, { gasLimit: 500000 });
      await tx.wait();

      logger.info(`Work approved successfully: ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error approving work:', error);
      throw new AppError(`Failed to approve work: ${error.message}`, 500);
    }
  }

  /**
   * Withdraw funds (vendor)
   */
  async withdrawFunds(escrowAddress: string, privateKey: string): Promise<string> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Withdrawing funds from escrow ${escrowAddress}`);

      const tx = await contract.withdraw({ gasLimit: 1000000 });
      await tx.wait();

      logger.info(`Funds withdrawn successfully: ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error withdrawing funds:', error);
      throw new AppError(`Failed to withdraw funds: ${error.message}`, 500);
    }
  }

  /**
   * Initiate dispute
   */
  async initiateDispute(escrowAddress: string, privateKey: string): Promise<string> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      // Get dispute fee amount
      const info = await this.getEscrowInfo(escrowAddress);
      let disputeFee = 0n;
      if(info.buyer === wallet.address) {
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
      return tx.hash;
    } catch (error: any) {
      logger.error('Error initiating dispute:', error);
      throw new AppError(`Failed to initiate dispute: ${error.message}`, 500);
    }
  }

  /**
   * Pay dispute fee (counterparty)
   */
  async venderPayDisputeFee(escrowAddress: string, privateKey: string): Promise<string> {
    try {
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
      return tx.hash;
    } catch (error: any) {
      logger.error('Error paying dispute fee:', error);
      throw new AppError(`Failed to pay dispute fee: ${error.message}`, 500);
    }
  }

  /**
   * Buyer join the 
   */
  async buyerJoinDispute(escrowAddress: string, privateKey: string): Promise<string> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Buyer join the dispute for escrow ${escrowAddress}`);

      const tx = await contract.payDisputeFee({
        value: 0,
        gasLimit: 500000,
      });
      await tx.wait();

      logger.info(`Dispute fee paid successfully: ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error paying dispute fee:', error);
      throw new AppError(`Failed to pay dispute fee: ${error.message}`, 500);
    }
  }


  /**
   * Resolve dispute (arbiter)
   */
  async resolveDispute(
    escrowAddress: string,
    favorBuyer: boolean
  ): Promise<string> {
    try {
      const privateKey = CONTRACT_ADDRESSES.ArbiterPrivateKey;
      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getEscrowContract(escrowAddress, wallet);

      logger.info(`Resolving dispute for escrow ${escrowAddress}, favor buyer: ${favorBuyer}`);

      const tx = favorBuyer
        ? await contract.resolveToBuyer({ gasLimit: 1000000 })
        : await contract.resolveToVendor({ gasLimit: 1000000 });

      await tx.wait();

      logger.info(`Dispute resolved successfully: ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error resolving dispute:', error);
      throw new AppError(`Failed to resolve dispute: ${error.message}`, 500);
    }
  }
}

export const escrowService = new EscrowService();

