/**
 * Example: Using Web3.js instead of Ethers.js
 * 
 * Alternative implementation if you prefer web3.js
 */

import Web3 from 'web3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const escrowABI = JSON.parse(
  readFileSync(join(__dirname, '..', 'abi', 'Escrow.json'), 'utf8')
);

const ESCROW_ADDRESS = '0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B';
const RPC_URL = 'https://bsc-testnet-rpc.publicnode.com/';

// ============================================
// Initialize Web3
// ============================================

const web3 = new Web3(RPC_URL);

// ============================================
// Get Escrow Info
// ============================================

export async function getEscrowInfo() {
  const contract = new web3.eth.Contract(escrowABI, ESCROW_ADDRESS);
  
  const info = await contract.methods.getAllInfo().call();
  
  return {
    buyer: info.buyer,
    vendor: info.vendor,
    amount: web3.utils.fromWei(info.amount, 'ether'),
    state: info.state,
    stateName: ['Unfunded', 'Funded', 'Delivered', 'Disputed', 'Releasable', 'Paid', 'Refunded'][info.state],
    proposedCID: info.proposedCID,
    buyerApproved: info.buyerApproved,
    vendorApproved: info.vendorApproved
  };
}

// ============================================
// Fund Escrow
// ============================================

export async function fundEscrow(privateKey, amountBNB) {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  
  const contract = new web3.eth.Contract(escrowABI, ESCROW_ADDRESS);
  
  const tx = await contract.methods.fund().send({
    from: account.address,
    value: web3.utils.toWei(amountBNB.toString(), 'ether'),
    gas: 200000
  });
  
  console.log('Transaction hash:', tx.transactionHash);
  return tx;
}

// ============================================
// Deliver Work
// ============================================

export async function deliverWork(privateKey, cid, contentHash = '0x' + '0'.repeat(64)) {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  
  const contract = new web3.eth.Contract(escrowABI, ESCROW_ADDRESS);
  
  const tx = await contract.methods.deliver(cid, contentHash).send({
    from: account.address,
    gas: 150000
  });
  
  console.log('Transaction hash:', tx.transactionHash);
  return tx;
}

// ============================================
// Approve Work
// ============================================

export async function approveWork(privateKey, cid) {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  
  const contract = new web3.eth.Contract(escrowABI, ESCROW_ADDRESS);
  
  const tx = await contract.methods.approve(cid).send({
    from: account.address,
    gas: 100000
  });
  
  console.log('Transaction hash:', tx.transactionHash);
  return tx;
}

// ============================================
// Withdraw Payment
// ============================================

export async function withdrawPayment(privateKey) {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  
  const contract = new web3.eth.Contract(escrowABI, ESCROW_ADDRESS);
  
  const tx = await contract.methods.withdraw().send({
    from: account.address,
    gas: 300000
  });
  
  console.log('Transaction hash:', tx.transactionHash);
  return tx;
}

// ============================================
// Listen to Events
// ============================================

export function listenToEvents(callback) {
  const contract = new web3.eth.Contract(escrowABI, ESCROW_ADDRESS);
  
  contract.events.allEvents({}, (error, event) => {
    if (error) {
      console.error('Event error:', error);
      return;
    }
    
    callback({
      event: event.event,
      returnValues: event.returnValues,
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber
    });
  });
}

// ============================================
// Example Usage
// ============================================

async function example() {
  console.log('Getting escrow info...');
  const info = await getEscrowInfo();
  console.log('Escrow info:', info);
  
  // Listen to events
  listenToEvents((event) => {
    console.log('New event:', event.event, event.returnValues);
  });
}

// Uncomment to run example
// example();

