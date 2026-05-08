#!/usr/bin/env bash
# BSC Mainnet — One-shot deployment for Escrow + Factory + RewardDistributor
# Usage:  cd contract && ./deploy-mainnet.sh
set -euo pipefail

cd "$(dirname "$0")"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}ℹ${NC}  $*"; }
ok()    { echo -e "${GREEN}✅${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
fail()  { echo -e "${RED}❌${NC} $*" >&2; exit 1; }

# ------------------------------------------------------------------
# 1) Pre-flight
# ------------------------------------------------------------------
[ -f .env ] || fail ".env file not found in contract/. Copy from env.example and fill it."
set -a; source .env; set +a

: "${PRIVATE_KEY:?PRIVATE_KEY missing in .env}"
: "${BSC_MAINNET_RPC_URL:?BSC_MAINNET_RPC_URL missing in .env}"
: "${GRMPS_TOKEN_ADDRESS:?GRMPS_TOKEN_ADDRESS missing in .env}"

GAS_PRICE="${GAS_PRICE:-3000000000}"          # 3 gwei default
REWARD_RATE_PER_1E18="${REWARD_RATE_PER_1E18:-10000000000000000000000}"
STABLECOIN_DIVISOR="${STABLECOIN_DIVISOR:-1000}"

VERIFY_FLAGS=""
if [ -n "${BSCSCAN_API_KEY:-}" ]; then
  VERIFY_FLAGS="--verify --etherscan-api-key $BSCSCAN_API_KEY"
  ok "BSCSCAN_API_KEY found — contracts will be verified"
else
  warn "BSCSCAN_API_KEY missing — verification will be skipped"
fi

command -v forge >/dev/null || fail "forge not found. Install Foundry: https://getfoundry.sh"
command -v cast  >/dev/null || fail "cast not found. Install Foundry."
command -v python3 >/dev/null || fail "python3 not found (needed to parse broadcast files)."

DEPLOYER=$(cast wallet address "$PRIVATE_KEY")
BAL_WEI=$(cast balance "$DEPLOYER" --rpc-url "$BSC_MAINNET_RPC_URL")
BAL_BNB=$(cast --to-unit "$BAL_WEI" ether)

info "Deployer:     $DEPLOYER"
info "Balance:      $BAL_BNB BNB"
info "Gas price:    $((GAS_PRICE / 1000000000)) gwei"
info "Reward rate:  $REWARD_RATE_PER_1E18 (per 1e18 wei BNB)"
info "Stable rate:  BNB / $STABLECOIN_DIVISOR"
info "GRMPS token:  $GRMPS_TOKEN_ADDRESS"
echo

# Sanity: GRMPS exists on mainnet
SYM=$(cast call "$GRMPS_TOKEN_ADDRESS" "symbol()(string)" --rpc-url "$BSC_MAINNET_RPC_URL" 2>/dev/null || echo "")
[ -n "$SYM" ] || fail "GRMPS_TOKEN_ADDRESS does not respond on BSC mainnet. Check the address."
ok "GRMPS token symbol on mainnet: $SYM"
echo

read -p "$(echo -e ${YELLOW}Proceed with mainnet deployment? \(yes/no\):${NC} ) " confirm
[ "$confirm" = "yes" ] || fail "Aborted by user."
echo

# ------------------------------------------------------------------
# Helper: extract last deployed contractAddress from broadcast file
# ------------------------------------------------------------------
extract_addr() {
  local script="$1"
  local file="broadcast/${script}/56/run-latest.json"
  [ -f "$file" ] || fail "Broadcast file not found: $file"
  python3 - "$file" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
for tx in data.get("transactions", []):
    if tx.get("transactionType") in ("CREATE", "CREATE2") and tx.get("contractAddress"):
        addr = tx["contractAddress"]
print(addr)
PY
}

# ------------------------------------------------------------------
# 2) Deploy Escrow Implementation
# ------------------------------------------------------------------
echo "=========================================="
info "[1/3] Deploying Escrow implementation..."
echo "=========================================="
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url "$BSC_MAINNET_RPC_URL" \
  --broadcast --legacy \
  --gas-price "$GAS_PRICE" --gas-limit 5000000 \
  $VERIFY_FLAGS -vv

ESCROW_IMPLEMENTATION_ADDRESS=$(extract_addr "DeployImplementation.s.sol")
[ -n "$ESCROW_IMPLEMENTATION_ADDRESS" ] || fail "Failed to extract implementation address"
export ESCROW_IMPLEMENTATION_ADDRESS
ok "Implementation: $ESCROW_IMPLEMENTATION_ADDRESS"
echo

# ------------------------------------------------------------------
# 3) Deploy Factory
# ------------------------------------------------------------------
echo "=========================================="
info "[2/3] Deploying EscrowFactory..."
echo "=========================================="
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url "$BSC_MAINNET_RPC_URL" \
  --broadcast --legacy \
  --gas-price "$GAS_PRICE" --gas-limit 5000000 \
  $VERIFY_FLAGS -vv

FACTORY_ADDRESS=$(extract_addr "DeployFactory.s.sol")
[ -n "$FACTORY_ADDRESS" ] || fail "Failed to extract factory address"
export FACTORY_ADDRESS
ok "Factory: $FACTORY_ADDRESS"
echo

# ------------------------------------------------------------------
# 4) Deploy RewardDistributor
# ------------------------------------------------------------------
echo "=========================================="
info "[3/3] Deploying RewardDistributor..."
echo "=========================================="
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url "$BSC_MAINNET_RPC_URL" \
  --broadcast --legacy \
  --gas-price "$GAS_PRICE" --gas-limit 3000000 \
  $VERIFY_FLAGS -vv

REWARD_DISTRIBUTOR_ADDRESS=$(extract_addr "DeployRewardDistributor.s.sol")
[ -n "$REWARD_DISTRIBUTOR_ADDRESS" ] || fail "Failed to extract distributor address"
export REWARD_DISTRIBUTOR_ADDRESS
ok "RewardDistributor: $REWARD_DISTRIBUTOR_ADDRESS"
echo

# ------------------------------------------------------------------
# 5) Wire everything (5 transactions)
# ------------------------------------------------------------------
echo "=========================================="
info "Wiring contracts..."
echo "=========================================="

send() {
  local desc="$1" target="$2" sig="$3"; shift 3
  info "  → $desc"
  cast send "$target" "$sig" "$@" \
    --private-key "$PRIVATE_KEY" \
    --rpc-url "$BSC_MAINNET_RPC_URL" \
    --legacy --gas-price "$GAS_PRICE" --gas-limit 500000 \
    >/dev/null
  ok "    done"
}

send "Factory.setRewardDistributor" "$FACTORY_ADDRESS" \
     "setRewardDistributor(address)" "$REWARD_DISTRIBUTOR_ADDRESS"

send "Factory.setRewardToken (GRMPS)" "$FACTORY_ADDRESS" \
     "setRewardToken(address)" "$GRMPS_TOKEN_ADDRESS"

send "Factory.setRewardRatePer1e18 (BNB rate)" "$FACTORY_ADDRESS" \
     "setRewardRatePer1e18(uint256)" "$REWARD_RATE_PER_1E18"

send "Factory.setRewardRatePer1e18ForStablecoinWithDivisor($STABLECOIN_DIVISOR)" \
     "$FACTORY_ADDRESS" \
     "setRewardRatePer1e18ForStablecoinWithDivisor(uint256)" "$STABLECOIN_DIVISOR"

send "RewardDistributor.setAuthorizedFactory" "$REWARD_DISTRIBUTOR_ADDRESS" \
     "setAuthorizedFactory(address,bool)" "$FACTORY_ADDRESS" "true"

echo
ok "All wiring transactions confirmed."
echo

# ------------------------------------------------------------------
# 6) Save addresses
# ------------------------------------------------------------------
{
  echo ""
  echo "# === BSC MAINNET (chain 56) — deployed $(date -u +"%Y-%m-%dT%H:%M:%SZ") ==="
  echo "ESCROW_IMPLEMENTATION_ADDRESS=$ESCROW_IMPLEMENTATION_ADDRESS"
  echo "FACTORY_ADDRESS=$FACTORY_ADDRESS"
  echo "REWARD_DISTRIBUTOR_ADDRESS=$REWARD_DISTRIBUTOR_ADDRESS"
  echo "GRMPS_TOKEN_ADDRESS=$GRMPS_TOKEN_ADDRESS"
  echo "REWARD_RATE_PER_1E18=$REWARD_RATE_PER_1E18"
} >> .env.deployed

# ------------------------------------------------------------------
# 7) Summary
# ------------------------------------------------------------------
cat <<EOF

==================================================================
🎉  BSC MAINNET DEPLOYMENT COMPLETE
==================================================================

📋 Deployed contracts:
   Implementation     : $ESCROW_IMPLEMENTATION_ADDRESS
   Factory            : $FACTORY_ADDRESS
   RewardDistributor  : $REWARD_DISTRIBUTOR_ADDRESS

🔗 BscScan:
   https://bscscan.com/address/$ESCROW_IMPLEMENTATION_ADDRESS
   https://bscscan.com/address/$FACTORY_ADDRESS
   https://bscscan.com/address/$REWARD_DISTRIBUTOR_ADDRESS

📁 Addresses also appended to: contract/.env.deployed

⚠️  REMAINING MANUAL STEPS:

1. Approve GRMPS for the RewardDistributor (from the wallet that holds GRMPS):
     cast send $GRMPS_TOKEN_ADDRESS \\
       "approve(address,uint256)" $REWARD_DISTRIBUTOR_ADDRESS 1000000000000000000000000000 \\
       --private-key \$REWARD_SOURCE_PRIVATE_KEY \\
       --rpc-url $BSC_MAINNET_RPC_URL --legacy --gas-price $GAS_PRICE

2. Exclude reward source from GRMPS transfer fees (must be called by GRMPS owner):
     cast send $GRMPS_TOKEN_ADDRESS "excludeFromFees(address,bool)" \\
       $DEPLOYER true --private-key \$GRMPS_OWNER_KEY \\
       --rpc-url $BSC_MAINNET_RPC_URL --legacy

3. Update backend/.env:
     CHAIN_ID=56
     FACTORY_ADDRESS=$FACTORY_ADDRESS
     ESCROW_IMPLEMENTATION_ADDRESS=$ESCROW_IMPLEMENTATION_ADDRESS
     REWARD_DISTRIBUTOR_ADDRESS=$REWARD_DISTRIBUTOR_ADDRESS
     GRMPS_TOKEN_ADDRESS=$GRMPS_TOKEN_ADDRESS

4. Update frontend/.env(.local):
     NEXT_PUBLIC_CHAIN_ID=0x38
     NEXT_PUBLIC_FACTORY_ADDRESS=$FACTORY_ADDRESS
     NEXT_PUBLIC_REWARD_DISTRIBUTOR_ADDRESS=$REWARD_DISTRIBUTOR_ADDRESS
     NEXT_PUBLIC_GRMPS_TOKEN_ADDRESS=$GRMPS_TOKEN_ADDRESS

5. Restart backend and rebuild frontend.

==================================================================
EOF
