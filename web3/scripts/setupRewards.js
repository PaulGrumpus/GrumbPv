#!/usr/bin/env node

/**
 * Configure GRMPS rewards (arbiter only)
 * Usage: npm run setup-rewards
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  if (!CONFIG.arbiterPrivateKey) {
    throw new Error('ARBITER_PRIVATE_KEY not set in .env');
  }
  
  if (!CONFIG.grmpsToken || CONFIG.grmpsToken.startsWith('0x6234')) {
    throw new Error('GRMPS_TOKEN_ADDRESS not set in .env (update with real GRMPS address)');
  }
  
  // Connect to BSC testnet
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  
  // Create wallet
  const wallet = new ethers.Wallet(CONFIG.arbiterPrivateKey, provider);
  
  console.log('Configuring rewards as arbiter:', wallet.address);
  console.log('Escrow address:', CONFIG.escrowAddress);
  console.log('GRMPS Token:', CONFIG.grmpsToken);
  console.log('Reward Rate:', CONFIG.rewardRate);
  
  // Create contract instance
  const escrow = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    wallet
  );
  
  // Set reward token
  console.log('\n1. Setting reward token...');
  const tx1 = await escrow.setRewardToken(CONFIG.grmpsToken);
  console.log('Transaction hash:', tx1.hash);
  await tx1.wait();
  console.log('✅ Reward token set');
  
  // Set reward rate
  console.log('\n2. Setting reward rate...');
  const tx2 = await escrow.setRewardRatePer1e18(CONFIG.rewardRate);
  console.log('Transaction hash:', tx2.hash);
  await tx2.wait();
  console.log('✅ Reward rate set');
  
  console.log('\n✅ Rewards configured successfully!');
  console.log('\nNext steps:');
  
  // Get escrow owner (arbiter)
  const ownerAddress = await escrow.owner();
  
  // Check if RewardDistributor function exists (new contracts have it, old ones don't)
  let rewardDistributor;
  let hasDistributor = false;
  
  try {
    rewardDistributor = await escrow.rewardDistributor();
    hasDistributor = true;
  } catch (error) {
    // Old escrow contract without rewardDistributor() function
    console.log('ℹ️  Old escrow contract (deployed before RewardDistributor feature)');
    hasDistributor = false;
  }
  
  if (hasDistributor && rewardDistributor && rewardDistributor !== ethers.ZeroAddress) {
    console.log('✅ Using RewardDistributor (scalable approach)');
    console.log('RewardDistributor:', rewardDistributor);
    console.log('\n1. Ensure reward source has approved RewardDistributor:');
    console.log('   npm run approve:distributor');
    console.log('2. GRMPS owner must exclude REWARD SOURCE from fees');
    console.log('3. Update rate periodically as market prices change');
  } else {
    if (!hasDistributor) {
      console.log('⚠️  Old escrow contract - using legacy direct transfer');
    } else {
      console.log('⚠️  RewardDistributor not set - using legacy direct transfer');
    }
    console.log('Escrow Owner (Arbiter):', ownerAddress);
    console.log('\n1. GRMPS owner must exclude the escrow OWNER from fees:');
    console.log(`   GRMPS.excludeFromFees(${ownerAddress}, true)`);
    console.log('   (Because GRMPS transfers FROM owner wallet using allowance)');
    console.log('2. Escrow Owner must approve GRMPS allowance:');
    console.log(`   grmpsToken.approve(${CONFIG.escrowAddress}, largeAmount)`);
    console.log('3. Update rate periodically as market prices change');
    
    if (hasDistributor) {
      console.log('\n💡 Tip: Set RewardDistributor for scalable rewards!');
      console.log('   escrow.setRewardDistributor(distributorAddress)');
    } else {
      console.log('\n💡 Tip: This escrow was deployed with old contract.');
      console.log('   Deploy new escrows via factory to use RewardDistributor!');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

