# 🎯 BSC Deployment - TESTED & WORKING

## ✅ The Working Configuration (Tested on BSC Testnet)

After testing, these settings **WORK** for BSC Testnet:

```bash
--gas-price 20000000000  # 20 gwei (NOT 10!)
--gas-limit 5000000      # 5M gas
--legacy                 # Legacy transaction type
```

## 🚀 Deploy Commands (Copy & Paste - TESTED!)

### Implementation Address from Previous Deployment
```bash
export ESCROW_IMPLEMENTATION_ADDRESS=0xd576c25A9a3389D5FC3acbE2F20B3451Bfa62874
```

### Deploy Factory
```bash
source .env

forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 20000000000 \
  --gas-limit 5000000 \
  --legacy \
  -vv
```

### Deploy RewardDistributor
```bash
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 20000000000 \
  --gas-limit 3000000 \
  --legacy \
  -vv
```

### Configure System
```bash
# After getting addresses from above, export them:
export FACTORY_ADDRESS=0x...
export REWARD_DISTRIBUTOR_ADDRESS=0x...

# Link Factory to RewardDistributor
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 20000000000 \
  --gas-limit 500000 \
  --legacy

# Authorize Factory
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 20000000000 \
  --gas-limit 500000 \
  --legacy
```

## 📝 Or Use the Automated Script

The `deploy-all.sh` script has been updated with working settings:

```bash
cd contract
./deploy-all.sh
```

It now uses:
- ✅ 20 gwei gas price (tested!)
- ✅ 5M gas limit (prevents OutOfGas!)
- ✅ --legacy flag (BSC compatible!)

## ⚙️ What Changed from Initial Setup

| Setting | Initial | Final (Working) |
|---------|---------|-----------------|
| **Gas Price** | 10 gwei | **20 gwei** ✅ |
| **Gas Limit** | 2-3M | **5M** ✅ |
| **TX Type** | EIP-1559 | **Legacy** ✅ |

## 💡 Why These Settings?

1. **20 gwei**: BSC Testnet is sometimes congested, 10 gwei was too low
2. **5M gas**: Contracts use `via_ir` optimization which needs more deployment gas
3. **--legacy**: BSC works better with legacy transaction format (Type 0)

## ✅ Verified Working

**Implementation:** Deployed successfully at `0xd576c25A9a3389D5FC3acbE2F20B3451Bfa62874` ✅

**Next:** Continue with Factory and RewardDistributor using commands above!

## 🎊 Quick Deploy Now

```bash
# Already deployed
export ESCROW_IMPLEMENTATION_ADDRESS=0xd576c25A9a3389D5FC3acbE2F20B3451Bfa62874

# Continue with automated script
./deploy-all.sh
```

The script will skip Implementation (already deployed) and continue with Factory and RewardDistributor! 🚀

