#!/usr/bin/env node

/**
 * Initiate dispute for BEP-20 escrow.
 * Buyer: no payment (uses reserved fee). Vendor: (1) Approve dispute fee, (2) initiateDispute().
 * Usage: node scripts/usdt-usdc/disputeInitBep20.js
 * Env: ESCROW_ADDRESS, DISPUTE_INITIATOR=buyer|vendor, VENDOR_PRIVATE_KEY or BUYER_PRIVATE_KEY.
 */

import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';
import { decodeError } from '../../utils/escrowUtils.js';
import { getTokenConfigByAddress } from './tokenConfig.js';

async function main() {
  const escrowAddress = process.env.ESCROW_ADDRESS || CONFIG.escrowAddress;
  if (!escrowAddress) throw new Error('ESCROW_ADDRESS not set');

  const role = process.env.DISPUTE_INITIATOR || 'vendor';
  const privateKey = role === 'buyer' ? CONFIG.buyerPrivateKey : CONFIG.vendorPrivateKey;
  if (!privateKey) throw new Error(`${role.toUpperCase()}_PRIVATE_KEY not set`);

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const escrow = new ethers.Contract(escrowAddress, CONFIG.escrowABI, wallet);
  const info = await escrow.getAllInfo();

  if (info.paymentToken === ethers.ZeroAddress) {
    throw new Error('This escrow uses BNB. Use npm run dispute-init instead.');
  }

  const disputeFee = info.disputeFeeAmount;
  const tokenConfig = getTokenConfigByAddress(info.paymentToken, CONFIG.chainId);
  const token = new ethers.Contract(info.paymentToken, CONFIG.erc20ABI, wallet);

  console.log('Initiate dispute (BEP-20) as', role);
  console.log('  Dispute fee:', disputeFee.toString(), `(${Number(disputeFee) / 10 ** tokenConfig.decimals} ${tokenConfig.symbol})`);

  if (role === 'vendor') {
    const balance = await token.balanceOf(wallet.address);
    if (balance < disputeFee) throw new Error(`Insufficient ${tokenConfig.symbol} for dispute fee`);
    const allowance = await token.allowance(wallet.address, escrowAddress);
    if (allowance < disputeFee) {
      console.log('  Step 1: Approve escrow to pull dispute fee...');
      const approveTx = await token.approve(escrowAddress, disputeFee);
      await approveTx.wait();
      console.log('  Approved. Tx:', approveTx.hash);
    }
    console.log('  Step 2: initiateDispute()...');
  } else {
    console.log('  Buyer uses reserved fee (single tx)...');
  }

  try {
    const value = role === 'vendor' ? 0n : 0n;
    const tx = await escrow.initiateDispute({ value });
    await tx.wait();
    console.log('  Tx:', tx.hash);

    const updated = await escrow.getAllInfo();
    const deadline = new Date(Number(updated.disputeFeeDeadline) * 1000);
    console.log('\nDispute initiated. Counterparty deadline:', deadline.toISOString());
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
