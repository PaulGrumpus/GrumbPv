# 🚀 Quick Deployment Guide

The **fastest** way to deploy using Foundry scripts.

## ⚠️ IMPORTANT: Gas Settings for BSC

**BSC requires higher gas than default!** Always use:
- **Gas Price:** 10 gwei (10000000000 wei)
- **Gas Limit:** 2-3M for deployments

**Symptom of low gas:** Transactions stuck/pending for minutes.

**Solution:** All commands below include proper gas settings! ✅

## 1️⃣ Setup Environment

```bash
cd contract
cp .env.example .env  # Create from example

# Edit .env and add:
# PRIVATE_KEY=0xYourDeployerPrivateKey
# BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
# GRMPS_TOKEN_ADDRESS=0xYourGRMPSAddress  # Optional

# Gas settings (important for BSC!)
# GAS_PRICE=10000000000   # 10 gwei (prevents delays)
# GAS_LIMIT=3000000       # 3M gas
```

**Note:** Gas settings are already configured in `foundry.toml`, but you can override them in `.env` if needed.

## 2️⃣ Deploy Using Script (Easiest!)

```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

The script will:
- ✅ Deploy Implementation
- ✅ Deploy Factory
- ✅ Deploy RewardDistributor (optional)
- ✅ Configure everything automatically
- ✅ Save addresses to `.env.deployed`

**Follow the prompts!**

## 3️⃣ Or Deploy Manually (Step-by-Step)

### Deploy Implementation
```bash
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 5000000

# Copy address and export
export ESCROW_IMPLEMENTATION_ADDRESS=0xABC...
```

### Deploy Factory (with higher gas for BSC!)
```bash
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 5000000

# Copy address and export
export FACTORY_ADDRESS=0xDEF...
```

### Deploy RewardDistributor
```bash
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 3000000

# Copy address
export REWARD_DISTRIBUTOR_ADDRESS=0xGHI...
```

### Configure
```bash
# Link factory to distributor
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 10000000000 \
  --gas-limit 500000

# Authorize factory (ONE TIME → all escrows authorized!)
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 10000000000 \
  --gas-limit 500000
```

## 4️⃣ Final Steps

```bash
# Copy addresses to web3
cd ../web3
echo "FACTORY_ADDRESS=0xDEF..." >> .env
echo "REWARD_DISTRIBUTOR_ADDRESS=0xGHI..." >> .env

# Approve GRMPS
npm run approve:distributor
```

## 5️⃣ Test It!

```bash
# Create an escrow
npm run create:escrow

# Should work! 🎉
```

## 📝 What You Need

**Before deployment:**
- ✅ Foundry installed (`forge --version`)
- ✅ BSC Testnet BNB (get from faucet)
- ✅ Deployer private key
- ✅ GRMPS token address (if using rewards)

**After deployment:**
- ✅ Approve GRMPS to RewardDistributor
- ✅ Exclude reward source from GRMPS fees

## 🆘 Problems?

**Can't find addresses after deployment?**
```bash
# Check the broadcast directory
cat broadcast/DeployFactory.s.sol/97/run-latest.json | grep contractAddress
```

**Want to verify contracts?**
```bash
# Add to deployment commands:
--verify --etherscan-api-key $BSCSCAN_API_KEY
```

**Need more details?**
- Read `DEPLOYMENT_WITH_FOUNDRY.md` - Complete guide
- Read `AUTHORIZATION_SYSTEM.md` - How authorization works

## 🎊 Done!

You now have:
- ✅ Escrow Factory deployed
- ✅ RewardDistributor deployed
- ✅ Factory authorized (all escrows work automatically!)
- ✅ Ready to create unlimited escrows

**Create your first escrow:**
```bash
cd web3
npm run create:escrow
```

🚀 **Happy escrow-ing!**

