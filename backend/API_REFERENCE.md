# BSC Escrow API Reference

## 📚 Complete Swagger Documentation Added!

All API endpoints now have comprehensive Swagger/OpenAPI documentation.

## 🌐 Access Swagger UI

```
http://localhost:5000/api-docs
```

## 📋 Documented Endpoints

### ✅ Health (1 endpoint)
- `GET /health` - API health check with blockchain connection status

### ✅ Factory (5 endpoints)
- `POST /api/v1/factory/escrow` - Create new escrow
- `POST /api/v1/factory/escrow/deterministic` - Create deterministic escrow  
- `GET /api/v1/factory/predict/:salt` - Predict escrow address
- `GET /api/v1/factory/verify/:address` - Verify escrow creation
- `GET /api/v1/factory/owner` - Get factory owner

### ✅ Escrow (8 endpoints)
- `GET /api/v1/escrow/:address` - Get escrow information
- `POST /api/v1/escrow/:address/fund` - Fund escrow (buyer)
- `POST /api/v1/escrow/:address/deliver` - Deliver work (vendor)
- `POST /api/v1/escrow/:address/approve` - Approve work (buyer)
- `POST /api/v1/escrow/:address/withdraw` - Withdraw funds (vendor)
- `POST /api/v1/escrow/:address/cancel` - Cancel escrow (buyer)
- `POST /api/v1/escrow/:address/dispute/initiate` - Initiate dispute
- `POST /api/v1/escrow/:address/dispute/pay` - Pay dispute fee
- `POST /api/v1/escrow/:address/dispute/resolve` - Resolve dispute (arbiter)

### ✅ Rewards (6 endpoints)
- `POST /api/v1/rewards/approve` - Approve distributor for GRMPS
- `GET /api/v1/rewards/allowance` - Get current allowance
- `GET /api/v1/rewards/balance` - Get reward source balance
- `POST /api/v1/rewards/authorize-factory` - Authorize factory
- `GET /api/v1/rewards/check-auth/:address` - Check authorization
- `GET /api/v1/rewards/info` - Get distributor info

**Total: 20 fully documented endpoints!**

## 🎯 Quick Examples

### Example 1: Create Escrow

```bash
curl -X POST http://localhost:5000/api/v1/factory/escrow \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB-001",
    "buyer": "0xf5d9b2b9b9fd768836216fad7d8c1a7ae0cc8c01",
    "seller": "0x90b9ba4a349fcd7c2509d99d0e57be0f4ff68420",
    "arbiter": "0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd",
    "amount": "0.1",
    "deadline": 1733097600
  }'
```

**Note**: `deadline` must be in the future! Use:
```javascript
Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)  // 30 days from now
```

### Example 2: Fund Escrow

```bash
curl -X POST http://localhost:5000/api/v1/escrow/0xEscrowAddress/fund \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "0xBuyerPrivateKey",
    "value": "1.005"
  }'
```

### Example 3: Deliver Work

```bash
curl -X POST http://localhost:5000/api/v1/escrow/0xEscrowAddress/deliver \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "0xVendorPrivateKey",
    "cid": "QmTestCID123abc"
  }'
```

### Example 4: Approve Work

```bash
curl -X POST http://localhost:5000/api/v1/escrow/0xEscrowAddress/approve \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "0xBuyerPrivateKey",
    "cid": "QmTestCID123abc"
  }'
```

### Example 5: Withdraw Funds

```bash
curl -X POST http://localhost:5000/api/v1/escrow/0xEscrowAddress/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "0xVendorPrivateKey"
  }'
```

## 📖 Swagger UI Features

### 1. Interactive Testing
- Click any endpoint to expand
- Click "Try it out"
- Fill in parameters
- Click "Execute"
- See real response!

### 2. Schema Explorer
- View request/response structures
- See required vs optional fields
- Check data types
- View examples

### 3. Authentication
- Test with your actual private keys
- See transaction hashes
- Verify on BSCScan

### 4. Export
- Download OpenAPI JSON
- Generate client SDKs
- Import to Postman

## 🔧 Configuration Notes

### Private Keys from .env

**Factory operations** now use `DEPLOYER_PRIVATE_KEY` from `.env`:
- No need to pass `privateKey` in request for factory operations
- Automatically uses deployer's key

**Escrow operations** still require `privateKey` in request:
- Different users (buyer, vendor, arbiter) need different keys
- Must be passed in request body

### Required .env Variables

```env
# Contract Addresses
FACTORY_ADDRESS=0x...
ESCROW_IMPLEMENTATION_ADDRESS=0x...
REWARD_DISTRIBUTOR_ADDRESS=0x...
GRMPS_TOKEN_ADDRESS=0x...

# Deployer for Factory Operations
DEPLOYER_PRIVATE_KEY=0x...

# Fee Recipient
FEE_RECIPIENT_ADDRESS=0x...
```

## 🐛 Common Issues & Solutions

### Issue: "bad deadline"
**Error**: Transaction reverts with "bad deadline"
**Solution**: Use a future timestamp
```javascript
deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)  // 30 days
```

### Issue: "FEE_RECIPIENT_ADDRESS not configured"
**Solution**: Set in `.env`:
```env
FEE_RECIPIENT_ADDRESS=0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd
```

### Issue: "Factory address not configured"
**Solution**: Set in `.env`:
```env
FACTORY_ADDRESS=0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59
```

### Issue: "Insufficient balance"
**Solution**: Fund the deployer wallet with BNB for gas:
```bash
# Check balance
curl -X GET http://localhost:5000/health | jq .data.blockchain
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "escrowAddress": "0x..."
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

## 🧪 Testing Workflow

### Complete Escrow Lifecycle

1. **Create Escrow** (Factory)
   ```
   POST /api/v1/factory/escrow
   → Returns escrowAddress
   ```

2. **Fund** (Buyer)
   ```
   POST /api/v1/escrow/{address}/fund
   ```

3. **Deliver** (Vendor)
   ```
   POST /api/v1/escrow/{address}/deliver
   ```

4. **Approve** (Buyer)
   ```
   POST /api/v1/escrow/{address}/approve
   ```

5. **Withdraw** (Vendor)
   ```
   POST /api/v1/escrow/{address}/withdraw
   → GRMPS rewards distributed automatically!
   ```

### Dispute Workflow

1. **Initiate** (Either party)
   ```
   POST /api/v1/escrow/{address}/dispute/initiate
   ```

2. **Pay Fee** (Counterparty)
   ```
   POST /api/v1/escrow/{address}/dispute/pay
   ```

3. **Resolve** (Arbiter)
   ```
   POST /api/v1/escrow/{address}/dispute/resolve
   ```

## 📝 Notes

- All Swagger docs are generated from JSDoc comments
- Documentation stays in sync with code
- Test all endpoints directly in Swagger UI
- Export OpenAPI spec for client generation

## 🚀 Start Using

1. **Start server**: `npm run dev`
2. **Open Swagger**: http://localhost:5000/api-docs
3. **Test endpoints**: Click "Try it out" on any endpoint
4. **Build your app**: Use the API!

---

**All 20 endpoints are now fully documented in Swagger! 🎉**

