# BSC Escrow Backend API

TypeScript/Express backend API for BSC Escrow smart contracts with MVC architecture.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── contracts.ts         # Contract ABIs and addresses
│   ├── controllers/
│   │   ├── escrow.controller.ts
│   │   ├── factory.controller.ts
│   │   └── reward.controller.ts
│   ├── services/
│   │   ├── escrow.service.ts    # Escrow business logic
│   │   ├── factory.service.ts   # Factory business logic
│   │   └── reward.service.ts    # Reward distribution logic
│   ├── routes/
│   │   ├── escrow.routes.ts
│   │   ├── factory.routes.ts
│   │   ├── reward.routes.ts
│   │   └── health.routes.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   ├── notFoundHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validateRequest.ts
│   ├── utils/
│   │   ├── logger.ts            # Winston logger
│   │   └── web3Provider.ts      # Web3 provider singleton
│   └── index.ts                 # App entry point
├── abi/                          # Contract ABIs (copied from contract/out)
├── logs/                         # Application logs
├── .env.example
├── .eslintrc.json
├── .prettierrc.json
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 📚 **Interactive API Documentation**

This API includes **Swagger/OpenAPI** documentation!

### Access Swagger UI

Once the server is running:

🎯 **http://localhost:3000/api-docs**

Features:
- 📖 Interactive documentation
- 🧪 Test endpoints directly ("Try it out")
- 📝 Request/response schemas
- 💡 Example payloads
- 📥 Export OpenAPI JSON

See [SWAGGER_GUIDE.md](SWAGGER_GUIDE.md) for details.

## 🚀 Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Copy Contract ABIs

Copy the compiled ABIs from the contract folder:

```bash
mkdir -p abi
cp ../contract/out/Escrow.sol/Escrow.json abi/
cp ../contract/out/EscrowFactory.sol/EscrowFactory.json abi/
cp ../contract/out/RewardDistributor.sol/RewardDistributor.json abi/
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=3000

# Blockchain
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97

# Contracts
FACTORY_ADDRESS=0x...
ESCROW_IMPLEMENTATION_ADDRESS=0x...
REWARD_DISTRIBUTOR_ADDRESS=0x...
GRMPS_TOKEN_ADDRESS=0x...

# Private Keys
DEPLOYER_PRIVATE_KEY=0x...
FEE_RECIPIENT_ADDRESS=0x...
```

### 4. Create Logs Directory

```bash
mkdir -p logs
```

## 🏃 Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Health Check

```http
GET /health
```

### Escrow Endpoints

#### Get Escrow Info

```http
GET /api/v1/escrow/:address
```

#### Fund Escrow

```http
POST /api/v1/escrow/:address/fund
Content-Type: application/json

{
  "privateKey": "0x...",
  "value": "1.005"
}
```

#### Deliver Work

```http
POST /api/v1/escrow/:address/deliver
Content-Type: application/json

{
  "privateKey": "0x...",
  "cid": "QmTestCID123",
  "contentHash": "0x..." // optional
}
```

#### Approve Work

```http
POST /api/v1/escrow/:address/approve
Content-Type: application/json

{
  "privateKey": "0x...",
  "cid": "QmTestCID123"
}
```

#### Withdraw Funds

```http
POST /api/v1/escrow/:address/withdraw
Content-Type: application/json

{
  "privateKey": "0x..."
}
```

#### Cancel Escrow

```http
POST /api/v1/escrow/:address/cancel
Content-Type: application/json

{
  "privateKey": "0x..."
}
```

#### Dispute Operations

```http
# Initiate Dispute
POST /api/v1/escrow/:address/dispute/initiate
{
  "privateKey": "0x..."
}

# Pay Dispute Fee
POST /api/v1/escrow/:address/dispute/pay
{
  "privateKey": "0x..."
}

# Resolve Dispute (Arbiter)
POST /api/v1/escrow/:address/dispute/resolve
{
  "privateKey": "0x...",
  "favorBuyer": true
}
```

### Factory Endpoints

#### Create Escrow

```http
POST /api/v1/factory/escrow
Content-Type: application/json

{
  "privateKey": "0x...",
  "jobId": "JOB-001",
  "buyer": "0x...",
  "seller": "0x...",
  "arbiter": "0x...",
  "amount": "1.0",
  "deadline": 1735689600,
  "buyerFeeBps": 50,
  "vendorFeeBps": 50,
  "disputeFeeBps": 50,
  "rewardRateBps": 25
}
```

#### Create Deterministic Escrow

```http
POST /api/v1/factory/escrow/deterministic
Content-Type: application/json

{
  "privateKey": "0x...",
  "salt": "unique-salt-123",
  "jobId": "JOB-001",
  // ... other params
}
```

#### Predict Address

```http
GET /api/v1/factory/predict/:salt
```

#### Verify Escrow

```http
GET /api/v1/factory/verify/:address
```

#### Get Factory Owner

```http
GET /api/v1/factory/owner
```

### Reward Endpoints

#### Approve Distributor

```http
POST /api/v1/rewards/approve
Content-Type: application/json

{
  "privateKey": "0x...",
  "amount": "1000000"
}
```

#### Get Allowance

```http
GET /api/v1/rewards/allowance
```

#### Get Source Balance

```http
GET /api/v1/rewards/balance
```

#### Authorize Factory

```http
POST /api/v1/rewards/authorize-factory
Content-Type: application/json

{
  "privateKey": "0x..."
}
```

#### Check Authorization

```http
GET /api/v1/rewards/check-auth/:address
```

#### Get Distributor Info

```http
GET /api/v1/rewards/info
```

## 🔒 Security Considerations

1. **Private Keys**: Never commit private keys. Use environment variables.
2. **Rate Limiting**: Configured in `rateLimiter` middleware
3. **Validation**: All inputs validated using express-validator
4. **Helmet**: Security headers enabled
5. **CORS**: Configured for cross-origin requests

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // response data
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Blockchain**: ethers.js v6
- **Logging**: Winston
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📝 Development

### Adding New Endpoints

1. Create service method in `src/services/`
2. Create controller method in `src/controllers/`
3. Add route in `src/routes/`
4. Add validation middleware

### TypeScript

The project uses strict TypeScript configuration. All types must be properly defined.

## 🚢 Deployment

### Environment Variables

Ensure all required environment variables are set in production.

### PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start dist/index.js --name bsc-escrow-api
pm2 save
pm2 startup
```

### Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY abi ./abi
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 📄 License

MIT

