# ⚠️ REDEPLOY REQUIRED

## What Changed

We fixed the error you encountered! The problem was:

**Error:** Factory tried to call `setRewardDistributor()` on escrow after initialization, but factory is not the escrow owner (arbiter is).

**Fix:** Added `rewardDistributor` as a parameter to `initialize()`, so it's set **during** initialization (before ownership transfer).

## 📝 Changes Made

1. ✅ `Escrow.sol` - Added `address _rewardDistributor` parameter to `initialize()`
2. ✅ `EscrowFactory.sol` - Passes `rewardDistributor` to `initialize()`
3. ✅ Updated test files to include the new parameter
4. ✅ Updated ABIs (`Escrow.json`, `EscrowFactory.json`)

## 🔄 You Need to Redeploy

### Which Contracts to Redeploy

| Contract | Redeploy? | Why |
|----------|-----------|-----|
| **Escrow Implementation** | ✅ YES | Changed `initialize()` signature |
| **EscrowFactory** | ✅ YES | Calls new `initialize()` signature |
| **RewardDistributor** | ❌ NO | No changes |

### Old Contracts (Can Keep Using)

Your old deployed contracts still work for their purpose:
- Old Escrows: Work fine, just use legacy reward method
- Old Factory at `0x43dFdcB4Da8bd20A463e759aEC16882AcbC9d7A3`: **Won't work** with new implementation

## 🚀 Redeploy Steps

### 1. Deploy New Implementation

```bash
cd /home/sweetdream/Work/Kash/bsc-escrow/contract

source .env

forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 20000000000 \
  --gas-limit 5000000 \
  --legacy \
  -vv
```

**Save the new address:**
```bash
export ESCROW_IMPLEMENTATION_ADDRESS=0x... # NEW ADDRESS
```

### 2. Deploy New Factory

```bash
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 20000000000 \
  --gas-limit 5000000 \
  --legacy \
  -vv
```

**Save the new address:**
```bash
export FACTORY_ADDRESS=0x... # NEW ADDRESS
```

### 3. Configure System

```bash
# Link factory to existing RewardDistributor
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 20000000000 \
  --gas-limit 500000 \
  --legacy

# Authorize new factory
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 20000000000 \
  --gas-limit 500000 \
  --legacy
```

### 4. Update Web3 Config

```bash
cd ../web3

# Update .env with NEW addresses
echo "FACTORY_ADDRESS=$FACTORY_ADDRESS" >> .env
echo "ESCROW_IMPLEMENTATION_ADDRESS=$ESCROW_IMPLEMENTATION_ADDRESS" >> .env
```

### 5. Test!

```bash
# Create new escrow (should work now!)
npm run create:escrow

# It will automatically have RewardDistributor set! ✅
```

## 🎯 Or Use Automated Script

```bash
cd contract
./deploy-all.sh
```

It will deploy:
1. New Implementation
2. New Factory  
3. (Skip RewardDistributor - already deployed)
4. Configure everything automatically

**Choose:**
- Skip RewardDistributor when prompted (already have one!)
- Or deploy a new one if you prefer

## ✅ After Redeployment

The error will be fixed! New escrows will:
- ✅ Have RewardDistributor set during initialization
- ✅ Be automatically authorized in RewardDistributor
- ✅ Work seamlessly without ownership issues

## 📚 What to Remember

**RewardDistributor** address: Keep using the existing one (`$REWARD_DISTRIBUTOR_ADDRESS`)
**Factory & Implementation**: Deploy new ones with updated code

The fix ensures factory can set the distributor **during** initialization (before arbiter becomes owner)!

