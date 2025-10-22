/**
 * Complete Factory + Escrow Integration Example
 * 
 * This example demonstrates:
 * 1. Deploying implementation and factory
 * 2. Creating escrows via factory
 * 3. Full escrow lifecycle
 * 4. Event listening
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';
import {
  getEscrowContract,
  getFactoryContract,
  getEscrowInfo,
  formatEscrowInfo,
  calculateBuyerFunding,
  getSigner,
  waitForTransaction,
  listenForEscrowCreation
} from '../utils/escrowUtils.js';

async function main() {
  console.log('🚀 Factory + Escrow Integration Example\n');
  
  // ========================================
  // 1. SETUP
  // ========================================
  console.log('1️⃣  SETUP');
  console.log('─'.repeat(60));
  
  const buyer = getSigner(process.env.BUYER_PRIVATE_KEY);
  const seller = getSigner(process.env.VENDOR_PRIVATE_KEY);
  const arbiter = getSigner(process.env.ARBITER_PRIVATE_KEY);
  
  console.log('Buyer:', await buyer.getAddress());
  console.log('Seller:', await seller.getAddress());
  console.log('Arbiter:', await arbiter.getAddress());
  console.log();
  
  // ========================================
  // 2. CREATE ESCROW VIA FACTORY
  // ========================================
  console.log('2️⃣  CREATE ESCROW VIA FACTORY');
  console.log('─'.repeat(60));
  
  const factory = getFactoryContract(buyer);
  
  const jobId = ethers.id(`JOB-${Date.now()}`);
  const projectAmount = ethers.parseEther('1.0');
  const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now
  
  console.log('Creating escrow...');
  const createTx = await factory.createEscrow(
    jobId,
    await buyer.getAddress(),
    await seller.getAddress(),
    await arbiter.getAddress(),
    CONFIG.feeRecipient || await buyer.getAddress(),
    100, // 1% total fee
    ethers.ZeroAddress, // Native BNB
    projectAmount,
    deadline,
    50, // 0.5% buyer fee
    50, // 0.5% vendor fee
    50, // 0.5% dispute fee
    25  // 0.25% reward rate
  );
  
  const createReceipt = await createTx.wait();
  
  // Parse event to get escrow address
  const event = createReceipt.logs
    .map(log => {
      try {
        return factory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(e => e && e.name === 'EscrowCreated');
  
  const escrowAddress = event.args.escrow;
  console.log('✅ Escrow created at:', escrowAddress);
  console.log('⛽ Gas used:', createReceipt.gasUsed.toString(), '(~100k)');
  console.log();
  
  // ========================================
  // 3. FUND ESCROW
  // ========================================
  console.log('3️⃣  BUYER FUNDS ESCROW');
  console.log('─'.repeat(60));
  
  const escrow = getEscrowContract(escrowAddress, buyer);
  
  // Calculate funding amount (project + 0.5% buyer fee)
  const buyerFee = (projectAmount * 50n) / 10000n;
  const totalFunding = projectAmount + buyerFee;
  
  console.log('Project amount:', ethers.formatEther(projectAmount), 'BNB');
  console.log('Buyer fee (0.5%):', ethers.formatEther(buyerFee), 'BNB');
  console.log('Total funding:', ethers.formatEther(totalFunding), 'BNB');
  
  const fundTx = await escrow.fund({ value: totalFunding });
  await waitForTransaction(fundTx, 'Funding escrow');
  
  // Check state
  let info = await getEscrowInfo(escrowAddress);
  console.log('State:', info.stateName);
  console.log();
  
  // ========================================
  // 4. SELLER DELIVERS
  // ========================================
  console.log('4️⃣  SELLER DELIVERS WORK');
  console.log('─'.repeat(60));
  
  const escrowAsSeller = getEscrowContract(escrowAddress, seller);
  const cid = 'QmExampleIPFSHash123456';
  const contentHash = ethers.id('content');
  
  console.log('Delivering CID:', cid);
  const deliverTx = await escrowAsSeller.deliver(cid, contentHash);
  await waitForTransaction(deliverTx, 'Delivering work');
  
  info = await getEscrowInfo(escrowAddress);
  console.log('State:', info.stateName);
  console.log('Proposed CID:', info.proposedCID);
  console.log();
  
  // ========================================
  // 5. BUYER APPROVES
  // ========================================
  console.log('5️⃣  BUYER APPROVES DELIVERY');
  console.log('─'.repeat(60));
  
  console.log('Approving CID:', cid);
  const approveTx = await escrow.approve(cid);
  await waitForTransaction(approveTx, 'Approving delivery');
  
  info = await getEscrowInfo(escrowAddress);
  console.log('State:', info.stateName);
  console.log('Buyer approved:', info.buyerApproved);
  console.log('Seller approved:', info.vendorApproved);
  console.log();
  
  // ========================================
  // 6. SELLER WITHDRAWS
  // ========================================
  console.log('6️⃣  SELLER WITHDRAWS FUNDS');
  console.log('─'.repeat(60));
  
  const sellerBalanceBefore = await seller.provider.getBalance(await seller.getAddress());
  console.log('Seller balance before:', ethers.formatEther(sellerBalanceBefore), 'BNB');
  
  const withdrawTx = await escrowAsSeller.withdraw();
  await waitForTransaction(withdrawTx, 'Withdrawing funds');
  
  const sellerBalanceAfter = await seller.provider.getBalance(await seller.getAddress());
  console.log('Seller balance after:', ethers.formatEther(sellerBalanceAfter), 'BNB');
  
  const received = sellerBalanceAfter - sellerBalanceBefore;
  console.log('Amount received:', ethers.formatEther(received), 'BNB');
  
  info = await getEscrowInfo(escrowAddress);
  console.log('State:', info.stateName);
  console.log();
  
  // ========================================
  // 7. FINAL SUMMARY
  // ========================================
  console.log('7️⃣  FINAL SUMMARY');
  console.log('─'.repeat(60));
  console.log(formatEscrowInfo(info));
  
  console.log('✅ Complete escrow lifecycle finished successfully!');
}

/**
 * Example: Listen for escrow creation events
 */
