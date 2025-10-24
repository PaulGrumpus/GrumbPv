# Environment Variables Guide

This document explains all environment variables used in the BSC Escrow system and clarifies the different roles.

## Role Summary

### DEPLOYER (Contract Owner)
- **Purpose**: Deploys Factory and RewardDistributor, owns these contracts
- **Responsibilities**:
  - Deploy Factory and RewardDistributor contracts
  - Configure Factory settings (set RewardDistributor address)
  - Authorize callers in RewardDistributor
  - Can transfer ownership to Gnosis Safe for production
- **Private Key**: `DEPLOYER_PRIVATE_KEY` or `PRIVATE_KEY`
- **Used By**: Deployment scripts, factory management scripts

### ARBITER (Escrow Owner)
- **Purpose**: Resolves disputes, manages individual escrows
- **Responsibilities**:
  - Resolve disputes in escrows (arbiter role)
  - Each escrow's `owner()` = arbiter address
  - Configure reward token and rate per escrow
  - Set RewardDistributor on individual escrows
- **Private Key**: `ARBITER_PRIVATE_KEY`
- **Used By**: Escrow setup scripts, dispute resolution
- **Note**: **DIFFERENT from Deployer** (except when testing with same key)

### REWARD SOURCE
- **Purpose**: Holds and provides GRMPS tokens for rewards
- **Responsibilities**:
  - Hold GRMPS tokens
  - Approve RewardDistributor to spend GRMPS
  - Must be excluded from GRMPS transfer fees
- **Private Key**: `REWARD_SOURCE_PRIVATE_KEY` (defaults to DEPLOYER_PRIVATE_KEY)
- **Used By**: Approval scripts
- **Note**: Usually the deployer or Gnosis Safe

### BUYER
- **Purpose**: Funds escrows, pays for services
- **Responsibilities**:
  - Fund escrows with BNB
  - Approve delivery
  - Initiate disputes if needed
- **Private Key**: `BUYER_PRIVATE_KEY`
- **Used By**: Fund, approve, dispute scripts

### VENDOR
- **Purpose**: Delivers services, receives payments
- **Responsibilities**:
  - Deliver work (submit IPFS CID)
  - Withdraw payments after approval
  - Respond to disputes
- **Private Key**: `VENDOR_PRIVATE_KEY`
- **Used By**: Deliver, withdraw, dispute scripts

## Environment Variables

### Network Configuration

```bash
BSC_TESTNET_RPC_URL=https://bsc-testnet-rpc.publicnode.com/
CHAIN_ID=97
```

### Contract Addresses

```bash
# Deployed contract addresses
FACTORY_ADDRESS=0x...
ESCROW_IMPLEMENTATION_ADDRESS=0x...
ESCROW_ADDRESS=0x...  # For single escrow scripts
REWARD_DISTRIBUTOR_ADDRESS=0x...
```

### Token Addresses

```bash
GRMPS_TOKEN_ADDRESS=0x...
```

### Private Keys (CRITICAL - Keep Secure!)

```bash
# DEPLOYER - Owns Factory and RewardDistributor
DEPLOYER_PRIVATE_KEY=0x...
# or
PRIVATE_KEY=0x...

# ARBITER - Owns individual escrows, resolves disputes
# ⚠️ DIFFERENT from deployer (except for testing)
ARBITER_PRIVATE_KEY=0x...

# BUYER - Funds escrows, approves delivery
BUYER_PRIVATE_KEY=0x...

# VENDOR - Delivers work, withdraws payments
VENDOR_PRIVATE_KEY=0x...

# REWARD SOURCE (Optional) - Holds GRMPS, defaults to deployer
REWARD_SOURCE_PRIVATE_KEY=0x...
```

### Participant Addresses

```bash
BUYER_ADDRESS=0x...
VENDOR_ADDRESS=0x...
ARBITER_ADDRESS=0x...
FEE_RECIPIENT_ADDRESS=0x...
```

### Reward Configuration

```bash
# RewardDistributor owner (defaults to deployer address)
REWARD_DISTRIBUTOR_OWNER=0x...

# Wallet holding GRMPS tokens (defaults to RewardDistributor owner)
REWARD_SOURCE_ADDRESS=0x...

# Conversion rate: GRMPS per 1e18 wei of project amount
# Example: 30000 GRMPS per 1 BNB = 30000000000000000000000
REWARD_RATE=30000000000000000000000

# Expected monthly GRMPS volume for approval calculation
MONTHLY_GRMPS_VOLUME=100000
```

### Escrow Parameters

```bash
FUND_AMOUNT=0.1  # Default funding amount in BNB
```

