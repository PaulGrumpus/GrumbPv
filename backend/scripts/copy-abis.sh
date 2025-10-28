#!/bin/bash

# Script to copy contract ABIs from contract/out to backend/abi

set -e

echo "📋 Copying contract ABIs..."

# Determine script directory and backend root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
CONTRACT_DIR="$( cd "$BACKEND_DIR/../contract" && pwd )"

# Create abi directory in backend root if it doesn't exist
mkdir -p "$BACKEND_DIR/abi"

# Copy ABIs
cp "$CONTRACT_DIR/out/Escrow.sol/Escrow.json" "$BACKEND_DIR/abi/"
cp "$CONTRACT_DIR/out/EscrowFactory.sol/EscrowFactory.json" "$BACKEND_DIR/abi/"
cp "$CONTRACT_DIR/out/RewardDistributor.sol/RewardDistributor.json" "$BACKEND_DIR/abi/"

echo "✅ ABIs copied successfully!"
echo ""
echo "Files copied to $BACKEND_DIR/abi/:"
echo "  - Escrow.json"
echo "  - EscrowFactory.json"
echo "  - RewardDistributor.json"

