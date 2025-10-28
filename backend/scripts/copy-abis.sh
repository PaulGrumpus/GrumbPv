#!/bin/bash

# Script to copy contract ABIs from contract/out to backend/abi

set -e

echo "📋 Copying contract ABIs..."

# Create abi directory if it doesn't exist
mkdir -p abi

# Copy ABIs
cp ../contract/out/Escrow.sol/Escrow.json abi/
cp ../contract/out/EscrowFactory.sol/EscrowFactory.json abi/
cp ../contract/out/RewardDistributor.sol/RewardDistributor.json abi/

echo "✅ ABIs copied successfully!"
echo ""
echo "Files copied:"
echo "  - Escrow.json"
echo "  - EscrowFactory.json"
echo "  - RewardDistributor.json"

