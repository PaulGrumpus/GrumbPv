#!/usr/bin/env node

/**
 * Arbiter resolves dispute
 * Usage: RESOLUTION=vendor npm run dispute-resolve
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';
import { decodeError } from '../utils/escrowUtils.js';

async function main() {
  if (!CONFIG.arbiterPrivateKey) {
    throw new Error('ARBITER_PRIVATE_KEY not set');
  }
  
  const resolution = process.env.RESOLUTION || 'vendor'; // 'buyer' or 'vendor'
  
  if (resolution !== 'buyer' && resolution !== 'vendor') {
    throw new Error('RESOLUTION must be "buyer" or "vendor"');
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.arbiterPrivateKey, provider);
  
  console.log('Resolving dispute as arbiter:', wallet.address);
  console.log('Resolution:', resolution);
  
  const escrow = new ethers.Contract(CONFIG.escrowAddress, CONFIG.escrowABI, wallet);
  
  const info = await escrow.getAllInfo();
  console.log('\nProject amount:', ethers.formatEther(info.amount), 'BNB');
  console.log('Both parties paid:', info.buyerPaidDisputeFee && info.vendorPaidDisputeFee);
  
  try {
    console.log('\nSending transaction...');
    const tx = resolution === 'vendor' 
      ? await escrow.resolveToVendor()
      : await escrow.resolveToBuyer();
      
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    
    console.log('\n✅ Dispute resolved!');
    console.log('Winner:', resolution);
    console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
    
    // Parse events
    receipt.logs.forEach(log => {
      try {
        const parsed = escrow.interface.parseLog(log);
        if (parsed?.name === 'FeePaid') {
          console.log(`Fee paid: ${ethers.formatEther(parsed.args.amount)} BNB to ${parsed.args.to} (${parsed.args.reason})`);
        }
      } catch {}
    });
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

