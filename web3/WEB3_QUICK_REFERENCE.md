# Web3.js Quick Reference

## 🚀 Quick Commands

### Factory Setup
```bash
# Deploy implementation
npm run deploy:implementation

# Deploy factory (set ESCROW_IMPLEMENTATION_ADDRESS first)
npm run deploy:factory

# Create escrow
npm run create:escrow

# List all escrows
npm run list:escrows

# Predict escrow address
npm run predict:address
```

### Escrow Operations
```bash
# Fund escrow
npm run fund

# Deliver work
npm run deliver

# Approve delivery
npm run approve

# Withdraw funds
npm run withdraw

# Cancel escrow
npm run cancel

# Get escrow info
npm run info
```

### Dispute Operations
```bash
# Initiate dispute
npm run dispute-init

# Pay dispute fee
npm run dispute-pay

# Resolve dispute
npm run dispute-resolve
```

## 📝 Common Code Snippets

### Create Escrow

```javascript
import { ethers } from 'ethers';
import { getFactoryContract, getSigner } from './utils/escrowUtils.js';

const factory = getFactoryContract(getSigner(privateKey));

const tx = await factory.createEscrow(
  ethers.id('JOB-123'),           // jobId
  buyerAddress,                    // buyer
  sellerAddress,                   // seller
  arbiterAddress,                  // arbiter (or ethers.ZeroAddress)
  feeRecipientAddress,             // feeRecipient
  100,                             // 1% fee
  ethers.ZeroAddress,              // Native BNB
  ethers.parseEther('1.0')         // 1 BNB
);

const receipt = await tx.wait();
const escrowAddress = /* parse event */;
```

### Fund Escrow

```javascript
import { getEscrowContract } from './utils/escrowUtils.js';

const escrow = getEscrowContract(escrowAddress, buyerSigner);

// Project + 0.5% buyer fee
const amount = ethers.parseEther('1.0');
const fee = (amount * 50n) / 10000n;
const total = amount + fee;

await escrow.fund({ value: total });
```

### Deliver Work

```javascript
const escrow = getEscrowContract(escrowAddress, sellerSigner);

await escrow.deliver('QmIPFSHash', ethers.id('content'));
```

### Approve Delivery

```javascript
const escrow = getEscrowContract(escrowAddress, buyerSigner);

await escrow.approve('QmIPFSHash');
```

### Withdraw Funds

```javascript
const escrow = getEscrowContract(escrowAddress, sellerSigner);

await escrow.withdraw();
```

### Get Escrow Info

```javascript
import { getEscrowInfo, formatEscrowInfo } from './utils/escrowUtils.js';

const info = await getEscrowInfo(escrowAddress);
console.log(formatEscrowInfo(info));
```

### Predict Address (Deterministic)

```javascript
import { generateSalt, predictEscrowAddress } from './utils/escrowUtils.js';

const salt = generateSalt(
  ethers.id('JOB-123'),
  buyerAddress,
  sellerAddress
);

const predicted = await predictEscrowAddress(salt);
console.log('Will deploy at:', predicted);
```

### Listen for Events

```javascript
import { listenForEscrowCreation } from './utils/escrowUtils.js';

listenForEscrowCreation((event) => {
  console.log('New escrow:', event.escrow);
  console.log('Amount:', event.amountFormatted, 'BNB');
});
```

### Query Past Events

```javascript
import { getCreatedEscrows } from './utils/escrowUtils.js';

const escrows = await getCreatedEscrows(0, 'latest');

escrows.forEach(e => {
  console.log(`${e.escrow}: ${e.amountFormatted} BNB`);
});
```

## 💰 Fee Calculations

### Buyer Funding
```javascript
// Project amount: 1.0 BNB
// Buyer fee: 0.5% = 0.005 BNB
// Total: 1.005 BNB

const project = ethers.parseEther('1.0');
const buyerFee = (project * 50n) / 10000n;  // 0.5%
const total = project + buyerFee;           // 1.005
```

