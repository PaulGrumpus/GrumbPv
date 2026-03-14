#!/usr/bin/env node

/**
 * Create an escrow with BEP-20 payment token (USDT or USDC).
 * Usage: node scripts/usdt-usdc/createEscrowBep20.js
 * Env: PAYMENT_TOKEN=USDT|USDC, AMOUNT_WEI (token units, e.g. 100000000 for 100 USDT),
 *      or AMOUNT=100 (human) with 6 decimals for USDT/USDC.
 *      BUYER_ADDRESS, VENDOR_ADDRESS, FEE_RECIPIENT_ADDRESS, FACTORY_ADDRESS, etc.
 */

import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';
import { getTokenConfig } from './tokenConfig.js';

async function main() {
  const factoryAddress = process.env.FACTORY_ADDRESS || CONFIG.factoryAddress;
  if (!factoryAddress) {
    throw new Error('FACTORY_ADDRESS not set');
  }

  const tokenConfig = getTokenConfig(null, CONFIG.chainId);
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY || CONFIG.arbiterPrivateKey,
    provider
  );

  const buyer = process.env.BUYER_ADDRESS || CONFIG.buyer;
  const seller = process.env.VENDOR_ADDRESS || CONFIG.vendor;
  const feeRecipient = process.env.FEE_RECIPIENT_ADDRESS || CONFIG.feeRecipient;
  const arbiter = process.env.ARBITER_ADDRESS || CONFIG.arbiter || ethers.ZeroAddress;

  if (!buyer || !seller || !feeRecipient) {
    throw new Error('Set BUYER_ADDRESS, VENDOR_ADDRESS, FEE_RECIPIENT_ADDRESS');
  }

  // Amount: AMOUNT_WEI (raw) or AMOUNT (human, e.g. 100 => 100e6 for USDT)
  let amountWei;
  if (process.env.AMOUNT_WEI) {
    amountWei = BigInt(process.env.AMOUNT_WEI);
  } else {
    const amountHuman = process.env.AMOUNT || '100';
    amountWei = BigInt(Number(amountHuman) * 10 ** tokenConfig.decimals);
  }

  const jobId = process.env.JOB_ID || ethers.id(`JOB-BEP20-${Date.now()}`);
  const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
  const feeBps = 100;
  const buyerFeeBps = 50;
  const vendorFeeBps = 50;
  const disputeFeeBps = 50;
  const rewardRateBps = 25;

  const factory = new ethers.Contract(factoryAddress, CONFIG.factoryABI, wallet);

  console.log('Creating BEP-20 escrow');
  console.log('  Token:', tokenConfig.symbol, tokenConfig.address);
  console.log('  Amount (wei):', amountWei.toString(), `(${Number(amountWei) / 10 ** tokenConfig.decimals} ${tokenConfig.symbol})`);
  console.log('  Buyer:', buyer);
  console.log('  Seller:', seller);
  console.log('  Factory:', factoryAddress);

  const salt = ethers.solidityPackedKeccak256(
    ['bytes32', 'address', 'address'],
    [jobId, buyer, seller]
  );
  const predicted = await factory.predictEscrow(salt);

  const tx = await factory.createEscrowDeterministic(
    jobId,
    buyer,
    seller,
    arbiter,
    feeRecipient,
    feeBps,
    tokenConfig.address,
    amountWei,
    deadline,
    buyerFeeBps,
    vendorFeeBps,
    disputeFeeBps,
    rewardRateBps,
    salt
  );
  const receipt = await tx.wait();

  const event = receipt.logs
    .map((log) => {
      try {
        return factory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e) => e && e.name === 'EscrowCreated');
  const escrowAddress = event.args.escrow;

  console.log('\nEscrow created:', escrowAddress);
  console.log('Predicted:', predicted);
  console.log('Match:', escrowAddress === predicted);
  console.log('\nSet in .env:');
  console.log('  ESCROW_ADDRESS=' + escrowAddress);
  console.log('  PAYMENT_TOKEN=' + tokenConfig.symbol);
  console.log('  AMOUNT_WEI=' + amountWei.toString());
  console.log('\nNext: Buyer runs approveAndFundBep20 (approve then fund).');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
