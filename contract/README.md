# Smart Contract

Solidity smart contracts for BSC Escrow system built with Foundry.

## Structure

```
contract/
├── src/              # Smart contracts
│   └── Escrow.sol   # Main escrow contract
├── test/             # Test suite
│   └── Escrow.t.sol # Comprehensive tests
├── script/           # Deployment & interaction scripts
│   ├── Deploy.s.sol
│   ├── Escrow.s.sol
│   └── Interact.s.sol
├── lib/              # Dependencies
│   ├── forge-std/
│   └── openzeppelin-contracts/
└── foundry.toml      # Foundry configuration
```

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- BNB for gas (testnet or mainnet)

## Build & Test

```bash
# Build contracts
forge build

# Run tests
forge test -vv

# Gas report
forge test --gas-report

# Coverage
forge coverage
```

## Deployment

### BSC Testnet

```bash
# Configure environment
cp env.example .env
nano .env

# Deploy
make deploy-testnet

# Or use forge directly
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --verify
```

### BSC Mainnet

```bash
make deploy-mainnet
```

## Documentation

- **Quick Start:** `QUICKSTART.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Makefile Commands:** Run `make help`

## Current Deployment

**BSC Testnet:**
- Address: `0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B`
- Explorer: https://testnet.bscscan.com/address/0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B
- Status: ✅ Verified

## Testing

15 comprehensive tests covering:
- Normal completion flow
- Cancellation
- Deadline refunds
- Dispute initiation (buyer/vendor)
- Dispute resolution (both sides)
- Default judgments
- GRMPS reward distribution
- Fee calculations

**All tests passing:** ✅

## Security

- OpenZeppelin v5.x contracts
- ReentrancyGuard on all payment functions
- Comprehensive access control
- State machine enforcement
- IR-based compilation for stack optimization

