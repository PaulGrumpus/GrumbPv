# Backend Setup Guide

Complete guide to set up and run the BSC Escrow TypeScript backend.

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Deployed smart contracts (see contract/README.md)
- BSC Testnet RPC access

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
cd backend
bash scripts/setup.sh
```

This will:
1. Install dependencies
2. Copy contract ABIs
3. Create logs directory
4. Create .env from template

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Copy Contract ABIs

```bash
bash scripts/copy-abis.sh
```

Or manually:
```bash
mkdir -p abi
cp ../contract/out/Escrow.sol/Escrow.json abi/
cp ../contract/out/EscrowFactory.sol/EscrowFactory.json abi/
cp ../contract/out/RewardDistributor.sol/RewardDistributor.json abi/
```

#### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Blockchain
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97

# Contracts (from deployment)
FACTORY_ADDRESS=0x...
ESCROW_IMPLEMENTATION_ADDRESS=0x...
REWARD_DISTRIBUTOR_ADDRESS=0x...
GRMPS_TOKEN_ADDRESS=0x...

# Default addresses
FEE_RECIPIENT_ADDRESS=0x...

# Private keys (use different keys for different roles)
DEPLOYER_PRIVATE_KEY=0x...
BUYER_PRIVATE_KEY=0x...
VENDOR_PRIVATE_KEY=0x...
ARBITER_PRIVATE_KEY=0x...

# Fees (in basis points, 100 = 1%)
DEFAULT_FEE_BPS=100
DEFAULT_BUYER_FEE_BPS=50
DEFAULT_VENDOR_FEE_BPS=50
DEFAULT_DISPUTE_FEE_BPS=50
DEFAULT_REWARD_RATE_BPS=25

# Logging
LOG_LEVEL=debug

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 4. Create Logs Directory

```bash
mkdir -p logs
```

## 🏃 Running the Backend

### Development Mode (with hot reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Check if Running

```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {
#   "success": true,
#   "data": {
#     "status": "healthy",
#     "blockchain": { ... },
#     "contracts": { ... }
#   }
# }
```

## 🧪 Testing the API

### Using curl

#### Get Factory Info
```bash
curl http://localhost:3000/api/v1/factory/owner
```

#### Get Reward Distributor Info
```bash
curl http://localhost:3000/api/v1/rewards/info
```

#### Create Escrow
```bash
curl -X POST http://localhost:3000/api/v1/factory/escrow \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "0x...",
    "jobId": "TEST-001",
    "buyer": "0x...",
    "seller": "0x...",
    "arbiter": "0x...",
    "amount": "0.1",
    "deadline": 1735689600
  }'
```

### Using Postman

1. Import the API endpoints
2. Set base URL: `http://localhost:3000/api/v1`
3. Add requests for each endpoint
4. Test with your wallet addresses

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middlewares/      # Express middlewares
│   ├── utils/            # Utilities
│   └── index.ts          # Entry point
├── abi/                  # Contract ABIs
├── logs/                 # Application logs
├── scripts/              # Setup scripts
├── .env                  # Environment variables
├── package.json
└── tsconfig.json
```

## 🐛 Troubleshooting

### Error: Cannot find module './abi/Escrow.json'

Solution: Copy ABIs from contract output
```bash
bash scripts/copy-abis.sh
```

### Error: Invalid private key format

Solution: Ensure private keys start with '0x'
```env
DEPLOYER_PRIVATE_KEY=0x1234...
```

### Error: Contract addresses not set

Solution: Update .env with deployed contract addresses
```env
FACTORY_ADDRESS=0x...
REWARD_DISTRIBUTOR_ADDRESS=0x...
```

### Error: Port 3000 already in use

Solution: Change port in .env
```env
PORT=3001
```

### Error: RPC connection failed

Solution: Check RPC URL and network connectivity
```env
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
```

## 🔧 Development

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Build

```bash
npm run build
```

Output in `dist/` folder

### Watch Mode

```bash
npm run dev
```

Auto-reloads on file changes

## 📊 Logs

Logs are written to:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs
- Console (development mode)

## 🚀 Production Deployment

### Using PM2

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name bsc-escrow-api

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

### Using Docker

```bash
# Build image
docker build -t bsc-escrow-api .

# Run container
docker run -p 3000:3000 --env-file .env bsc-escrow-api
```

### Environment Variables for Production

```env
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=50
```

## 📚 Next Steps

1. Read [API Documentation](README.md)
2. Test all endpoints
3. Integrate with frontend
4. Set up monitoring
5. Configure production environment

## 🔗 Related Documentation

- [API Documentation](README.md)
- [Contract Documentation](../contract/README.md)
- [Project Structure](../PROJECT_STRUCTURE.md)

