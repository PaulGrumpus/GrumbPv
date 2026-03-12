#!/usr/bin/env node

/**
 * End-to-end test: create BEP-20 escrow → fund (approve + fund) → deliver → approve → withdraw.
 * Usage: node scripts/usdt-usdc/fullFlowTest.js
 * Env: FACTORY_ADDRESS, BUYER_ADDRESS, VENDOR_ADDRESS, FEE_RECIPIENT_ADDRESS,
 *      BUYER_PRIVATE_KEY, VENDOR_PRIVATE_KEY, DEPLOYER_PRIVATE_KEY (or PRIVATE_KEY),
 *      PAYMENT_TOKEN=USDT|USDC, AMOUNT (e.g. 10 for 10 USDT).
 * Optional: ARBITER_ADDRESS. Set IPFS_CID/CONTENT_HASH for deliver step (defaults used).
 */

import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';
import { decodeError } from '../../utils/escrowUtils.js';
import { getTokenConfig, getTokenConfigByAddress } from './tokenConfig.js';

const STEP = (name) => {
  console.log('\n' + '='.repeat(60));
  console.log('  ' + name);
  console.log('='.repeat(60));
};

async function main() {
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const factoryAddress = process.env.FACTORY_ADDRESS || CONFIG.factoryAddress;
  const buyer = process.env.BUYER_ADDRESS || CONFIG.buyer;
  const vendor = process.env.VENDOR_ADDRESS || CONFIG.vendor;
  const feeRecipient = process.env.FEE_RECIPIENT_ADDRESS || CONFIG.feeRecipient;

  if (!factoryAddress || !buyer || !vendor || !feeRecipient) {
    throw new Error('Set FACTORY_ADDRESS, BUYER_ADDRESS, VENDOR_ADDRESS, FEE_RECIPIENT_ADDRESS');
  }
  if (!CONFIG.buyerPrivateKey || !CONFIG.vendorPrivateKey) {
    throw new Error('Set BUYER_PRIVATE_KEY and VENDOR_PRIVATE_KEY');
  }

  const tokenConfig = getTokenConfig(null, CONFIG.chainId);
  const amountHuman = process.env.AMOUNT || '10';
  const amountWei = BigInt(Number(amountHuman) * 10 ** tokenConfig.decimals);

  const deployer = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY || CONFIG.arbiterPrivateKey,
    provider
  );
  const buyerWallet = new ethers.Wallet(CONFIG.buyerPrivateKey, provider);
  const vendorWallet = new ethers.Wallet(CONFIG.vendorPrivateKey, provider);

  const token = new ethers.Contract(tokenConfig.address, CONFIG.erc20ABI, provider);
  const buyerTokenBalance = await token.balanceOf(buyer);
  const totalToFund = (amountWei * (10000n + 50n)) / 10000n;
  if (buyerTokenBalance < totalToFund) {
    throw new Error(
      `Buyer has ${buyerTokenBalance} ${tokenConfig.symbol}, need ${totalToFund} for funding. Get testnet ${tokenConfig.symbol} first.`
    );
  }

  const factory = new ethers.Contract(factoryAddress, CONFIG.factoryABI, deployer);
  const jobId = ethers.id(`JOB-E2E-${Date.now()}`);
  const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
  const salt = ethers.solidityPackedKeccak256(['bytes32', 'address', 'address'], [jobId, buyer, vendor]);
  const arbiter = process.env.ARBITER_ADDRESS || CONFIG.arbiter || ethers.ZeroAddress;

  STEP('1. Create BEP-20 escrow');
  const createTx = await factory.createEscrowDeterministic(
    jobId,
    buyer,
    vendor,
    arbiter,
    feeRecipient,
    100,
    tokenConfig.address,
    amountWei,
    deadline,
    50,
    50,
    50,
    25,
    salt
  );
  const createReceipt = await createTx.wait();
  const createEvent = createReceipt.logs
    .map((log) => {
      try {
        return factory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e) => e && e.name === 'EscrowCreated');
  const escrowAddress = createEvent.args.escrow;
  console.log('  Escrow:', escrowAddress);

  const escrow = new ethers.Contract(escrowAddress, CONFIG.escrowABI, provider);

  STEP('2. Buyer: approve + fund');
  const escrowWithBuyer = new ethers.Contract(escrowAddress, CONFIG.escrowABI, buyerWallet);
  const tokenWithBuyer = new ethers.Contract(tokenConfig.address, CONFIG.erc20ABI, buyerWallet);
  const approveTx = await tokenWithBuyer.approve(escrowAddress, totalToFund);
  await approveTx.wait();
  console.log('  Approve tx:', approveTx.hash);
  const fundTx = await escrowWithBuyer.fund({ value: 0n });
  await fundTx.wait();
  console.log('  Fund tx:', fundTx.hash);
  let info = await escrow.getAllInfo();
  console.log('  State:', info.state.toString(), '(1 = Funded)');

  STEP('3. Vendor: deliver');
  const cid = process.env.IPFS_CID || 'QmE2ETestBEP20';
  const contentHash = process.env.CONTENT_HASH || ethers.ZeroHash;
  const escrowWithVendor = new ethers.Contract(escrowAddress, CONFIG.escrowABI, vendorWallet);
  const deliverTx = await escrowWithVendor.deliver(cid, contentHash);
  await deliverTx.wait();
  console.log('  Deliver tx:', deliverTx.hash);
  info = await escrow.getAllInfo();
  console.log('  State:', info.state.toString(), '(2 = Delivered)');

  STEP('4. Buyer: approve CID');
  const approveCidTx = await escrowWithBuyer.approve(cid);
  await approveCidTx.wait();
  console.log('  Approve CID tx:', approveCidTx.hash);
  info = await escrow.getAllInfo();
  console.log('  State:', info.state.toString(), '(4 = Releasable)');

  STEP('5. Vendor: withdraw');
  const vendorBalBefore = await token.balanceOf(vendor);
  const withdrawTx = await escrowWithVendor.withdraw();
  await withdrawTx.wait();
  console.log('  Withdraw tx:', withdrawTx.hash);
  const vendorBalAfter = await token.balanceOf(vendor);
  const received = vendorBalAfter - vendorBalBefore;
  const cfg = getTokenConfigByAddress(info.paymentToken, CONFIG.chainId);
  console.log('  Vendor received:', (Number(received) / 10 ** cfg.decimals).toFixed(6), cfg.symbol);

  info = await escrow.getAllInfo();
  console.log('  State:', info.state.toString(), '(5 = Paid)');

  console.log('\n' + '='.repeat(60));
  console.log('  BEP-20 full flow test passed.');
  console.log('='.repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  });
