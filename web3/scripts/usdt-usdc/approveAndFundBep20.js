#!/usr/bin/env node

/**
 * Buyer: (1) Approve escrow to spend token, (2) Call fund() with no BNB.
 * Usage: node scripts/usdt-usdc/approveAndFundBep20.js
 * Env: ESCROW_ADDRESS, PAYMENT_TOKEN=USDT|USDC, BUYER_PRIVATE_KEY.
 */

import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';
import { decodeError } from '../../utils/escrowUtils.js';
import { getTokenConfigByAddress } from './tokenConfig.js';

async function main() {
  const escrowAddress = process.env.ESCROW_ADDRESS || CONFIG.escrowAddress;
  if (!escrowAddress) throw new Error('ESCROW_ADDRESS not set');
  if (!CONFIG.buyerPrivateKey) throw new Error('BUYER_PRIVATE_KEY not set');

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.buyerPrivateKey, provider);

  const escrow = new ethers.Contract(escrowAddress, CONFIG.escrowABI, wallet);
  const info = await escrow.getAllInfo();

  if (info.paymentToken === ethers.ZeroAddress) {
    throw new Error('This escrow uses BNB, not BEP-20. Use npm run fund instead.');
  }

  const tokenConfig = getTokenConfigByAddress(info.paymentToken, CONFIG.chainId);

  const projectAmount = info.amount;
  const buyerFeeBps = info.buyerFeeBps;
  const totalToApprove = (projectAmount * (10000n + buyerFeeBps)) / 10000n;

  const token = new ethers.Contract(info.paymentToken, CONFIG.erc20ABI, wallet);
  const balance = await token.balanceOf(wallet.address);
  if (balance < totalToApprove) {
    throw new Error(
      `Insufficient ${tokenConfig.symbol}: have ${balance}, need ${totalToApprove}`
    );
  }

  const decimals = tokenConfig.decimals;
  console.log('BEP-20 fund (two steps)');
  console.log('  Escrow:', escrowAddress);
  console.log('  Token:', tokenConfig.symbol, tokenConfig.address);
  console.log('  Project amount:', projectAmount.toString(), `(${Number(projectAmount) / 10 ** decimals} ${tokenConfig.symbol})`);
  console.log('  Total to approve:', totalToApprove.toString());

  try {
    const existingAllowance = await token.allowance(wallet.address, escrowAddress);
    if (existingAllowance < totalToApprove) {
      console.log('\nStep 1: Approve escrow to spend token...');
      const approveTx = await token.approve(escrowAddress, totalToApprove);
      await approveTx.wait();
      console.log('  Approved. Tx:', approveTx.hash);
    } else {
      console.log('\nStep 1: Already approved (skip).');
    }

    console.log('\nStep 2: Call fund() (no BNB value)...');
    const fundTx = await escrow.fund({ value: 0n });
    await fundTx.wait();
    console.log('  Funded. Tx:', fundTx.hash);

    const updated = await escrow.getAllInfo();
    console.log('\nState:', updated.state.toString(), '(1 = Funded)');
    console.log('Amount in escrow:', updated.amount.toString());
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
