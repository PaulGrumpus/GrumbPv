# 🔧 Quick Fix: Contract Address Configuration

## ❌ Problem Detected

Your `FACTORY_ADDRESS` is set to the same value as `ESCROW_IMPLEMENTATION_ADDRESS`:

```env
FACTORY_ADDRESS=0x8e6A2412Bf364D909B91130536119b8Bd66CC9Fd              ❌ Wrong!
ESCROW_IMPLEMENTATION_ADDRESS=0x8e6A2412Bf364D909B91130536119b8Bd66CC9Fd  ✅ Correct
```

**These should be DIFFERENT addresses!**

## ✅ Solution

### Option 1: Find the Correct Factory Address

```bash
cd contract

# Check the factory deployment
cat broadcast/DeployFactory.s.sol/97/run-latest.json | grep -A 2 "contractAddress"

# OR check deploy-all.sh output
cat .env.deployed 2>/dev/null
```

### Option 2: Redeploy (if you can't find the address)

```bash
cd contract

# Deploy just the factory (requires ESCROW_IMPLEMENTATION_ADDRESS in contract/.env)
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast \
  --legacy \
  -vv
```

Look for output like:
```
EscrowFactory deployed at: 0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59
```

### Option 3: Use Correct Address from Logs

Based on your terminal history, your correct Factory address is:

```
0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59
```

## 🛠️ Update Your .env

```bash
cd backend
nano .env
```

Change this line:
```env
FACTORY_ADDRESS=0x8e6A2412Bf364D909B91130536119b8Bd66CC9Fd
```

To:
```env
FACTORY_ADDRESS=0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59
```

Your `.env` should look like:
```env
# Contract Addresses
FACTORY_ADDRESS=0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59                  ← Factory
ESCROW_IMPLEMENTATION_ADDRESS=0x8e6A2412Bf364D909B91130536119b8Bd66CC9Fd  ← Implementation
REWARD_DISTRIBUTOR_ADDRESS=0x353b1CB343781F67AFB7E3dbfC4A19Ab18cD2385      ← Rewards
GRMPS_TOKEN_ADDRESS=0xB908a4d3534D3e63b30b856e33Bf1B5d1dEd0016           ← Token
```

## 🔄 Restart Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📡 Environment: development
🔗 API: http://localhost:5000/api/v1
📚 Swagger Docs: http://localhost:5000/api-docs
(no warnings)
```

## ✅ Test It Works

```bash
# Test factory owner
curl http://localhost:5000/api/v1/factory/owner

# Should return:
{
  "success": true,
  "data": {
    "owner": "0x..."
  }
}
```

## 📋 Quick Reference

Your correct addresses (based on your deployment):

| Contract | Address |
|----------|---------|
| **Factory** | `0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59` |
| **Implementation** | `0x8e6A2412Bf364D909B91130536119b8Bd66CC9Fd` |
| **RewardDistributor** | `0x353b1CB343781F67AFB7E3dbfC4A19Ab18cD2385` |
| **GRMPS Token** | `0xB908a4d3534D3e63b30b856e33Bf1B5d1dEd0016` |

## 🔍 How to Find Addresses

### From contract deployment:

```bash
cd contract
cat .env.deployed
```

### From broadcast logs:

```bash
cd contract
cat broadcast/DeployFactory.s.sol/97/run-latest.json | jq '.transactions[0].contractAddress'
cat broadcast/DeployImplementation.s.sol/97/run-latest.json | jq '.transactions[0].contractAddress'
```

### From BSCScan (if verified):

Visit: https://testnet.bscscan.com/address/YOUR_ADDRESS

---

**After fixing, your API should work perfectly!** 🎉

