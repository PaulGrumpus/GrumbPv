# Gas Configuration for BSC Deployment

## 🔥 Problem: Slow/Stuck Transactions

If your deployment is slow or stuck, it's usually because of **low gas fees**. BSC requires proper gas settings!

## 💡 Solution: Set Proper Gas Parameters

### Current BSC Testnet Gas Price

Check current gas price:
```bash
# Using curl
curl -s https://bsc-testnet-rpc.publicnode.com/ \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":1}'

# Using cast
cast gas-price --rpc-url https://bsc-testnet-rpc.publicnode.com/
```

**Recommended gas prices:**
- **BSC Testnet:** 10 gwei (minimum 5 gwei)
- **BSC Mainnet:** Check https://bscscan.com/gastracker (usually 3-5 gwei)

## 🚀 Deploy with Proper Gas Settings

### Method 1: Using Environment Variables (Recommended)

Add to your `contract/.env`:

```bash
# Gas settings for BSC
GAS_PRICE=10000000000    # 10 gwei in wei
GAS_LIMIT=3000000        # 3 million gas
```

Then deploy:

```bash
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price $GAS_PRICE \
  --gas-limit $GAS_LIMIT \
  -vvvv
```

### Method 2: Inline Gas Settings

```bash
# Deploy Factory with 10 gwei gas price
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 3000000 \
  -vvvv
```

### Method 3: Using Cast Commands

For individual transactions (like configuration):

```bash
# Link Factory to RewardDistributor with gas settings
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 10000000000 \
  --gas-limit 500000
```

## 📊 Gas Usage Reference

Typical gas usage for each contract:

| Contract | Gas Limit Needed | Actual Usage | Notes |
|----------|-----------------|--------------|-------|
| **Escrow Implementation** | 5,000,000 | ~3,500,000 | Large contract with via_ir |
| **EscrowFactory** | 5,000,000 | ~3,500,000 | Complex factory logic |
| **RewardDistributor** | 3,000,000 | ~2,000,000 | Medium size |
| **Configuration Txs** | 500,000 | ~100,000-300,000 | Simple settings |

**Safe defaults:**
- **All deployments:** `--gas-limit 5000000` (5M gas - prevents OutOfGas)
- **Configuration:** `--gas-limit 500000` (500k gas)
- **Gas price:** `--gas-price 10000000000` (10 gwei)

**⚠️ IMPORTANT:** Due to Solidity optimizer and `via_ir` flag, contracts need higher gas limits than their runtime size suggests!

## 🔧 Updated Deployment Commands (FIXED!)

### Deploy Implementation
```bash
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 5000000 \
  -vvvv
```

### Deploy Factory
```bash
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 5000000 \
  -vvvv
```

### Deploy RewardDistributor
```bash
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 3000000 \
  -vvvv
```

## 🎯 Foundry Configuration File

Create or update `contract/foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.24"

# Gas settings for BSC
gas_price = 10_000_000_000  # 10 gwei
gas_limit = 3_000_000

# BSC-specific settings
[profile.bsc-testnet]
gas_price = 10_000_000_000
gas_limit = 3_000_000

[profile.bsc-mainnet]
gas_price = 5_000_000_000  # Adjust based on current prices
gas_limit = 3_000_000
```

Then use profiles:

```bash
# Deploy to BSC testnet with profile
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --profile bsc-testnet \
  -vvvv
```

## 🐢 What If Transaction is Still Slow?

### 1. Check Transaction Status

```bash
# Check if transaction is pending
cast tx $TX_HASH --rpc-url $BSC_TESTNET_RPC_URL

# If pending, check mempool
cast pending --rpc-url $BSC_TESTNET_RPC_URL
```

### 2. Speed Up Transaction

You can send a new transaction with same nonce but higher gas:

```bash
# Get current nonce
cast nonce $YOUR_ADDRESS --rpc-url $BSC_TESTNET_RPC_URL

# Send replacement transaction with higher gas price
# (Use same nonce, 20% higher gas price)
```

### 3. Increase Gas Price

If 10 gwei is still slow, try:
- **15 gwei:** `--gas-price 15000000000`
- **20 gwei:** `--gas-price 20000000000`

### 4. Check Network Congestion

```bash
# Check latest block and gas usage
cast block latest --rpc-url $BSC_TESTNET_RPC_URL
```

## ⚡ Quick Fix: High Gas Deployment

If you're in a hurry and don't care about gas cost:

```bash
# Deploy with high gas price (fast confirmation)
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 50000000000 \
  --gas-limit 5000000 \
  --legacy \
  -vvvv
```

**Note:** `--legacy` uses legacy transaction type (Type 0) which works better on BSC sometimes.

## 📝 Updated `.env` Template

Add these to your `contract/.env`:

```bash
# Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
PRIVATE_KEY=0x...

# Gas settings (adjust as needed)
GAS_PRICE=10000000000     # 10 gwei
GAS_LIMIT=3000000         # 3M gas
CONFIG_GAS_LIMIT=500000   # For configuration txs

# Contract addresses (filled after deployment)
ESCROW_IMPLEMENTATION_ADDRESS=
FACTORY_ADDRESS=
REWARD_DISTRIBUTOR_ADDRESS=
```

## 🔍 Monitoring Gas Prices

### BSC Testnet
```bash
# Check current gas price
cast gas-price --rpc-url $BSC_TESTNET_RPC_URL

# Convert to gwei (divide by 1e9)
cast gas-price --rpc-url $BSC_TESTNET_RPC_URL | \
  xargs -I {} echo "scale=2; {} / 1000000000" | bc
```

### BSC Mainnet
- https://bscscan.com/gastracker
- https://bsc.blocksec.com/gas-tracker

## 🎊 Summary

**For BSC Testnet deployments, always use:**

```bash
--gas-price 10000000000  # 10 gwei minimum
--gas-limit 3000000      # 3M gas for factory
```

**In your commands:**
```bash
# Full deployment with proper gas
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 3000000 \
  -vvvv
```

This will ensure **fast confirmations** (usually 1-2 blocks, ~6 seconds)! 🚀

