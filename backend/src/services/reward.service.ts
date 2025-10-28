import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '../config/contracts.js';
import { web3Provider } from '../utils/web3Provider.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';

export class RewardService {
  /**
   * Get reward distributor contract instance
   */
  private getRewardContract(signer?: ethers.Wallet): ethers.Contract {
    const provider = web3Provider.getProvider();
    return new ethers.Contract(
      CONTRACT_ADDRESSES.rewardDistributor,
      CONTRACT_ABIS.RewardDistributor,
      signer || provider
    );
  }

  /**
   * Get ERC20 token contract instance
   */
  private getTokenContract(tokenAddress: string, signer?: ethers.Wallet): ethers.Contract {
    const provider = web3Provider.getProvider();
    return new ethers.Contract(
      tokenAddress,
      CONTRACT_ABIS.ERC20,
      signer || provider
    );
  }

  /**
   * Approve reward distributor to spend tokens
   */
  async approveDistributor(privateKey: string, amount: string): Promise<string> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const token = this.getTokenContract(CONTRACT_ADDRESSES.grmpsToken, wallet);

      logger.info(`Approving reward distributor to spend ${amount} GRMPS tokens`);

      const tx = await token.approve(
        CONTRACT_ADDRESSES.rewardDistributor,
        ethers.parseEther(amount),
        { gasLimit: 100000 }
      );

      await tx.wait();

      logger.info(`Approval successful: ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error approving distributor:', error);
      throw new AppError(`Failed to approve distributor: ${error.message}`, 500);
    }
  }

  /**
   * Get current allowance
   */
  async getCurrentAllowance(): Promise<string> {
    try {
      const contract = this.getRewardContract();
      const allowance = await contract.getCurrentAllowance();
      
      return ethers.formatEther(allowance);
    } catch (error: any) {
      logger.error('Error getting allowance:', error);
      throw new AppError(`Failed to get allowance: ${error.message}`, 500);
    }
  }

  /**
   * Get reward source balance
   */
  async getSourceBalance(): Promise<string> {
    try {
      const contract = this.getRewardContract();
      const balance = await contract.getSourceBalance();
      
      return ethers.formatEther(balance);
    } catch (error: any) {
      logger.error('Error getting source balance:', error);
      throw new AppError(`Failed to get source balance: ${error.message}`, 500);
    }
  }

  /**
   * Authorize factory
   */
  async authorizeFactory(privateKey: string): Promise<string> {
    try {
      const wallet = web3Provider.getWallet(privateKey);
      const contract = this.getRewardContract(wallet);

      logger.info(`Authorizing factory ${CONTRACT_ADDRESSES.factory}`);

      const tx = await contract.setAuthorizedFactory(
        CONTRACT_ADDRESSES.factory,
        true,
        { gasLimit: 200000 }
      );

      await tx.wait();

      logger.info(`Factory authorized: ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error authorizing factory:', error);
      throw new AppError(`Failed to authorize factory: ${error.message}`, 500);
    }
  }

  /**
   * Check if caller is authorized
   */
  async isAuthorized(callerAddress: string): Promise<boolean> {
    try {
      const contract = this.getRewardContract();
      return await contract.isAuthorized(callerAddress);
    } catch (error: any) {
      logger.error('Error checking authorization:', error);
      throw new AppError(`Failed to check authorization: ${error.message}`, 500);
    }
  }

  /**
   * Get reward distributor info
   */
  async getDistributorInfo(): Promise<{
    rewardToken: string;
    rewardSource: string;
    owner: string;
    openMode: boolean;
  }> {
    try {
      const contract = this.getRewardContract();

      const [rewardToken, rewardSource, owner, openMode] = await Promise.all([
        contract.rewardToken(),
        contract.rewardSource(),
        contract.owner(),
        contract.openMode(),
      ]);

      return {
        rewardToken,
        rewardSource,
        owner,
        openMode,
      };
    } catch (error: any) {
      logger.error('Error getting distributor info:', error);
      throw new AppError(`Failed to get distributor info: ${error.message}`, 500);
    }
  }
}

export const rewardService = new RewardService();

