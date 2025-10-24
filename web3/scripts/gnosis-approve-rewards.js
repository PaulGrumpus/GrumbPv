#!/usr/bin/env node

/**
 * Gnosis Safe: Approve GRMPS allowance for reward distribution
 * 
 * This script creates a transaction for Gnosis Safe to approve
 * the escrow contract to spend GRMPS tokens for rewards.
 * 
 * Usage: npm run gnosis:approve-rewards
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  console.log('=== Gnosis Safe: Approve GRMPS Rewards ===\n');
  
  // Configuration
  const grmpsTokenAddress = CONFIG.grmpsToken;
  const escrowAddress = CONFIG.escrowAddress; // or factory address for all escrows
  const gnosisSafeAddress = process.env.GNOSIS_SAFE_ADDRESS;
  
  if (!grmpsTokenAddress || !gnosisSafeAddress) {
    throw new Error('GRMPS_TOKEN_ADDRESS or GNOSIS_SAFE_ADDRESS not set');
  }
  
  // Calculate approval amount
  // Option 1: Approve specific amount for expected volume
  const monthlyVolumeGRMPS = process.env.MONTHLY_GRMPS_VOLUME || '100000';
  const approvalAmount = ethers.parseEther(monthlyVolumeGRMPS);
  
  // Option 2: Approve unlimited (max uint256) - not recommended for security
  // const approvalAmount = ethers.MaxUint256;
  
  console.log('GRMPS Token:', grmpsTokenAddress);
  console.log('Escrow Address:', escrowAddress);
  console.log('Gnosis Safe:', gnosisSafeAddress);
  console.log('Approval Amount:', ethers.formatEther(approvalAmount), 'GRMPS\n');
  
  // Create approval transaction data
  const grmpsInterface = new ethers.Interface([
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)'
  ]);
  
  const approvalData = grmpsInterface.encodeFunctionData('approve', [
    escrowAddress,
    approvalAmount
  ]);
  
  console.log('Transaction Details:');
  console.log('To:', grmpsTokenAddress);
  console.log('Data:', approvalData);
  console.log('Value: 0 BNB\n');
  
  // If running with signer (for testing or manual execution)
  if (process.env.GNOSIS_SAFE_SIGNER_KEY) {
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    const signer = new ethers.Wallet(process.env.GNOSIS_SAFE_SIGNER_KEY, provider);
    
    console.log('Executing with signer:', signer.address);
    
    const grmpsToken = new ethers.Contract(grmpsTokenAddress, grmpsInterface, signer);
    
    // Check current state
    const currentAllowance = await grmpsToken.allowance(gnosisSafeAddress, escrowAddress);
    const balance = await grmpsToken.balanceOf(gnosisSafeAddress);
    
    console.log('\nCurrent State:');
    console.log('Gnosis Safe GRMPS Balance:', ethers.formatEther(balance));
    console.log('Current Allowance:', ethers.formatEther(currentAllowance));
    
    if (balance < approvalAmount) {
      console.warn('\n⚠️  Warning: Gnosis Safe balance is less than approval amount');
      console.warn('Balance:', ethers.formatEther(balance), 'GRMPS');
      console.warn('Approving:', ethers.formatEther(approvalAmount), 'GRMPS');
    }
    
    // Execute approval
    console.log('\nSending approval transaction...');
    const tx = await grmpsToken.approve(escrowAddress, approvalAmount);
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('\n✅ Approval successful!');
    console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
    
    // Verify new allowance
    const newAllowance = await grmpsToken.allowance(gnosisSafeAddress, escrowAddress);
    console.log('\nNew Allowance:', ethers.formatEther(newAllowance), 'GRMPS');
  } else {
    console.log('📋 Next Steps:');
    console.log('1. Go to Gnosis Safe UI: https://app.safe.global');
    console.log('2. Select your Safe wallet');
    console.log('3. Click "New Transaction" → "Contract Interaction"');
    console.log('4. Enter the following:');
    console.log(`   - Contract Address: ${grmpsTokenAddress}`);
    console.log(`   - ABI: Use ERC20 standard ABI`);
    console.log(`   - Method: approve`);
    console.log(`   - spender: ${escrowAddress}`);
    console.log(`   - amount: ${approvalAmount.toString()}`);
    console.log('5. Submit and collect signatures from other owners');
    console.log('6. Execute when threshold is reached');
  }
  
  console.log('\n💡 Tips:');
  console.log('- Monitor allowance regularly');
  console.log('- Adjust approval as needed for volume changes');
  console.log('- Can revoke by approving 0');
  console.log('- Unused GRMPS stays in Gnosis Safe wallet');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

