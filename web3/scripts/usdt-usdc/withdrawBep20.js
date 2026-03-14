#!/usr/bin/env node

/**
 * Vendor withdraws payment (BEP-20). Same contract call as BNB; this script shows token balance.
 * Usage: node scripts/usdt-usdc/withdrawBep20.js
 * Env: ESCROW_ADDRESS, VENDOR_PRIVATE_KEY.
 */

import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';
import { decodeError } from '../../utils/escrowUtils.js';
import { getTokenConfig } from './tokenConfig.js';

async function main() {
  const escrowAddress = process.env.ESCROW_ADDRESS || CONFIG.escrowAddress;
  if (!escrowAddress) throw new Error('ESCROW_ADDRESS not set');
  if (!CONFIG.vendorPrivateKey) throw new Error('VENDOR_PRIVATE_KEY not set');

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.vendorPrivateKey, provider);

  const escrow = new ethers.Contract(escrowAddress, CONFIG.escrowABI, wallet);
  const info = await escrow.getAllInfo();

  if (info.paymentToken === ethers.ZeroAddress) {
    throw new Error('This escrow uses BNB. Use npm run withdraw instead.');
  }

  const tokenConfig = getTokenConfigByAddress(info.paymentToken, CONFIG.chainId);
  const token = new ethers.Contract(info.paymentToken, CONFIG.erc20ABI, provider);
  const decimals = tokenConfig.decimals;

  const releasable = await escrow.isReleasable();
  if (!releasable) {
    throw new Error('Escrow not releasable. State: ' + info.state.toString());
  }

  const vendorBalBefore = await token.balanceOf(wallet.address);
  const projectAmount = info.amount;
  const vendorFeeBps = info.vendorFeeBps;
  const vendorReceives = projectAmount - (projectAmount * vendorFeeBps) / 10000n;

  console.log('Withdrawing as vendor (BEP-20)');
  console.log('  Token:', tokenConfig.symbol);
  console.log('  Vendor balance before:', (Number(vendorBalBefore) / 10 ** decimals).toFixed(6), tokenConfig.symbol);
  console.log('  Expected to receive:', (Number(vendorReceives) / 10 ** decimals).toFixed(6), tokenConfig.symbol);

  try {
    const tx = await escrow.withdraw();
    const receipt = await tx.wait();
    console.log('  Tx:', receipt.hash);

    const vendorBalAfter = await token.balanceOf(wallet.address);
    const received = vendorBalAfter - vendorBalBefore;
    console.log('\nVendor balance after:', (Number(vendorBalAfter) / 10 ** decimals).toFixed(6), tokenConfig.symbol);
    console.log('Received:', (Number(received) / 10 ** decimals).toFixed(6), tokenConfig.symbol);
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
