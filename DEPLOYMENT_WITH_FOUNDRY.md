# Deployment Guide Using Foundry Scripts

Complete guide to deploy all contracts using Foundry `.s.sol` scripts.

## Prerequisites

1. **Foundry installed** - `forge --version`
2. **BSC Testnet BNB** - Get from https://testnet.bnbchain.org/faucet-smart
3. **Private keys ready**

## 🔑 Environment Setup

Create or update `contract/.env`:

```bash
# Deployer private key (for infrastructure contracts)
PRIVATE_KEY=0xYourDeployerPrivateKey
DEPLOYER_PRIVATE_KEY=0xYourDeployerPrivateKey  # Same as above

# Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/

# GRMPS Token (if using rewards)
GRMPS_TOKEN_ADDRESS=0xYourGRMPSTokenAddress

# These will be filled as you deploy
ESCROW_IMPLEMENTATION_ADDRESS=
FACTORY_ADDRESS=
REWARD_DISTRIBUTOR_ADDRESS=
REWARD_SOURCE_ADDRESS=  # Usually same as deployer
```

**⚠️ IMPORTANT:** Never commit `.env` to git!

## 📦 Deployment Steps

### Step 1: Deploy Escrow Implementation

This is the template contract that will be cloned by the factory.

```bash
cd contract

# Deploy with proper gas settings for BSC
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 5000000 \
  --verify \
  --etherscan-api-key $BSCSCAN_API_KEY \
  -vvvv
```

**Gas Settings:**
- `--gas-price 10000000000` = 10 gwei (fast confirmation on BSC)
- `--gas-limit 5000000` = 5M gas (required due to via_ir optimization)

**Output:**
```
Escrow Implementation deployed at: 0xABC...
```

**Save the address:**
```bash
# Add to contract/.env
ESCROW_IMPLEMENTATION_ADDRESS=0xABC...

# Or export for current session
export ESCROW_IMPLEMENTATION_ADDRESS=0xABC...
```

### Step 2: Deploy Factory

This creates escrows from the implementation.

```bash
# Deploy with proper gas settings (IMPORTANT for BSC!)
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 5000000 \
  --verify \
  --etherscan-api-key $BSCSCAN_API_KEY \
  -vvvv
```

**Gas Settings:**
- `--gas-price 10000000000` = 10 gwei (prevents delays!)
- `--gas-limit 5000000` = 5M gas (factory is larger contract)

**Output:**
```
EscrowFactory deployed at: 0xDEF...
Factory owner: 0xYourDeployerAddress
```

**Save the address:**
```bash
# Add to contract/.env
FACTORY_ADDRESS=0xDEF...

# Or export for current session
export FACTORY_ADDRESS=0xDEF...
```

### Step 3: Deploy RewardDistributor

This manages GRMPS rewards for all escrows.

```bash
# Deploy with proper gas settings
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --gas-price 10000000000 \
  --gas-limit 3000000 \
  --verify \
  --etherscan-api-key $BSCSCAN_API_KEY \
  -vvvv
```

**Gas Settings:**
- `--gas-price 10000000000` = 10 gwei
- `--gas-limit 3000000` = 3M gas

**Output:**
```
RewardDistributor deployed at: 0xGHI...
Owner: 0xYourDeployerAddress
Reward Token: 0xGRMPS...
Reward Source: 0xYourDeployerAddress
```

**Save the address:**
```bash
# Add to contract/.env
REWARD_DISTRIBUTOR_ADDRESS=0xGHI...

# Also add to web3/.env
cd ../web3
echo "REWARD_DISTRIBUTOR_ADDRESS=0xGHI..." >> .env
```

## ⚙️ Post-Deployment Configuration

### Step 4: Link Factory to RewardDistributor

```bash
cd contract

cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 10000000000 \
  --gas-limit 500000
```

**Verify:**
```bash
cast call $FACTORY_ADDRESS "rewardDistributor()" \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Step 5: Authorize Factory in RewardDistributor

**ONE TIME AUTHORIZATION** → All escrows (past & future) are authorized!

```bash
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price 10000000000 \
  --gas-limit 500000
