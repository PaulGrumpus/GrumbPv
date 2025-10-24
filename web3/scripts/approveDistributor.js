#!/usr/bin/env node

/**
 * Approve RewardDistributor to spend GRMPS (EOA or Gnosis Safe)
 * 
 * This is the NEW way - approve once for all escrows!
 * 
 * Usage: npm run approve:distributor
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  console.log('=== Approve RewardDistributor ===\n');
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  
  // Get distributor address
  const distributorAddress = process.env.REWARD_DISTRIBUTOR_ADDRESS;
  if (!distributorAddress) {
    throw new Error('REWARD_DISTRIBUTOR_ADDRESS not set in .env');
  }
  
  // Load distributor contract to get reward source
  const distributorABI = [
    'function rewardSource() view returns (address)',
    'function rewardToken() view returns (address)',
    'function owner() view returns (address)',
    'function getCurrentAllowance() view returns (uint256)',
    'function getSourceBalance() view returns (uint256)'
  ];
  
  const distributor = new ethers.Contract(distributorAddress, distributorABI, provider);
  
  const rewardSource = await distributor.rewardSource();
  const rewardToken = await distributor.rewardToken();
  const distributorOwner = await distributor.owner();
  
  console.log('RewardDistributor:', distributorAddress);
  console.log('Distributor Owner:', distributorOwner);
  console.log('Reward Source:', rewardSource);
  console.log('Reward Token (GRMPS):', rewardToken);
  
  // Check if reward source is a contract (Gnosis Safe) or EOA
  const sourceCode = await provider.getCode(rewardSource);
  const isContract = sourceCode !== '0x';
  const sourceType = isContract ? 'Gnosis Safe/Contract' : 'EOA';
  console.log('Reward Source Type:', sourceType);
  
  // Calculate approval amount
  const monthlyVolumeGRMPS = process.env.MONTHLY_GRMPS_VOLUME || '100000';
  const approvalAmount = ethers.parseEther(monthlyVolumeGRMPS);
  
  console.log('\nApproval Amount:', ethers.formatEther(approvalAmount), 'GRMPS\n');
  
  // Create approval transaction data
  const grmpsInterface = new ethers.Interface([
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)'
  ]);
  
  const approvalData = grmpsInterface.encodeFunctionData('approve', [
    distributorAddress,
    approvalAmount
  ]);
  
  console.log('Transaction Details:');
  console.log('To:', rewardToken);
  console.log('Data:', approvalData);
  console.log('Value: 0 BNB\n');
  
  // Check current state
  const grmpsToken = new ethers.Contract(rewardToken, grmpsInterface, provider);
  const currentAllowance = await grmpsToken.allowance(rewardSource, distributorAddress);
  const balance = await grmpsToken.balanceOf(rewardSource);
  
  console.log('Current State:');
  console.log('Reward Source GRMPS Balance:', ethers.formatEther(balance));
  console.log('Current Allowance:', ethers.formatEther(currentAllowance));
  
  if (balance < approvalAmount) {
    console.warn('\n⚠️  Warning: Reward source balance is less than approval amount');
    console.warn('Balance:', ethers.formatEther(balance), 'GRMPS');
    console.warn('Approving:', ethers.formatEther(approvalAmount), 'GRMPS');
  }
  
  // Handle based on source type and available credentials
  if (!isContract) {
    // EOA reward source - can execute directly if private key is provided
    const sourcePrivateKey = process.env.REWARD_SOURCE_PRIVATE_KEY || 
                             process.env.OWNER_PRIVATE_KEY || 
                             CONFIG.arbiterPrivateKey;
    
    if (sourcePrivateKey) {
      const signer = new ethers.Wallet(sourcePrivateKey, provider);
      
      if (signer.address.toLowerCase() !== rewardSource.toLowerCase()) {
        throw new Error(`Private key mismatch! Expected ${rewardSource}, got ${signer.address}`);
      }
      
      console.log('\n✅ EOA reward source detected with private key');
      console.log('Executing approval directly...\n');
      
      const grmpsTokenSigned = new ethers.Contract(rewardToken, grmpsInterface, signer);
      const tx = await grmpsTokenSigned.approve(distributorAddress, approvalAmount);
      console.log('Transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Approval successful!');
      console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
      
      // Verify new allowance
      const newAllowance = await grmpsToken.allowance(rewardSource, distributorAddress);
      console.log('\nNew Allowance:', ethers.formatEther(newAllowance), 'GRMPS');
    } else {
      console.log('\n📋 EOA Reward Source - Manual Steps:');
      console.log('Set REWARD_SOURCE_PRIVATE_KEY in .env and run again, OR:');
      console.log('1. Connect wallet with address:', rewardSource);
      console.log('2. Go to GRMPS token on BSCScan');
      console.log('3. Call approve function:');
      console.log(`   - spender: ${distributorAddress}`);
      console.log(`   - amount: ${approvalAmount.toString()}`);
    }
  } else {
    // Gnosis Safe/Contract reward source
    console.log('\n📋 Gnosis Safe - Next Steps:');
    console.log('1. Go to Gnosis Safe UI: https://app.safe.global');
    console.log(`2. Select your Safe wallet: ${rewardSource}`);
    console.log('3. Click "New Transaction" → "Contract Interaction"');
    console.log('4. Enter the following:');
    console.log(`   - Contract Address: ${rewardToken}`);
    console.log(`   - ABI: Use ERC20 standard ABI`);
    console.log(`   - Method: approve`);
    console.log(`   - spender: ${distributorAddress}`);
    console.log(`   - amount: ${approvalAmount.toString()}`);
    console.log('5. Submit and collect signatures from other owners');
    console.log('6. Execute when threshold is reached');
    
    console.log('\n📋 Or use the encoded transaction data above for Safe Transaction Builder');
  }
  
  console.log('\n💡 Benefits of RewardDistributor:');
  console.log('✅ Approve ONCE for ALL escrows (scalable!)');
  console.log('✅ No need to approve each new escrow individually');
  console.log('✅ Centralized control and monitoring');
  console.log(`✅ Unused GRMPS stays in reward source wallet (${rewardSource})`);
  
  console.log('\n⚠️  Important:');
  console.log('GRMPS owner must exclude the REWARD SOURCE from transfer fees:');
  console.log(`GRMPS.excludeFromFees("${rewardSource}", true)`);
  console.log('(Fees are charged on FROM address)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

