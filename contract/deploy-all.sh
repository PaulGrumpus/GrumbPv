#!/bin/bash

# BSC Escrow - Complete Deployment Script
# This script deploys all contracts in the correct order

set -e

echo "🚀 BSC Escrow System - Complete Deployment"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create contract/.env with:"
    echo "  PRIVATE_KEY=0x..."
    echo "  BSC_TESTNET_RPC_URL=..."
    echo "  GRMPS_TOKEN_ADDRESS=0x..."
    exit 1
fi

# Load .env
source .env

# Check required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env"
    exit 1
fi

if [ -z "$BSC_TESTNET_RPC_URL" ]; then
    echo "❌ Error: BSC_TESTNET_RPC_URL not set in .env"
    exit 1
fi

# Check for BSCSCAN_API_KEY (optional but recommended for verification)
if [ -z "$BSCSCAN_API_KEY" ]; then
    echo "⚠️  Warning: BSCSCAN_API_KEY not set in .env"
    echo "   Contract verification will be skipped"
    echo "   Set BSCSCAN_API_KEY in .env to enable verification"
    VERIFY_FLAGS=""
else
    VERIFY_FLAGS="--verify --etherscan-api-key $BSCSCAN_API_KEY"
    echo "✅ BSCSCAN_API_KEY found - contracts will be verified"
fi

# Set gas settings (important for BSC!)
GAS_PRICE=${GAS_PRICE:-20000000000}  # Default 20 gwei (BSC testnet needs higher!)
GAS_LIMIT=${GAS_LIMIT:-5000000}      # Default 5M gas
export GAS_PRICE
export GAS_LIMIT

echo "✅ Environment variables loaded"
echo "⛽ Gas settings: $((GAS_PRICE / 1000000000)) gwei, limit: $GAS_LIMIT"
echo "💡 Using --legacy transaction type for BSC compatibility"
echo ""

# ============================================
# Step 1: Deploy Escrow Implementation
# ============================================
echo "📦 Step 1/3: Deploying Escrow Implementation..."
echo "----------------------------------------------"
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  $VERIFY_FLAGS \
  --gas-price $GAS_PRICE \
  --gas-limit 5000000 \
  --legacy \
  -vv

echo ""
echo "⚠️  Please copy the Escrow Implementation address from above"
read -p "Enter ESCROW_IMPLEMENTATION_ADDRESS: " ESCROW_IMPLEMENTATION_ADDRESS

if [ -z "$ESCROW_IMPLEMENTATION_ADDRESS" ]; then
    echo "❌ Error: ESCROW_IMPLEMENTATION_ADDRESS is required"
    exit 1
fi

export ESCROW_IMPLEMENTATION_ADDRESS
echo "ESCROW_IMPLEMENTATION_ADDRESS=$ESCROW_IMPLEMENTATION_ADDRESS" >> .env.deployed
echo "✅ Implementation deployed: $ESCROW_IMPLEMENTATION_ADDRESS"
echo ""

# ============================================
# Step 2: Deploy Factory
# ============================================
echo "🏭 Step 2/3: Deploying EscrowFactory..."
echo "----------------------------------------------"
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  $VERIFY_FLAGS \
  --gas-price $GAS_PRICE \
  --gas-limit 5000000 \
  --legacy \
  -vv

echo ""
echo "⚠️  Please copy the Factory address from above"
read -p "Enter FACTORY_ADDRESS: " FACTORY_ADDRESS

if [ -z "$FACTORY_ADDRESS" ]; then
    echo "❌ Error: FACTORY_ADDRESS is required"
    exit 1
fi

export FACTORY_ADDRESS
echo "FACTORY_ADDRESS=$FACTORY_ADDRESS" >> .env.deployed
echo "✅ Factory deployed: $FACTORY_ADDRESS"
echo ""

# ============================================
# Step 3: Deploy RewardDistributor
# ============================================
if [ -z "$GRMPS_TOKEN_ADDRESS" ]; then
    echo "⚠️  Warning: GRMPS_TOKEN_ADDRESS not set"
    read -p "Do you want to deploy RewardDistributor? (y/n): " deploy_rd
    if [ "$deploy_rd" != "y" ]; then
        echo "Skipping RewardDistributor deployment"
        echo ""
        echo "🎉 Deployment Complete!"
        echo "======================="
        echo "Implementation: $ESCROW_IMPLEMENTATION_ADDRESS"
        echo "Factory: $FACTORY_ADDRESS"
        exit 0
    fi
    read -p "Enter GRMPS_TOKEN_ADDRESS: " GRMPS_TOKEN_ADDRESS
    export GRMPS_TOKEN_ADDRESS
fi

echo "💰 Step 3/3: Deploying RewardDistributor..."
echo "----------------------------------------------"
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  $VERIFY_FLAGS \
  --gas-price $GAS_PRICE \
  --gas-limit 3000000 \
  --legacy \
  -vv

echo ""
echo "⚠️  Please copy the RewardDistributor address from above"
read -p "Enter REWARD_DISTRIBUTOR_ADDRESS: " REWARD_DISTRIBUTOR_ADDRESS

