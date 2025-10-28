# Quick Start Guide

## ✅ Setup Complete!

The setup script is now fixed and working. You can run it from anywhere.

## 🚀 Running the Setup

### Option 1: From backend directory (Recommended)

```bash
cd backend
bash scripts/setup.sh
npm install  # Install Swagger dependencies
```

### Option 2: From scripts directory

```bash
cd backend/scripts
bash setup.sh
cd ..
npm install
```

Both methods work correctly now!

## 📋 What the Setup Does

1. ✅ Checks Node.js version (18+)
2. ✅ Installs npm dependencies (including Swagger)
3. ✅ Copies contract ABIs from `../contract/out/`
4. ✅ Creates `logs/` directory
5. ✅ Creates `.env` from `.env.example` (if not exists)

## 🔧 Configuration

### Edit your `.env` file

```bash
cd backend
nano .env
```

Update with your deployed contract addresses:

```env
# Contract Addresses (from contract deployment)
FACTORY_ADDRESS=0xYourFactoryAddress
ESCROW_IMPLEMENTATION_ADDRESS=0xYourImplementationAddress
REWARD_DISTRIBUTOR_ADDRESS=0xYourRewardDistributorAddress
GRMPS_TOKEN_ADDRESS=0xYourGRMPSTokenAddress

# Wallet Private Keys
DEPLOYER_PRIVATE_KEY=0xYourPrivateKey
FEE_RECIPIENT_ADDRESS=0xYourFeeRecipientAddress
```

## 🏃 Start the Server

### Development Mode (with hot reload)

```bash
cd backend
npm run dev
```

Server runs at: `http://localhost:3000`

### Test if it's running

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "blockchain": {
      "connected": true,
      "blockNumber": 12345678,
      "chainId": 97
    },
    "contracts": {
      "factory": "0x...",
      "implementation": "0x...",
      "rewardDistributor": "0x..."
    }
  }
}
```

## 📚 **NEW: Swagger API Documentation**

### Access Interactive API Docs

Once the server is running, visit:

**🎯 http://localhost:3000/api-docs**

Features:
- 📖 Interactive documentation for all endpoints
- 🧪 Test API directly from browser ("Try it out" button)
- 📝 Request/response schemas
- 💡 Example payloads
- 📥 Export OpenAPI JSON

### Quick Swagger Test

1. Open http://localhost:3000/api-docs
2. Expand `GET /health`
3. Click "Try it out"
4. Click "Execute"
5. See the response!

## 📚 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Documentation
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

### Health Check
```bash
curl http://localhost:3000/health
```

### Get Factory Owner
```bash
curl http://localhost:3000/api/v1/factory/owner
```

### Get Reward Info
```bash
curl http://localhost:3000/api/v1/rewards/info
```

### Create Escrow
```bash
curl -X POST http://localhost:3000/api/v1/factory/escrow \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "0x...",
    "jobId": "JOB-001",
    "buyer": "0x...",
    "seller": "0x...",
    "arbiter": "0x...",
    "amount": "0.1",
    "deadline": 1735689600
  }'
```

## 🛠️ Troubleshooting

### ABIs not found?

Re-run the copy script:
```bash
cd backend/scripts
bash copy-abis.sh
```

### Port 3000 already in use?

Change port in `.env`:
```env
PORT=3001
```

### Module not found?

Reinstall dependencies:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Swagger UI not loading?

1. Check if server is running: `curl http://localhost:3000/health`
2. Check logs in `logs/combined.log`
3. Try clearing browser cache
4. Verify swagger packages installed: `npm list swagger-ui-express swagger-jsdoc`

## 📖 Documentation

- [API Documentation](README.md)
- [Swagger Guide](SWAGGER_GUIDE.md) ⭐ NEW!
- [Setup Guide](SETUP_GUIDE.md)
- [Project Structure](../PROJECT_STRUCTURE.md)

## 🎯 Next Steps

1. ✅ Setup complete
2. ✅ Configure `.env`
3. ✅ Start server: `npm run dev`
4. ✅ **Visit Swagger UI**: http://localhost:3000/api-docs ⭐
5. ✅ Test endpoints in Swagger
6. 🔜 Integrate with frontend
7. 🔜 Deploy to production

---

**You're all set with interactive API docs! 🎉📚**
