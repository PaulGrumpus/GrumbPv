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
  
  console.log('\n--- Timeline ---');
  const createdAt = new Date(Number(info.createdAt) * 1000);
  console.log('Created At:', createdAt.toISOString(), `(${info.createdAt})`);
  
  if (info.fundedAt > 0) {
    const fundedAt = new Date(Number(info.fundedAt) * 1000);
    console.log('Funded At:', fundedAt.toISOString(), `(${info.fundedAt})`);
  } else {
    console.log('Funded At: Not funded yet');
  }
  
  const deadline = new Date(Number(info.deadline) * 1000);
  console.log('Project Deadline:', deadline.toISOString(), `(${info.deadline})`);
  
  // Calculate cancel window if funded
  if (info.fundedAt > 0 && info.state == 1n) { // State.Funded
    const fundedTimestamp = Number(info.fundedAt);
    const deadlineTimestamp = Number(info.deadline);
    const period = deadlineTimestamp - fundedTimestamp;
    const cancelWindowDuration = period / 5; // 20%
    const cancelWindowEnd = fundedTimestamp + cancelWindowDuration;
    const cancelWindowEndDate = new Date(cancelWindowEnd * 1000);
    const now = Math.floor(Date.now() / 1000);
    
    console.log('\n--- Cancel Window ---');
    console.log('Cancel Window End:', cancelWindowEndDate.toISOString());
    
    if (now <= cancelWindowEnd) {
      const remaining = cancelWindowEnd - now;
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      console.log(`✅ Buyer can cancel (${hours}h ${minutes}m remaining)`);
    } else if (now > deadlineTimestamp) {
      console.log('✅ Buyer can cancel (deadline passed, vendor never delivered)');
    } else {
      console.log('❌ Cancel window closed (must wait for deadline)');
    }
  }
  
  if (info.disputeFeeDeadline > 0) {
    const disputeDeadline = new Date(Number(info.disputeFeeDeadline) * 1000);
    console.log('\n--- Dispute Info ---');
    console.log('Dispute Fee Deadline:', disputeDeadline.toISOString());
    console.log('Dispute Initiator:', info.disputeInitiator);
    console.log('Buyer Paid Dispute Fee:', info.buyerPaidDisputeFee);
    console.log('Vendor Paid Dispute Fee:', info.vendorPaidDisputeFee);
  }
  
  console.log('\n--- Content ---');
  console.log('Proposed CID:', info.proposedCID || '(none)');
  console.log('Finalized CID:', info.cid || '(none)');
  
  console.log('\n--- Rewards ---');
  console.log('Reward Token:', info.rewardToken);
  console.log('Reward Rate:', info.rewardRatePer1e18.toString());
  
  // Check if RewardDistributor is set
  let rewardDistributor;
  try {
    rewardDistributor = await escrow.rewardDistributor();
  } catch (error) {
    rewardDistributor = ethers.ZeroAddress;
  }
  
  if (rewardDistributor && rewardDistributor !== ethers.ZeroAddress) {
    console.log('✅ RewardDistributor:', rewardDistributor);
  }
  
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
        
        // Check owner balance
        const ownerAddress = await escrow.owner();
        const ownerBalance = await grmps.balanceOf(ownerAddress);
        console.log('Owner GRMPS Balance:', ethers.formatEther(ownerBalance), 'GRMPS');
        
        // Check allowance based on reward method
        if (rewardDistributor && rewardDistributor !== ethers.ZeroAddress) {
          // NEW: Using RewardDistributor
          // Check allowance from owner to RewardDistributor (or reward source)
          const distributorContract = new ethers.Contract(
            rewardDistributor,
            ['function rewardSource() view returns (address)'],
            provider
          );
          
          try {
            const rewardSource = await distributorContract.rewardSource();
            const allowance = await grmps.allowance(rewardSource, rewardDistributor);
            console.log('RewardSource → Distributor Allowance:', ethers.formatEther(allowance), 'GRMPS');
          } catch (error) {
            console.log('⚠️  Could not fetch RewardDistributor allowance');
          }
        } else {
          // LEGACY: Direct transfer from owner
          const allowance = await grmps.allowance(ownerAddress, CONFIG.escrowAddress);
          console.log('Owner → Escrow Allowance:', ethers.formatEther(allowance), 'GRMPS');
        }
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

