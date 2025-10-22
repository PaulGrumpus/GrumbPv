# Web3.js Integration Guide

Complete guide for interacting with the Escrow and EscrowFactory contracts using JavaScript/Node.js.

## 📋 Table of Contents

- [Setup](#setup)
- [Quick Start](#quick-start)
- [Factory Operations](#factory-operations)
- [Escrow Operations](#escrow-operations)
- [Utility Functions](#utility-functions)
- [Examples](#examples)
- [API Reference](#api-reference)

## 🚀 Setup

### 1. Install Dependencies

```bash
cd web3
npm install
```

### 2. Configure Environment

Create a `.env` file in the `web3` directory:

```bash
# Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97

# Deployed Contracts
FACTORY_ADDRESS=0x...
ESCROW_IMPLEMENTATION_ADDRESS=0x...
ESCROW_ADDRESS=0x...  # For direct escrow interaction

# Participants
BUYER_ADDRESS=0x...
VENDOR_ADDRESS=0x...
ARBITER_ADDRESS=0x...
FEE_RECIPIENT_ADDRESS=0x...

# Private Keys (use carefully!)
DEPLOYER_PRIVATE_KEY=0x...
BUYER_PRIVATE_KEY=0x...
VENDOR_PRIVATE_KEY=0x...
ARBITER_PRIVATE_KEY=0x...
```

### 3. Build Contract ABIs

```bash
cd ../contract
forge build
cd ../web3
```

The ABIs are automatically extracted to `web3/abi/`.

## ⚡ Quick Start

### Deploy Factory System

```bash
# 1. Deploy implementation
npm run deploy:implementation

# 2. Copy the implementation address to .env
export ESCROW_IMPLEMENTATION_ADDRESS=0x...

# 3. Deploy factory
npm run deploy:factory

# 4. Copy the factory address to .env
export FACTORY_ADDRESS=0x...
```

### Create and Use Escrow

```bash
# 1. Create new escrow
npm run create:escrow

# 2. Fund escrow (buyer)
npm run fund

# 3. Deliver work (seller)
npm run deliver

# 4. Approve delivery (buyer)
npm run approve

# 5. Withdraw funds (seller)
npm run withdraw
```

## 🏭 Factory Operations

### Deploy Implementation

```javascript
import { deployImplementation } from './scripts/factory/deployImplementation.js';

const implementationAddress = await deployImplementation();
```

Or via CLI:
```bash
npm run deploy:implementation
```

### Deploy Factory

```javascript
import { deployFactory } from './scripts/factory/deployFactory.js';

// Set ESCROW_IMPLEMENTATION_ADDRESS in .env first
const factoryAddress = await deployFactory();
```

Or via CLI:
```bash
export ESCROW_IMPLEMENTATION_ADDRESS=0x...
npm run deploy:factory
```

### Create Escrow (Non-Deterministic)

```javascript
import { createEscrow } from './scripts/factory/createEscrow.js';

const escrowAddress = await createEscrow({
  buyer: '0x...',
  seller: '0x...',
  arbiter: '0x...',
  feeRecipient: '0x...',
  feeBps: 100,              // 1%
  amount: '1.0',            // 1 BNB
  jobId: ethers.id('JOB-123')
});
```

Or via CLI:
```bash
npm run create:escrow
```

### Create Escrow (Deterministic)

```javascript
const escrowAddress = await createEscrow({
  buyer: '0x...',
  seller: '0x...',
  arbiter: '0x...',
  feeRecipient: '0x...',
  feeBps: 100,
  amount: '1.0',
  deterministic: true,
  salt: '0x...'  // Optional, will be generated if not provided
});
```

Or via CLI:
```bash
npm run create:escrow -- --deterministic true --buyer 0x... --seller 0x...
```

### Predict Escrow Address

```javascript
import { predictEscrowAddress, generateSalt } from './utils/escrowUtils.js';

const salt = generateSalt(jobId, buyer, seller);
const predictedAddress = await predictEscrowAddress(salt);

console.log('Escrow will be created at:', predictedAddress);
```

Or via CLI:
```bash
export JOB_ID=0x...
export BUYER_ADDRESS=0x...
export VENDOR_ADDRESS=0x...
npm run predict:address
```

### List All Created Escrows

```javascript
import { getCreatedEscrows } from './utils/escrowUtils.js';

const escrows = await getCreatedEscrows(0, 'latest');

escrows.forEach(escrow => {
  console.log('Escrow:', escrow.escrow);
  console.log('Buyer:', escrow.buyer);
  console.log('Amount:', escrow.amountFormatted, 'BNB');
});
```

Or via CLI:
```bash
npm run list:escrows
```

### Listen for Escrow Creation Events

```javascript
import { listenForEscrowCreation } from './utils/escrowUtils.js';

listenForEscrowCreation((event) => {
  console.log('New escrow created:', event.escrow);
  console.log('Buyer:', event.buyer);
  console.log('Seller:', event.seller);
  console.log('Amount:', event.amountFormatted, 'BNB');
});
```

## 💼 Escrow Operations

### Fund Escrow

```javascript
import { getEscrowContract, getSigner } from './utils/escrowUtils.js';
import { ethers } from 'ethers';

const buyer = getSigner(process.env.BUYER_PRIVATE_KEY);
const escrow = getEscrowContract(escrowAddress, buyer);

// Calculate funding (project amount + 0.5% buyer fee)
const projectAmount = ethers.parseEther('1.0');
const buyerFee = (projectAmount * 50n) / 10000n;
const total = projectAmount + buyerFee;

await escrow.fund({ value: total });
```

Or via CLI:
```bash
export ESCROW_ADDRESS=0x...
npm run fund
```

### Deliver Work

```javascript
const seller = getSigner(process.env.VENDOR_PRIVATE_KEY);
const escrow = getEscrowContract(escrowAddress, seller);

const cid = 'QmYourIPFSHash';
const contentHash = ethers.id('content');

await escrow.deliver(cid, contentHash);
```

Or via CLI:
```bash
npm run deliver
```

### Approve Delivery

```javascript
const buyer = getSigner(process.env.BUYER_PRIVATE_KEY);
const escrow = getEscrowContract(escrowAddress, buyer);

const cid = 'QmYourIPFSHash';
await escrow.approve(cid);
```

Or via CLI:
```bash
npm run approve
```

### Withdraw Funds

```javascript
const seller = getSigner(process.env.VENDOR_PRIVATE_KEY);
const escrow = getEscrowContract(escrowAddress, seller);

await escrow.withdraw();
```

Or via CLI:
```bash
npm run withdraw
```

### Cancel Escrow

```javascript
const buyer = getSigner(process.env.BUYER_PRIVATE_KEY);
const escrow = getEscrowContract(escrowAddress, buyer);

await escrow.cancel();
```

Or via CLI:
```bash
npm run cancel
```

### Initiate Dispute

```javascript
const buyer = getSigner(process.env.BUYER_PRIVATE_KEY);
const escrow = getEscrowContract(escrowAddress, buyer);

// Buyer uses reserved fee, no payment needed
await escrow.initiateDispute();

// If seller initiates, they must pay dispute fee
const seller = getSigner(process.env.VENDOR_PRIVATE_KEY);
const escrowAsSeller = getEscrowContract(escrowAddress, seller);
const disputeFee = (projectAmount * 50n) / 10000n; // 0.5%
await escrowAsSeller.initiateDispute({ value: disputeFee });
```

Or via CLI:
```bash
npm run dispute-init
```

### Pay Dispute Fee

```javascript
// Counterparty pays their fee
const seller = getSigner(process.env.VENDOR_PRIVATE_KEY);
const escrow = getEscrowContract(escrowAddress, seller);

const disputeFee = (projectAmount * 50n) / 10000n;
await escrow.payDisputeFee({ value: disputeFee });
```

Or via CLI:
```bash
npm run dispute-pay
```

### Resolve Dispute

```javascript
const arbiter = getSigner(process.env.ARBITER_PRIVATE_KEY);
const escrow = getEscrowContract(escrowAddress, arbiter);

// Resolve to seller
await escrow.resolveToVendor();

// Or resolve to buyer
await escrow.resolveToBuyer();
```

Or via CLI:
```bash
npm run dispute-resolve
```

## 🛠️ Utility Functions

### Get Escrow Information

```javascript
import { getEscrowInfo, formatEscrowInfo } from './utils/escrowUtils.js';

const info = await getEscrowInfo(escrowAddress);

console.log('State:', info.stateName);
console.log('Amount:', info.amountFormatted, 'BNB');
console.log('Buyer:', info.buyer);
console.log('Seller:', info.vendor);

// Pretty print
console.log(formatEscrowInfo(info));
```

Or via CLI:
```bash
npm run info
```

### Calculate Funding Amount

```javascript
import { calculateBuyerFunding } from './utils/escrowUtils.js';

const projectAmount = '1.0'; // 1 BNB
const totalFunding = calculateBuyerFunding(projectAmount);

console.log('Buyer must send:', totalFunding, 'BNB');
// Output: Buyer must send: 1.005 BNB
```

### Calculate Dispute Fee

```javascript
import { calculateDisputeFee } from './utils/escrowUtils.js';

const projectAmount = '1.0'; // 1 BNB
const disputeFee = calculateDisputeFee(projectAmount);

console.log('Dispute fee:', disputeFee, 'BNB');
// Output: Dispute fee: 0.005 BNB
```

### Check if Releasable

```javascript
import { isReleasable } from './utils/escrowUtils.js';

const releasable = await isReleasable(escrowAddress);

if (releasable) {
  console.log('✅ Escrow is ready for withdrawal');
} else {
  console.log('❌ Escrow is not yet releasable');
}
```

### Get Participants

```javascript
import { getParticipants } from './utils/escrowUtils.js';

const { buyer, vendor, arbiter, feeRecipient } = await getParticipants(escrowAddress);

console.log('Buyer:', buyer);
console.log('Seller:', vendor);
console.log('Arbiter:', arbiter);
console.log('Fee Recipient:', feeRecipient);
```

### Check Balance

```javascript
import { getBalance } from './utils/escrowUtils.js';

const balance = await getBalance(address);
console.log('Balance:', balance, 'BNB');
```

## 📖 Examples

### Complete Lifecycle Example

See `examples/factory-integration.js` for a complete example:

```bash
node examples/factory-integration.js
```

### Listen for Events Example

```bash
node examples/factory-integration.js listen
```

### Deterministic Deployment Example

```bash
node examples/factory-integration.js deterministic
```

### Frontend Integration Example

See `examples/frontend-integration.js` for React/Next.js integration.

## 📚 API Reference

### Factory Methods

#### `deployImplementation()`
Deploys the Escrow implementation contract.

**Returns:** `Promise<string>` - Implementation address

#### `deployFactory()`
Deploys the EscrowFactory contract.

**Requires:** `ESCROW_IMPLEMENTATION_ADDRESS` in environment

**Returns:** `Promise<string>` - Factory address

#### `createEscrow(params)`
Creates a new escrow via the factory.

**Parameters:**
- `params.jobId` - Job identifier (optional, auto-generated)
- `params.buyer` - Buyer address
- `params.seller` - Seller address
- `params.arbiter` - Arbiter address (use ethers.ZeroAddress for none)
- `params.feeRecipient` - Fee recipient address
- `params.feeBps` - Fee in basis points (e.g., 100 = 1%)
- `params.amount` - Project amount in ETH string (e.g., '1.0')
- `params.deterministic` - Use CREATE2 (optional, default: false)
- `params.salt` - Salt for CREATE2 (optional, auto-generated)

**Returns:** `Promise<string>` - Escrow address

### Escrow Methods

#### `fund({ value })`
Buyer funds the escrow.

**Parameters:**
- `value` - Total amount (project + 0.5% buyer fee)

#### `deliver(cid, contentHash)`
Seller delivers work.

**Parameters:**
- `cid` - IPFS CID
- `contentHash` - Optional content hash

#### `approve(cid)`
Buyer approves delivery.

**Parameters:**
- `cid` - IPFS CID (must match proposed CID)

#### `withdraw()`
Seller withdraws funds after approval.

#### `cancel()`
Buyer cancels before delivery.

#### `initiateDispute({ value? })`
Either party initiates dispute.

**Parameters:**
- `value` - Dispute fee (only if seller initiates)

#### `payDisputeFee({ value })`
Counterparty pays dispute fee.

**Parameters:**
- `value` - Dispute fee amount

#### `resolveToVendor()`
Arbiter resolves dispute in favor of seller.

#### `resolveToBuyer()`
Arbiter resolves dispute in favor of buyer.

### Utility Methods

See `utils/escrowUtils.js` for complete documentation of utility functions.

## 💡 Tips

1. **Always check balance** before transactions:
   ```javascript
   const balance = await getBalance(address);
   if (parseFloat(balance) < parseFloat(amount)) {
     throw new Error('Insufficient balance');
   }
   ```

2. **Handle errors gracefully**:
   ```javascript
   try {
     await escrow.fund({ value: amount });
   } catch (error) {
     if (error.code === 'INSUFFICIENT_FUNDS') {
       console.error('Not enough BNB');
     } else {
       console.error('Transaction failed:', error.message);
     }
   }
   ```

3. **Wait for confirmations**:
   ```javascript
   const tx = await escrow.fund({ value: amount });
   const receipt = await tx.wait(2); // Wait for 2 confirmations
   ```

4. **Use events for tracking**:
   ```javascript
   escrow.on('Funded', (buyer, amount, fee) => {
     console.log('Escrow funded:', ethers.formatEther(amount));
   });
   ```

5. **Predict gas costs**:
   ```javascript
   const gasEstimate = await escrow.fund.estimateGas({ value: amount });
   const gasPrice = await provider.getFeeData();
   const cost = gasEstimate * gasPrice.gasPrice;
   console.log('Estimated cost:', ethers.formatEther(cost), 'BNB');
   ```

## 🔐 Security Notes

- Never commit `.env` files with private keys
- Use hardware wallets for production
- Always verify contract addresses before transactions
- Test thoroughly on testnet first
- Use appropriate gas limits and prices

## 📞 Support

For issues or questions:
- Check the examples in `examples/`
- Review utility functions in `utils/escrowUtils.js`
- See the main project README

