#!/usr/bin/env node

/**
 * Vendor delivers work with IPFS CID
 * Usage: npm run deliver
 * Env: IPFS_CID, CONTENT_HASH
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';
import { decodeError } from '../utils/escrowUtils.js';

async function main() {
  if (!CONFIG.vendorPrivateKey) {
    throw new Error('VENDOR_PRIVATE_KEY not set in .env');
  }
  
  const cid = process.env.IPFS_CID || 'QmExampleCID123';
  const contentHash = process.env.CONTENT_HASH || ethers.ZeroHash;
  
  // Connect to BSC testnet
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  
  // Create wallet
  const wallet = new ethers.Wallet(CONFIG.vendorPrivateKey, provider);
  
  console.log('Delivering work as vendor:', wallet.address);
  console.log('Escrow address:', CONFIG.escrowAddress);
  console.log('IPFS CID:', cid);
  console.log('Content Hash:', contentHash);
  
  // Create contract instance
  const escrow = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    wallet
  );
  
  // Check current state
  const currentState = await escrow.getState();
  console.log('\nCurrent state:', currentState.toString());
  
  if (currentState !== 1n && currentState !== 2n) {
    throw new Error('Invalid state. Must be Funded (1) or Delivered (2)');
  }
  
  try {
    // Send transaction
    console.log('\nSending transaction...');
    const tx = await escrow.deliver(cid, contentHash);
    console.log('Transaction hash:', tx.hash);
    
    // Wait for confirmation
    console.log('Waiting for confirmation...');
    const receipt = await tx.wait();
    
    console.log('\n✅ Work delivered successfully!');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
    
    // Get updated info
    const info = await escrow.getAllInfo();
    console.log('\n--- Updated Info ---');
    console.log('Proposed CID:', info.proposedCID);
    console.log('Vendor Approved:', info.vendorApproved);
    console.log('State:', info.state.toString(), '(2 = Delivered)');
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

