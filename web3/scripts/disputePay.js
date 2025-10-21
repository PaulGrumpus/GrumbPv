#!/usr/bin/env node

/**
 * Pay dispute fee as counterparty
 * Usage: npm run dispute-pay
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  const role = process.env.DISPUTE_PAYER || 'vendor'; // who is paying
  const privateKey = role === 'buyer' ? CONFIG.buyerPrivateKey : CONFIG.vendorPrivateKey;
  
  if (!privateKey) {
    throw new Error(`${role.toUpperCase()}_PRIVATE_KEY not set`);
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`Paying dispute fee as ${role}:`, wallet.address);
  
  const escrow = new ethers.Contract(CONFIG.escrowAddress, CONFIG.escrowABI, wallet);
  
  const info = await escrow.getAllInfo();
  const disputeFee = info.disputeFeeAmount;
  
  console.log('Dispute fee:', ethers.formatEther(disputeFee), 'BNB');
  console.log('Initiator:', info.disputeInitiator);
  console.log('Deadline:', new Date(Number(info.disputeFeeDeadline) * 1000).toISOString());
  
  // Vendor must pay, buyer uses reserved
  const value = role === 'vendor' ? disputeFee : 0n;
  
  console.log('\nSending transaction...');
  const tx = await escrow.payDisputeFee({ value });
  console.log('Transaction hash:', tx.hash);
  
  const receipt = await tx.wait();
  
  console.log('\n✅ Dispute fee paid!');
  console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
  console.log('\n⚠️  Both parties have now paid. Arbiter can resolve the dispute.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

