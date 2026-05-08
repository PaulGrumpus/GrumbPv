# Smart Contracts

Solidity smart contracts for the BSC Escrow system, built with Foundry and OpenZeppelin.

## 📁 Structure

```
contract/
├── src/
│   ├── Escrow.sol              # Core escrow logic with rewards
│   ├── EscrowFactory.sol       # Factory for gas-efficient deployment
│   └── RewardDistributor.sol   # Centralized reward distribution
├── test/
│   ├── Escrow.t.sol            # Escrow tests (15+ tests)
│   ├── EscrowFactory.t.sol     # Factory tests
│   └── RewardDistributor.sol   # RewardDistributor tests
├── script/
│   ├── DeployImplementation.s.sol    # Deploy base Escrow
│   ├── DeployFactory.s.sol           # Deploy Factory
│   ├── DeployRewardDistributor.s.sol # Deploy RewardDistributor
│   └── CreateEscrow.s.sol            # Create escrow via factory
├── deploy-all.sh               # One-command deployment script
├── env.example                 # Environment template
└── foundry.toml               # Foundry configuration
```

## 🏗️ Smart Contracts

### Escrow.sol
Core escrow contract with:
- Two-party escrow (buyer ↔ vendor)
- Optional arbiter for disputes
- IPFS CID verification
- Deadline-based refunds
- Fee system (buyer, vendor, dispute fees)
- GRMPS reward integration
- Upgradeable via proxy pattern

**Key Functions:**
- `initialize()` - Initialize escrow (called by factory)
- `fund()` - Buyer funds escrow
- `deliver()` - Vendor delivers work with IPFS CID
- `approve()` - Buyer approves delivery
- `withdraw()` - Withdraw funds (vendor after approval, buyer after deadline)
- `cancel()` - Buyer cancels before delivery
- `initiateDispute()` - Start dispute resolution
- `payDisputeFee()` - Pay to participate in dispute
- `resolveDispute()` - Arbiter resolves dispute

### EscrowFactory.sol
Minimal proxy factory using EIP-1167:
- Creates escrow clones (~100k gas vs ~3M gas)
- Deterministic and non-deterministic deployment
- Tracks created escrows
- Links to RewardDistributor
- Transferable ownership (supports Gnosis Safe)

**Key Functions:**
- `createEscrow()` - Create escrow clone
- `createEscrowDeterministic()` - Create with predictable address
- `predictEscrow()` - Predict deterministic address
- `setRewardDistributor()` - Link reward distributor
- `transferOwnership()` - Transfer to multisig

### RewardDistributor.sol
Centralized GRMPS reward distribution:
- One-time approval for all escrows
- Factory-based authorization
- Automatic authorization for factory-created escrows
- Supports multiple factories
- EOA and Gnosis Safe compatible

**Key Functions:**
- `distributeRewards()` - Distribute to multiple recipients
- `setAuthorizedFactory()` - Authorize/deauthorize factory
- `setRewardSource()` - Set token holder address
- `isAuthorized()` - Check if caller is authorized

## 🚀 Deployment

### Prerequisites

