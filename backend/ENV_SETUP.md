# Environment Setup - Contract Addresses

## 🚨 Error: Contract Addresses Not Configured

You're seeing this error because the contract addresses haven't been set in your `.env` file.

```
Error: Factory address not configured. Please set FACTORY_ADDRESS in .env file
```

## ✅ Quick Fix

### 1. Check Your `.env` File

```bash
cd backend
cat .env | grep ADDRESS
```

You should see (with actual addresses, not `0x...`):
```env
FACTORY_ADDRESS=0xYourFactoryAddress
ESCROW_IMPLEMENTATION_ADDRESS=0xYourImplementationAddress
REWARD_DISTRIBUTOR_ADDRESS=0xYourRewardDistributorAddress
GRMPS_TOKEN_ADDRESS=0xYourGRMPSTokenAddress
```

### 2. Get Deployed Contract Addresses

If you haven't deployed contracts yet:

```bash
cd ../contract
./deploy-all.sh
```

This will output addresses like:
```
Implementation: 0x8e6A2412Bf364D909B91130536119b8Bd66CC9Fd
Factory:        0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59
RewardDistrib:  0x353b1CB343781F67AFB7E3dbfC4A19Ab18cD2385
```

### 3. Update Backend `.env`

```bash
cd ../backend
nano .env
```

Update these lines:
```env
# Contract Addresses (REQUIRED - from contract deployment)
FACTORY_ADDRESS=0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59
ESCROW_IMPLEMENTATION_ADDRESS=0x8e6A2412Bf364D909B91130536119b8Bd66CC9Fd
REWARD_DISTRIBUTOR_ADDRESS=0x353b1CB343781F67AFB7E3dbfC4A19Ab18cD2385
GRMPS_TOKEN_ADDRESS=0xB908a4d3534D3e63b30b856e33Bf1B5d1dEd0016
```

### 4. Restart the Server

```bash
npm run dev
```

You should now see:
```
🚀 Server running on port 5000
📡 Environment: development
🔗 API: http://localhost:5000/api/v1
📚 Swagger Docs: http://localhost:5000/api-docs
```

No warnings!

## 📋 Required Environment Variables

### Critical (API won't work without these):

```env
# Blockchain Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97

# Contract Addresses (from deployment)
FACTORY_ADDRESS=0x...
ESCROW_IMPLEMENTATION_ADDRESS=0x...
REWARD_DISTRIBUTOR_ADDRESS=0x...
```

### Optional (for specific features):

```env
# GRMPS Token (for rewards)
GRMPS_TOKEN_ADDRESS=0x...

# Private Keys (for signing transactions)
DEPLOYER_PRIVATE_KEY=0x...
BUYER_PRIVATE_KEY=0x...
VENDOR_PRIVATE_KEY=0x...
ARBITER_PRIVATE_KEY=0x...
```

## 🔍 Validation on Startup

The backend now validates contract addresses on startup.

### If addresses are missing, you'll see:

```
⚠️  Warning: Missing contract addresses in .env:
   - FACTORY_ADDRESS
   - ESCROW_IMPLEMENTATION_ADDRESS
   - REWARD_DISTRIBUTOR_ADDRESS
   Some API endpoints will not work until these are configured.
```

### When properly configured:

No warnings - server starts cleanly!

## 🧪 Test Configuration

### Health Check (should work without addresses):

```bash
curl http://localhost:5000/health
```

### Factory Owner (requires FACTORY_ADDRESS):

```bash
curl http://localhost:5000/api/v1/factory/owner
```

If configured correctly, returns:
```json
{
  "success": true,
  "data": {
    "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
```

If not configured, returns:
```json
{
  "success": false,
  "error": {
    "message": "Factory address not configured. Please set FACTORY_ADDRESS in .env file",
    "code": "FACTORY_ADDRESS_NOT_SET"
  }
}
```

## 📝 Example `.env` File

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# Blockchain Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97

# Contract Addresses (from contract deployment)
FACTORY_ADDRESS=0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59
ESCROW_IMPLEMENTATION_ADDRESS=0x8e6A2412Bf364D909B91130536119b8Bd66CC9Fd
REWARD_DISTRIBUTOR_ADDRESS=0x353b1CB343781F67AFB7E3dbfC4A19Ab18cD2385
GRMPS_TOKEN_ADDRESS=0xB908a4d3534D3e63b30b856e33Bf1B5d1dEd0016

# Default Configuration
FEE_RECIPIENT_ADDRESS=0xYourFeeRecipientAddress
DEFAULT_FEE_BPS=100
DEFAULT_BUYER_FEE_BPS=50
DEFAULT_VENDOR_FEE_BPS=50
DEFAULT_DISPUTE_FEE_BPS=50
DEFAULT_REWARD_RATE_BPS=25

# Private Keys (use different keys for different environments!)
DEPLOYER_PRIVATE_KEY=0xYourPrivateKey
BUYER_PRIVATE_KEY=0xYourBuyerPrivateKey
VENDOR_PRIVATE_KEY=0xYourVendorPrivateKey
ARBITER_PRIVATE_KEY=0xYourArbiterPrivateKey

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🆘 Troubleshooting

### Error: "Factory address not configured"

**Solution**: Set `FACTORY_ADDRESS` in `.env`

### Error: "Invalid escrow address format"

**Solution**: Make sure the address starts with `0x` and is 42 characters long

### Error: "RPC connection failed"

**Solution**: Check `BSC_TESTNET_RPC_URL` in `.env`

### Addresses keep resetting

**Solution**: Make sure you're editing `backend/.env` (not `contract/.env`)

## 🔗 Quick Links

- [Deploy Contracts](../contract/DEPLOYMENT_GUIDE.md)
- [Backend Setup](SETUP_GUIDE.md)
- [Swagger API Docs](http://localhost:5000/api-docs)

---

**Need help?** Check if contracts are deployed and addresses are in `backend/.env`

