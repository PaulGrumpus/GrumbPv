#!/usr/bin/env node

/**
 * Buyer cancels escrow (before vendor delivers)
 * Usage: npm run cancel
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

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
  
  console.log('\nSending transaction...');
  const tx = await escrow.cancel();
  console.log('Transaction hash:', tx.hash);
  
  const receipt = await tx.wait();
  
  console.log('\n✅ Escrow cancelled successfully!');
  console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
  
  const buyerBalAfter = await provider.getBalance(wallet.address);
  const refunded = buyerBalAfter - buyerBalBefore + receipt.gasUsed * receipt.gasPrice;
  console.log('Refunded (excluding gas):', ethers.formatEther(refunded), 'BNB');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

