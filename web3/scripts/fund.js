#!/usr/bin/env node

/**
 * Buyer funds the escrow
 * Usage: npm run fund
 * Env: FUND_AMOUNT (in BNB, e.g., "1.005")
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  if (!CONFIG.buyerPrivateKey) {
    throw new Error('BUYER_PRIVATE_KEY not set in .env');
  }
  
  // Connect to BSC testnet
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  
  // Create wallet
  const wallet = new ethers.Wallet(CONFIG.buyerPrivateKey, provider);
  
  console.log('Funding escrow as buyer:', wallet.address);
  console.log('Escrow address:', CONFIG.escrowAddress);
  
  // Create contract instance with signer
  const escrow = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    wallet
  );
  
  // Get fund amount from env or default
  const fundAmount = ethers.parseEther(CONFIG.fundAmount);
  
  console.log('Fund amount:', ethers.formatEther(fundAmount), 'BNB');
  
  // Check buyer balance
  const balance = await provider.getBalance(wallet.address);
  console.log('Buyer balance:', ethers.formatEther(balance), 'BNB');
  
  if (balance < fundAmount) {
    throw new Error('Insufficient balance');
  }
  
  // Estimate gas
  const gasEstimate = await escrow.fund.estimateGas({ value: fundAmount });
  console.log('Estimated gas:', gasEstimate.toString());
  
  // Send transaction
  console.log('\nSending transaction...');
  const tx = await escrow.fund({ value: fundAmount });
  console.log('Transaction hash:', tx.hash);
  
  // Wait for confirmation
  console.log('Waiting for confirmation...');
  const receipt = await tx.wait();
  
  console.log('\n✅ Escrow funded successfully!');
  console.log('Block:', receipt.blockNumber);
  console.log('Gas used:', receipt.gasUsed.toString());
  console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
  
  // Get updated info
  const info = await escrow.getAllInfo();
  console.log('\n--- Updated Info ---');
  console.log('Project Amount:', ethers.formatEther(info.amount), 'BNB');
  console.log('Buyer Fee Reserve:', ethers.formatEther(info.buyerFeeReserve), 'BNB');
  console.log('State:', info.state.toString(), '(1 = Funded)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

