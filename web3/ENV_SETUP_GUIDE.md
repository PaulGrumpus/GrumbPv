# Web3 Environment Setup Guide

## 🚀 **Quick Setup for Creating Escrow**

### **Step 1: Create `.env` file**

```bash
cd web3
cp ENV_TEMPLATE.txt .env
```

### **Step 2: Edit `.env` with Your Values**

```bash
# ========================================
# NETWORK
# ========================================
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97

# ========================================
# DEPLOYED CONTRACTS (ALREADY DEPLOYED ✅)
# ========================================
FACTORY_ADDRESS=0xf4d898028A09f8c3a7d9689ac5C811B864851272
ESCROW_IMPLEMENTATION_ADDRESS=0x115CD26Dc1c415562E7e02Bc9A252FE85EA81Eee

# Leave empty - will be filled after creating escrow
ESCROW_ADDRESS=

# ========================================
# REQUIRED: PARTICIPANT ADDRESSES
# ========================================
# Replace with your actual addresses
BUYER_ADDRESS=0xYourBuyerAddress
VENDOR_ADDRESS=0xYourVendorAddress
ARBITER_ADDRESS=0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd
FEE_RECIPIENT_ADDRESS=0xYourFeeRecipientAddress

# ========================================
# REQUIRED: DEPLOYER PRIVATE KEY
# ========================================
# The account that will pay gas to create the escrow
DEPLOYER_PRIVATE_KEY=your_private_key_here

# ========================================
# OPTIONAL: Testing Private Keys
# ========================================
# Only needed if you want to test buyer/vendor actions
BUYER_PRIVATE_KEY=
VENDOR_PRIVATE_KEY=
ARBITER_PRIVATE_KEY=

# ========================================
# OPTIONAL: GRMPS Rewards
# ========================================
GRMPS_TOKEN_ADDRESS=
REWARD_RATE=30000000000000000000000
```

## 📋 **Minimum Required for Creating Escrow**

You only need these values to create an escrow:

```bash
# Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97

# Contracts (already deployed!)
FACTORY_ADDRESS=0xf4d898028A09f8c3a7d9689ac5C811B864851272

# Participants
BUYER_ADDRESS=0x...      # Who will fund the escrow
VENDOR_ADDRESS=0x...     # Who will deliver the work
ARBITER_ADDRESS=0x...    # Who will resolve disputes
FEE_RECIPIENT_ADDRESS=0x... # Who receives platform fees

# Private Key
DEPLOYER_PRIVATE_KEY=xxx # Account to pay gas for creating escrow
```

## 🎯 **Quick Start Commands**

### **1. Create `.env` file:**

```bash
cd web3
cat > .env << 'EOF'
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97
FACTORY_ADDRESS=0xf4d898028A09f8c3a7d9689ac5C811B864851272
ESCROW_IMPLEMENTATION_ADDRESS=0x115CD26Dc1c415562E7e02Bc9A252FE85EA81Eee

BUYER_ADDRESS=0xYourBuyerAddress
VENDOR_ADDRESS=0xYourVendorAddress
ARBITER_ADDRESS=0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd
FEE_RECIPIENT_ADDRESS=0xYourFeeRecipientAddress

DEPLOYER_PRIVATE_KEY=your_private_key_here
EOF
```

### **2. Edit the addresses:**

```bash
nano .env
# or
vi .env
# or use your favorite editor
```

### **3. Create your first escrow:**

```bash
npm run create:escrow
```

## 🔍 **Where to Get the Values**

### **FACTORY_ADDRESS** ✅
Already set: `0xf4d898028A09f8c3a7d9689ac5C811B864851272`

### **BUYER_ADDRESS**
The address that will pay for the work:
- Your MetaMask address
- Or any Testnet address you control

### **VENDOR_ADDRESS**
The address that will receive payment:
- Freelancer's address
- Or another test address

### **ARBITER_ADDRESS**
Who resolves disputes (default to your deployer):
- Use: `0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd` (your current owner)
- Or set to `0x0000000000000000000000000000000000000000` for no arbiter

### **FEE_RECIPIENT_ADDRESS**
Who receives platform fees:
- Your platform wallet
- Or use deployer address: `0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd`

### **DEPLOYER_PRIVATE_KEY**
Your private key (to pay gas):
- Same one you used for deployment
- Has testnet BNB for gas

## ⚠️ **Security Note**

For testing, you can use the same address for multiple roles:

```bash
# Simple test setup (all same address)
BUYER_ADDRESS=0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd
VENDOR_ADDRESS=0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd
ARBITER_ADDRESS=0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd
FEE_RECIPIENT_ADDRESS=0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd
DEPLOYER_PRIVATE_KEY=your_key
```

**For production**: Use different addresses for each role!

## ✅ **Complete Example `.env`**

```bash
# Network
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97

# Deployed Contracts
FACTORY_ADDRESS=0xf4d898028A09f8c3a7d9689ac5C811B864851272
ESCROW_IMPLEMENTATION_ADDRESS=0x115CD26Dc1c415562E7e02Bc9A252FE85EA81Eee

# Participants (replace with your addresses)
BUYER_ADDRESS=0x1111111111111111111111111111111111111111
VENDOR_ADDRESS=0x2222222222222222222222222222222222222222
ARBITER_ADDRESS=0x94d16b9d37b4876cCAC00ed3cA1e5579e0b803Bd
FEE_RECIPIENT_ADDRESS=0x3333333333333333333333333333333333333333

# Private Key (your deployer key)
DEPLOYER_PRIVATE_KEY=0xabc123...

# Optional: GRMPS Rewards
GRMPS_TOKEN_ADDRESS=0x4444444444444444444444444444444444444444
REWARD_RATE=30000000000000000000000
```

## 🚀 **After Creating `.env`, Run:**

```bash
npm run create:escrow
```

This will create your first escrow from the factory! 🎉