```

**Verify:**
```bash
cast call $REWARD_DISTRIBUTOR_ADDRESS "authorizedFactories(address)" \
  $FACTORY_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL
# Should return: true
```

### Step 6: Approve GRMPS for RewardDistributor

Switch to web3 directory and approve GRMPS:

```bash
cd ../web3

# Copy addresses to web3/.env
echo "FACTORY_ADDRESS=$FACTORY_ADDRESS" >> .env
echo "REWARD_DISTRIBUTOR_ADDRESS=$REWARD_DISTRIBUTOR_ADDRESS" >> .env
echo "ESCROW_IMPLEMENTATION_ADDRESS=$ESCROW_IMPLEMENTATION_ADDRESS" >> .env

# Approve GRMPS (one time for all escrows!)
npm run approve:distributor
```

### Step 7: Exclude Reward Source from GRMPS Fees

**CRITICAL:** GRMPS owner must do this!

```bash
cd ../contract

# If you're the GRMPS owner
cast send $GRMPS_TOKEN_ADDRESS "excludeFromFees(address,bool)" \
  $REWARD_SOURCE_ADDRESS true \
  --private-key $GRMPS_OWNER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

## ✅ Verification Checklist

After deployment, verify everything:

```bash
# 1. Check implementation
cast call $FACTORY_ADDRESS "implementation()" --rpc-url $BSC_TESTNET_RPC_URL

# 2. Check factory owner
cast call $FACTORY_ADDRESS "owner()" --rpc-url $BSC_TESTNET_RPC_URL

# 3. Check factory's reward distributor
cast call $FACTORY_ADDRESS "rewardDistributor()" --rpc-url $BSC_TESTNET_RPC_URL

# 4. Check if factory is authorized
cast call $REWARD_DISTRIBUTOR_ADDRESS "authorizedFactories(address)" \
  $FACTORY_ADDRESS --rpc-url $BSC_TESTNET_RPC_URL

# 5. Check reward distributor owner
cast call $REWARD_DISTRIBUTOR_ADDRESS "owner()" --rpc-url $BSC_TESTNET_RPC_URL

# 6. Check reward source
cast call $REWARD_DISTRIBUTOR_ADDRESS "rewardSource()" --rpc-url $BSC_TESTNET_RPC_URL

# 7. Check GRMPS allowance
cast call $GRMPS_TOKEN_ADDRESS "allowance(address,address)" \
  $REWARD_SOURCE_ADDRESS $REWARD_DISTRIBUTOR_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL
```

## 🧪 Test Deployment

Create a test escrow to verify everything works:

```bash
cd ../web3

# Create escrow
npm run create:escrow

# Fund it
BUYER_PRIVATE_KEY=0x... npm run fund

# Deliver
VENDOR_PRIVATE_KEY=0x... npm run deliver

# Approve
BUYER_PRIVATE_KEY=0x... npm run approve

# Withdraw (rewards will be distributed automatically!)
VENDOR_PRIVATE_KEY=0x... npm run withdraw
```

## 🔄 Re-deployment (if needed)

If you need to redeploy:

### Redeploy Everything
```bash
# 1. Deploy new implementation
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL --broadcast

# 2. Update .env with new address

# 3. Deploy new factory
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL --broadcast

# 4. Deploy new reward distributor
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL --broadcast

# 5. Reconfigure (Steps 4-7 above)
```

### Redeploy Only Factory
```bash
# If you just need a new factory with same implementation
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL --broadcast

# Then reconfigure Steps 4-5
```

## 📝 Environment Variables Summary

After deployment, your `contract/.env` should look like:

```bash
# Deployer
PRIVATE_KEY=0x...
DEPLOYER_PRIVATE_KEY=0x...  # Same as PRIVATE_KEY

# Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/

# Deployed Contracts
ESCROW_IMPLEMENTATION_ADDRESS=0xABC...
FACTORY_ADDRESS=0xDEF...
REWARD_DISTRIBUTOR_ADDRESS=0xGHI...

# GRMPS
GRMPS_TOKEN_ADDRESS=0xJKL...
REWARD_SOURCE_ADDRESS=0xYourDeployerAddress  # Usually same as deployer
```