async function listenExample() {
  console.log('👂 Listening for escrow creation events...\n');
  
  listenForEscrowCreation((event) => {
    console.log('🆕 New escrow created!');
    console.log('  Address:', event.escrow);
    console.log('  Job ID:', event.jobId);
    console.log('  Buyer:', event.buyer);
    console.log('  Seller:', event.seller);
    console.log('  Amount:', event.amountFormatted, 'BNB');
    console.log('  Deterministic:', event.deterministic);
    console.log('  Block:', event.blockNumber);
    console.log('  TX:', event.transactionHash);
    console.log();
  });
  
  console.log('Listening... (Press Ctrl+C to stop)');
}

/**
 * Example: Deterministic escrow creation
 */
async function deterministicExample() {
  console.log('🔮 Deterministic Escrow Creation Example\n');
  
  const factory = getFactoryContract(getSigner(process.env.BUYER_PRIVATE_KEY));
  const buyer = process.env.BUYER_ADDRESS;
  const seller = process.env.VENDOR_ADDRESS;
  
  const jobId = ethers.id('JOB-DETERMINISTIC-123');
  const salt = ethers.solidityPackedKeccak256(
    ['bytes32', 'address', 'address'],
    [jobId, buyer, seller]
  );
  
  // Predict address
  const predicted = await factory.predictEscrow(salt);
  console.log('🔮 Predicted address:', predicted);
  
  // Create escrow
  console.log('⏳ Creating escrow...');
  const deadline2 = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now
  const tx = await factory.createEscrowDeterministic(
    jobId,
    buyer,
    seller,
    ethers.ZeroAddress, // No arbiter
    buyer, // Fee recipient
    100, // 1% total fee
    ethers.ZeroAddress,
    ethers.parseEther('1.0'),
    deadline2,
    50, // 0.5% buyer fee
    50, // 0.5% vendor fee
    50, // 0.5% dispute fee
    25, // 0.25% reward rate
    salt
  );
  
  const receipt = await tx.wait();
  const event = receipt.logs
    .map(log => {
      try {
        return factory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(e => e && e.name === 'EscrowCreated');
  
  const actual = event.args.escrow;
  console.log('✅ Actual address:', actual);
  console.log('✅ Addresses match:', predicted === actual);
}

// Run based on command line argument
const command = process.argv[2];

if (import.meta.url === `file://${process.argv[1]}`) {
  let runner;
  
  switch(command) {
    case 'listen':
      runner = listenExample();
      break;
    case 'deterministic':
      runner = deterministicExample();
      break;
    default:
      runner = main();
  }
  
  runner
    .then(() => {
      if (command !== 'listen') process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main, listenExample, deterministicExample };

