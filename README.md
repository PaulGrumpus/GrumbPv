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

## Getting Started

### For Smart Contract Development

```bash
cd contract
forge build
forge test
```

See `contract/QUICKSTART.md` for deployment guide.

### For Web3 Integration

```bash
cd web3
npm install
npm run info  # View deployed contract
```

See `web3/README.md` for usage guide.

## Documentation

- **Contract Development:** `contract/DEPLOYMENT_GUIDE.md`
- **Web3 Integration:** `web3/README.md`
- **Quick Start:** `contract/QUICKSTART.md`

## Security

- ✅ OpenZeppelin contracts (Ownable, ReentrancyGuard)
- ✅ Comprehensive test coverage (15 tests)
- ✅ Verified on BscScan
- ✅ Audited logic patterns

## License

MIT