### Dispute Fee
```javascript
// Dispute fee: 0.5% of project amount

const project = ethers.parseEther('1.0');
const disputeFee = (project * 50n) / 10000n;  // 0.005 BNB
```

### Normal Completion
```javascript
// Vendor gets: Project - 0.5% = 99.5%
// Fee recipient gets: 0.5% + 0.5% = 1%

const project = ethers.parseEther('1.0');
const vendorFee = (project * 50n) / 10000n;     // 0.005
const vendorGets = project - vendorFee;         // 0.995
const feeRecipientGets = buyerFee + vendorFee;  // 0.010
```

## 🔑 Environment Variables

```bash
# Required for deployment
export DEPLOYER_PRIVATE_KEY=0x...
export ESCROW_IMPLEMENTATION_ADDRESS=0x...

# Required for factory
export FACTORY_ADDRESS=0x...

# Required for escrow operations
export ESCROW_ADDRESS=0x...
export BUYER_PRIVATE_KEY=0x...
export VENDOR_PRIVATE_KEY=0x...

# Optional
export ARBITER_PRIVATE_KEY=0x...
export ARBITER_ADDRESS=0x...
export FEE_RECIPIENT_ADDRESS=0x...
```

## 📊 Gas Estimates

| Operation | Gas Used | Cost @ 3 gwei |
|-----------|----------|---------------|
| Deploy Implementation | ~3,000,000 | 0.009 BNB |
| Deploy Factory | ~500,000 | 0.0015 BNB |
| Create Escrow | ~100,000 | 0.0003 BNB |
| Fund | ~50,000 | 0.00015 BNB |
| Deliver | ~70,000 | 0.00021 BNB |
| Approve | ~60,000 | 0.00018 BNB |
| Withdraw | ~80,000 | 0.00024 BNB |

## 🎯 States

```javascript
0: 'Unfunded'   // Initial state
1: 'Funded'     // Buyer has funded
2: 'Delivered'  // Seller has delivered
3: 'Disputed'   // Dispute initiated
4: 'Releasable' // Both approved, ready for withdrawal
5: 'Paid'       // Funds withdrawn by seller
6: 'Refunded'   // Funds refunded to buyer
```

## ⚠️ Common Errors

### AlreadyInitialized
```
Escrow already initialized - cannot initialize twice
Solution: Use a different escrow or create a new one
```

### OnlyBuyer / OnlyVendor
```
Only the buyer/seller can call this function
Solution: Use the correct signer
```

### BadState
```
Operation not allowed in current state
Solution: Check escrow state with getEscrowInfo()
```

### CIDMismatch
```
CID doesn't match proposed CID
Solution: Use the exact CID from the Delivered event
```

### InsufficientDisputeFee
```
Not enough dispute fee paid
Solution: Send exactly 0.5% of project amount
```

## 🛠️ Debugging

### Check escrow state
```javascript
const info = await getEscrowInfo(escrowAddress);
console.log('State:', info.stateName);
console.log('Amount:', info.amountFormatted);
```

### Check balance
```javascript
import { getBalance } from './utils/escrowUtils.js';
const balance = await getBalance(address);
console.log('Balance:', balance, 'BNB');
```

### Estimate gas
```javascript
const gasEstimate = await escrow.fund.estimateGas({ 
  value: ethers.parseEther('1.005') 
});
console.log('Gas needed:', gasEstimate.toString());
```

### Get transaction receipt
```javascript
const tx = await escrow.fund({ value: amount });
const receipt = await tx.wait();
console.log('Gas used:', receipt.gasUsed.toString());
console.log('Status:', receipt.status); // 1 = success, 0 = failed
```

## 📚 More Resources

- Full guide: `WEB3_INTEGRATION_GUIDE.md`
- Examples: `examples/factory-integration.js`
- Utils: `utils/escrowUtils.js`
- Config: `config.js`