if [ -z "$REWARD_DISTRIBUTOR_ADDRESS" ]; then
    echo "❌ Error: REWARD_DISTRIBUTOR_ADDRESS is required"
    exit 1
fi

export REWARD_DISTRIBUTOR_ADDRESS
echo "REWARD_DISTRIBUTOR_ADDRESS=$REWARD_DISTRIBUTOR_ADDRESS" >> .env.deployed
echo "GRMPS_TOKEN_ADDRESS=$GRMPS_TOKEN_ADDRESS" >> .env.deployed
echo "REWARD_RATE_PER_1E18=$REWARD_RATE_PER_1E18" >> .env.deployed
echo "✅ RewardDistributor deployed: $REWARD_DISTRIBUTOR_ADDRESS"
echo ""

# ============================================
# Step 4: Configuration
# ============================================
echo "⚙️  Step 4: Configuring System..."
echo "----------------------------------------------"

# Get reward rate from .env or prompt
if [ -z "$REWARD_RATE_PER_1E18" ]; then
    echo "⚠️  REWARD_RATE_PER_1E18 not set in .env"
    read -p "Enter REWARD_RATE_PER_1E18 (e.g., 10000000000000000000000 for 10000 GRMPS per 1 BNB): " REWARD_RATE_PER_1E18
    if [ -z "$REWARD_RATE_PER_1E18" ]; then
        REWARD_RATE_PER_1E18="10000000000000000000000"
        echo "Using default: $REWARD_RATE_PER_1E18"
    fi
fi

echo ""
echo "Setting up Factory reward configuration..."
echo "  RewardDistributor: $REWARD_DISTRIBUTOR_ADDRESS"
echo "  RewardToken: $GRMPS_TOKEN_ADDRESS"
echo "  RewardRatePer1e18: $REWARD_RATE_PER_1E18"
echo ""

echo "1/4: Setting RewardDistributor on Factory..."
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price $GAS_PRICE \
  --gas-limit 500000 \
  --legacy

echo "✅ Factory linked to RewardDistributor"
echo ""

echo "2/4: Setting RewardToken on Factory..."
cast send $FACTORY_ADDRESS "setRewardToken(address)" \
  $GRMPS_TOKEN_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price $GAS_PRICE \
  --gas-limit 500000 \
  --legacy

echo "✅ Factory RewardToken set to $GRMPS_TOKEN_ADDRESS"
echo ""

echo "3/4: Setting RewardRatePer1e18 on Factory..."
cast send $FACTORY_ADDRESS "setRewardRatePer1e18(uint256)" \
  $REWARD_RATE_PER_1E18 \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price $GAS_PRICE \
  --gas-limit 500000 \
  --legacy

echo "✅ Factory RewardRatePer1e18 set to $REWARD_RATE_PER_1E18"
echo ""

echo "4/4: Authorizing Factory in RewardDistributor..."
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --gas-price $GAS_PRICE \
  --gas-limit 500000 \
  --legacy

echo "✅ Factory authorized in RewardDistributor"
echo ""

# ============================================
# Summary
# ============================================
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "📋 Deployed Addresses:"
echo "  Implementation:   $ESCROW_IMPLEMENTATION_ADDRESS"
echo "  Factory:          $FACTORY_ADDRESS"
echo "  RewardDistributor: $REWARD_DISTRIBUTOR_ADDRESS"
echo ""
echo "📋 Factory Reward Configuration:"
echo "  RewardDistributor: $REWARD_DISTRIBUTOR_ADDRESS"
echo "  RewardToken:       $GRMPS_TOKEN_ADDRESS"
echo "  RewardRatePer1e18: $REWARD_RATE_PER_1E18"
echo ""
if [ ! -z "$BSCSCAN_API_KEY" ]; then
    echo "✅ Contracts verified on BscScan:"
    echo "  https://testnet.bscscan.com/address/$ESCROW_IMPLEMENTATION_ADDRESS"
    echo "  https://testnet.bscscan.com/address/$FACTORY_ADDRESS"
    echo "  https://testnet.bscscan.com/address/$REWARD_DISTRIBUTOR_ADDRESS"
    echo ""
fi
echo "Addresses saved to: contract/.env.deployed"
echo ""
echo "⚠️  Next Steps:"
echo "1. Copy addresses to backend/.env:"
echo "   FACTORY_ADDRESS=$FACTORY_ADDRESS"
echo "   REWARD_DISTRIBUTOR_ADDRESS=$REWARD_DISTRIBUTOR_ADDRESS"
echo "   GRMPS_TOKEN_ADDRESS=$GRMPS_TOKEN_ADDRESS"
echo ""
echo "2. Approve GRMPS for RewardDistributor:"
echo "   cd ../web3 && npm run approve:distributor"
echo ""
echo "3. Exclude reward source from GRMPS fees (GRMPS owner must do this):"
echo "   GRMPS.excludeFromFees(rewardSourceAddress, true)"
echo ""
echo "4. Test by creating an escrow:"
echo "   npm run create:escrow"
echo ""
echo "🚀 System is ready to use!"
echo ""
echo "ℹ️  Note: All escrows created through the factory will automatically"
echo "   inherit the reward configuration (token, rate, distributor)."

