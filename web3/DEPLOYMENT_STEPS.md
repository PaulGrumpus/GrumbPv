# 🚀 Deployment Steps - Quick Guide

## Prerequisites

1. Make sure contracts are compiled:
```bash
cd contract
forge build
cd ../web3
```

2. Make sure you have funds in your deployer wallet on BSC testnet

3. Set your deployer private key in `.env`:
```bash
DEPLOYER_PRIVATE_KEY=0x...
```

## Step-by-Step Deployment

### Step 1: Deploy Implementation Contract

```bash
npm run deploy:implementation
```

**Expected Output:**
```
🚀 Deploying Escrow Implementation...

Deployer address: 0x...
Network: BSC Testnet
Deployer balance: 0.5 BNB

⏳ Deploying implementation contract...

✅ Implementation deployed successfully!
==============================================
📍 Implementation Address: 0xABC...123
==============================================

📝 Save this address:
export ESCROW_IMPLEMENTATION_ADDRESS=0xABC...123
```

**Action Required:** Copy the implementation address and add to `.env`:
```bash
echo "ESCROW_IMPLEMENTATION_ADDRESS=0xABC...123" >> .env
```

### Step 2: Deploy Factory Contract

```bash
npm run deploy:factory
```

**Expected Output:**
```
🚀 Deploying Escrow Factory...

Implementation address: 0xABC...123
Deployer address: 0x...
Network: BSC Testnet
Deployer balance: 0.49 BNB

⏳ Deploying factory contract...

✅ Factory deployed successfully!
==============================================
📍 Factory Address: 0xDEF...456
👤 Factory Owner: 0x...
🔗 Implementation: 0xABC...123
==============================================

📝 Save this address:
export FACTORY_ADDRESS=0xDEF...456
```

**Action Required:** Copy the factory address and add to `.env`:
```bash
echo "FACTORY_ADDRESS=0xDEF...456" >> .env
```

### Step 3: Create Your First Escrow

```bash
npm run create:escrow
```

**Expected Output:**
```
🏭 Creating Escrow via Factory...

Factory address: 0xDEF...456
Deployer address: 0x...
Network: BSC Testnet

📋 Escrow Parameters:
  Job ID: 0x...
  Buyer: 0x...
  Seller: 0x...
  Arbiter: None
  Fee Recipient: 0x...
  Fee: 1 %
  Payment Token: Native BNB
  Amount: 1.0 BNB

⏳ Creating escrow...
📝 Transaction hash: 0x...
⏳ Waiting for confirmation...
✅ Confirmed in block: 12345678
⛽ Gas used: 95432

✅ Escrow created successfully!
==============================================
📍 Escrow Address: 0xGHI...789
🔗 Transaction: 0x...
⛽ Gas Used: 95432
💰 Gas Cost: 0.0002 BNB
==============================================

🔗 View on BscScan:
https://testnet.bscscan.com/address/0xGHI...789

💡 Next steps:
  1. Buyer funds the escrow: npm run fund
  2. Set ESCROW_ADDRESS in .env: 0xGHI...789
```

**Action Required:** Set the escrow address in `.env`:
```bash
echo "ESCROW_ADDRESS=0xGHI...789" >> .env
```

### Step 4: Use the Escrow

Now you can interact with the escrow using the existing scripts:

```bash
# Buyer funds the escrow
npm run fund

# Seller delivers work
npm run deliver

# Buyer approves
npm run approve

# Seller withdraws funds
npm run withdraw

# Check escrow status anytime
npm run info
```

## 📊 What Just Happened?

1. **Implementation Deployed** (~3M gas, one-time cost)
   - This is the master contract with all the logic
   - Never used directly, only for cloning

2. **Factory Deployed** (~500k gas, one-time cost)
   - This creates new escrows as minimal proxies
   - Points to the implementation

3. **Escrow Created** (~100k gas, repeated for each job)
   - Minimal proxy clone (~45 bytes!)
   - 97% cheaper than deploying full contract
   - Each escrow is independent

## 💰 Cost Breakdown (@ 3 gwei)

| Operation | Gas | Cost | Frequency |
|-----------|-----|------|-----------|
| Deploy Implementation | ~3,000,000 | 0.009 BNB | Once |
| Deploy Factory | ~500,000 | 0.0015 BNB | Once |
| Create Escrow | ~100,000 | 0.0003 BNB | Per job |

**Total one-time setup:** 0.0105 BNB  
**Per escrow after setup:** 0.0003 BNB (97% savings!)

## 🔧 Troubleshooting

### "ESCROW_IMPLEMENTATION_ADDRESS not set"
Make sure you added it to `.env` after step 1:
```bash
echo "ESCROW_IMPLEMENTATION_ADDRESS=0xYourAddress" >> .env
```

### "FACTORY_ADDRESS not set"
Make sure you added it to `.env` after step 2:
```bash
echo "FACTORY_ADDRESS=0xYourAddress" >> .env
```

### "Insufficient funds"
Make sure your deployer wallet has enough BNB:
```bash
# Check balance
node -e "import('ethers').then(e => { const p = new e.ethers.JsonRpcProvider('https://bsc-testnet-rpc.publicnode.com'); p.getBalance('YOUR_ADDRESS').then(b => console.log(e.ethers.formatEther(b), 'BNB')); })"
```

### Contract not found
Make sure you ran `forge build` in the contract directory:
```bash
cd ../contract
forge build
cd ../web3
```

## ✅ Verification Checklist

- [ ] Implementation deployed and address saved in `.env`
- [ ] Factory deployed and address saved in `.env`
- [ ] Test escrow created successfully
- [ ] Can fund, deliver, approve, withdraw on test escrow
- [ ] Ready to integrate into your application!

## 📚 Next Steps

- Read: `WEB3_INTEGRATION_GUIDE.md` for complete API documentation
- Check: `WEB3_QUICK_REFERENCE.md` for code snippets
- Example: `examples/factory-integration.js` for full lifecycle
- Integrate: Use `utils/escrowUtils.js` in your application

## 🎉 You're Ready!

Your factory system is now deployed and ready to create escrows with 97% gas savings!

