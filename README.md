# BSC Escrow System

A professional escrow system for BSC (Binance Smart Chain) with TypeScript backend API and Solidity smart contracts.

## 🎯 Overview

Complete escrow solution featuring:
- ✅ **Smart Contracts**: Factory pattern with minimal proxies (EIP-1167)
- ✅ **TypeScript Backend**: RESTful API with MVC architecture
- ✅ **Reward System**: GRMPS token distribution for completed escrows
- ✅ **Dispute Resolution**: Built-in arbitration system
- ✅ **Production Ready**: Error handling, validation, logging, security

## 📁 Project Structure

```
bsc-escrow/
├── contract/          # Solidity smart contracts (Foundry)
├── backend/           # TypeScript/Express API (NEW!)
├── web3/             # Legacy scripts (deprecated)
└── docs/             # Documentation
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed structure.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Foundry (for contracts)
- BSC Testnet RPC URL
- BNB Testnet tokens

### 1. Clone Repository

```bash
git clone <repository-url>
cd bsc-escrow
```

### 2. Deploy Smart Contracts

```bash
cd contract
cp .env.example .env
# Edit .env with your configuration
./deploy-all.sh
```

Save the deployed addresses!

### 3. Setup Backend API

```bash
cd backend
bash scripts/setup.sh
```

Edit `backend/.env` with deployed contract addresses:

```env
FACTORY_ADDRESS=0x...
ESCROW_IMPLEMENTATION_ADDRESS=0x...
REWARD_DISTRIBUTOR_ADDRESS=0x...
GRMPS_TOKEN_ADDRESS=0x...
```

### 4. Start Backend

```bash
npm run dev
```

API runs at `http://localhost:3000`

### 5. Test API

```bash
curl http://localhost:3000/health
```

## 📚 Documentation

- [Backend API Documentation](backend/README.md)
- [Contract Documentation](contract/README.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [Deployment Guide](contract/DEPLOYMENT_GUIDE.md)

## 🔧 API Endpoints

### Health Check
```http
GET /health
```

### Escrow Operations
```http
GET    /api/v1/escrow/:address              # Get info
POST   /api/v1/escrow/:address/fund          # Fund escrow
POST   /api/v1/escrow/:address/deliver       # Deliver work
POST   /api/v1/escrow/:address/approve       # Approve work
POST   /api/v1/escrow/:address/withdraw      # Withdraw funds
POST   /api/v1/escrow/:address/cancel        # Cancel escrow
```

### Factory Operations
```http
POST   /api/v1/factory/escrow                # Create escrow
POST   /api/v1/factory/escrow/deterministic  # Create deterministic
GET    /api/v1/factory/predict/:salt         # Predict address
GET    /api/v1/factory/verify/:address       # Verify escrow
```

### Reward Operations
```http
POST   /api/v1/rewards/approve               # Approve distributor
GET    /api/v1/rewards/allowance             # Get allowance
POST   /api/v1/rewards/authorize-factory     # Authorize factory
GET    /api/v1/rewards/info                  # Get distributor info
```

See [backend/README.md](backend/README.md) for full API documentation.

## 💻 Development

### Contract Development

```bash
cd contract
forge build        # Compile
forge test -vv     # Test
forge fmt          # Format
```

### Backend Development

```bash
cd backend
npm run dev        # Development mode
npm run build      # Build for production
npm run lint       # Lint code
npm run format     # Format code
```

## 🏗️ Architecture

### Smart Contracts
- **Escrow.sol**: Individual escrow with proxy pattern
- **EscrowFactory.sol**: Factory for creating escrow clones
- **RewardDistributor.sol**: Centralized GRMPS distribution

### Backend (MVC Pattern)
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and Web3 interactions
- **Routes**: API endpoint definitions
- **Middlewares**: Error handling, validation, security

### Technology Stack
- **Contracts**: Solidity ^0.8.24, OpenZeppelin, Foundry
- **Backend**: TypeScript, Express, ethers.js v6
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: express-validator

## 🔐 Security

- ✅ Reentrancy protection (OpenZeppelin)
- ✅ Access control modifiers
- ✅ Input validation
- ✅ Rate limiting
- ✅ Secure headers (Helmet)
- ✅ Private key management via env vars

## 📊 Testing

### Contracts
```bash
cd contract
forge test -vv

# All tests passing:
# ✓ Escrow: 15 tests
# ✓ EscrowFactory: 13 tests
# ✓ RewardDistributor: 6 tests
```

### Backend
```bash
cd backend
npm test  # TODO: Add tests
```

## 🚢 Deployment

### Testnet (BSC Testnet)
1. Deploy contracts: `cd contract && ./deploy-all.sh`
2. Copy ABIs: `cd backend && bash scripts/copy-abis.sh`
3. Update `.env` with contract addresses
4. Start backend: `npm run build && npm start`

### Production
See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment guide.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Foundry for development framework
- Express.js for web framework

## 📞 Support

- Create an issue for bugs
- Check documentation for common questions
- Review tests for usage examples

---

**Built with ❤️ for the BSC ecosystem**
