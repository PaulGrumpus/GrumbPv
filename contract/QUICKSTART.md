# Quick Start Guide - 5 Minutes to Deploy

Get your escrow contract deployed and running on BSC testnet in 5 minutes.

## 1. Setup (1 minute)

```bash
# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Get test BNB from faucet
# Visit: https://testnet.bnbchain.org/faucet-smart
# Enter your address and request BNB
```

## 2. Configure (1 minute)

Create `.env` file:
```bash
cat > .env << 'EOF'
# Your deployer private key (will be arbiter)
PRIVATE_KEY=0xYourPrivateKeyHere

# Participant addresses
BUYER_ADDRESS=0xBuyerAddressHere
VENDOR_ADDRESS=0xVendorAddressHere
ARBITER_ADDRESS=0xYourAddressHere
FEE_RECIPIENT_ADDRESS=0xFeeRecipientAddressHere

# Project deadline (30 days from now, or set custom timestamp)
DEADLINE_TIMESTAMP=1735689600

# BSC Testnet
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# BscScan API key (optional, for verification)
BSCSCAN_API_KEY=YourApiKeyHere
EOF
```

**Get addresses:**
```bash
# Generate new address
cast wallet new

# Or get your address from private key
cast wallet address --private-key $PRIVATE_KEY
```

## 3. Build & Test (1 minute)

```bash
# Build contracts
forge build

# Run tests
forge test -vv
```

## 4. Deploy (1 minute)

```bash
# Deploy to BSC testnet
make deploy-testnet

# Or use forge directly:
source .env
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  -vvvv
```

**Save the deployed address:**
```bash
# Add to .env file
echo "ESCROW_ADDRESS=0xYourDeployedAddress" >> .env
```

## 5. Test the Flow (1 minute)

```bash
# Source environment
source .env

# Buyer funds (1.005 BNB = 1 BNB + 0.5% fee)
FUND_AMOUNT_WEI=1005000000000000000 \
make buyer-fund

# Vendor delivers
IPFS_CID=QmTestCID123 \
CONTENT_HASH=0x0000000000000000000000000000000000000000000000000000000000000000 \
make vendor-deliver

# Buyer approves
make buyer-approve

# Vendor withdraws
make vendor-withdraw

# Check final state
make info
```

## Done! 🎉

Your escrow contract is deployed and you've completed a full transaction.

---

## Next Steps

### Setup GRMPS Rewards

```bash
# 1. Set GRMPS token address in .env
echo "GRMPS_TOKEN_ADDRESS=0xGRMPSAddress" >> .env

# 2. Set reward rate (60,000 GRMPS per 1 BNB)
echo "REWARD_RATE_PER_1E18=60000000000000000000000" >> .env

# 3. Configure rewards (as arbiter)
make setup-rewards

# 4. Fund escrow with GRMPS
GRMPS_AMOUNT=300000000000000000000 \
make fund-grmps
```

### Important: Exclude Escrow from GRMPS Fees

```bash
# GRMPS owner must call:
cast send $GRMPS_TOKEN_ADDRESS "excludeFromFees(address,bool)" $ESCROW_ADDRESS true \
  --private-key $GRMPS_OWNER_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

---

## Common Commands

```bash
# View escrow info
make info

# Check balances
make balance

# Buyer cancels (before vendor delivers)
make buyer-cancel

# Initiate dispute
make dispute-init

# View all commands
make help
```

---

## Troubleshooting

**"Insufficient funds"**
- Get more test BNB from faucet

**"OnlyBuyer error"**
- Check you're using correct private key in .env

**"Transaction reverted"**
- Run with -vvvv flag to see error details
- Check state with `make info`

---

## Full Documentation

See `DEPLOYMENT_GUIDE.md` for:
- Detailed workflow examples
- Dispute resolution
- Direct contract calls with cast
- Mainnet deployment
- Event monitoring
- Complete troubleshooting guide

