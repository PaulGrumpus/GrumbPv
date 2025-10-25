#!/usr/bin/env node

/**
 * Vendor withdraws payment
 * Usage: npm run withdraw
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';
import { decodeError } from '../utils/escrowUtils.js';

async function main() {
  if (!CONFIG.vendorPrivateKey) {
    throw new Error('VENDOR_PRIVATE_KEY not set in .env');
  }
  
  // Connect to BSC testnet
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  
  // Create wallet
  const wallet = new ethers.Wallet(CONFIG.vendorPrivateKey, provider);
  
  console.log('Withdrawing as vendor:', wallet.address);
  console.log('Escrow address:', CONFIG.escrowAddress);
  
  // Create contract instance
  const escrow = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    wallet
  );
  
  // Check if releasable
  const releasable = await escrow.isReleasable();
  if (!releasable) {
    const info = await escrow.getAllInfo();
    throw new Error(`Not releasable. Current state: ${info.state} (need state 4)`);
  }
  
  // Get balances before
  const vendorBalBefore = await provider.getBalance(wallet.address);
  console.log('\nVendor balance before:', ethers.formatEther(vendorBalBefore), 'BNB');
  
  const info = await escrow.getAllInfo();
  console.log('Project amount:', ethers.formatEther(info.amount), 'BNB');
  console.log('Expected vendor receives (~99%):', ethers.formatEther(info.amount * 99n / 100n), 'BNB');
  
  try {
    // Send transaction
    console.log('\nSending transaction...');
    const tx = await escrow.withdraw();
    console.log('Transaction hash:', tx.hash);
    
    // Wait for confirmation
    console.log('Waiting for confirmation...');
    const receipt = await tx.wait();
    
    console.log('\n✅ Withdrawal successful!');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
    
    // Get balances after
    const vendorBalAfter = await provider.getBalance(wallet.address);
    const received = vendorBalAfter - vendorBalBefore + receipt.gasUsed * receipt.gasPrice;
    console.log('\n--- Payment Received ---');
    console.log('Vendor balance after:', ethers.formatEther(vendorBalAfter), 'BNB');
    console.log('Net received (excluding gas):', ethers.formatEther(received), 'BNB');
    
    // Check for reward events
    console.log('\n--- Checking for Rewards ---');
    const rewardEvents = receipt.logs.filter(log => {
      try {
        const parsed = escrow.interface.parseLog(log);
        return parsed?.name === 'RewardPaid';
      } catch {
        return false;
      }
    });
    
    if (rewardEvents.length > 0) {
      console.log('✅ GRMPS Rewards paid!');
      rewardEvents.forEach(log => {
        const parsed = escrow.interface.parseLog(log);
        console.log(`  - ${parsed.args.reason}: ${ethers.formatEther(parsed.args.amount)} GRMPS to ${parsed.args.to}`);
      });
    } else {
      console.log('No GRMPS rewards (not configured or insufficient balance)');
    }
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

