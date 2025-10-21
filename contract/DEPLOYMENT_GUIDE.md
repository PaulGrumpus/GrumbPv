# BSC Escrow - Deployment & Interaction Guide

Complete guide for deploying and interacting with the escrow contract on BSC testnet/mainnet.

---

## Prerequisites

### 1. Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Get Test BNB
For BSC Testnet, get test BNB from faucet:
- https://testnet.binance.org/faucet-smart
- https://testnet.bnbchain.org/faucet-smart

### 3. Setup Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

---

## Configuration

### Generate Addresses (Optional)
```bash
# Generate new addresses with cast
cast wallet new

# Or use existing addresses
# Add them to .env file
```

### Set Environment Variables
Edit `.env` file:
```bash
# Private key of deployer (arbiter)
PRIVATE_KEY=0xYourPrivateKeyHere

# Participant addresses
BUYER_ADDRESS=0x...
VENDOR_ADDRESS=0x...
ARBITER_ADDRESS=0x...
FEE_RECIPIENT_ADDRESS=0x...

# Project deadline (unix timestamp)
DEADLINE_TIMESTAMP=1735689600  # Use: date -d "2025-12-31" +%s

# BSC Testnet RPC
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# BscScan API key (for verification)
BSCSCAN_API_KEY=YourBscScanApiKey
```

---

## Step-by-Step Deployment

### Step 1: Build Contracts
```bash
forge build
```

### Step 2: Run Tests
```bash
forge test -vv
```

### Step 3: Deploy to BSC Testnet
```bash
# Load environment variables
source .env

# Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Note the deployed address** from console output and add to `.env`:
```bash
ESCROW_ADDRESS=0xDeployedContractAddress
```

### Step 4: Verify Contract (if not auto-verified)
```bash
forge verify-contract \
  $ESCROW_ADDRESS \
  src/Escrow.sol:Escrow \
  --chain-id 97 \
  --constructor-args $(cast abi-encode "constructor(address,address,address,address,uint64)" $BUYER_ADDRESS $VENDOR_ADDRESS $ARBITER_ADDRESS $FEE_RECIPIENT_ADDRESS $DEADLINE_TIMESTAMP) \
  --etherscan-api-key $BSCSCAN_API_KEY
```

---

## Workflow Examples

### Example 1: Happy Path (Normal Completion)

#### 1. Configure GRMPS Rewards (Arbiter)
```bash
# Set in .env:
GRMPS_TOKEN_ADDRESS=0xGRMPSTokenAddress
REWARD_RATE_PER_1E18=60000000000000000000000  # 60,000 GRMPS per 1 BNB

# Run script
forge script script/Interact.s.sol:ConfigureRewardsScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $ARBITER_PRIVATE_KEY \
  --broadcast
```

#### 2. Fund Escrow with GRMPS (Any address with GRMPS)
```bash
# Set in .env:
GRMPS_AMOUNT=300000000000000000000  # 300 GRMPS

# Transfer GRMPS to escrow
forge script script/Interact.s.sol:FundGRMPSScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

#### 3. Buyer Funds Escrow
```bash
# Set in .env:
FUND_AMOUNT_WEI=1005000000000000000  # 1.005 BNB (1 BNB + 0.5% fee)

# Fund
forge script script/Interact.s.sol:FundEscrowScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $BUYER_PRIVATE_KEY \
  --broadcast
```

#### 4. Vendor Delivers Work
```bash
# Set in .env:
IPFS_CID=QmYourIPFSCIDHere
CONTENT_HASH=0x1234567890abcdef...  # Optional hash

# Deliver
forge script script/Interact.s.sol:DeliverWorkScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $VENDOR_PRIVATE_KEY \
  --broadcast
```

#### 5. Buyer Approves Work
```bash
# Use same CID as delivery
forge script script/Interact.s.sol:ApproveWorkScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $BUYER_PRIVATE_KEY \
  --broadcast
```

#### 6. Vendor Withdraws
```bash
forge script script/Interact.s.sol:WithdrawScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $VENDOR_PRIVATE_KEY \
  --broadcast
```

---

### Example 2: Buyer Cancels Before Delivery

#### 1. Buyer Funds
```bash
forge script script/Interact.s.sol:FundEscrowScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $BUYER_PRIVATE_KEY \
  --broadcast
```

#### 2. Buyer Cancels
```bash
forge script script/Interact.s.sol:CancelEscrowScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $BUYER_PRIVATE_KEY \
  --broadcast
```

---

### Example 3: Dispute Resolution

#### 1. Fund and Deliver (as above)

#### 2. Buyer Initiates Dispute
```bash
# Buyer uses reserved fee, no payment needed
forge script script/Interact.s.sol:InitiateDisputeScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $BUYER_PRIVATE_KEY \
  --broadcast
```

#### 3. Vendor Pays Dispute Fee
```bash
# Set in .env:
DISPUTE_FEE_WEI=5000000000000000  # 0.5% of project amount

forge script script/Interact.s.sol:PayDisputeFeeScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $VENDOR_PRIVATE_KEY \
  --broadcast
```

#### 4. Arbiter Resolves Dispute
```bash
# Set in .env:
RESOLUTION=vendor  # or "buyer"

forge script script/Interact.s.sol:ResolveDisputeScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --private-key $ARBITER_PRIVATE_KEY \
  --broadcast
```

---

## Utility Scripts

