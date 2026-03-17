#!/usr/bin/env node

/**
 * Check factory reward rates: BNB rate vs stablecoin rate (USDT/USDC).
 * If rewardRatePer1e18ForStablecoin is 0 or missing, USDT escrows get the BNB rate (1000x too high).
 * Usage: node scripts/checkFactoryRates.js
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  const factoryAddress = process.env.FACTORY_ADDRESS || CONFIG.factoryAddress;
  if (!factoryAddress) {
    throw new Error('FACTORY_ADDRESS not set');
  }

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const factory = new ethers.Contract(factoryAddress, CONFIG.factoryABI, provider);

  console.log('Factory:', factoryAddress);
  console.log('');

  const bnbRate = await factory.rewardRatePer1e18();
  console.log('rewardRatePer1e18 (BNB):', bnbRate.toString());
  console.log('  →', ethers.formatEther(bnbRate), 'GRMPS per 1 BNB');
  console.log('');

  let stablecoinRate;
  try {
    stablecoinRate = await factory.rewardRatePer1e18ForStablecoin();
  } catch (e) {
    console.log('rewardRatePer1e18ForStablecoin: NOT AVAILABLE (factory is old bytecode)');
    console.log('');
    console.log('Fix: Redeploy EscrowFactory (current contract code), then run deploy-all.sh');
    console.log('      setup (or call setRewardRatePer1e18 and setRewardRatePer1e18ForStablecoinWithDivisor(1000)).');
    process.exit(1);
  }

  console.log('rewardRatePer1e18ForStablecoin:', stablecoinRate.toString());
  console.log('  →', ethers.formatEther(stablecoinRate), 'GRMPS per 1e18 token wei (e.g. per 1 USDT if 18 decimals)');
  console.log('');

  if (stablecoinRate === 0n) {
    console.log('Stablecoin rate is 0 → USDT/USDC escrows are currently getting the BNB rate (wrong).');
    console.log('');
    console.log('Fix: Run: node scripts/setStablecoinRewardRate.js');
    console.log('      (or: cast send <FACTORY> "setRewardRatePer1e18ForStablecoinWithDivisor(uint256)" 1000 ...)');
    process.exit(1);
  }

  const expectedRatio = bnbRate / stablecoinRate;
  console.log('Ratio (BNB rate / stablecoin rate):', expectedRatio.toString(), '(expected 1000 for 1 BNB = 1000 USDT)');
  if (expectedRatio < 900n || expectedRatio > 1100n) {
    console.log('Warning: ratio is not ~1000; adjust divisor if needed.');
  } else {
    console.log('OK: New USDT/USDC escrows will get ~1/1000 of BNB reward per unit.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
