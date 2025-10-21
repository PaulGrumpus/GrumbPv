# Web3 Integration Guide

Complete guide for interacting with your deployed BSC Escrow contract using JavaScript/TypeScript.

---

## ✅ What You Have

- **Deployed Contract:** `0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B`
- **Network:** BSC Testnet (Chain ID: 97)
- **Explorer:** https://testnet.bscscan.com/address/0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B
- **Status:** ✅ Verified on BscScan

---

## Quick Start (3 Steps)

### 1. Install Dependencies
```bash
cd interact
npm install
```

### 2. Configure (Already Done!)
Your `.env` is already configured with:
- Contract address: `0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B`
- All participant addresses
- Private keys (testnet keys)
- RPC URL

### 3. Test Connection
```bash
npm run info
```

You should see your contract details!

---

## Available Scripts

### Information & Monitoring

```bash
# Get complete escrow information
npm run info

# Returns:
# - All participants
# - Current state
# - Amounts and fees
# - Deadlines
# - CIDs
# - Reward configuration
```

### Normal Workflow

```bash
# 1. Buyer funds escrow
FUND_AMOUNT=1.005 npm run fund

# 2. Vendor delivers work
IPFS_CID=QmYourActualCID npm run deliver

# 3. Buyer approves
IPFS_CID=QmYourActualCID npm run approve

# 4. Vendor withdraws
npm run withdraw
```

### Cancellation

```bash
# Buyer cancels before vendor delivers
npm run cancel
```

### Dispute Management

```bash
# Buyer initiates dispute
DISPUTE_INITIATOR=buyer npm run dispute-init

# Vendor pays dispute fee
DISPUTE_PAYER=vendor npm run dispute-pay

# Arbiter resolves
RESOLUTION=vendor npm run dispute-resolve
```

### GRMPS Rewards

```bash
# Configure rewards (arbiter only)
npm run setup-rewards

# Fund escrow with GRMPS
GRMPS_AMOUNT=300 npm run fund-grmps
```

---

## Complete Example Transaction

Here's a full end-to-end transaction on your deployed contract:

```bash
cd interact

# 1. Check initial state
npm run info

# 2. Buyer funds 1.005 BNB (1 BNB + 0.5% fee)
FUND_AMOUNT=1.005 npm run fund

# 3. Vendor delivers work with IPFS CID
IPFS_CID=QmTestCID12345 npm run deliver

# 4. Buyer verifies and approves the exact CID
IPFS_CID=QmTestCID12345 npm run approve

# 5. Vendor withdraws payment
npm run withdraw

# 6. Check final state
npm run info
```

**Expected result:**
- Vendor receives: ~0.995 BNB (99%)
- Fee Recipient receives: 0.01 BNB (1%)
- If GRMPS configured: Both parties get GRMPS rewards

---

## Frontend Integration

### React/Next.js Example

```javascript
import { ethers } from 'ethers';
import escrowABI from './abi/Escrow.json';

const ESCROW_ADDRESS = '0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B';

// 1. Connect MetaMask
async function connectWallet() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
}

// 2. Get escrow info
async function getEscrowInfo() {
  const { provider } = await connectWallet();
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, provider);
  const info = await escrow.getAllInfo();
  
  return {
    buyer: info.buyer,
    vendor: info.vendor,
    amount: ethers.formatEther(info.amount),
    state: info.state,
    buyerApproved: info.buyerApproved,
    vendorApproved: info.vendorApproved
  };
}

// 3. Fund escrow (buyer)
async function fundEscrow(amountBNB) {
  const { signer } = await connectWallet();
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, signer);
  
  const tx = await escrow.fund({ 
    value: ethers.parseEther(amountBNB.toString()) 
  });
  await tx.wait();
  
  return tx.hash;
}

// 4. Deliver work (vendor)
async function deliverWork(ipfsCID) {
  const { signer } = await connectWallet();
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, signer);
  
  const tx = await escrow.deliver(ipfsCID, ethers.ZeroHash);
  await tx.wait();
  
  return tx.hash;
}

// 5. Approve work (buyer)
async function approveWork(ipfsCID) {
  const { signer } = await connectWallet();
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, signer);
  
  const tx = await escrow.approve(ipfsCID);
  await tx.wait();
  
  return tx.hash;
}

// 6. Withdraw (vendor)
async function withdraw() {
  const { signer } = await connectWallet();
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, signer);
  
  const tx = await escrow.withdraw();
  await tx.wait();
  
  return tx.hash;
}

// 7. Listen to events
async function subscribeToEvents(callback) {
  const { provider } = await connectWallet();
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, provider);
  
  escrow.on('Funded', (buyer, amount, fee) => {
    callback('funded', {
      buyer,
      amount: ethers.formatEther(amount),
      fee: ethers.formatEther(fee)
    });
  });
  
  escrow.on('Delivered', (vendor, cid) => {
    callback('delivered', { vendor, cid });
  });
  
  escrow.on('Withdrawn', (to, amount) => {
    callback('withdrawn', {
      to,
      amount: ethers.formatEther(amount)
    });
  });
}

// Usage in React component
export function EscrowComponent() {
  const [info, setInfo] = useState(null);
  
  useEffect(() => {
    getEscrowInfo().then(setInfo);
  }, []);
  
  const handleFund = async () => {
    try {
      const txHash = await fundEscrow(1.005);
      console.log('Funded!', txHash);
      // Refresh info
      const updated = await getEscrowInfo();
      setInfo(updated);
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      <h2>Escrow Status: {info?.state}</h2>
      <p>Amount: {info?.amount} BNB</p>
      <button onClick={handleFund}>Fund Escrow</button>
    </div>
  );
}
```