### Production (Gnosis Safe)

```bash
GNOSIS_SAFE_ADDRESS=0x...  # For ownership transfer
```

## Script to Private Key Mapping

| Script | Required Private Key | Role |
|--------|---------------------|------|
| `deployFactory.js` | `DEPLOYER_PRIVATE_KEY` | Deployer |
| `deployImplementation.js` | `DEPLOYER_PRIVATE_KEY` | Deployer |
| `deployRewardDistributor.js` | `DEPLOYER_PRIVATE_KEY` | Deployer |
| `setupRewards.js` | `ARBITER_PRIVATE_KEY` | Arbiter (escrow owner) |
| `approveDistributor.js` | `REWARD_SOURCE_PRIVATE_KEY` or `DEPLOYER_PRIVATE_KEY` | Reward Source |
| `fund.js` | `BUYER_PRIVATE_KEY` | Buyer |
| `deliver.js` | `VENDOR_PRIVATE_KEY` | Vendor |
| `approve.js` | `BUYER_PRIVATE_KEY` | Buyer |
| `withdraw.js` | `VENDOR_PRIVATE_KEY` | Vendor |
| `cancel.js` | `BUYER_PRIVATE_KEY` | Buyer |
| `disputeInit.js` | `BUYER_PRIVATE_KEY` or `VENDOR_PRIVATE_KEY` | Buyer/Vendor |
| `disputePay.js` | `BUYER_PRIVATE_KEY` or `VENDOR_PRIVATE_KEY` | Buyer/Vendor |
| `disputeResolve.js` | `ARBITER_PRIVATE_KEY` | Arbiter |

## Testing Configuration

For testing, you can use the same private key for deployer and arbiter:

```bash
# Set both to same key for testing
DEPLOYER_PRIVATE_KEY=0xYourTestKey
ARBITER_PRIVATE_KEY=0xYourTestKey  # Same for testing
```

## Production Configuration

For production, use different keys and Gnosis Safe:

```bash
# Different keys for security
DEPLOYER_PRIVATE_KEY=0xDeployerKey  # Then transfer to Gnosis
ARBITER_PRIVATE_KEY=0xArbiterKey    # Separate arbiter wallet

# Transfer ownership after deployment
GNOSIS_SAFE_ADDRESS=0xYourGnosisSafe
# Then:
# 1. Factory.transferOwnership(GNOSIS_SAFE_ADDRESS)
# 2. RewardDistributor.transferOwnership(GNOSIS_SAFE_ADDRESS)
```

## Common Mistakes

❌ **Wrong**: Using `ARBITER_PRIVATE_KEY` to deploy RewardDistributor
```bash
# This is WRONG
npm run deploy:reward-distributor  # Expects DEPLOYER_PRIVATE_KEY
```

✅ **Correct**: Using `DEPLOYER_PRIVATE_KEY` to deploy, `ARBITER_PRIVATE_KEY` to configure escrows
```bash
# Deploy (deployer's role)
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:reward-distributor

# Configure escrow rewards (arbiter's role)
ARBITER_PRIVATE_KEY=0x... npm run setup-rewards
```

❌ **Wrong**: Thinking arbiter and deployer are the same
- They are **different roles** with different responsibilities
- Only use same key for testing/development

✅ **Correct**: Understanding the separation
- **Deployer** = System administrator (Factory/RewardDistributor owner)
- **Arbiter** = Dispute resolver (Escrow owner)

## Security Best Practices

1. **Never commit .env file** - Add to .gitignore
2. **Use different keys for production** - Separate deployer and arbiter
3. **Transfer to Gnosis Safe** - For production deployments
4. **Rotate keys periodically** - Especially for testnet
5. **Use hardware wallets** - For production deployments
6. **Limit key exposure** - Only use when necessary

## Quick Setup (Development/Testing)

1. Copy this template to `.env`:
```bash
cp ENV_VARIABLES.md .env
```

2. Fill in minimum required variables:
```bash
# For testing, can use same key
DEPLOYER_PRIVATE_KEY=0xYourTestPrivateKey
ARBITER_PRIVATE_KEY=0xYourTestPrivateKey

# Addresses (can derive from private key)
BUYER_ADDRESS=0x...
VENDOR_ADDRESS=0x...
ARBITER_ADDRESS=0x...
FEE_RECIPIENT_ADDRESS=0x...

# GRMPS token (if using rewards)
GRMPS_TOKEN_ADDRESS=0x...
```

3. Deploy and configure:
```bash
npm run deploy:factory
npm run deploy:reward-distributor
npm run approve:distributor
npm run create:escrow
npm run setup-rewards
```

