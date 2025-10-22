# Web3.js Scripts for Escrow + Factory

Complete Web3.js integration for interacting with the Escrow and EscrowFactory contracts.

## 📦 What's Included

### ✅ Factory Scripts (`scripts/factory/`)
- `deployImplementation.js` - Deploy the Escrow implementation contract
- `deployFactory.js` - Deploy the EscrowFactory contract
- `createEscrow.js` - Create new escrow instances via factory
- `listEscrows.js` - List all created escrows
- `predictAddress.js` - Predict deterministic escrow addresses

### ✅ Escrow Scripts (`scripts/`)
- `fund.js` - Buyer funds escrow
- `deliver.js` - Seller delivers work
- `approve.js` - Buyer approves delivery
- `withdraw.js` - Seller withdraws funds
- `cancel.js` - Buyer cancels escrow
- `getInfo.js` - Get escrow information
- `disputeInit.js` - Initiate dispute
- `disputePay.js` - Pay dispute fee
- `disputeResolve.js` - Arbiter resolves dispute
- `setupRewards.js` - Configure GRMPS rewards
- `fundGRMPS.js` - Fund escrow with reward tokens

### ✅ Utilities (`utils/`)
- `escrowUtils.js` - Comprehensive utility library with 15+ helper functions

### ✅ Examples (`examples/`)
- `factory-integration.js` - Complete factory + escrow lifecycle example
- `frontend-integration.js` - React/Next.js integration example
- `web3-example.js` - Basic Web3.js usage

### ✅ Documentation
- `WEB3_INTEGRATION_GUIDE.md` - Complete integration guide (📖 **START HERE**)
- `WEB3_QUICK_REFERENCE.md` - Quick command and code reference
- `WEB3_README.md` - This file

### ✅ Configuration
- `config.js` - Centralized configuration with ABIs
- `ENV_TEMPLATE.txt` - Environment variables template
- `abi/Escrow.json` - Escrow contract ABI
- `abi/EscrowFactory.json` - Factory contract ABI

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Create `.env` file from template:

```bash
cp ENV_TEMPLATE.txt .env
# Edit .env with your values
```

### 3. Deploy Factory System

```bash
# Step 1: Deploy implementation
npm run deploy:implementation
# Copy the address to .env as ESCROW_IMPLEMENTATION_ADDRESS

# Step 2: Deploy factory
npm run deploy:factory
# Copy the address to .env as FACTORY_ADDRESS
```

### 4. Create and Use Escrow

```bash
# Create escrow
npm run create:escrow

# Fund escrow (buyer)
npm run fund

# Deliver work (seller)
npm run deliver

# Approve delivery (buyer)
npm run approve

# Withdraw funds (seller)
npm run withdraw
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **WEB3_INTEGRATION_GUIDE.md** | 📘 Complete integration guide with examples |
| **WEB3_QUICK_REFERENCE.md** | ⚡ Quick command and code snippets |
| **ENV_TEMPLATE.txt** | 🔧 Environment variables template |

## 🎯 Available Commands

### Factory Operations
```bash
npm run deploy:implementation    # Deploy implementation contract
npm run deploy:factory          # Deploy factory contract
npm run create:escrow           # Create new escrow
npm run list:escrows            # List all created escrows
npm run predict:address         # Predict deterministic address
```

### Escrow Operations
```bash
npm run fund                    # Buyer funds escrow
npm run deliver                 # Seller delivers work
npm run approve                 # Buyer approves delivery
npm run withdraw                # Seller withdraws funds
npm run cancel                  # Buyer cancels escrow
npm run info                    # Get escrow info
```

### Dispute Operations
```bash
npm run dispute-init            # Initiate dispute
npm run dispute-pay             # Pay dispute fee
npm run dispute-resolve         # Resolve dispute (arbiter)
```

### Rewards (Optional)
```bash
npm run setup-rewards           # Configure reward system
npm run fund-grmps             # Fund escrow with rewards
```

## 💡 Usage Examples

### Create Escrow via Factory

```javascript
import { ethers } from 'ethers';
import { getFactoryContract, getSigner } from './utils/escrowUtils.js';

const factory = getFactoryContract(getSigner(privateKey));

const tx = await factory.createEscrow(
  ethers.id('JOB-123'),
  buyerAddress,
  sellerAddress,
  arbiterAddress,
  feeRecipientAddress,
  100,                         // 1% fee
  ethers.ZeroAddress,          // Native BNB
  ethers.parseEther('1.0')     // 1 BNB
);

const receipt = await tx.wait();
```

### Fund Escrow

```javascript
import { getEscrowContract, getSigner } from './utils/escrowUtils.js';

const escrow = getEscrowContract(escrowAddress, getSigner(buyerKey));

// Project + 0.5% buyer fee = 1.005 BNB
const amount = ethers.parseEther('1.0');
const fee = (amount * 50n) / 10000n;

