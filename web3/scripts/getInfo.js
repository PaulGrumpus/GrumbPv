#!/usr/bin/env node

/**
 * Get complete escrow information
 * Usage: npm run info
 */

import { ethers } from 'ethers';
import { CONFIG, STATES } from '../config.js';

async function main() {
  // Connect to BSC testnet
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  
  // Create contract instance (read-only)
  const escrow = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    provider
  );
  
  console.log('=== ESCROW INFO ===\n');
  console.log('Contract Address:', CONFIG.escrowAddress);
  console.log('Network:', await provider.getNetwork().then(n => n.name));
  console.log('Chain ID:', (await provider.getNetwork()).chainId.toString());
  
  // Get all info
  const info = await escrow.getAllInfo();
  
  console.log('\n--- Participants ---');
  console.log('Buyer:', info.buyer);
  console.log('Vendor:', info.vendor);
  console.log('Arbiter:', info.arbiter);
  console.log('Fee Recipient:', info.feeRecipient);
  
  console.log('\n--- Amounts (BNB) ---');
  console.log('Project Amount:', ethers.formatEther(info.amount), 'BNB');
  console.log('Buyer Fee Reserve:', ethers.formatEther(info.buyerFeeReserve), 'BNB');
  console.log('Dispute Fee Amount:', ethers.formatEther(info.disputeFeeAmount), 'BNB');
  
  console.log('\n--- State ---');
  console.log('Current State:', STATES[info.state], `(${info.state})`);
  console.log('Buyer Approved:', info.buyerApproved);
  console.log('Vendor Approved:', info.vendorApproved);
  
  console.log('\n--- Deadlines ---');
  const deadline = new Date(Number(info.deadline) * 1000);
  console.log('Project Deadline:', deadline.toISOString(), `(${info.deadline})`);
  
  if (info.disputeFeeDeadline > 0) {
    const disputeDeadline = new Date(Number(info.disputeFeeDeadline) * 1000);
    console.log('Dispute Fee Deadline:', disputeDeadline.toISOString());
  }
  
  console.log('\n--- Content ---');
  console.log('Proposed CID:', info.proposedCID || '(none)');
  console.log('Finalized CID:', info.cid || '(none)');
  
  console.log('\n--- Rewards ---');
  console.log('Reward Token:', info.rewardToken);
  console.log('Reward Rate:', info.rewardRatePer1e18.toString());
  
  if (info.rewardToken !== ethers.ZeroAddress) {
    try {
      // Check if token contract exists
      const code = await provider.getCode(info.rewardToken);
      
      if (code !== '0x') {
        const grmps = new ethers.Contract(
          info.rewardToken,
          CONFIG.erc20ABI,
          provider
        );
        
        // Note: With allowance pattern, GRMPS stays in owner's wallet
        const ownerAddress = await escrow.owner();
        const ownerBalance = await grmps.balanceOf(ownerAddress);
        const allowance = await grmps.allowance(ownerAddress, CONFIG.escrowAddress);
        
        console.log('Owner GRMPS Balance:', ethers.formatEther(ownerBalance), 'GRMPS');
        console.log('Escrow Allowance:', ethers.formatEther(allowance), 'GRMPS');
      } else {
        console.log('⚠️  GRMPS token not deployed at this address');
      }
    } catch (error) {
      console.log('⚠️  Could not fetch GRMPS info:', error.message);
    }
  }
  
  console.log('\n--- Contract Balance ---');
  const balance = await provider.getBalance(CONFIG.escrowAddress);
  console.log('BNB Balance:', ethers.formatEther(balance), 'BNB');
  
  // Check if releasable
  const releasable = await escrow.isReleasable();
  console.log('\n--- Status ---');
  console.log('Is Releasable:', releasable);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

