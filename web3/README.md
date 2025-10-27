# Web3 Integration

JavaScript/Node.js scripts and examples for interacting with the BSC Escrow system using ethers.js v6.

## 📁 Structure

```
web3/
├── config.js                  # Shared configuration
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── abi/
│   ├── Escrow.json          # Escrow ABI
│   ├── EscrowFactory.json   # Factory ABI
│   └── RewardDistributor.json # RewardDistributor ABI
├── scripts/
│   ├── factory/             # Factory-related scripts
│   │   ├── deployImplementation.js
│   │   ├── deployFactory.js
│   │   ├── deployRewardDistributor.js
│   │   ├── createEscrow.js
│   │   ├── listEscrows.js
│   │   └── predictAddress.js
│   ├── getInfo.js           # View escrow state
│   ├── fund.js              # Buyer funds escrow
│   ├── deliver.js           # Vendor delivers work
│   ├── approve.js           # Buyer approves delivery
│   ├── withdraw.js          # Withdraw funds
│   ├── cancel.js            # Cancel escrow
│   ├── disputeInit.js       # Initiate dispute
│   ├── disputePay.js        # Pay dispute fee
│   ├── disputeResolve.js    # Arbiter resolves dispute
│   ├── setupRewards.js      # Configure rewards (legacy)
│   ├── approveDistributor.js # Approve GRMPS to distributor
│   └── transfer-ownership-to-gnosis.js # Transfer to multisig
├── examples/
│   ├── frontend-integration.js      # React/Next.js example
│   ├── secure-wallet-integration.js # Gnosis Safe example
│   └── factory-integration.js       # Factory usage example
└── utils/
    └── escrowUtils.js       # Helper functions
```

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

Dependencies:
- `ethers@^6.9.0` - Modern Ethereum library
- `web3@^4.3.0` - Alternative Web3 library
- `dotenv@^16.3.1` - Environment management

### 2. Configure Environment

Create `.env` file:

```bash
# Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
BSC_MAINNET_RPC_URL=https://bsc-rpc.publicnode.com/

# Deployed Contracts (from contract deployment)
FACTORY_ADDRESS=0x...
REWARD_DISTRIBUTOR_ADDRESS=0x...
ESCROW_ADDRESS=0x...  # For direct escrow interaction

# Wallets
BUYER_PRIVATE_KEY=0x...
VENDOR_PRIVATE_KEY=0x...
ARBITER_PRIVATE_KEY=0x...
DEPLOYER_PRIVATE_KEY=0x...  # Same as ARBITER typically

# Addresses
BUYER_ADDRESS=0x...
VENDOR_ADDRESS=0x...
ARBITER_ADDRESS=0x...
FEE_RECIPIENT_ADDRESS=0x...

# GRMPS Token
GRMPS_TOKEN_ADDRESS=0xB908a4d3534D3e63b30b856e33Bf1B5d1dEd0016
```

### 3. Test Connection

```bash
npm run info
```

## 📜 Available Scripts

### Factory Scripts

| Command | Description |
|---------|-------------|
| `npm run deploy:implementation` | Deploy Escrow implementation |
| `npm run deploy:factory` | Deploy EscrowFactory |
| `npm run deploy:reward-distributor` | Deploy RewardDistributor |
| `npm run create:escrow` | Create new escrow via factory |
| `npm run list:escrows` | List all created escrows |
| `npm run predict:address` | Predict deterministic escrow address |

### Escrow Interaction Scripts

| Command | Description |
|---------|-------------|
| `npm run info` | View escrow state and details |
| `npm run fund` | Buyer funds escrow |
| `npm run deliver` | Vendor delivers work with IPFS CID |
| `npm run approve` | Buyer approves delivery |
| `npm run withdraw` | Withdraw funds (vendor or buyer) |
| `npm run cancel` | Buyer cancels escrow |

### Dispute Scripts

| Command | Description |
|---------|-------------|
| `npm run dispute-init` | Initiate dispute (buyer or vendor) |
| `npm run dispute-pay` | Pay dispute fee (counterparty) |
| `npm run dispute-resolve` | Arbiter resolves dispute |

### Reward & Management Scripts

| Command | Description |
|---------|-------------|
| `npm run approve:distributor` | Approve GRMPS to RewardDistributor |
| `npm run transfer:ownership` | Transfer factory ownership to Gnosis Safe |
| `npm run check:ownership` | Check current ownership |

## 🔄 Complete Workflow

### Initial Setup (One-time)

```bash
# 1. Deploy contracts (see contract/README.md)
cd ../contract
./deploy-all.sh

# 2. Copy addresses to web3/.env
cd ../web3
nano .env
# Add: FACTORY_ADDRESS, REWARD_DISTRIBUTOR_ADDRESS

# 3. Approve GRMPS for RewardDistributor
npm run approve:distributor
# This approves unlimited GRMPS from your wallet to the distributor
```

### Creating and Using an Escrow

#### Step 1: Create Escrow

```bash
npm run create:escrow
```

**Output:**
```
🏭 Creating Escrow via Factory...

Parameters:
  Buyer: 0x123...
  Vendor: 0x456...
  Amount: 0.1 BNB
  Deadline: 10 minutes from now

✅ Escrow created!
Address: 0xABC...
Job ID: JOB-1234567890
Gas used: 95,234
```

Save the escrow address for next steps.

#### Step 2: Buyer Funds Escrow

```bash
ESCROW_ADDRESS=0xABC... FUND_AMOUNT=0.1005 npm run fund
```

The amount includes:
- Base amount: 0.1 BNB
- Buyer fee (0.5%): 0.0005 BNB
- **Total: 0.1005 BNB**

#### Step 3: Vendor Delivers Work

```bash
ESCROW_ADDRESS=0xABC... IPFS_CID=QmYourIPFSHash npm run deliver
```

This records the IPFS CID of the deliverable on-chain.

#### Step 4: Buyer Approves

```bash
ESCROW_ADDRESS=0xABC... IPFS_CID=QmYourIPFSHash npm run approve
```

This verifies the CID and approves the delivery.

#### Step 5: Vendor Withdraws

```bash
ESCROW_ADDRESS=0xABC... npm run withdraw
```

Vendor receives:
- Payment: 0.1 BNB
- Minus vendor fee (0.5%): -0.0005 BNB
- **Net: 0.0995 BNB**
- **Plus: GRMPS tokens** (0.25% reward)

Buyer also receives GRMPS tokens automatically!

### Alternative Paths

#### Cancel Escrow (Before Delivery)

```bash
ESCROW_ADDRESS=0xABC... npm run cancel
```

Buyer gets full refund (no fees).

#### Deadline Refund

After deadline expires without delivery:

```bash
ESCROW_ADDRESS=0xABC... npm run withdraw
```

Buyer can withdraw funds (no fees).

#### Dispute Resolution

**1. Buyer initiates dispute:**
```bash
ESCROW_ADDRESS=0xABC... DISPUTE_INITIATOR=buyer npm run dispute-init
```

Buyer pays 0.5% dispute fee.

**2. Vendor pays dispute fee:**
```bash
ESCROW_ADDRESS=0xABC... DISPUTE_PAYER=vendor npm run dispute-pay
```

Vendor pays 0.5% dispute fee (must respond within 48 hours).

**3. Arbiter resolves:**
```bash
ESCROW_ADDRESS=0xABC... RESOLUTION=vendor npm run dispute-resolve
```

Result:
- Winner (vendor) gets payment + dispute fee refunded
- Loser (buyer) loses dispute fee
- Arbiter gets 50% of loser's fee

## 💡 Script Usage Examples

### Create Custom Escrow

```bash
node scripts/factory/createEscrow.js \
  --buyer 0x123... \
  --seller 0x456... \
  --amount 1.0 \
  --deadline 86400  # 24 hours
```

### Fund with Custom Amount

```bash
ESCROW_ADDRESS=0xABC... FUND_AMOUNT=5.0025 npm run fund
# 5.0 BNB + 0.5% buyer fee = 5.0025 BNB
```

### Check Escrow Info

```bash
ESCROW_ADDRESS=0xABC... npm run info
```

**Output:**
```
📊 Escrow Information

Contract: 0xABC...
State: Approved
Buyer: 0x123...
Vendor: 0x456...
Amount: 0.1 BNB
IPFS CID: QmYourIPFSHash
Deadline: 2025-10-27 15:30:00

Fees:
  Buyer Fee: 0.0005 BNB (0.5%)
  Vendor Fee: 0.0005 BNB (0.5%)
  Dispute Fee: 0.0005 BNB (0.5%)

Rewards:
  Enabled: true
  Rate: 0.25% per side
  Distributor: 0xDEF...
```

### List All Escrows

```bash
npm run list:escrows
```

This queries factory events to show all created escrows.

## 🎨 Frontend Integration

### React/Next.js Example

```javascript
import { ethers } from 'ethers';
import EscrowFactoryABI from './abi/EscrowFactory.json';
import EscrowABI from './abi/Escrow.json';

const FACTORY_ADDRESS = '0x...';

// Connect to MetaMask
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Create escrow
const factory = new ethers.Contract(FACTORY_ADDRESS, EscrowFactoryABI, signer);

const tx = await factory.createEscrow(
  ethers.id(`JOB-${Date.now()}`),  // jobId
  buyerAddress,
  sellerAddress,
  arbiterAddress || ethers.ZeroAddress,
  feeRecipientAddress,
  100,  // 1% total fee
  ethers.ZeroAddress,  // BNB (native)
  ethers.parseEther('1.0'),  // 1 BNB
  Math.floor(Date.now() / 1000) + 86400,  // 24h deadline
  50,  // 0.5% buyer fee
  50,  // 0.5% vendor fee
  50,  // 0.5% dispute fee
  25   // 0.25% reward rate
);

const receipt = await tx.wait();
const event = receipt.logs.find(log => {
  try {
    const parsed = factory.interface.parseLog(log);
    return parsed.name === 'EscrowCreated';
  } catch { return false; }
});

const escrowAddress = event.args.escrow;
console.log('Escrow created:', escrowAddress);

// Interact with escrow
const escrow = new ethers.Contract(escrowAddress, EscrowABI, signer);

// Buyer funds
const fundTx = await escrow.fund({
  value: ethers.parseEther('1.005')  // 1.0 + 0.5% fee
});
await fundTx.wait();

// Vendor delivers
const deliverTx = await escrow.deliver('QmYourIPFSHash');
await deliverTx.wait();

// Buyer approves
const approveTx = await escrow.approve('QmYourIPFSHash');
await approveTx.wait();

// Vendor withdraws
const withdrawTx = await escrow.withdraw();
await withdrawTx.wait();
```

See [`examples/frontend-integration.js`](examples/frontend-integration.js) for complete example.

### Gnosis Safe Integration

For multisig wallet integration, see [`examples/secure-wallet-integration.js`](examples/secure-wallet-integration.js).

```bash
# Transfer factory ownership to Gnosis Safe
npm run transfer:ownership

# Approve GRMPS from Gnosis Safe
npm run approve:rewards
```

## 🔍 Querying Escrow State

### Get Escrow Info Programmatically

```javascript
import { ethers } from 'ethers';
import EscrowABI from './abi/Escrow.json';

const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC_URL);
const escrow = new ethers.Contract(escrowAddress, EscrowABI, provider);

const info = await escrow.getAllInfo();

console.log({
  state: info.state,  // 0=Created, 1=Funded, 2=Delivered, etc.
  buyer: info.buyer,
  vendor: info.vendor,
  amount: ethers.formatEther(info.amountWei),
  ipfsCid: info.ipfsCid,
  deadline: new Date(Number(info.deadline) * 1000)
});
```

### Listen for Events

```javascript
// Listen for escrow creation
const factory = new ethers.Contract(FACTORY_ADDRESS, FactoryABI, provider);

factory.on('EscrowCreated', (jobId, escrowAddress, buyer, seller) => {
  console.log('New escrow created:', {
    jobId,
    escrowAddress,
    buyer,
    seller
  });
});

// Listen for funding
const escrow = new ethers.Contract(escrowAddress, EscrowABI, provider);

escrow.on('Funded', (buyer, amount) => {
  console.log('Escrow funded:', ethers.formatEther(amount), 'BNB');
});
```

## 🛠️ Development & Testing

### Run Scripts Locally

```bash
# Create test escrow
node scripts/factory/createEscrow.js

# Fund escrow
ESCROW_ADDRESS=0x... FUND_AMOUNT=0.1005 node scripts/fund.js
```

### Debug Mode

Add `-d` or set `DEBUG=true`:

```bash
DEBUG=true npm run info
```

### Use Alternative RPC

```bash
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545 npm run info
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `FACTORY_ADDRESS` | EscrowFactory contract | `0x123...` |
| `REWARD_DISTRIBUTOR_ADDRESS` | RewardDistributor contract | `0x456...` |
| `ESCROW_ADDRESS` | Specific escrow instance | `0x789...` |
| `BUYER_PRIVATE_KEY` | Buyer wallet private key | `0xabc...` |
| `VENDOR_PRIVATE_KEY` | Vendor wallet private key | `0xdef...` |
| `ARBITER_PRIVATE_KEY` | Arbiter wallet private key | `0xghi...` |
| `FUND_AMOUNT` | Amount to fund (in BNB) | `1.005` |
| `IPFS_CID` | IPFS content identifier | `QmYour...` |
| `DISPUTE_INITIATOR` | Who starts dispute | `buyer` or `vendor` |
| `DISPUTE_PAYER` | Who pays dispute fee | `buyer` or `vendor` |
| `RESOLUTION` | Dispute winner | `buyer` or `vendor` |

## 🐛 Troubleshooting

### "Cannot find module 'ethers'"
```bash
npm install
```

### "Insufficient funds for gas"
Ensure you have enough BNB for gas + transaction amount.

### "Transaction underpriced"
Increase gas price:
```bash
GAS_PRICE=20000000000 npm run fund
```

### "Escrow not found"
Check that `ESCROW_ADDRESS` is set correctly:
```bash
echo $ESCROW_ADDRESS
```

### "Already delivered" error
You can only deliver once. Check escrow state:
```bash
npm run info
```

## 📚 Additional Resources

- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [BSC Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
- [BSC Testnet Explorer](https://testnet.bscscan.com/)
- [IPFS Documentation](https://docs.ipfs.tech/)

## 🤝 Contributing

To add new scripts:

1. Create script in `scripts/` directory
2. Add to `package.json` scripts section
3. Document in this README
4. Test on BSC testnet

---

For smart contract development, see [`../contract/README.md`](../contract/README.md)
