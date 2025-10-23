# Complete Gnosis Safe Setup Guide

## Overview
This guide shows you exactly how to transfer ownership to Gnosis Safe multisig wallets.

## Prerequisites
- Deployed EscrowFactory contract
- Gnosis Safe wallet created
- Access to current owner's private key

## Step 1: Create Gnosis Safe Wallet

### Via Gnosis Safe Web Interface
1. Go to [app.safe.global](https://app.safe.global)
2. Click "Create Account"
3. Choose your network (BSC Mainnet/Testnet)
4. Add signers (2-5 recommended)
5. Set threshold (2-of-3 or 3-of-5 recommended)
6. Deploy the Safe
7. **Save the Safe address** - you'll need this!

## Step 2: Prepare Environment

```bash
# Copy the example environment file
cp gnosis-setup.env.example .env

# Edit .env with your actual values
FACTORY_ADDRESS=0xYourDeployedFactoryAddress
GNOSIS_SAFE_ADDRESS=0xYourGnosisSafeAddress
OWNER_PRIVATE_KEY=0xYourCurrentOwnerPrivateKey
RPC_URL=https://bsc-dataseed.binance.org/
```

## Step 3: Transfer Ownership

### Option A: Using Foundry Script
```bash
# Run the ownership transfer script
forge script script/TransferToGnosisSafe.s.sol --rpc-url $RPC_URL --broadcast --verify
```

### Option B: Using JavaScript
```bash
# Run the JavaScript example
node web3/examples/transfer-ownership-to-gnosis.js
```

### Option C: Manual Transaction
```javascript
// Using ethers.js or web3.js
const factory = new ethers.Contract(factoryAddress, factoryABI, ownerWallet);
await factory.transferOwnership(gnosisSafeAddress);
```

## Step 4: Verify Transfer

```bash
# Check the new owner
cast call $FACTORY_ADDRESS "owner()" --rpc-url $RPC_URL

# Should return your Gnosis Safe address
```

## Step 5: Test Multisig Functionality

### Create a Test Transaction
1. Go to your Gnosis Safe interface
2. Click "New Transaction"
3. Add your factory contract address
4. Add function: `transferOwnership(address)`
5. Add parameter: `0x0000000000000000000000000000000000000000` (for testing)
6. Submit the transaction
7. **Don't execute it** - just verify it works

### What You'll See
- Transaction requires multiple signatures
- All signers must approve
- Only executes when threshold is met

## Step 6: Create Escrows with Gnosis Safe Arbiter

```javascript
// Example: Create escrow with Gnosis Safe as arbiter
const factory = new ethers.Contract(factoryAddress, factoryABI, signer);

await factory.createEscrow(
    jobId,
    buyerAddress,
    vendorAddress,
    gnosisSafeAddress, // Use Gnosis Safe as arbiter
    feeRecipientAddress,
    feeBps,
    paymentTokenAddress,
    amountWei,
    deadline,
    buyerFeeBps,
    vendorFeeBps,
    disputeFeeBps,
    rewardRateBps
);
```

## How It Works Technically

### Before Transfer
```
Current Owner (EOA) → Factory Contract
- Single signature required
- msg.sender = EOA address
- Risk: Single point of failure
```

### After Transfer
```
Gnosis Safe Multisig → Factory Contract
- Multiple signatures required
- msg.sender = Gnosis Safe address
- Security: Multiple approvals needed
```

### Your Contract Sees
```solidity
// This works exactly the same way
modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner();
    _;
}

// msg.sender is now the Gnosis Safe address
// But the transaction required multiple signatures
```

## Security Benefits

### ✅ What You Gain
- **Multiple Signatures**: No single point of failure
- **Transparency**: All decisions are visible
- **Audit Trail**: Complete transaction history
- **Time Delays**: Optional delays for critical operations
- **Recovery**: Built-in recovery mechanisms

### ⚠️ What Changes
- **Slower Operations**: Requires coordination between signers
- **Higher Gas Costs**: Multisig transactions cost more
- **Dependency**: Relies on signers being available

## Troubleshooting

### Common Issues

1. **"Not the current owner" error**
   - Check if you're using the correct private key
   - Verify the factory address is correct

2. **Transaction fails**
   - Ensure you have enough BNB for gas
   - Check if the Gnosis Safe address is valid

3. **Gnosis Safe not responding**
   - Verify the Safe is deployed on the correct network
   - Check if signers are available

### Verification Commands

```bash
# Check factory owner
cast call $FACTORY_ADDRESS "owner()" --rpc-url $RPC_URL

# Check Gnosis Safe info
cast call $GNOSIS_SAFE_ADDRESS "getThreshold()" --rpc-url $RPC_URL
cast call $GNOSIS_SAFE_ADDRESS "getOwners()" --rpc-url $RPC_URL

# Check if addresses match
if [ "$(cast call $FACTORY_ADDRESS "owner()" --rpc-url $RPC_URL)" = "$GNOSIS_SAFE_ADDRESS" ]; then
    echo "✅ Ownership transfer successful!"
else
    echo "❌ Ownership transfer failed!"
fi
```

## Next Steps

1. **Test thoroughly** on testnet first
2. **Set up monitoring** for factory transactions
3. **Document procedures** for your team
4. **Consider time delays** for critical operations
5. **Plan for emergencies** (key recovery, etc.)

## Cost Estimation

- **Ownership Transfer**: ~50,000 gas (~$0.50 on BSC)
- **Multisig Transactions**: ~100,000 gas (~$1.00 on BSC)
- **Gnosis Safe Deployment**: ~500,000 gas (~$5.00 on BSC)

*Costs are approximate and depend on current gas prices*
