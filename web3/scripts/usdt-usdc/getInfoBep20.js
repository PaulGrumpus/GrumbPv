#!/usr/bin/env node

/**
 * Show escrow info with BEP-20 token amounts (symbol and decimals).
 * Usage: node scripts/usdt-usdc/getInfoBep20.js
 * Env: ESCROW_ADDRESS
 */

import { ethers } from 'ethers';
import { CONFIG, STATES } from '../../config.js';
import { getTokenConfigByAddress } from './tokenConfig.js';

async function main() {
  const escrowAddress = process.env.ESCROW_ADDRESS || CONFIG.escrowAddress;
  if (!escrowAddress) throw new Error('ESCROW_ADDRESS not set');

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const escrow = new ethers.Contract(escrowAddress, CONFIG.escrowABI, provider);
  const info = await escrow.getAllInfo();

  const isBnb = info.paymentToken === ethers.ZeroAddress;
  const tokenConfig = isBnb
    ? { symbol: 'BNB', decimals: 18 }
    : getTokenConfigByAddress(info.paymentToken, CONFIG.chainId);

  const d = tokenConfig.decimals;
  const fmt = (val) => (Number(val) / 10 ** d).toFixed(d === 18 ? 6 : 6);

  console.log('=== ESCROW INFO (BEP-20) ===\n');
  console.log('Address:', escrowAddress);
  console.log('Payment:', tokenConfig.symbol, isBnb ? '(native)' : info.paymentToken);
  console.log('\n--- Amounts ---');
  console.log('Project:', info.amount.toString(), `(${fmt(info.amount)} ${tokenConfig.symbol})`);
  console.log('Buyer fee reserve:', info.buyerFeeReserve.toString(), `(${fmt(info.buyerFeeReserve)} ${tokenConfig.symbol})`);
  console.log('Dispute fee:', info.disputeFeeAmount.toString(), `(${fmt(info.disputeFeeAmount)} ${tokenConfig.symbol})`);
  console.log('\n--- State ---');
  console.log('State:', STATES[Number(info.state)] ?? info.state, `(${info.state})`);
  console.log('Buyer approved:', info.buyerApproved);
  console.log('Vendor approved:', info.vendorApproved);
  console.log('\n--- Parties ---');
  console.log('Buyer:', info.buyer);
  console.log('Vendor:', info.vendor);
  console.log('Arbiter:', info.arbiter);
  console.log('Fee recipient:', info.feeRecipient);
  if (!isBnb) {
    const token = new ethers.Contract(info.paymentToken, CONFIG.erc20ABI, provider);
    const balance = await token.balanceOf(escrowAddress);
    console.log('\n--- Escrow token balance ---');
    console.log(balance.toString(), `(${fmt(balance)} ${tokenConfig.symbol})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
