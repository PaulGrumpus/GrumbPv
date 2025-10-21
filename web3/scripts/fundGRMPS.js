#!/usr/bin/env node

/**
 * Transfer GRMPS tokens to escrow for rewards
 * Usage: npm run fund-grmps
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

async function main() {
  if (!CONFIG.arbiterPrivateKey) {
    throw new Error('ARBITER_PRIVATE_KEY not set (or use your private key)');
  }
  
  if (!CONFIG.grmpsToken || CONFIG.grmpsToken.startsWith('0x6234')) {
    throw new Error('GRMPS_TOKEN_ADDRESS not properly set in .env');
  }
  
  const amount = process.env.GRMPS_AMOUNT || '300'; // Default 300 GRMPS
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(CONFIG.arbiterPrivateKey, provider);
  
  console.log('Funding escrow with GRMPS');
  console.log('From:', wallet.address);
  console.log('To:', CONFIG.escrowAddress);
  console.log('Amount:', amount, 'GRMPS');
  
  // Create GRMPS contract instance
  const grmps = new ethers.Contract(
    CONFIG.grmpsToken,
    CONFIG.erc20ABI,
    wallet
  );
  
  // Check balance
  const balance = await grmps.balanceOf(wallet.address);
  console.log('\nYour GRMPS balance:', ethers.formatEther(balance), 'GRMPS');
  
  const amountWei = ethers.parseEther(amount);
  if (balance < amountWei) {
    throw new Error('Insufficient GRMPS balance');
  }
  
  // Transfer GRMPS to escrow
  console.log('\nSending transaction...');
  const tx = await grmps.transfer(CONFIG.escrowAddress, amountWei);
  console.log('Transaction hash:', tx.hash);
  
  const receipt = await tx.wait();
  
  console.log('\n✅ GRMPS transferred successfully!');
  console.log('Transaction:', `https://testnet.bscscan.com/tx/${receipt.hash}`);
  
  // Check escrow balance
  const escrowBalance = await grmps.balanceOf(CONFIG.escrowAddress);
  console.log('\nEscrow GRMPS balance:', ethers.formatEther(escrowBalance), 'GRMPS');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });

