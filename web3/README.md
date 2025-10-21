# Web3 Integration

JavaScript/TypeScript scripts and examples for interacting with the deployed BSC Escrow contract.

## Structure

```
web3/
├── package.json       # Dependencies (ethers.js, web3.js)
├── config.js          # Shared configuration
├── .env               # Environment variables
├── abi/
│   └── Escrow.json   # Contract ABI
├── scripts/           # CLI interaction scripts
│   ├── getInfo.js
│   ├── fund.js
│   ├── deliver.js
│   ├── approve.js
│   ├── withdraw.js
│   ├── cancel.js
│   ├── disputeInit.js
│   ├── disputePay.js
│   ├── disputeResolve.js
│   ├── setupRewards.js
│   └── fundGRMPS.js
└── examples/          # Integration examples
    ├── frontend-integration.js
    └── web3-example.js
```

## Setup

```bash
# Install dependencies
npm install

# Configure environment (already done!)
# Your .env is pre-configured with deployed contract:
# ESCROW_ADDRESS=0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B
```

## Usage

### View Contract Information

```bash
npm run info
```

### Complete Transaction Flow

```bash
# 1. Buyer funds
FUND_AMOUNT=1.005 npm run fund

# 2. Vendor delivers
IPFS_CID=QmYourCID npm run deliver

# 3. Buyer approves
IPFS_CID=QmYourCID npm run approve

# 4. Vendor withdraws
npm run withdraw
```

### Dispute Flow

```bash
# Buyer initiates
DISPUTE_INITIATOR=buyer npm run dispute-init

# Vendor pays fee
DISPUTE_PAYER=vendor npm run dispute-pay

# Arbiter resolves
RESOLUTION=vendor npm run dispute-resolve
```

### GRMPS Rewards

```bash
# Configure (arbiter)
npm run setup-rewards

# Fund with GRMPS
GRMPS_AMOUNT=300 npm run fund-grmps
```

## Frontend Integration

### React/Next.js with MetaMask

```javascript
import { ethers } from 'ethers';
import escrowABI from './abi/Escrow.json';

const ESCROW = '0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B';

async function fundEscrow(amountBNB) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const escrow = new ethers.Contract(ESCROW, escrowABI, signer);
  
  const tx = await escrow.fund({ 
    value: ethers.parseEther(amountBNB.toString()) 
  });
  
  return await tx.wait();
}
```

See `examples/frontend-integration.js` for complete implementation.

### Web3.js Alternative

See `examples/web3-example.js` for Web3.js implementation.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run info` | View escrow information |
| `npm run fund` | Buyer funds escrow |
| `npm run deliver` | Vendor delivers work |
| `npm run approve` | Buyer approves work |
| `npm run withdraw` | Vendor withdraws payment |
| `npm run cancel` | Buyer cancels escrow |
| `npm run dispute-init` | Initiate dispute |
| `npm run dispute-pay` | Pay dispute fee |
| `npm run dispute-resolve` | Arbiter resolves dispute |
| `npm run setup-rewards` | Configure GRMPS rewards |
| `npm run fund-grmps` | Fund escrow with GRMPS |

## Environment Variables

Key variables in `.env`:

```bash
ESCROW_ADDRESS=0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/

BUYER_PRIVATE_KEY=...
VENDOR_PRIVATE_KEY=...
ARBITER_PRIVATE_KEY=...
```

## Examples

### CLI Usage

```bash
# Check contract state
npm run info

# Fund with 0.01 BNB (test)
FUND_AMOUNT=0.0105 npm run fund

# Deliver work
IPFS_CID=QmTest123 npm run deliver
```

### Programmatic Usage

```javascript
import { ethers } from 'ethers';
import { CONFIG } from './config.js';

const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
const escrow = new ethers.Contract(
  CONFIG.escrowAddress,
  CONFIG.escrowABI,
  provider
);

// Get info
const info = await escrow.getAllInfo();
console.log('State:', info.state);
```

## Deployed Contract

- **Address:** `0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B`
- **Network:** BSC Testnet
- **Chain ID:** 97
- **Explorer:** https://testnet.bscscan.com/address/0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B

## Dependencies

- **ethers.js v6** - Modern Ethereum library
- **web3.js v4** - Alternative Web3 library
- **dotenv** - Environment management

## TypeScript Support

Convert to TypeScript:

```bash
npm install -D typescript @types/node
npx tsc --init
```

Rename `.js` to `.ts` and run with:
```bash
npx tsx scripts/getInfo.ts
```
