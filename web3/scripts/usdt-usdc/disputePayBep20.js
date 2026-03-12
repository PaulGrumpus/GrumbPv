#!/usr/bin/env node

/**
 * Pay dispute fee (counterparty). For BEP-20 escrow, vendor must (1) Approve, (2) payDisputeFee().
 * Usage: node scripts/usdt-usdc/disputePayBep20.js
 * Env: ESCROW_ADDRESS, VENDOR_PRIVATE_KEY (when vendor is paying).
 */

import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';
import { decodeError } from '../../utils/escrowUtils.js';
import { getTokenConfigByAddress } from './tokenConfig.js';

async function main() {
  const escrowAddress = process.env.ESCROW_ADDRESS || CONFIG.escrowAddress;
  if (!escrowAddress) throw new Error('ESCROW_ADDRESS not set');
  if (!CONFIG.vendorPrivateKey) throw new Error('VENDOR_PRIVATE_KEY not set (vendor pays dispute fee)');

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.vendorPrivateKey, provider);

  const escrow = new ethers.Contract(escrowAddress, CONFIG.escrowABI, wallet);
  const info = await escrow.getAllInfo();

  if (info.paymentToken === ethers.ZeroAddress) {
    throw new Error('This escrow uses BNB. Use npm run dispute-pay instead.');
  }

  const disputeFee = info.disputeFeeAmount;
  const tokenConfig = getTokenConfigByAddress(info.paymentToken, CONFIG.chainId);
  const token = new ethers.Contract(info.paymentToken, CONFIG.erc20ABI, wallet);

  console.log('Pay dispute fee (BEP-20) as vendor');
  console.log('  Fee:', disputeFee.toString(), tokenConfig.symbol);

  const allowance = await token.allowance(wallet.address, escrowAddress);
  if (allowance < disputeFee) {
    console.log('  Step 1: Approve escrow...');
    const approveTx = await token.approve(escrowAddress, disputeFee);
    await approveTx.wait();
    console.log('  Approved. Tx:', approveTx.hash);
  }
  console.log('  Step 2: payDisputeFee()...');

  try {
    const tx = await escrow.payDisputeFee({ value: 0n });
    await tx.wait();
    console.log('  Tx:', tx.hash);
    console.log('\nDispute fee paid.');
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