---

## Web3.js Alternative

If you prefer Web3.js over Ethers.js:

```javascript
import Web3 from 'web3';
import escrowABI from './abi/Escrow.json';

const web3 = new Web3('https://bsc-testnet-rpc.publicnode.com/');
const escrow = new web3.eth.Contract(
  escrowABI, 
  '0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B'
);

// Get info
const info = await escrow.methods.getAllInfo().call();
console.log('State:', info.state);

// Fund escrow
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

await escrow.methods.fund().send({
  from: account.address,
  value: web3.utils.toWei('1.005', 'ether'),
  gas: 200000
});
```

See `interact/examples/web3-example.js` for complete implementation.

---

## File Structure

```
interact/
├── package.json              # Dependencies
├── .env                      # Your configuration (already set!)
├── config.js                 # Shared config loader
├── README.md                 # Documentation
├── abi/
│   └── Escrow.json          # Complete contract ABI
├── scripts/
│   ├── getInfo.js           # ✅ View contract state
│   ├── fund.js              # ✅ Buyer funds
│   ├── deliver.js           # ✅ Vendor delivers
│   ├── approve.js           # ✅ Buyer approves
│   ├── withdraw.js          # ✅ Vendor withdraws
│   ├── cancel.js            # ✅ Buyer cancels
│   ├── disputeInit.js       # ✅ Initiate dispute
│   ├── disputePay.js        # ✅ Pay dispute fee
│   ├── disputeResolve.js    # ✅ Arbiter resolves
│   ├── setupRewards.js      # ✅ Configure GRMPS
│   └── fundGRMPS.js         # ✅ Send GRMPS to escrow
└── examples/
    ├── frontend-integration.js   # React/Vue integration
    └── web3-example.js           # Web3.js examples
```

---

## Test Your Deployment Right Now!

Try these commands:

```bash
# 1. View your contract (already works!)
cd /home/sweetdream/Work/Kash/bsc-escrow/interact
npm run info

# 2. Test funding (will actually send BNB!)
FUND_AMOUNT=0.001 npm run fund

# 3. Check updated state
npm run info
```

---

## Important Environment Variables

Already configured in `interact/.env`:

| Variable | Value | Purpose |
|----------|-------|---------|
| `ESCROW_ADDRESS` | 0x4035...247B | Your deployed contract |
| `BSC_TESTNET_RPC_URL` | https://bsc-testnet... | Network connection |
| `BUYER_PRIVATE_KEY` | 26b9e800... | Buyer transactions |
| `VENDOR_PRIVATE_KEY` | 3e95cb0e... | Vendor transactions |
| `ARBITER_PRIVATE_KEY` | 25779904... | Arbiter transactions |

---

## Next Steps

### Option A: Test Full Flow
1. Run `npm run info` - See current state
2. Run `FUND_AMOUNT=0.01 npm run fund` - Test with small amount
3. Run `IPFS_CID=QmTest123 npm run deliver` - Deliver work
4. Run `IPFS_CID=QmTest123 npm run approve` - Approve
5. Run `npm run withdraw` - Complete transaction

### Option B: Integrate into Your App
- Copy `interact/examples/frontend-integration.js`
- Import into your React/Next.js app
- Connect MetaMask
- Use the helper functions

### Option C: Build Custom Integration
- Use the ABI from `interact/abi/Escrow.json`
- Reference the example scripts
- Build your own custom workflow

---

## Where to Get BscScan API Key

1. Go to https://bscscan.com/
2. Sign up for free account
3. Navigate to: https://bscscan.com/myapikey
4. Click "Add" to create API key
5. Copy the key
6. Add to `.env`: `BSCSCAN_API_KEY=YourKeyHere`

**Note:** Same API key works for both testnet and mainnet!

---

## Your Deployment Summary

✅ **Contract Deployed:** `0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B`  
✅ **Network:** BSC Testnet  
✅ **Verified:** Yes  
✅ **Scripts Ready:** 11 interaction scripts  
✅ **ABI Generated:** Complete interface available  
✅ **Dependencies Installed:** ethers.js, web3.js, dotenv  

**You're ready to interact with your contract!** 🚀

