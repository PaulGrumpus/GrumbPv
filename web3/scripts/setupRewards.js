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
  
  // Get owner address (arbiter or Gnosis Safe)
  const escrowContract = new ethers.Contract(
    CONFIG.escrowAddress,
    CONFIG.escrowABI,
    wallet
  );
  const ownerAddress = await escrowContract.owner();
  
  console.log('1. GRMPS owner must exclude the escrow OWNER from fees:');
  console.log(`   GRMPS.excludeFromFees(${ownerAddress}, true)`);
  console.log('   (Because GRMPS transfers FROM owner wallet using allowance)');
  console.log('2. Owner (Gnosis Safe) must approve GRMPS allowance:');
  console.log(`   grmpsToken.approve(${CONFIG.escrowAddress}, largeAmount)`);
  console.log('3. Update rate periodically as market prices change');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

