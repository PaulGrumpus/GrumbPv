#!/usr/bin/env node

/**
 * Initiate a dispute
 * Usage: npm run dispute-init
 * Use BUYER_PRIVATE_KEY or VENDOR_PRIVATE_KEY env var
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';
import { decodeError } from '../utils/escrowUtils.js';

async function main() {
  // Determine which party is initiating
  const role = process.env.DISPUTE_INITIATOR || 'buyer'; // 'buyer' or 'vendor'
  
  const privateKey = role === 'buyer' ? CONFIG.buyerPrivateKey : CONFIG.vendorPrivateKey;
  
  if (!privateKey) {
    throw new Error(`${role.toUpperCase()}_PRIVATE_KEY not set in .env`);
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`Initiating dispute as ${role}:`, wallet.address);
  console.log('Escrow address:', CONFIG.escrowAddress);
  
  const escrow = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    wallet
  );
  
  // Get dispute fee
  const info = await escrow.getAllInfo();
  const disputeFee = info.disputeFeeAmount;
  
  console.log('\nDispute fee:', ethers.formatEther(disputeFee), 'BNB');
  
  // Vendor must pay, buyer uses reserved fee
  const value = role === 'vendor' ? disputeFee : 0n;
  
  if (value > 0n) {
    const balance = await provider.getBalance(wallet.address);
    console.log('Wallet balance:', ethers.formatEther(balance), 'BNB');
    if (balance < value) {
      throw new Error('Insufficient balance for dispute fee');
    }
  } else {
    console.log('Buyer uses reserved fee (no payment needed)');
  }
  
  try {
    console.log('\nSending transaction...');
    const tx = await escrow.initiateDispute({ value });
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    
    console.log('\n✅ Dispute initiated successfully!');
    console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
    
    // Get updated info
    const updatedInfo = await escrow.getAllInfo();
    const deadline = new Date(Number(updatedInfo.disputeFeeDeadline) * 1000);
    
    console.log('\n--- Dispute Info ---');
    console.log('Initiator:', updatedInfo.disputeInitiator);
    console.log('Counterparty deadline:', deadline.toISOString());
    console.log('Hours remaining:', Math.floor((Number(updatedInfo.disputeFeeDeadline) - Date.now()/1000) / 3600));
    console.log('\n⚠️  Counterparty must pay dispute fee before deadline or initiator wins by default!');
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

