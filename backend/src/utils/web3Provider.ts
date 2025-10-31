import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from '../config/contracts.js';
import { logger } from './logger.js';

class Web3Provider {
  private provider: ethers.JsonRpcProvider;
  private static instance: Web3Provider;

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.rpcUrl);
    logger.info(`Web3 Provider initialized: ${BLOCKCHAIN_CONFIG.rpcUrl}`);
  }

  public static getInstance(): Web3Provider {
    if (!Web3Provider.instance) {
      Web3Provider.instance = new Web3Provider();
    }
    return Web3Provider.instance;
  }

  public getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  public getWallet(privateKey: string): ethers.Wallet {
    if (!privateKey || !privateKey.startsWith('0x')) {
      throw new Error('Invalid private key format');
    }
    return new ethers.Wallet(privateKey, this.provider);
  }

  public async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  public async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  public async getBalance(address: string): Promise<bigint> {
    return await this.provider.getBalance(address);
  }
}

export const web3Provider = Web3Provider.getInstance();

