# BSC Escrow Smart Contract

A production-ready escrow system for BNB Smart Chain with advanced dispute resolution, fee management, and GRMPS token rewards.

## Project Structure

```
bsc-escrow/
├── contract/          # Smart contract code (Foundry)
│   ├── src/          # Solidity contracts
│   ├── test/         # Contract tests
│   ├── script/       # Deployment scripts
│   └── lib/          # Dependencies (OpenZeppelin, forge-std)
│
└── web3/             # Web3 interaction scripts (JavaScript/TypeScript)
    ├── scripts/      # CLI interaction scripts
    ├── examples/     # Frontend integration examples
    └── abi/          # Contract ABIs
```

## Quick Links

- **Deployed Contract (Testnet):** `0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B`
- **Explorer:** https://testnet.bscscan.com/address/0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B
- **Network:** BSC Testnet (Chain ID: 97)

## Features

### Core Features
- ✅ Two-party escrow for BNB
- ✅ IPFS CID verification
- ✅ Deadline-based refunds
- ✅ Optional arbiter for disputes
- ✅ Cancel before vendor delivers

### Advanced Dispute System
- ✅ Pay-to-dispute mechanism (prevents frivolous disputes)
- ✅ Automatic default judgment if counterparty doesn't pay
- ✅ Winner gets fee refunded, loser pays
- ✅ Arbiter compensation (50% of loser's fee)
- ✅ Asymmetric deadlines (buyer gets more time)

### Fee System
- ✅ 1% total fee on normal completion (0.5% buyer + 0.5% vendor)
- ✅ Dispute fees: 0.5% per side
- ✅ Winner's fee refunded in disputes
- ✅ No fees on cancellation or deadline refunds

### GRMPS Rewards
- ✅ Optional GRMPS (BEP-20) token rewards
- ✅ 0.25% per side on successful completion
- ✅ Configurable BNB→GRMPS conversion rate
- ✅ No rewards on dispute paths
- ✅ **RewardDistributor:** Scalable architecture (approve once for all escrows)
- ✅ Works with EOA and Gnosis Safe multisig

## Getting Started

### Quick Deployment (Recommended 🚀)

**Using Foundry scripts (fastest):**
```bash
cd contract
chmod +x deploy-all.sh
./deploy-all.sh
```

See `DEPLOY_QUICK_START.md` for details.

### For Smart Contract Development

```bash
cd contract
forge build
forge test
```

See `DEPLOYMENT_WITH_FOUNDRY.md` for complete deployment guide.

### For Web3 Integration

```bash
cd web3
npm install
npm run info  # View deployed contract
```

See `web3/README.md` for usage guide.

## Documentation

### Deployment Guides 🚀
- **Quick Start:** `DEPLOY_QUICK_START.md` - Fastest way to deploy (5 minutes!)
- **Complete Guide:** `DEPLOYMENT_WITH_FOUNDRY.md` - Detailed Foundry deployment
- **Gas Configuration:** `GAS_CONFIGURATION.md` - Fix slow/stuck transactions ⚡
- **Old Guide:** `contract/DEPLOYMENT_GUIDE.md` - Original deployment guide

### Core Guides
- **Web3 Integration:** `web3/README.md`
- **Quick Reference:** `QUICK_REFERENCE.md` - Quick setup commands

### New Architecture (Scalable Rewards) ⭐
- **Reward System:** `REWARD_DISTRIBUTOR_GUIDE.md` - Complete guide to RewardDistributor
- **Authorization System:** `AUTHORIZATION_SYSTEM.md` - How factory authorization works (automatic!)
- **Roles & Responsibilities:** `ROLES_AND_RESPONSIBILITIES.md` - Clarifies Deployer vs Arbiter
- **Environment Variables:** `web3/ENV_VARIABLES.md` - All env vars explained

## Security

- ✅ OpenZeppelin contracts (Ownable, ReentrancyGuard)
- ✅ Comprehensive test coverage (15 tests)
- ✅ Verified on BscScan
- ✅ Audited logic patterns

## License

MIT
