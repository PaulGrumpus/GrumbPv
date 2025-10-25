#!/usr/bin/env node

/**
 * Buyer cancels escrow and gets full refund
 * Can cancel:
 * - Within first 20% of period from funding to deadline (early cancellation)
 * - After deadline passes if vendor never delivered
 * Cannot cancel after vendor has delivered (must use dispute system)
 * Usage: npm run cancel
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';
import { decodeError } from '../utils/escrowUtils.js';

async function main() {
  if (!CONFIG.buyerPrivateKey) {
    throw new Error('BUYER_PRIVATE_KEY not set in .env');
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.buyerPrivateKey, provider);
  
  console.log('Cancelling escrow as buyer:', wallet.address);
  
  const escrow = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    wallet
  );
  
  // Check state
  const state = await escrow.getState();
  if (state !== 1n) {
    throw new Error(`Cannot cancel. State must be Funded (1), current: ${state}`);
  }
  
  const buyerBalBefore = await provider.getBalance(wallet.address);
  
  try {
    console.log('\nSending transaction...');
    const tx = await escrow.cancel();
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    
    console.log('\n✅ Escrow cancelled successfully!');
    console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
    
    const buyerBalAfter = await provider.getBalance(wallet.address);
    const refunded = buyerBalAfter - buyerBalBefore + receipt.gasUsed * receipt.gasPrice;
    console.log('Refunded (excluding gas):', ethers.formatEther(refunded), 'BNB');
  } catch (error) {
    // Decode contract error to show user-friendly message
    const errorMsg = decodeError(error, escrow.interface);
    console.error('\n' + errorMsg);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // Error already displayed above
    process.exit(1);
  });

