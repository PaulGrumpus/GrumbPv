import { ethers } from 'ethers';
import { CONFIG, STATES } from '../config.js';

/**
 * Utility functions for interacting with Escrow contracts
 */

/**
 * Get escrow contract instance
 * @param {string} escrowAddress - Address of the escrow contract
 * @param {ethers.Signer} [signer] - Optional signer for write operations
 * @returns {ethers.Contract} Escrow contract instance
 */
export function getEscrowContract(escrowAddress, signer = null) {
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  return new ethers.Contract(
    escrowAddress,
    CONFIG.escrowABI,
    signer || provider
  );
}

/**
 * Get factory contract instance
 * @param {ethers.Signer} [signer] - Optional signer for write operations
 * @returns {ethers.Contract} Factory contract instance
 */
export function getFactoryContract(signer = null) {
  const factoryAddress = process.env.FACTORY_ADDRESS || CONFIG.factoryAddress;
  if (!factoryAddress) {
    throw new Error('FACTORY_ADDRESS not set');
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  return new ethers.Contract(
    factoryAddress,
    CONFIG.factoryABI,
    signer || provider
  );
}

/**
 * Get all escrow information
 * @param {string} escrowAddress - Address of the escrow contract
 * @returns {Promise<object>} All escrow info
 */
export async function getEscrowInfo(escrowAddress) {
  const escrow = getEscrowContract(escrowAddress);
  const info = await escrow.getAllInfo();
  
  return {
    buyer: info.buyer,
    vendor: info.vendor,
    arbiter: info.arbiter,
    feeRecipient: info.feeRecipient,
    rewardToken: info.rewardToken,
    rewardRatePer1e18: info.rewardRatePer1e18.toString(),
    amount: info.amount.toString(),
    amountFormatted: ethers.formatEther(info.amount),
    buyerFeeReserve: info.buyerFeeReserve.toString(),
    buyerFeeReserveFormatted: ethers.formatEther(info.buyerFeeReserve),
    disputeFeeAmount: info.disputeFeeAmount.toString(),
    disputeFeeAmountFormatted: ethers.formatEther(info.disputeFeeAmount),
    deadline: info.deadline.toString(),
    deadlineDate: new Date(Number(info.deadline) * 1000).toISOString(),
    disputeFeeDeadline: info.disputeFeeDeadline.toString(),
    disputeFeeDeadlineDate: info.disputeFeeDeadline > 0 
      ? new Date(Number(info.disputeFeeDeadline) * 1000).toISOString()
      : 'N/A',
    disputeInitiator: info.disputeInitiator,
    buyerPaidDisputeFee: info.buyerPaidDisputeFee,
    vendorPaidDisputeFee: info.vendorPaidDisputeFee,
    cid: info.cid,
    contentHash: info.contentHash,
    proposedCID: info.proposedCID,
    proposedContentHash: info.proposedContentHash,
    buyerApproved: info.buyerApproved,
    vendorApproved: info.vendorApproved,
    state: Number(info.state),
    stateName: STATES[Number(info.state)]
  };
}

/**
 * Calculate buyer's funding amount (project amount + 0.5% fee)
 * @param {string} projectAmount - Project amount in ETH
 * @returns {string} Total amount buyer needs to send
 */
export function calculateBuyerFunding(projectAmount) {
  const amount = ethers.parseEther(projectAmount);
  const fee = (amount * 50n) / 10000n; // 0.5%
  return ethers.formatEther(amount + fee);
}

/**
 * Calculate dispute fee (0.5% of project amount)
 * @param {string} projectAmount - Project amount in ETH
 * @returns {string} Dispute fee amount
 */
export function calculateDisputeFee(projectAmount) {
  const amount = ethers.parseEther(projectAmount);
  const fee = (amount * 50n) / 10000n; // 0.5%
  return ethers.formatEther(fee);
}

/**
 * Check if escrow is releasable (ready for withdrawal)
 * @param {string} escrowAddress - Address of the escrow contract
 * @returns {Promise<boolean>} True if releasable
 */
export async function isReleasable(escrowAddress) {
  const escrow = getEscrowContract(escrowAddress);
  return await escrow.isReleasable();
}

/**
 * Get participants (buyer, vendor, arbiter, feeRecipient)
 * @param {string} escrowAddress - Address of the escrow contract
 * @returns {Promise<object>} Participants object
 */
export async function getParticipants(escrowAddress) {
  const escrow = getEscrowContract(escrowAddress);
  const [buyer, vendor, arbiter, feeRecipient] = await escrow.participants();
  
  return { buyer, vendor, arbiter, feeRecipient };
}

/**
 * Get escrow state
 * @param {string} escrowAddress - Address of the escrow contract
 * @returns {Promise<object>} State info
 */
export async function getState(escrowAddress) {
  const escrow = getEscrowContract(escrowAddress);
  const state = await escrow.getState();
  
  return {
    stateId: Number(state),
    stateName: STATES[Number(state)]
  };
}

/**
 * Wait for transaction and log result
 * @param {Promise} txPromise - Transaction promise
 * @param {string} action - Action description
 * @returns {Promise<object>} Transaction receipt
 */
export async function waitForTransaction(txPromise, action = 'Transaction') {
  console.log(`⏳ ${action}...`);
  const tx = await txPromise;
  console.log('📝 Transaction hash:', tx.hash);
  
  console.log('⏳ Waiting for confirmation...');
  const receipt = await tx.wait();
  
  console.log('✅ Confirmed in block:', receipt.blockNumber);
  console.log('⛽ Gas used:', receipt.gasUsed.toString());
  
  return receipt;
}

/**
 * Format escrow info for display
 * @param {object} info - Escrow info from getEscrowInfo
 * @returns {string} Formatted string
 */
export function formatEscrowInfo(info) {
  return `
╔════════════════════════════════════════════════════════════════╗
║                      ESCROW INFORMATION                        ║
╠════════════════════════════════════════════════════════════════╣
║ State: ${info.stateName.padEnd(55)}║
║ Amount: ${(info.amountFormatted + ' BNB').padEnd(54)}║
║ Buyer Fee Reserve: ${(info.buyerFeeReserveFormatted + ' BNB').padEnd(43)}║
╠════════════════════════════════════════════════════════════════╣
║ Buyer: ${info.buyer.padEnd(55)}║
║ Vendor: ${info.vendor.padEnd(54)}║
║ Arbiter: ${info.arbiter.padEnd(53)}║
║ Fee Recipient: ${info.feeRecipient.padEnd(47)}║
╠════════════════════════════════════════════════════════════════╣
║ Deadline: ${info.deadlineDate.padEnd(52)}║
║ Proposed CID: ${(info.proposedCID || 'N/A').padEnd(48)}║
║ Buyer Approved: ${(info.buyerApproved ? 'Yes' : 'No').padEnd(48)}║
║ Vendor Approved: ${(info.vendorApproved ? 'Yes' : 'No').padEnd(47)}║
╠════════════════════════════════════════════════════════════════╣
║ Dispute Fee: ${(info.disputeFeeAmountFormatted + ' BNB').padEnd(49)}║
║ Buyer Paid Fee: ${(info.buyerPaidDisputeFee ? 'Yes' : 'No').padEnd(48)}║
║ Vendor Paid Fee: ${(info.vendorPaidDisputeFee ? 'Yes' : 'No').padEnd(47)}║
╚════════════════════════════════════════════════════════════════╝
`;
}

/**
 * Create a signer from private key
 * @param {string} privateKey - Private key
 * @returns {ethers.Wallet} Wallet instance
 */
export function getSigner(privateKey) {
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Decode custom error from contract
 * @param {Error} error - Error object from contract call
 * @param {ethers.Interface} contractInterface - Contract interface
 * @returns {string} Human-readable error message
 */
export function decodeError(error, contractInterface) {
  if (!error.data) return error.message;
  
  try {
    // Try to decode the error
    const decodedError = contractInterface.parseError(error.data);
    
    if (!decodedError) return error.message;
    
    // Map errors to user-friendly messages
    const errorMessages = {
      'OnlyBuyer': '❌ Only the buyer can perform this action',
      'OnlyVendor': '❌ Only the vendor can perform this action',
      'OnlyParticipant': '❌ Only buyer or vendor can perform this action',
      'BadState': '❌ Invalid state for this operation. Check escrow state with: npm run info',
      'BadValue': '❌ Invalid payment amount',
      'DeadlineNotReached': '❌ Project deadline has not been reached yet',
      'CIDMismatch': '❌ CID does not match the proposed CID',
      'NoArbiter': '❌ This escrow has no arbiter for dispute resolution',
      'InsufficientDisputeFee': '❌ Insufficient dispute fee payment',
      'DisputeFeeAlreadyPaid': '❌ Dispute fee already paid',
      'DisputeFeeDeadlinePassed': '❌ Dispute fee deadline has passed. Use resolveDisputeByDefault instead',
      'DisputeFeeDeadlineNotPassed': '❌ Dispute fee deadline has not passed yet',
      'BothPartiesNotPaid': '❌ Both parties have not paid dispute fees',
      'AlreadyInitialized': '❌ Escrow already initialized',
      'CancelWindowPassed': '❌ Cancel window has passed (only available in first 20% of deadline)',
    };
    
    const friendlyMessage = errorMessages[decodedError.name];
    
    if (friendlyMessage) {
      // Add additional context for BadState
      if (decodedError.name === 'BadState') {
        return `${friendlyMessage}\n\n💡 Common reasons:\n  - Escrow already completed (Paid/Refunded)\n  - Wrong operation for current state\n  - Create a new escrow: npm run create:escrow`;
      }
      return friendlyMessage;
    }
    
    return `❌ ${decodedError.name}: ${decodedError.args.join(', ')}`;
  } catch (e) {
    // If we can't decode, return original error
    return error.message;
  }
}

/**
 * Check wallet balance
 * @param {string} address - Wallet address
 * @returns {Promise<string>} Balance in ETH
 */
export async function getBalance(address) {
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Predict escrow address for deterministic deployment
 * @param {string} salt - Salt for CREATE2
 * @returns {Promise<string>} Predicted address
 */
export async function predictEscrowAddress(salt) {
  const factory = getFactoryContract();
  return await factory.predictEscrow(salt);
}

/**
 * Generate salt for deterministic deployment
 * @param {string} jobId - Job identifier
 * @param {string} buyer - Buyer address
 * @param {string} seller - Seller address
 * @returns {string} Generated salt
 */
export function generateSalt(jobId, buyer, seller) {
  return ethers.solidityPackedKeccak256(
    ['bytes32', 'address', 'address'],
    [jobId, buyer, seller]
  );
}

/**
 * Listen for factory events
 * @param {Function} callback - Callback function for events
 * @returns {ethers.Contract} Factory contract with listener attached
 */
export function listenForEscrowCreation(callback) {
  const factory = getFactoryContract();
  
  factory.on('EscrowCreated', (jobId, escrow, buyer, seller, arbiter, feeRecipient, feeBps, paymentToken, amountWei, deterministic, event) => {
    callback({
      jobId,
      escrow,
      buyer,
      seller,
      arbiter,
      feeRecipient,
      feeBps: Number(feeBps),
      paymentToken,
      amountWei: amountWei.toString(),
      amountFormatted: ethers.formatEther(amountWei),
      deterministic,
      blockNumber: event.log.blockNumber,
      transactionHash: event.log.transactionHash
    });
  });
  
  return factory;
}

/**
 * Get all escrows created by factory (requires event indexing)
 * @param {number} fromBlock - Starting block number
 * @param {number} toBlock - Ending block number ('latest' for current)
 * @returns {Promise<Array>} Array of escrow creation events
 */
export async function getCreatedEscrows(fromBlock = 0, toBlock = 'latest') {
  const factory = getFactoryContract();
  const provider = factory.runner.provider;
  
  // Get current block if toBlock is 'latest'
  const endBlock = toBlock === 'latest' ? await provider.getBlockNumber() : parseInt(toBlock);
  const startBlock = parseInt(fromBlock);
  
  // BSC RPC limits: 5000 blocks per query to be safe
  const CHUNK_SIZE = 5000;
  const allEvents = [];
  
  // Query in chunks
  for (let from = startBlock; from <= endBlock; from += CHUNK_SIZE) {
    const to = Math.min(from + CHUNK_SIZE - 1, endBlock);
    
    try {
      const filter = factory.filters.EscrowCreated();
      const events = await factory.queryFilter(filter, from, to);
      allEvents.push(...events);
    } catch (error) {
      console.log(`⚠️  Error querying blocks ${from}-${to}:`, error.message);
    }
  }
  
  return allEvents.map(event => ({
    jobId: event.args.jobId,
    escrow: event.args.escrow,
    buyer: event.args.buyer,
    seller: event.args.seller,
    arbiter: event.args.arbiter,
    feeRecipient: event.args.feeRecipient,
    feeBps: Number(event.args.feeBps),
    paymentToken: event.args.paymentToken,
    amountWei: event.args.amountWei.toString(),
    amountFormatted: ethers.formatEther(event.args.amountWei),
    deterministic: event.args.deterministic,
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash
  }));
}

export default {
  getEscrowContract,
  getFactoryContract,
  getEscrowInfo,
  calculateBuyerFunding,
  calculateDisputeFee,
  isReleasable,
  getParticipants,
  getState,
  waitForTransaction,
  formatEscrowInfo,
  getSigner,
  getBalance,
  predictEscrowAddress,
  generateSalt,
  listenForEscrowCreation,
  getCreatedEscrows
};