await escrow.fund({ value: amount + fee });
```

### Complete Lifecycle

See `examples/factory-integration.js` for a complete example:

```bash
node examples/factory-integration.js
```

## 🛠️ Utility Functions

The `utils/escrowUtils.js` library provides:

- `getEscrowContract()` - Get escrow instance
- `getFactoryContract()` - Get factory instance
- `getEscrowInfo()` - Get all escrow info
- `calculateBuyerFunding()` - Calculate total funding amount
- `calculateDisputeFee()` - Calculate dispute fee
- `isReleasable()` - Check if ready for withdrawal
- `getParticipants()` - Get buyer/seller/arbiter
- `getState()` - Get current state
- `formatEscrowInfo()` - Pretty print info
- `getSigner()` - Create signer from private key
- `getBalance()` - Check wallet balance
- `predictEscrowAddress()` - Predict deterministic address
- `generateSalt()` - Generate salt for CREATE2
- `listenForEscrowCreation()` - Listen for factory events
- `getCreatedEscrows()` - Query past escrow creations

## 📊 Gas Savings

| Operation | Old Method | Factory Clone | Savings |
|-----------|------------|---------------|---------|
| Deploy Escrow | ~3,000,000 gas | ~100,000 gas | **97%** |
| Estimated Cost | 0.009 BNB | 0.0003 BNB | 0.0087 BNB |

*Based on 3 gwei gas price on BSC testnet*

## 🔑 Environment Setup

Required variables:

```bash
# Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97

# Contracts
FACTORY_ADDRESS=0x...
ESCROW_IMPLEMENTATION_ADDRESS=0x...

# For operations
BUYER_PRIVATE_KEY=0x...
VENDOR_PRIVATE_KEY=0x...
ARBITER_PRIVATE_KEY=0x...
```

See `ENV_TEMPLATE.txt` for complete list.

## 🎨 Frontend Integration

### React/Ethers.js Example

```javascript
import { ethers } from 'ethers';
import { getFactoryContract } from './utils/escrowUtils';

function CreateEscrowButton() {
  const createEscrow = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const factory = getFactoryContract(signer);
    
    const tx = await factory.createEscrow(
      ethers.id('JOB-123'),
      buyerAddress,
      sellerAddress,
      arbiterAddress,
      feeRecipientAddress,
      100,
      ethers.ZeroAddress,
      ethers.parseEther('1.0')
    );
    
    const receipt = await tx.wait();
    // Parse event for escrow address
  };
  
  return <button onClick={createEscrow}>Create Escrow</button>;
}
```

See `examples/frontend-integration.js` for complete examples.

## 🐛 Debugging

### Check Escrow State

```bash
npm run info
```

Or programmatically:

```javascript
import { getEscrowInfo } from './utils/escrowUtils.js';

const info = await getEscrowInfo(escrowAddress);
console.log('State:', info.stateName);
console.log('Amount:', info.amountFormatted, 'BNB');
```

### Estimate Gas

```javascript
const gasEstimate = await escrow.fund.estimateGas({
  value: ethers.parseEther('1.005')
});
console.log('Gas needed:', gasEstimate.toString());
```

### Listen for Events

```javascript
import { listenForEscrowCreation } from './utils/escrowUtils.js';

listenForEscrowCreation((event) => {
  console.log('New escrow:', event.escrow);
  console.log('Amount:', event.amountFormatted, 'BNB');
});
```

## 🔐 Security

- ⚠️ Never commit `.env` files with private keys
- ✅ Use hardware wallets for production
- ✅ Always verify contract addresses
- ✅ Test thoroughly on testnet first
- ✅ Use appropriate gas limits

## 📞 Getting Help

1. **Read the docs:**
   - `WEB3_INTEGRATION_GUIDE.md` - Complete guide
   - `WEB3_QUICK_REFERENCE.md` - Quick reference

2. **Check examples:**
   - `examples/factory-integration.js` - Complete lifecycle
   - `examples/frontend-integration.js` - React integration

3. **Review utilities:**
   - `utils/escrowUtils.js` - All helper functions

4. **Test scripts:**
   - Run individual scripts to test specific operations
   - Use `npm run info` to check escrow state

## 📦 Dependencies

```json
{
  "ethers": "^6.9.0",
  "web3": "^4.3.0",
  "dotenv": "^16.3.1"
}
```

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure environment: Copy `ENV_TEMPLATE.txt` to `.env`
3. ✅ Deploy factory system: `npm run deploy:implementation` → `npm run deploy:factory`
4. ✅ Create your first escrow: `npm run create:escrow`
5. ✅ Test full lifecycle: Follow the Quick Start guide
6. ✅ Integrate into your app: Use the examples and utilities

## 🚀 Ready to Deploy!

Everything is set up and ready to use. Start with the Quick Start guide above or dive into the comprehensive `WEB3_INTEGRATION_GUIDE.md`.

Happy coding! 🎉