And your `web3/.env`:

```bash
# All from above, plus:
DEPLOYER_PRIVATE_KEY=0x...
ARBITER_PRIVATE_KEY=0x...  # Different from deployer in production
BUYER_PRIVATE_KEY=0x...
VENDOR_PRIVATE_KEY=0x...

# Addresses
BUYER_ADDRESS=0x...
VENDOR_ADDRESS=0x...
ARBITER_ADDRESS=0x...
FEE_RECIPIENT_ADDRESS=0x...
```

## 🎯 Quick Deploy Script

For convenience, here's a complete deployment script:

```bash
#!/bin/bash
# deploy-all.sh

set -e

echo "🚀 Deploying BSC Escrow System..."

# Step 1: Deploy Implementation
echo "\n📦 Step 1: Deploying Escrow Implementation..."
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast

read -p "Enter ESCROW_IMPLEMENTATION_ADDRESS: " IMPL_ADDR
export ESCROW_IMPLEMENTATION_ADDRESS=$IMPL_ADDR

# Step 2: Deploy Factory
echo "\n🏭 Step 2: Deploying Factory..."
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast

read -p "Enter FACTORY_ADDRESS: " FACTORY_ADDR
export FACTORY_ADDRESS=$FACTORY_ADDR

# Step 3: Deploy RewardDistributor
echo "\n💰 Step 3: Deploying RewardDistributor..."
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast

read -p "Enter REWARD_DISTRIBUTOR_ADDRESS: " RD_ADDR
export REWARD_DISTRIBUTOR_ADDRESS=$RD_ADDR

# Step 4: Configure
echo "\n⚙️  Step 4: Configuring Factory..."
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL

echo "\n✅ Step 5: Authorizing Factory..."
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL

echo "\n🎉 Deployment complete!"
echo "\nAddresses:"
echo "Implementation: $ESCROW_IMPLEMENTATION_ADDRESS"
echo "Factory: $FACTORY_ADDRESS"
echo "RewardDistributor: $REWARD_DISTRIBUTOR_ADDRESS"

echo "\n⚠️  Next steps:"
echo "1. Run: npm run approve:distributor (in web3 directory)"
echo "2. Exclude reward source from GRMPS fees"
echo "3. Test with: npm run create:escrow"
```

Save as `deploy-all.sh`, make executable, and run:

```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

## 🆘 Common Issues

### Issue: "ESCROW_IMPLEMENTATION_ADDRESS not set"
**Solution:** Export the address after step 1:
```bash
export ESCROW_IMPLEMENTATION_ADDRESS=0xABC...
```

### Issue: "insufficient funds for gas"
**Solution:** Get more testnet BNB from faucet

### Issue: "UnauthorizedCaller" when distributing rewards
**Solution:** Ensure factory is authorized:
```bash
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true --private-key $PRIVATE_KEY
```

### Issue: Rewards not distributed
**Solutions:**
1. Check GRMPS allowance: `cast call $GRMPS_TOKEN "allowance(address,address)" $REWARD_SOURCE $REWARD_DISTRIBUTOR`
2. Check reward source is excluded from fees
3. Check factory is authorized

## 📚 Additional Resources

- **Complete Guide:** `REWARD_DISTRIBUTOR_GUIDE.md`
- **Authorization:** `AUTHORIZATION_SYSTEM.md`
- **Roles:** `ROLES_AND_RESPONSIBILITIES.md`
- **Quick Ref:** `QUICK_REFERENCE.md`

## 🎊 Success!

After deployment, you can:
- Create unlimited escrows via factory
- All escrows automatically authorized for rewards
- Scalable reward distribution
- Transfer ownership to Gnosis Safe when ready

Happy deploying! 🚀

