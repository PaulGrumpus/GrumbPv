#!/usr/bin/env node

/**
 * Buyer approves vendor's work
 * Usage: npm run approve
 * Env: IPFS_CID (must match what vendor delivered)
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  if (!CONFIG.buyerPrivateKey) {
    throw new Error('BUYER_PRIVATE_KEY not set in .env');
  }
  
  const cid = process.env.IPFS_CID || 'QmExampleCID123';
  
  // Connect to BSC testnet
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  
  // Create wallet
  const wallet = new ethers.Wallet(CONFIG.buyerPrivateKey, provider);
  
  console.log('Approving work as buyer:', wallet.address);
  console.log('Escrow address:', CONFIG.escrowAddress);
  console.log('Approving CID:', cid);
  
  // Create contract instance
  const escrow = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    wallet
  );
  
  // Check current state and proposed CID
  const info = await escrow.getAllInfo();
  console.log('\nProposed CID:', info.proposedCID);
  console.log('Current state:', info.state.toString());
  
  if (info.state !== 2n) {
    throw new Error('Invalid state. Must be Delivered (2)');
  }
  
  if (info.proposedCID !== cid) {
    console.warn('\n⚠️  WARNING: CID mismatch!');
    console.warn('You are approving:', cid);
    console.warn('Vendor proposed:', info.proposedCID);
    throw new Error('CID mismatch. Transaction will revert.');
  }
  
  // Send transaction
  console.log('\nSending transaction...');
  const tx = await escrow.approve(cid);
  console.log('Transaction hash:', tx.hash);
  
  // Wait for confirmation
  console.log('Waiting for confirmation...');
  const receipt = await tx.wait();
  
  console.log('\n✅ Work approved successfully!');
  console.log('Block:', receipt.blockNumber);
  console.log('Gas used:', receipt.gasUsed.toString());
  console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
  
  // Get updated info
  const updatedInfo = await escrow.getAllInfo();
  console.log('\n--- Updated Info ---');
  console.log('Buyer Approved:', updatedInfo.buyerApproved);
  console.log('Vendor Approved:', updatedInfo.vendorApproved);
  console.log('State:', updatedInfo.state.toString(), '(4 = Releasable)');
  console.log('\n✅ Vendor can now call withdraw()!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