1. Install [Foundry](https://book.getfoundry.sh/getting-started/installation):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Install dependencies:
```bash
forge install
```

3. Build contracts:
```bash
forge build
```

### Quick Deployment (Recommended)

Use the automated deployment script:

```bash
# 1. Configure environment
cp env.example .env
nano .env

# Required variables:
# PRIVATE_KEY=0x...
# BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
# GRMPS_TOKEN_ADDRESS=0x...

# 2. Deploy everything
chmod +x deploy-all.sh
./deploy-all.sh
```

The script will:
1. ✅ Deploy Escrow Implementation
2. ✅ Deploy EscrowFactory
3. ✅ Deploy RewardDistributor
4. ✅ Link Factory → RewardDistributor
5. ✅ Authorize Factory in RewardDistributor
6. ✅ Save addresses to `.env.deployed`

### Manual Deployment

#### Step 1: Deploy Implementation

```bash
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vv
```

Save the `Escrow Implementation` address.

#### Step 2: Deploy Factory

```bash
# Add to .env:
export ESCROW_IMPLEMENTATION_ADDRESS=0x...

forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vv
```

Save the `EscrowFactory` address.

#### Step 3: Deploy RewardDistributor

```bash
# Ensure GRMPS_TOKEN_ADDRESS is in .env

forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vv
```

Save the `RewardDistributor` address.

#### Step 4: Configure System

```bash
# Link Factory to RewardDistributor
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --legacy

# Authorize Factory in RewardDistributor
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --legacy
```

### Mainnet Deployment

Same process, but use mainnet RPC and increase gas price:

```bash
export BSC_MAINNET_RPC_URL=https://bsc-rpc.publicnode.com/
export GAS_PRICE=3000000000  # 3 gwei (adjust based on network)

# Then run deployment scripts with mainnet RPC
```

## 🧪 Testing

### Run All Tests

```bash
forge test -vv
```

### Run Specific Test File

```bash
forge test --match-path test/Escrow.t.sol -vv
```

### Gas Report

```bash
forge test --gas-report
```

### Coverage

```bash
forge coverage
```

### Fork Testing (BSC Testnet)

```bash
forge test --fork-url $BSC_TESTNET_RPC_URL -vv
```

## 📊 Test Coverage

Current test suite includes:

**Escrow Tests (15+ tests):**
- ✅ Normal flow (fund → deliver → approve → withdraw)
- ✅ Cancellation before delivery
- ✅ Deadline refund (buyer withdraws after deadline)
- ✅ Dispute initiation (buyer/vendor)
- ✅ Dispute resolution (winner gets refund + payment)
- ✅ Default judgment (counterparty doesn't pay fee)
- ✅ Fee calculations (buyer, vendor, dispute fees)
- ✅ GRMPS reward distribution
- ✅ Access control

**Factory Tests:**
- ✅ Create escrow (non-deterministic)
- ✅ Create escrow (deterministic with salt)
- ✅ Predict deterministic address
- ✅ Track created escrows
- ✅ Gas comparison (clone vs full deployment)

**RewardDistributor Tests:**
- ✅ Factory authorization
- ✅ Escrow authorization via factory
- ✅ Reward distribution
- ✅ Allowance checks
- ✅ Multiple factories

## 🔧 Foundry Configuration

Key settings in `foundry.toml`:

```toml
[profile.default]
solc_version = "0.8.24"
optimizer = true
optimizer_runs = 200
via_ir = true              # Stack too deep fix
evm_version = "paris"      # BSC compatibility

[rpc_endpoints]
bsc_testnet = "${BSC_TESTNET_RPC_URL}"
bsc_mainnet = "${BSC_MAINNET_RPC_URL}"
```

## 📝 Environment Variables

Create `.env` file:

```bash
# Deployer
PRIVATE_KEY=0x...

# Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
BSC_MAINNET_RPC_URL=https://bsc-rpc.publicnode.com/

# BscScan (for verification)
BSCSCAN_API_KEY=...

# GRMPS Token
GRMPS_TOKEN_ADDRESS=0xe5189B697a8e679d5151d8740Ccf6A93B9e676B6

# Deployed Contracts (filled by deploy-all.sh)
ESCROW_IMPLEMENTATION_ADDRESS=
FACTORY_ADDRESS=
REWARD_DISTRIBUTOR_ADDRESS=

# Escrow Parameters
BUYER_ADDRESS=
VENDOR_ADDRESS=
ARBITER_ADDRESS=
FEE_RECIPIENT_ADDRESS=
```

## 🔍 Contract Verification

After deployment, verify on BscScan:

```bash
forge verify-contract \
  --chain-id 97 \
  --constructor-args $(cast abi-encode "constructor(address)" $IMPLEMENTATION_ADDRESS) \
  --watch \
  $FACTORY_ADDRESS \
  src/EscrowFactory.sol:EscrowFactory
```

## 📦 Gas Optimization

Current gas costs:

| Operation | Gas Cost |
|-----------|----------|
| Deploy Implementation | ~3,000,000 |
| Deploy Factory | ~800,000 |
| Deploy RewardDistributor | ~1,500,000 |
| Create Escrow (clone) | ~100,000 ✅ |
| Fund Escrow | ~50,000 |
| Approve & Withdraw | ~150,000 |

**97% gas savings** using minimal proxy vs full deployment!

## 🔒 Security Considerations

### Implemented Protections
- ✅ **ReentrancyGuard** on all payment functions
- ✅ **State machine** enforcement (only valid transitions)
- ✅ **Access control** (onlyBuyer, onlyVendor, onlyArbiter)
- ✅ **Zero address checks** on initialization
- ✅ **Safe math** (Solidity 0.8+)
- ✅ **Minimal proxy pattern** (EIP-1167)

### Best Practices
- ✅ OpenZeppelin v5.x battle-tested contracts
- ✅ No upgradeable proxies in core escrow (immutable after creation)
- ✅ Centralized reward distribution (single approval point)
- ✅ Factory authorization system (only approved factories)

### Audit Status
- ⚠️ Not yet audited - use at your own risk
- ✅ OpenZeppelin contracts are audited
- ✅ Comprehensive test coverage

## 🛠️ Development Tools

### Useful Commands

```bash
# Format code
forge fmt

# Check for issues
forge clean && forge build

# Generate documentation
forge doc

# Analyze storage layout
forge inspect Escrow storage-layout

# Flatten contracts (for verification)
forge flatten src/Escrow.sol
```

### Cast Commands (Interact with Deployed Contracts)

```bash
# Check factory implementation
cast call $FACTORY_ADDRESS "implementation()(address)" --rpc-url $BSC_TESTNET_RPC_URL

# Check reward distributor settings
cast call $REWARD_DISTRIBUTOR_ADDRESS "rewardToken()(address)" --rpc-url $BSC_TESTNET_RPC_URL

# Create escrow via factory (example)
cast send $FACTORY_ADDRESS "createEscrow(...)" \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --legacy
```

## 📚 Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [EIP-1167: Minimal Proxy](https://eips.ethereum.org/EIPS/eip-1167)
- [BSC Documentation](https://docs.bnbchain.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 🐛 Troubleshooting

### "Stack too deep" error
Already fixed with `via_ir = true` in `foundry.toml`

### Slow/stuck transactions on BSC
Increase gas price: `export GAS_PRICE=20000000000` (20 gwei)

### Nonce too low error
Use `--nonce <nonce>` flag or wait for previous tx to confirm

### Verification failed
Ensure you're using the same Solidity version and optimizer settings

---

For web3 integration and usage examples, see [`../web3/README.md`](../web3/README.md)
