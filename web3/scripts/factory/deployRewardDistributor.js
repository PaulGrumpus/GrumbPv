#!/usr/bin/env node

/**
 * Deploy RewardDistributor contract for centralized reward management
 * Usage: npm run deploy:reward-distributor
 */

import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { CONFIG } from '../../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load RewardDistributor ABI
const distributorArtifact = JSON.parse(
  readFileSync(join(__dirname, '../../abi/RewardDistributor.json'), 'utf8')
);

async function main() {
  console.log('=== Deploy RewardDistributor ===\n');
  
  // Configuration
  // Owner = deployer initially, can be transferred to Gnosis Safe later
  const deployerKey = CONFIG.deployerPrivateKey;
  
  if (!deployerKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY or PRIVATE_KEY not set in .env');
  }
  
  const rewardToken = CONFIG.grmpsToken;
  
  if (!rewardToken) {
    throw new Error('GRMPS_TOKEN_ADDRESS not set in .env');
  }
  
  // Connect to network
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const deployer = new ethers.Wallet(deployerKey, provider);
  
  // Owner = deployer address (can be overridden for testing)
  const owner = process.env.REWARD_DISTRIBUTOR_OWNER || deployer.address;
  
  // Reward source = who holds GRMPS (default to owner, can be separate)
  const rewardSource = process.env.REWARD_SOURCE_ADDRESS || owner;
  
  console.log('Configuration:');
  console.log('Deployer:', deployer.address);
  console.log('RewardDistributor Owner:', owner);
  console.log('Reward Token (GRMPS):', rewardToken);
  console.log('Reward Source (holds GRMPS):', rewardSource);
  console.log('Network:', CONFIG.rpcUrl);
  
  // Check balance
  const balance = await provider.getBalance(deployer.address);
  console.log('Balance:', ethers.formatEther(balance), 'BNB\n');
  
  if (balance < ethers.parseEther('0.01')) {
    throw new Error('Insufficient balance for deployment');
  }
  
  // Deploy
  console.log('Deploying RewardDistributor...');
  
  const RewardDistributor = new ethers.ContractFactory(
    distributorArtifact.abi,
    distributorArtifact.bytecode,
    deployer
  );
  
  const distributor = await RewardDistributor.deploy(
    owner,
    rewardToken,
    rewardSource
  );
  
  console.log('Transaction hash:', distributor.deploymentTransaction().hash);
  console.log('Waiting for confirmation...');
  
  await distributor.waitForDeployment();
  const distributorAddress = await distributor.getAddress();
  
  console.log('\n✅ Deployment successful!');
  console.log('RewardDistributor:', distributorAddress);
  console.log('Transaction:', `https://testnet.bscscan.com/address/${distributorAddress}`);
  
  console.log('\n=== Next Steps ===');
  console.log('\n1. Save this address in your .env:');
  console.log(`REWARD_DISTRIBUTOR_ADDRESS=${distributorAddress}`);
  
  console.log('\n2. Reward source must approve distributor:');
  console.log(`   grmpsToken.approve("${distributorAddress}", largeAmount)`);
  console.log(`   Run: npm run approve:distributor`);
  
  console.log('\n3. Owner must authorize callers:');
  console.log('   Option A: Authorize factory (all escrows can use it):');
  console.log(`     distributor.setAuthorizedCaller("${CONFIG.factoryAddress}", true)`);
  console.log('   Option B: Authorize specific escrows:');
  console.log(`     distributor.setAuthorizedCaller(escrowAddress, true)`);
  console.log('   Option C: Enable open mode (any escrow can use - less secure):');
  console.log('     distributor.setOpenMode(true)');
  
  console.log('\n4. Configure escrows to use distributor:');
  console.log(`   escrow.setRewardDistributor("${distributorAddress}")`);
  
  console.log('\n5. IMPORTANT: Exclude reward source from GRMPS fees:');
  console.log(`   GRMPS.excludeFromFees("${rewardSource}", true)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

