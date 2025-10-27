# BSC Escrow System

A production-ready, scalable escrow system for BNB Smart Chain with factory pattern deployment, dispute resolution, fee management, and GRMPS token rewards.

## 🌟 Features

### Core Escrow Features
- ✅ Two-party escrow for BNB (native token)
- ✅ IPFS CID verification for deliverables
- ✅ Deadline-based automatic refunds
- ✅ Optional arbiter for dispute resolution
- ✅ Cancel functionality before delivery
- ✅ Factory pattern for gas-efficient deployment (~100k gas vs ~3M gas)

### Advanced Dispute System
- ✅ Pay-to-dispute mechanism (prevents frivolous disputes)
- ✅ Automatic default judgment if counterparty doesn't respond
- ✅ Winner gets dispute fee refunded, loser pays
- ✅ Arbiter receives 50% of loser's fee as compensation
- ✅ Asymmetric deadlines (buyer gets more time to respond)

### Fee System
- ✅ 1% total fee on successful completion (0.5% buyer + 0.5% vendor)
- ✅ Dispute fees: 0.5% per side
- ✅ Winner's dispute fee refunded
- ✅ No fees on cancellation or deadline refunds

### GRMPS Reward System
- ✅ Optional GRMPS (BEP-20) token rewards on completion
- ✅ 0.25% per side (buyer and vendor)
- ✅ Centralized RewardDistributor for scalability
- ✅ Approve once for all escrows (factory authorization)
- ✅ Works with EOA wallets and Gnosis Safe multisig
- ✅ No rewards on dispute paths

## 📁 Project Structure

```
bsc-escrow/
├── contract/              # Smart contracts (Foundry/Solidity)
│   ├── src/
│   │   ├── Escrow.sol              # Core escrow logic
│   │   ├── EscrowFactory.sol       # Factory for gas-efficient deployment
│   │   └── RewardDistributor.sol   # Centralized reward distribution
│   ├── script/                     # Deployment scripts
│   ├── test/                       # Contract tests
│   └── deploy-all.sh              # One-command deployment script
│
└── web3/                  # Web3 integration (JavaScript/ethers.js)
    ├── scripts/           # Interaction scripts (fund, approve, etc.)
    ├── examples/          # Frontend integration examples
    └── abi/              # Contract ABIs
```

## 🚀 Quick Start

### 1. Deploy Smart Contracts

```bash
# Navigate to contract directory
cd contract

# Configure environment
cp env.example .env
nano .env  # Add PRIVATE_KEY, BSC_TESTNET_RPC_URL, GRMPS_TOKEN_ADDRESS

# Deploy all contracts (Implementation + Factory + RewardDistributor)
chmod +x deploy-all.sh
./deploy-all.sh
```

This deploys:
1. **Escrow Implementation** - Base contract for cloning
2. **EscrowFactory** - Creates minimal proxy escrows
3. **RewardDistributor** - Manages GRMPS token rewards

See [`contract/README.md`](contract/README.md) for detailed deployment instructions.

### 2. Configure Reward System

```bash
# Navigate to web3 directory
cd ../web3

# Install dependencies
npm install

# Copy deployed addresses to .env
nano .env  # Add FACTORY_ADDRESS, REWARD_DISTRIBUTOR_ADDRESS

# Approve GRMPS tokens for RewardDistributor
npm run approve:distributor
```

### 3. Create and Use Escrows

```bash
# Create a new escrow via factory
npm run create:escrow

# Interact with the escrow
npm run fund           # Buyer funds escrow
npm run deliver        # Vendor delivers work
npm run approve        # Buyer approves delivery
npm run withdraw       # Vendor withdraws payment
```

See [`web3/README.md`](web3/README.md) for all available scripts.

## 📖 Documentation

### Smart Contracts
- **[Contract README](contract/README.md)** - Build, test, and deploy contracts
- **[Escrow.sol](contract/src/Escrow.sol)** - Core escrow implementation
- **[EscrowFactory.sol](contract/src/EscrowFactory.sol)** - Factory for creating escrows
- **[RewardDistributor.sol](contract/src/RewardDistributor.sol)** - Reward distribution system

### Web3 Integration
- **[Web3 README](web3/README.md)** - Scripts and frontend integration
- **[Examples](web3/examples/)** - Frontend integration examples
- **[Scripts](web3/scripts/)** - CLI interaction scripts

## 🔄 Complete Workflow

### System Setup (One-time)

```bash
# 1. Deploy contracts
cd contract
./deploy-all.sh

# 2. Configure web3
cd ../web3
npm install
# Add FACTORY_ADDRESS and REWARD_DISTRIBUTOR_ADDRESS to .env

# 3. Approve GRMPS for rewards
npm run approve:distributor
```

