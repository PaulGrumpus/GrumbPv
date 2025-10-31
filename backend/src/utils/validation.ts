import { ethers } from 'ethers';
import { web3Provider } from './web3Provider.js';
import { logger } from './logger.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * Check if wallet has enough balance for transaction
 */
export async function checkWalletBalance(
  address: string,
  minBalance: bigint = ethers.parseEther('0.01')
): Promise<void> {
  const balance = await web3Provider.getBalance(address);
  
  logger.info(`Wallet balance check: ${address} = ${ethers.formatEther(balance)} BNB`);
  
  if (balance < minBalance) {
    throw new AppError(
      `Insufficient balance. Wallet ${address} has ${ethers.formatEther(balance)} BNB, needs at least ${ethers.formatEther(minBalance)} BNB for gas`,
      400,
      'INSUFFICIENT_BALANCE'
    );
  }
}

/**
 * Validate deadline is in the future
 */
export function validateDeadline(deadline: number): void {
  const now = Math.floor(Date.now() / 1000);
  
  if (deadline <= now) {
    throw new AppError(
      `Deadline must be in the future. Provided: ${deadline}, Current: ${now}`,
      400,
      'INVALID_DEADLINE'
    );
  }
  
  // Warn if deadline is more than 1 year in the future
  const oneYear = 365 * 24 * 60 * 60;
  if (deadline > now + oneYear) {
    logger.warn(`Deadline is more than 1 year in the future: ${new Date(deadline * 1000).toISOString()}`);
  }
}

/**
 * Validate fee basis points
 */
export function validateFeeBps(
  buyerFeeBps: number,
  vendorFeeBps: number,
  totalFeeBps: number
): void {
  if (buyerFeeBps + vendorFeeBps !== totalFeeBps) {
    throw new AppError(
      `Fee mismatch: buyerFeeBps (${buyerFeeBps}) + vendorFeeBps (${vendorFeeBps}) != totalFeeBps (${totalFeeBps})`,
      400,
      'FEE_MISMATCH'
    );
  }
  
  if (buyerFeeBps > 1000 || vendorFeeBps > 1000) {
    throw new AppError(
      'Individual fees cannot exceed 1000 bps (10%)',
      400,
      'FEE_TOO_HIGH'
    );
  }
}

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string, fieldName: string): void {
  if (!address || address === '') {
    throw new AppError(
      `${fieldName} is required`,
      400,
      'ADDRESS_REQUIRED'
    );
  }
  
  if (!ethers.isAddress(address)) {
    throw new AppError(
      `Invalid ${fieldName} format: ${address}`,
      400,
      'INVALID_ADDRESS'
    );
  }
  
  if (address === ethers.ZeroAddress) {
    throw new AppError(
      `${fieldName} cannot be zero address`,
      400,
      'ZERO_ADDRESS'
    );
  }
}

