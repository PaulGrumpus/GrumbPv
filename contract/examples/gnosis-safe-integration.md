# Gnosis Safe Integration Guide

## Overview
This guide shows how to integrate your escrow system with Gnosis Safe multisig wallets for enhanced security.

## Step-by-Step Implementation

### 1. Create Gnosis Safe Wallets

#### Factory Owner Safe
- **Purpose**: Manages the factory contract (updates, configuration)
- **Threshold**: 2-of-3 or 3-of-5 (recommended)
- **Signers**: Your team members or trusted parties

#### Arbiter Safe (Optional)
- **Purpose**: Resolves disputes in escrow contracts
- **Threshold**: 2-of-3 (recommended for faster resolution)
- **Signers**: Independent arbiters or community members

### 2. Deploy and Setup

```bash
# 1. Deploy your contracts first
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast

# 2. Copy environment template
cp gnosis-setup.env.example .env

# 3. Fill in your addresses in .env
FACTORY_ADDRESS=0xYourDeployedFactoryAddress
GNOSIS_SAFE_ADDRESS=0xYourGnosisSafeAddress

# 4. Transfer factory ownership to Gnosis Safe
forge script script/SetupGnosisSafe.s.sol --rpc-url $RPC_URL --broadcast
```

### 3. Create Escrows with Gnosis Safe Arbiter

```javascript
// Example: Create escrow with Gnosis Safe as arbiter
const factory = new ethers.Contract(factoryAddress, factoryABI, signer);

await factory.createEscrow(
    jobId,
    buyerAddress,
    vendorAddress,
    gnosisSafeArbiterAddress, // Use Gnosis Safe as arbiter
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

### 4. Managing Disputes with Gnosis Safe

When a dispute needs resolution:

1. **Both parties pay dispute fees** (automatic)
2. **Gnosis Safe multisig members review** the dispute
3. **Multisig executes resolution**:
   - `resolveToBuyer()` - Buyer wins
   - `resolveToVendor()` - Vendor wins

### 5. Factory Management with Gnosis Safe

Factory owner functions that now require multisig approval:
- `transferOwnership()` - Transfer factory ownership
- Any future admin functions you add

## Security Benefits

### Before (Single Owner)
- ❌ Single point of failure
- ❌ No oversight for critical decisions
- ❌ Risk of key compromise

### After (Gnosis Safe)
- ✅ Multiple signatures required
- ✅ Transparent decision making
- ✅ Reduced risk of compromise
- ✅ Time delays for critical changes (if configured)

## Best Practices

### 1. Safe Configuration
- Use 2-of-3 or 3-of-5 threshold
- Include geographically distributed signers
- Set up time delays for critical operations

### 2. Arbiter Selection
- Choose independent, trusted parties
- Consider rotating arbiters periodically
- Document arbiter selection criteria

### 3. Monitoring
- Monitor all factory and arbiter transactions
- Set up alerts for critical operations
- Regular security reviews

## Troubleshooting

### Common Issues

1. **Transaction Fails**: Check if all required signatures are collected
2. **Wrong Arbiter**: Can't change after escrow creation (by design)
3. **Safe Not Responding**: Check if signers are available and responsive

### Emergency Procedures

1. **Compromised Key**: Remove from Safe immediately
2. **Unresponsive Arbiter**: Use dispute timeout mechanisms
3. **Factory Issues**: Use Safe's recovery mechanisms

## Cost Considerations

- **Gas Costs**: Multisig transactions cost more gas
- **Time Costs**: Requires coordination between signers
- **Security vs Speed**: Balance based on your risk tolerance
