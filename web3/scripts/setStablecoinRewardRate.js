#!/usr/bin/env node

/**
 * Set factory stablecoin reward rate = BNB rate / divisor (e.g. 1000 for 1 BNB = 1000 USDT).
 * Must be called by factory owner. Only affects NEW escrows created after this call.
 * Usage: node scripts/setStablecoinRewardRate.js [divisor]
 *   divisor default: 1000
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  const factoryAddress = process.env.FACTORY_ADDRESS || CONFIG.factoryAddress;
  if (!factoryAddress) {
    throw new Error('FACTORY_ADDRESS not set');
  }

  const divisor = process.argv[2] ? BigInt(process.argv[2]) : 1000n;
  if (divisor === 0n) {
    throw new Error('divisor must be > 0');
  }

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY || process.env.ARBITER_PRIVATE_KEY,
    provider
  );
  const factory = new ethers.Contract(factoryAddress, CONFIG.factoryABI, wallet);

  const owner = await factory.owner();
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Factory owner is ${owner}; signer is ${wallet.address}. Use the owner key.`);
  }

  const bnbRate = await factory.rewardRatePer1e18();
  const newStablecoinRate = bnbRate / divisor;
  console.log('Factory:', factoryAddress);
  console.log('rewardRatePer1e18 (BNB):', bnbRate.toString());
  console.log('divisor:', divisor.toString());
  console.log('rewardRatePer1e18ForStablecoin will be set to:', newStablecoinRate.toString());
  console.log('  →', ethers.formatEther(newStablecoinRate), 'GRMPS per 1e18 token wei');
  console.log('');

  const tx = await factory.setRewardRatePer1e18ForStablecoinWithDivisor(divisor);
  console.log('Tx hash:', tx.hash);
  await tx.wait();
  console.log('Done. New USDT/USDC escrows will use this rate.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
