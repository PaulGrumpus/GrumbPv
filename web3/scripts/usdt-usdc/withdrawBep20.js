#!/usr/bin/env node

/**
 * Vendor withdraws payment (BEP-20). Same contract call as BNB; this script shows token balance.
 * GRMPS rewards (buyer + vendor) are distributed only if RewardDistributor has allowance from reward source.
 * Usage: node scripts/usdt-usdc/withdrawBep20.js
 * Env: ESCROW_ADDRESS, VENDOR_PRIVATE_KEY.
 */

import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';
import { decodeError } from '../../utils/escrowUtils.js';
import { getTokenConfigByAddress } from './tokenConfig.js';

async function main() {
  console.log('=== Withdrawing as vendor (BEP-20) ===');
  const escrowAddress = process.env.ESCROW_ADDRESS || CONFIG.escrowAddress;
  console.log('Escrow address:', escrowAddress);
  if (!escrowAddress) { console.log('ESCROW_ADDRESS not set'); return; }
  if (!CONFIG.vendorPrivateKey) { console.log('VENDOR_PRIVATE_KEY not set'); return; }

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.vendorPrivateKey, provider);
  console.log('Wallet address:', wallet.address);
  const escrow = new ethers.Contract(escrowAddress, CONFIG.escrowABI, provider);
  const info = await escrow.getAllInfo();

  if (info.paymentToken === ethers.ZeroAddress) {
    console.log('This escrow uses BNB. Use npm run withdraw instead.');
    return;
  }

  const tokenConfig = getTokenConfigByAddress(info.paymentToken, CONFIG.chainId);
  const token = new ethers.Contract(info.paymentToken, CONFIG.erc20ABI, provider);
  const decimals = tokenConfig.decimals;

  const releasable = await escrow.isReleasable();
  console.log('Releasable:', releasable);
  if (!releasable) {
    console.log('Escrow not releasable. State: ' + info.state.toString());
    return;
  }

  // --- GRMPS reward check: warn if distributor has no allowance (buyer/vendor won't get rewards) ---
  const rewardToken = info.rewardToken;
  const rewardDistributorAddr = await escrow.rewardDistributor().catch(() => ethers.ZeroAddress);
  if (rewardToken !== ethers.ZeroAddress && rewardDistributorAddr !== ethers.ZeroAddress) {
    const rate = info.rewardRatePer1e18;
    const rewardRateBps = info.rewardRateBps ?? 0n;
    if (rate > 0n && rewardRateBps > 0n) {
      const projectAmount = info.amount;
      const sideNative = (projectAmount * rewardRateBps) / 10000n;
      const rewardPerSide = (sideNative * rate) / (10n ** 18n);
      const totalReward = rewardPerSide * 2n;
      const distributorAbi = ['function rewardSource() view returns (address)'];
      const distributor = new ethers.Contract(rewardDistributorAddr, distributorAbi, provider);
      const rewardSource = await distributor.rewardSource();
      const grmps = new ethers.Contract(rewardToken, CONFIG.erc20ABI, provider);
      const allowance = await grmps.allowance(rewardSource, rewardDistributorAddr);
      if (allowance < totalReward) {
        console.log('\n⚠️  GRMPS REWARDS WILL NOT BE SENT: RewardDistributor allowance is insufficient.');
        console.log('   Reward source:', rewardSource);
        console.log('   Required:', ethers.formatEther(totalReward), 'GRMPS');
        console.log('   Current allowance:', ethers.formatEther(allowance), 'GRMPS');
        console.log('   To fix: reward source must run: npm run approve:distributor');
        console.log('   (Set REWARD_DISTRIBUTOR_ADDRESS in .env to', rewardDistributorAddr, ')\n');
      }
    }
  }

  const vendorBalBefore = await token.balanceOf(wallet.address);
  const projectAmount = info.amount;
  const vendorFeeBps = info.vendorFeeBps;
  const vendorReceives = projectAmount - (projectAmount * vendorFeeBps) / 10000n;

  console.log('Withdrawing as vendor (BEP-20)');
  console.log('  Token:', tokenConfig.symbol);
  console.log('  Vendor balance before:', (Number(vendorBalBefore) / 10 ** decimals).toFixed(6), tokenConfig.symbol);
  console.log('  Expected to receive:', (Number(vendorReceives) / 10 ** decimals).toFixed(6), tokenConfig.symbol);

  const escrowWithSigner = new ethers.Contract(escrowAddress, CONFIG.escrowABI, wallet);
  try {
    const tx = await escrowWithSigner.withdraw();
    const receipt = await tx.wait();
    console.log('  Tx:', receipt.hash);

    const vendorBalAfter = await token.balanceOf(wallet.address);
    const received = vendorBalAfter - vendorBalBefore;
    console.log('\nVendor balance after:', (Number(vendorBalAfter) / 10 ** decimals).toFixed(6), tokenConfig.symbol);
    console.log('Received:', (Number(received) / 10 ** decimals).toFixed(6), tokenConfig.symbol);

    // --- Reward outcome (GRMPS to buyer + vendor) ---
    console.log('\n--- GRMPS rewards ---');
    let rewardPaidCount = 0;
    let rewardSkippedReason = null;
    for (const log of receipt.logs) {
      try {
        const parsed = escrow.interface.parseLog(log);
        if (parsed && parsed.name === 'RewardPaid') {
          if (rewardPaidCount === 0) console.log('✅ GRMPS rewards paid to buyer and vendor.');
          rewardPaidCount++;
          console.log('  ', parsed.args.reason, ':', ethers.formatEther(parsed.args.amount), 'GRMPS to', parsed.args.to);
        } else if (parsed && parsed.name === 'RewardSkipped') {
          rewardSkippedReason = parsed.args.reason;
        }
      } catch { /* log from other contract */ }
    }
    if (rewardPaidCount === 0 && rewardSkippedReason) {
      console.log('❌ GRMPS rewards were not sent. Reason:', rewardSkippedReason);
      if (['insufficient_allowance', 'distributor_failed', 'distributor_call_failed'].includes(rewardSkippedReason)) {
        console.log('   Reward source must approve the RewardDistributor: npm run approve:distributor');
      }
    } else if (rewardPaidCount === 0) {
      console.log('No reward config on this escrow (or zero rate).');
    }
  } catch (error) {
    const msg = decodeError(error, escrow.interface) || error.message;
    console.error(msg);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    process.exit(1);
  });