### View Escrow Info
```bash
forge script script/Interact.s.sol:ViewEscrowInfoScript \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Check Balances
```bash
# Check BNB balance
cast balance $BUYER_ADDRESS --rpc-url $BSC_TESTNET_RPC_URL

# Check GRMPS balance
cast call $GRMPS_TOKEN_ADDRESS "balanceOf(address)(uint256)" $ESCROW_ADDRESS --rpc-url $BSC_TESTNET_RPC_URL
```

### Get Escrow State
```bash
# Get state as uint
cast call $ESCROW_ADDRESS "getState()(uint256)" --rpc-url $BSC_TESTNET_RPC_URL

# States: 0=Unfunded, 1=Funded, 2=Delivered, 3=Disputed, 4=Releasable, 5=Paid, 6=Refunded
```

### Check if Releasable
```bash
cast call $ESCROW_ADDRESS "isReleasable()(bool)" --rpc-url $BSC_TESTNET_RPC_URL
```

---

## Direct Contract Calls (Alternative)

### Using Cast

#### Fund Escrow
```bash
cast send $ESCROW_ADDRESS "fund()" \
  --value 1.005ether \
  --private-key $BUYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

#### Deliver Work
```bash
cast send $ESCROW_ADDRESS "deliver(string,bytes32)" "QmYourCID" "0x0000000000000000000000000000000000000000000000000000000000000000" \
  --private-key $VENDOR_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

#### Approve Work
```bash
cast send $ESCROW_ADDRESS "approve(string)" "QmYourCID" \
  --private-key $BUYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

#### Withdraw
```bash
cast send $ESCROW_ADDRESS "withdraw()" \
  --private-key $VENDOR_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

---

## Monitoring & Events

### Watch Events
```bash
# Watch all events
cast logs --from-block latest --rpc-url $BSC_TESTNET_RPC_URL --address $ESCROW_ADDRESS

# Watch specific event
cast logs "Funded(address indexed,uint256,uint256)" --rpc-url $BSC_TESTNET_RPC_URL --address $ESCROW_ADDRESS
```

### Decode Transaction
```bash
cast tx $TX_HASH --rpc-url $BSC_TESTNET_RPC_URL
```

---

## Troubleshooting

### Issue: "Insufficient funds"
**Solution:** Get test BNB from faucet or check balance
```bash
cast balance $YOUR_ADDRESS --rpc-url $BSC_TESTNET_RPC_URL
```

### Issue: "OnlyBuyer/OnlyVendor error"
**Solution:** Verify you're using correct private key for the role

### Issue: "BadState error"
**Solution:** Check current state
```bash
cast call $ESCROW_ADDRESS "getState()(uint256)" --rpc-url $BSC_TESTNET_RPC_URL
```

### Issue: Gas estimation failed
**Solution:** Add `--gas-limit 500000` to your command

### Issue: Transaction reverted
**Solution:** Run with `-vvvv` flag to see detailed error

---

## Mainnet Deployment

⚠️ **IMPORTANT: Triple-check everything before mainnet!**

### Checklist
- [ ] All tests passing
- [ ] Verified on testnet
- [ ] Real addresses configured
- [ ] Sufficient BNB for gas
- [ ] GRMPS owner will exclude escrow from fees
- [ ] Deadline is correct
- [ ] Fee recipient is correct

### Deploy to Mainnet
```bash
# Use mainnet RPC
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BSC_MAINNET_RPC_URL \
  --broadcast \
  --verify \
  --legacy \
  -vvvv
```

---

## Important Notes

1. **GRMPS Fee Exclusion:**
   - After deploying escrow, GRMPS owner MUST call:
   ```bash
   cast send $GRMPS_TOKEN_ADDRESS "excludeFromFees(address,bool)" $ESCROW_ADDRESS true \
     --private-key $GRMPS_OWNER_KEY \
     --rpc-url $BSC_TESTNET_RPC_URL
   ```

2. **Gas Prices:**
   - BSC Testnet: Usually 10 gwei
   - BSC Mainnet: Check https://bscscan.com/gastracker

3. **Confirmation Times:**
   - BSC block time: ~3 seconds
   - Wait 1-2 blocks for confirmation

4. **Security:**
   - Never commit `.env` file
   - Use hardware wallet for mainnet
   - Test thoroughly on testnet first

---

## Resources

- **BSC Testnet Explorer:** https://testnet.bscscan.com/
- **BSC Mainnet Explorer:** https://bscscan.com/
- **Foundry Book:** https://book.getfoundry.sh/
- **BSC Docs:** https://docs.bnbchain.org/

---

## Quick Reference

### Network Details

**BSC Testnet:**
- Chain ID: 97
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545/
- Explorer: https://testnet.bscscan.com/
- Faucet: https://testnet.bnbchain.org/faucet-smart

**BSC Mainnet:**
- Chain ID: 56
- RPC: https://bsc-dataseed.binance.org/
- Explorer: https://bscscan.com/

### State Mappings
```
0 = Unfunded
1 = Funded
2 = Delivered
3 = Disputed
4 = Releasable
5 = Paid
6 = Refunded
```

### Fee Calculations
```
Buyer sends: X BNB
Project amount: X / 1.005
Buyer fee: X - projectAmount

Normal completion fee: 1% (0.5% buyer + 0.5% vendor)
Dispute fee: 0.5% per side
Reward: 0.25% per side (in GRMPS)
```