### Per-Escrow Workflow

```bash
# 1. Create escrow (Factory creates minimal proxy)
npm run create:escrow
# Save the escrow address

# 2. Buyer funds escrow
ESCROW_ADDRESS=0x... FUND_AMOUNT=1.0 npm run fund

# 3. Vendor delivers work
ESCROW_ADDRESS=0x... IPFS_CID=QmYourCID npm run deliver

# 4. Buyer approves delivery
ESCROW_ADDRESS=0x... IPFS_CID=QmYourCID npm run approve

# 5. Vendor withdraws payment (with GRMPS rewards!)
ESCROW_ADDRESS=0x... npm run withdraw
```

### Alternative Paths

**Cancellation (before delivery):**
```bash
npm run cancel  # Buyer gets full refund
```

**Deadline Refund (after deadline expires):**
```bash
npm run withdraw  # Buyer can withdraw after deadline
```

**Dispute Resolution:**
```bash
# 1. Initiate dispute (buyer or vendor)
DISPUTE_INITIATOR=buyer npm run dispute-init

# 2. Counterparty pays dispute fee
DISPUTE_PAYER=vendor npm run dispute-pay

# 3. Arbiter resolves
RESOLUTION=vendor npm run dispute-resolve
```

## 🏗️ Architecture

### Factory Pattern
- **EscrowFactory** deploys minimal proxy clones using EIP-1167
- **Gas savings:** ~97% less gas per escrow (~100k vs ~3M)
- **Upgradability:** New implementation can be deployed, new factory points to it
- **Deterministic deployment:** Predict escrow address before creation

### Reward Distribution
- **Centralized RewardDistributor** approved once for all escrows
- **Factory authorization:** Authorize factory → all its escrows are authorized
- **Scalable:** No need to approve each escrow individually
- **Safe:** Only factory-created escrows can request rewards

### Security
- ✅ OpenZeppelin v5.x contracts
- ✅ ReentrancyGuard on all payment functions
- ✅ Comprehensive access control
- ✅ State machine enforcement
- ✅ Minimal proxy pattern (EIP-1167)
- ✅ Authorization system for reward distribution

## 🧪 Testing

```bash
cd contract

# Run all tests
forge test -vv

# Gas report
forge test --gas-report

# Coverage
forge coverage
```

**Test Coverage:**
- ✅ 15+ comprehensive tests
- ✅ All escrow lifecycle paths
- ✅ Dispute resolution scenarios
- ✅ Fee calculations
- ✅ GRMPS reward distribution
- ✅ Factory escrow creation

## 🌐 Network Information

### BSC Testnet (Chain ID: 97)
- **RPC URL:** `https://bsc-testnet-rpc.publicnode.com/`
- **Explorer:** https://testnet.bscscan.com/
- **Faucet:** https://testnet.bnbchain.org/faucet-smart

### BSC Mainnet (Chain ID: 56)
- **RPC URL:** `https://bsc-rpc.publicnode.com/`
- **Explorer:** https://bscscan.com/

## 📝 Environment Variables

### Contract Deployment (`contract/.env`)
```bash
PRIVATE_KEY=                    # Deployer private key
BSC_TESTNET_RPC_URL=           # BSC testnet RPC
GRMPS_TOKEN_ADDRESS=           # GRMPS token contract
```

### Web3 Interaction (`web3/.env`)
```bash
# Deployed contracts
FACTORY_ADDRESS=                # EscrowFactory address
REWARD_DISTRIBUTOR_ADDRESS=     # RewardDistributor address

# Wallets
BUYER_PRIVATE_KEY=             # Buyer wallet
VENDOR_PRIVATE_KEY=            # Vendor wallet
ARBITER_PRIVATE_KEY=           # Arbiter wallet

# Network
BSC_TESTNET_RPC_URL=           # BSC testnet RPC
```

See `contract/env.example` and `web3/.env` for complete examples.

## 🛠️ Development

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation) - Smart contract development
- [Node.js](https://nodejs.org/) v18+ - Web3 scripts
- [Git](https://git-scm.com/) - Version control

### Smart Contract Development
```bash
cd contract
forge build        # Compile contracts
forge test         # Run tests
forge fmt          # Format code
```

### Web3 Development
```bash
cd web3
npm install        # Install dependencies
npm run info       # Test connection to contracts
```

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📧 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check existing documentation
- Review contract tests for usage examples

---

**Built with ❤️ for the BNB Smart Chain ecosystem**
