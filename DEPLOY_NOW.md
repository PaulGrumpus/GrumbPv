# 🚀 Deploy NOW - Complete Commands

**Copy and paste these commands** to deploy with proper gas settings (fast on BSC!).

## ⚡ The Problem You Had

**Low gas = slow/stuck transactions** on BSC!

**Solution:** Use `--gas-price 10000000000` (10 gwei) for all deployments.

## ✅ Fixed Commands (Ready to Use!)

### 1. Setup
```bash
cd contract

# Make sure .env has:
# PRIVATE_KEY=0x...
# BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
# GRMPS_TOKEN_ADDRESS=0x...
```

### 2. Option A: Automated (Easiest!)

```bash
./deploy-all.sh
```

The script now includes **proper gas settings automatically**! ✅

### 2. Option B: Manual Deployment

#### Deploy Implementation
```bash
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 5000000 \
  -vvvv

# Save address
export ESCROW_IMPLEMENTATION_ADDRESS=0x...
```

#### Deploy Factory ⚡ (This was slow before!)
```bash
# NOW WITH PROPER GAS - FAST! 🚀
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 5000000 \
  -vvvv

# Save address
export FACTORY_ADDRESS=0x...
```

**This fixes your slow deployment issue!**

#### Deploy RewardDistributor
```bash
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 3000000 \
  -vvvv

# Save address
export REWARD_DISTRIBUTOR_ADDRESS=0x...
```

#### Configure (with gas!)
```bash
# Link factory
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 10000000000 \
  --gas-limit 500000

# Authorize factory
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 10000000000 \
  --gas-limit 500000
```

### 3. Final Setup
```bash
cd ../web3

# Add addresses
echo "FACTORY_ADDRESS=$FACTORY_ADDRESS" >> .env
echo "REWARD_DISTRIBUTOR_ADDRESS=$REWARD_DISTRIBUTOR_ADDRESS" >> .env

# Approve GRMPS
npm run approve:distributor
```

## 🎯 Quick Summary

**The key fix for slow deployments:**

```bash
--gas-price 10000000000  # 10 gwei (REQUIRED for BSC!)
--gas-limit 5000000      # 5M gas (for complex contracts with via_ir)
```

**Now your deployments will be FAST:**
- ✅ Confirmation in 1-2 blocks (~6 seconds)
- ✅ No more waiting/stuck transactions
- ✅ Reliable deployment

## 🔍 Check Gas Prices

```bash
# Check current BSC gas
./check-gas.sh

# Check your transaction status
./check-gas.sh 0xYourTxHash
```

## ⚙️ Automatic Gas Settings

**Good news:** I've updated:
1. ✅ `foundry.toml` - Default gas settings (10 gwei)
2. ✅ `deploy-all.sh` - Uses proper gas automatically
3. ✅ All documentation - Shows correct commands

**You can now deploy without worrying about gas!**

## 🎊 Ready to Deploy?

```bash
cd contract
./deploy-all.sh
```

**It will be FAST now!** 🚀

