# BSC Escrow - Project Structure

Complete project structure for the BSC Escrow system with TypeScript backend.

## 📁 Directory Structure

```
bsc-escrow/
├── contract/                          # Smart contracts (Solidity)
│   ├── src/
│   │   ├── Escrow.sol                # Main escrow contract
│   │   ├── EscrowFactory.sol         # Factory for creating escrows
│   │   └── RewardDistributor.sol     # Centralized reward distribution
│   ├── test/
│   │   ├── Escrow.t.sol
│   │   ├── EscrowFactory.t.sol
│   │   └── RewardDistributor.t.sol
│   ├── script/
│   │   ├── DeployImplementation.s.sol
│   │   ├── DeployFactory.s.sol
│   │   └── DeployRewardDistributor.s.sol
│   ├── out/                          # Compiled contracts (ABIs)
│   ├── deploy-all.sh                 # Deploy all contracts script
│   ├── foundry.toml
│   └── README.md
│
├── backend/                           # TypeScript/Express API (NEW)
│   ├── src/
│   │   ├── config/
│   │   │   └── contracts.ts          # Contract addresses & ABIs
│   │   ├── controllers/
│   │   │   ├── escrow.controller.ts
│   │   │   ├── factory.controller.ts
│   │   │   └── reward.controller.ts
│   │   ├── services/                 # Business logic layer
│   │   │   ├── escrow.service.ts
│   │   │   ├── factory.service.ts
│   │   │   └── reward.service.ts
│   │   ├── routes/
│   │   │   ├── escrow.routes.ts
│   │   │   ├── factory.routes.ts
│   │   │   ├── reward.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── middlewares/
│   │   │   ├── errorHandler.ts
│   │   │   ├── notFoundHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validateRequest.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── web3Provider.ts
│   │   └── index.ts
│   ├── abi/                          # Contract ABIs (copied from contract/out)
│   ├── logs/                         # Application logs
│   ├── scripts/
│   │   ├── copy-abis.sh
│   │   └── setup.sh
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── web3/                             # Legacy web3 scripts (can be deprecated)
│   └── ...                           # Old scripts, now replaced by backend API
│
├── docs/                             # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md
│
├── PROJECT_STRUCTURE.md              # This file
└── README.md                         # Main project README
```

## 🔄 Architecture Overview

### Contract Layer (Solidity)
- **Escrow.sol**: Individual escrow contract with proxy pattern
- **EscrowFactory.sol**: Creates escrow clones using EIP-1167
- **RewardDistributor.sol**: Centralized GRMPS token distribution

### Backend Layer (TypeScript/Express)
- **MVC Architecture**: Controllers → Services → Web3
- **RESTful API**: Clean HTTP endpoints for all operations
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Centralized error handling middleware
- **Validation**: Request validation using express-validator
- **Logging**: Structured logging with Winston

### Data Flow

```
Client Request
    ↓
Express Routes (+ Validation)
    ↓
Controllers (Request/Response handling)
    ↓
Services (Business logic)
    ↓
Web3 Provider (ethers.js)
    ↓
BSC Blockchain (Smart Contracts)
```

## 🚀 Quick Start

### 1. Deploy Contracts

```bash
cd contract
cp .env.example .env
# Edit .env with your configuration
./deploy-all.sh
```

### 2. Setup Backend

```bash
cd backend
bash scripts/setup.sh
# Edit .env with deployed contract addresses
npm run dev
```

### 3. Test API

```bash
curl http://localhost:3000/health
```

## 📋 Development Workflow

### Adding a New Feature

1. **Update Contract** (if needed)
   ```bash
   cd contract
   # Edit src/*.sol
   forge build
   forge test
   ```

2. **Copy ABIs to Backend**
   ```bash
   cd backend
   bash scripts/copy-abis.sh
   ```

3. **Create Service Method**
   ```typescript
   // backend/src/services/escrow.service.ts
   async newFeature(params) {
     // Business logic
   }
   ```

4. **Create Controller**
   ```typescript
   // backend/src/controllers/escrow.controller.ts
   async newFeature(req, res, next) {
     // Call service
   }
   ```

5. **Add Route**
   ```typescript
   // backend/src/routes/escrow.routes.ts
   router.post('/new-feature', controller.newFeature);
   ```

6. **Test**
   ```bash
   npm run dev
   # Test with curl or Postman
   ```

## 🔧 Configuration

### Contract Configuration
- `contract/.env`: Blockchain RPC, private keys, addresses
- `contract/foundry.toml`: Compiler settings, gas limits

### Backend Configuration
- `backend/.env`: Server port, contract addresses, private keys
- `backend/tsconfig.json`: TypeScript compiler options

## 📊 Testing

### Contract Tests
```bash
cd contract
forge test -vv
```

### Backend Tests (TODO)
```bash
cd backend
npm test
```

## 🚢 Deployment

### Contracts
```bash
cd contract
./deploy-all.sh
```

### Backend
```bash
cd backend
npm run build
pm2 start dist/index.js --name bsc-escrow-api
```

## 📚 Key Differences from Old Structure

### Before (web3/ folder)
- ❌ Plain JavaScript scripts
- ❌ No type safety
- ❌ Direct CLI execution
- ❌ No API layer
- ❌ Limited error handling

### After (backend/ folder)
- ✅ Full TypeScript with type safety
- ✅ MVC architecture
- ✅ RESTful API endpoints
- ✅ Comprehensive error handling
- ✅ Request validation
- ✅ Structured logging
- ✅ Rate limiting
- ✅ Security headers
- ✅ Production-ready

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Use different keys for dev/prod**
3. **Enable rate limiting in production**
4. **Use HTTPS in production**
5. **Rotate API keys regularly**
6. **Monitor logs for suspicious activity**

## 📈 Scalability

The new architecture supports:
- Horizontal scaling (multiple API instances)
- Load balancing
- Caching layer (Redis)
- Database integration (for off-chain data)
- Webhook notifications
- Queue systems (Bull/BullMQ)

## 🛣️ Roadmap

- [ ] Frontend integration guide
- [ ] Database integration
- [ ] Webhook system for events
- [ ] Admin dashboard
- [ ] Analytics & metrics
- [ ] CI/CD pipeline
- [ ] Docker containers
- [ ] Kubernetes deployment

