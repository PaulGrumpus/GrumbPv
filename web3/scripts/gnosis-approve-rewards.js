#!/usr/bin/env node

/**
 * Approve GRMPS allowance for reward distribution (EOA or Gnosis Safe)
 * 
 * This script handles GRMPS approval for both:
 * - EOA owners (direct execution with private key, or manual instructions)
 * - Gnosis Safe owners (generates transaction data for multisig)
 * 
 * Usage: npm run approve:rewards
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  console.log('=== Approve GRMPS Rewards ===\n');
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  
  // Get owner from escrow contract
  const escrow = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    provider
  );
  
  const ownerAddress = await escrow.owner();
  console.log('Escrow Owner:', ownerAddress);
  
  // Check if owner is a contract (Gnosis Safe) or EOA
  const ownerCode = await provider.getCode(ownerAddress);
  const isContract = ownerCode !== '0x';
  const ownerType = isContract ? 'Gnosis Safe/Contract' : 'EOA (Externally Owned Account)';
  console.log('Owner Type:', ownerType);
  
  // Configuration
  const grmpsTokenAddress = CONFIG.grmpsToken;
  const escrowAddress = CONFIG.escrowAddress;
  
  if (!grmpsTokenAddress) {
    throw new Error('GRMPS_TOKEN_ADDRESS not set');
  }
  
  // Calculate approval amount
  // Option 1: Approve specific amount for expected volume
  const monthlyVolumeGRMPS = process.env.MONTHLY_GRMPS_VOLUME || '100000';
  const approvalAmount = ethers.parseEther(monthlyVolumeGRMPS);
  
  // Option 2: Approve unlimited (max uint256) - not recommended for security
  // const approvalAmount = ethers.MaxUint256;
  
  console.log('\nGRMPS Token:', grmpsTokenAddress);
  console.log('Escrow Address:', escrowAddress);
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
  
  // Check current state
  const grmpsToken = new ethers.Contract(grmpsTokenAddress, grmpsInterface, provider);
  const currentAllowance = await grmpsToken.allowance(ownerAddress, escrowAddress);
  const balance = await grmpsToken.balanceOf(ownerAddress);
  
  console.log('Current State:');
  console.log('Owner GRMPS Balance:', ethers.formatEther(balance));
  console.log('Current Allowance:', ethers.formatEther(currentAllowance));
  
  if (balance < approvalAmount) {
    console.warn('\n⚠️  Warning: Owner balance is less than approval amount');
    console.warn('Balance:', ethers.formatEther(balance), 'GRMPS');
    console.warn('Approving:', ethers.formatEther(approvalAmount), 'GRMPS');
  }
  
  // Handle based on owner type and available credentials
  if (!isContract) {
    // EOA owner - can execute directly if private key is provided
    const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY || CONFIG.arbiterPrivateKey;
    
    if (ownerPrivateKey) {
      const signer = new ethers.Wallet(ownerPrivateKey, provider);
      
      if (signer.address.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error(`Private key mismatch! Expected ${ownerAddress}, got ${signer.address}`);
      }
      
      console.log('\n✅ EOA owner detected with private key');
      console.log('Executing approval directly...\n');
      
      const grmpsTokenSigned = new ethers.Contract(grmpsTokenAddress, grmpsInterface, signer);
      const tx = await grmpsTokenSigned.approve(escrowAddress, approvalAmount);
      console.log('Transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Approval successful!');
      console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
      
      // Verify new allowance
      const newAllowance = await grmpsToken.allowance(ownerAddress, escrowAddress);
      console.log('\nNew Allowance:', ethers.formatEther(newAllowance), 'GRMPS');
    } else {
      console.log('\n📋 EOA Owner - Manual Steps:');
      console.log('Set OWNER_PRIVATE_KEY or ARBITER_PRIVATE_KEY in .env and run again, OR:');
      console.log('1. Connect wallet with address:', ownerAddress);
      console.log('2. Go to GRMPS token on BSCScan');
      console.log('3. Call approve function:');
      console.log(`   - spender: ${escrowAddress}`);
      console.log(`   - amount: ${approvalAmount.toString()}`);
    }
  } else {
    // Gnosis Safe/Contract owner
    console.log('\n📋 Gnosis Safe - Next Steps:');
    console.log('1. Go to Gnosis Safe UI: https://app.safe.global');
    console.log(`2. Select your Safe wallet: ${ownerAddress}`);
    console.log('3. Click "New Transaction" → "Contract Interaction"');
    console.log('4. Enter the following:');
    console.log(`   - Contract Address: ${grmpsTokenAddress}`);
    console.log(`   - ABI: Use ERC20 standard ABI`);
    console.log(`   - Method: approve`);
    console.log(`   - spender: ${escrowAddress}`);
    console.log(`   - amount: ${approvalAmount.toString()}`);
    console.log('5. Submit and collect signatures from other owners');
    console.log('6. Execute when threshold is reached');
    
    console.log('\n📋 Or use the encoded transaction data above for Safe Transaction Builder');
  }
  
  console.log('\n💡 Tips:');
  console.log('- Monitor allowance regularly');
  console.log('- Adjust approval as needed for volume changes');
  console.log('- Can revoke by approving 0');
  console.log(`- Unused GRMPS stays in owner's wallet (${ownerAddress})`);
  
  console.log('\n⚠️  Important:');
  console.log('GRMPS owner must exclude the escrow OWNER from transfer fees:');
  console.log(`GRMPS.excludeFromFees(${ownerAddress}, true)`);
  console.log('(Fees are charged on FROM address, not escrow contract)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

