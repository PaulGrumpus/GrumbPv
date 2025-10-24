#!/bin/bash

# Quick script to check current BSC gas prices and your transaction status

echo "⛽ BSC Gas Price Checker"
echo "======================="
echo ""

# Load RPC URL from .env if exists
if [ -f .env ]; then
    source .env
fi

RPC_URL=${BSC_TESTNET_RPC_URL:-https://bsc-testnet-rpc.publicnode.com/}

# Check current gas price
echo "📊 Current BSC Testnet Gas Price:"
CURRENT_GAS=$(cast gas-price --rpc-url $RPC_URL)
echo "Wei: $CURRENT_GAS"
echo "Gwei: $((CURRENT_GAS / 1000000000))"
echo ""

# Recommended gas price
RECOMMENDED=$((CURRENT_GAS * 12 / 10))  # 120% of current
echo "💡 Recommended Gas Price:"
echo "Wei: $RECOMMENDED"
echo "Gwei: $((RECOMMENDED / 1000000000))"
echo ""

# Safe gas price (always fast)
SAFE_GAS=10000000000
echo "✅ Safe Gas Price (always works):"
echo "Wei: $SAFE_GAS"
echo "Gwei: $((SAFE_GAS / 1000000000))"
echo ""

# If transaction hash provided, check status
if [ ! -z "$1" ]; then
    echo "📦 Transaction Status for $1:"
    echo "----------------------------------------------"
    cast tx $1 --rpc-url $RPC_URL 2>&1 || echo "❌ Transaction not found or pending"
    echo ""
    
    echo "💡 To speed up, use this gas price: $RECOMMENDED wei ($((RECOMMENDED / 1000000000)) gwei)"
fi

echo "🚀 Deployment Commands with Proper Gas:"
echo "----------------------------------------------"
echo ""
echo "# Deploy Implementation (5M gas - via_ir needs more!):"
echo "forge script script/DeployImplementation.s.sol:DeployImplementation \\"
echo "  --rpc-url \$BSC_TESTNET_RPC_URL \\"
echo "  --broadcast \\"
echo "  --gas-price 10000000000 \\"
echo "  --gas-limit 5000000"
echo ""
echo "# Deploy Factory (5M gas - complex contract!):"
echo "forge script script/DeployFactory.s.sol:DeployFactory \\"
echo "  --rpc-url \$BSC_TESTNET_RPC_URL \\"
echo "  --broadcast \\"
echo "  --gas-price 10000000000 \\"
echo "  --gas-limit 5000000"
echo ""
echo "# Deploy RewardDistributor (3M gas):"
echo "forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \\"
echo "  --rpc-url \$BSC_TESTNET_RPC_URL \\"
echo "  --broadcast \\"
echo "  --gas-price 10000000000 \\"
echo "  --gas-limit 3000000"
echo ""
echo "# Configuration transactions (500k gas):"
echo "cast send \$CONTRACT_ADDRESS \"function(args)\" \\"
echo "  --private-key \$PRIVATE_KEY \\"
echo "  --rpc-url \$BSC_TESTNET_RPC_URL \\"
echo "  --gas-price 10000000000 \\"
echo "  --gas-limit 500000"

