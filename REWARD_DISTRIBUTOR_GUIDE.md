# RewardDistributor Guide

## Overview

The **RewardDistributor** is a centralized contract for distributing GRMPS rewards to escrow participants. It solves the scalability problem of approving each individual escrow contract by requiring **only ONE approval** from the reward source for ALL escrows.

## Problem Solved

### Old Approach (Not Scalable)
- Owner approves **each escrow individually**
- Factory creates 100 escrows → 100 approvals needed
- With Gnosis Safe multisig → 100 multisig transactions!
- Time-consuming and expensive

### New Approach (Scalable) ✅
- Owner approves **RewardDistributor once**
- Factory creates 1000 escrows → **still only 1 approval!**
- All escrows use the same distributor
- Works seamlessly with EOA and Gnosis Safe

## Architecture

```
┌─────────────┐
│ Reward      │ 1. Holds GRMPS tokens
│ Source      │ 2. Approves RewardDistributor (ONCE)
│ (Owner/Safe)│
└──────┬──────┘
       │ approve(distributor, amount)
       ▼
┌─────────────────┐
│ RewardDistributor│ 3. Authorized to spend GRMPS
│                  │ 4. Whitelist escrows/factory
└────────┬─────────┘
         │ transferFrom(source, recipient, amount)
         ▼
┌────────────┐
│ Escrow 1   │ 5. Calls distributor.distributeRewards()
│ Escrow 2   │    when completing jobs
│ Escrow 3   │
│ ...        │
└────────────┘
```

## Important: Roles Clarification

**Deployer** (Contract Owner):
- Deploys Factory and RewardDistributor
- Owns Factory and RewardDistributor contracts
- Can be transferred to Gnosis Safe for decentralized management
- Uses `DEPLOYER_PRIVATE_KEY` or `PRIVATE_KEY`

**Arbiter** (Escrow Owner):
- Resolves disputes in individual escrows
- Each escrow's `owner()` = arbiter address
- Configures reward settings per escrow
- Uses `ARBITER_PRIVATE_KEY`
- **Different from Deployer** (except for testing)

**Reward Source**:
- Wallet that holds GRMPS tokens
- Usually the Deployer or Gnosis Safe
- Approves RewardDistributor to spend GRMPS

## Deployment Guide

### Step 1: Deploy RewardDistributor

```bash
# Using Foundry
cd contract
forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --broadcast

# Or using Web3 scripts
cd web3
npm run deploy:reward-distributor
```

**Required env variables:**
- `DEPLOYER_PRIVATE_KEY` or `PRIVATE_KEY`: Deployer's private key
- `GRMPS_TOKEN_ADDRESS`: GRMPS token address
- `REWARD_DISTRIBUTOR_OWNER`: (Optional) Defaults to deployer address
- `REWARD_SOURCE_ADDRESS`: (Optional) Address holding GRMPS, defaults to owner

**Save the deployed address:**
```bash
# Add to .env
REWARD_DISTRIBUTOR_ADDRESS=0x...
```

### Step 2: (Optional) Transfer Ownership to Gnosis Safe

For production, transfer RewardDistributor ownership to Gnosis Safe multisig:

```bash
# Deployer transfers ownership
cast send $REWARD_DISTRIBUTOR_ADDRESS "transferOwnership(address)" $GNOSIS_SAFE_ADDRESS \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL

# Verify new owner
cast call $REWARD_DISTRIBUTOR_ADDRESS "owner()" --rpc-url $BSC_TESTNET_RPC_URL
```

**Note:** After transfer, all RewardDistributor management (authorize callers, set reward source, etc.) requires Gnosis Safe multisig approval.

### Step 3: Configure Factory

Set the RewardDistributor on the factory so all new escrows use it automatically:

```bash
cd contract
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

**Note:** Factory owner must call this (deployer or Gnosis Safe if transferred).

### Step 4: Approve RewardDistributor

The reward source (who holds GRMPS) must approve the distributor to spend tokens:

```bash
cd web3
npm run approve:distributor
```

This script:
- **Detects** if reward source is EOA or Gnosis Safe
- **EOA**: Executes approval directly (if private key provided)
- **Gnosis Safe**: Provides transaction data for multisig

**For Gnosis Safe:**
1. Go to https://app.safe.global
2. Select your Safe
3. Create "Contract Interaction" transaction
4. Target: GRMPS token address
5. Function: `approve`
6. Parameters:
   - `spender`: RewardDistributor address
   - `amount`: Large amount (e.g., 100,000 GRMPS)
7. Submit and collect signatures

### Step 5: Authorize Factory

Authorize the factory **once** → ALL escrows (past and future) are automatically authorized! 🎉

```bash
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

**Note:** RewardDistributor owner must call this (deployer or Gnosis Safe).

**How it works:**
1. Factory tracks all escrows it creates (`factory.isEscrowCreated(escrow)`)
2. When an escrow calls `distributor.distributeRewards()`, the distributor checks all authorized factories
3. If the escrow was created by an authorized factory, the request is approved
4. **No need to authorize individual escrows!**
5. Works for escrows created **before** and **after** factory authorization

#### Alternative Options

**Option B: Authorize Specific Escrows** (for non-factory escrows):
```bash
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedCaller(address,bool)" \
  $ESCROW_ADDRESS true \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

**Option C: Open Mode** (use with caution):
```bash
cast send $REWARD_DISTRIBUTOR_ADDRESS "setOpenMode(bool)" true \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Step 6: Exclude Reward Source from GRMPS Fees

**CRITICAL:** GRMPS charges transfer fees based on the FROM address. The reward source must be excluded:

```bash
# GRMPS owner must call (NOT the escrow owner)
cast send $GRMPS_TOKEN_ADDRESS "excludeFromFees(address,bool)" \
  $REWARD_SOURCE_ADDRESS true \
  --private-key $GRMPS_OWNER_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

## Usage

### For New Escrows (via Factory)

If factory has `rewardDistributor` set, all new escrows automatically use it:

```bash
npm run create:escrow
```

No additional configuration needed! The factory will:
1. Create escrow
2. Initialize it
3. **Automatically call** `escrow.setRewardDistributor(distributor)`

### For Existing Escrows

Set the distributor manually on existing escrows:

```bash
# Arbiter (escrow owner) must call this
cast send $ESCROW_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $ARBITER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

**Note:** Each escrow's owner is the arbiter, not the deployer.

### Setting Reward Configuration

Each escrow still needs reward token and rate configured (arbiter does this):

```bash
npm run setup-rewards
```

This sets (requires `ARBITER_PRIVATE_KEY`):
- `rewardToken` (GRMPS address)
- `rewardRatePer1e18` (conversion rate)

## How Rewards Are Distributed

When vendor withdraws from completed escrow:

1. **Escrow** calculates reward amounts for buyer and vendor
2. **Escrow** checks if `rewardDistributor` is set
3. **If set:** Calls `distributor.distributeRewards([buyer, vendor], [amount, amount], "escrow_completion")`
4. **Distributor** checks authorization
5. **Distributor** calls `grmpsToken.transferFrom(rewardSource, buyer, amount)`
6. **Distributor** calls `grmpsToken.transferFrom(rewardSource, vendor, amount)`
7. **Escrow** emits `RewardPaid` events

### Fallback Behavior

If `rewardDistributor` is not set, escrow uses legacy direct transfer method:
- Requires escrow owner to approve each escrow individually
- Still works, but not scalable

## Monitoring & Management

### Check Current State

```bash
# Check allowance
cast call $GRMPS_TOKEN_ADDRESS "allowance(address,address)" \
  $REWARD_SOURCE_ADDRESS $REWARD_DISTRIBUTOR_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL

# Check if caller is authorized
cast call $REWARD_DISTRIBUTOR_ADDRESS "isAuthorized(address)" \
  $ESCROW_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL

# Check reward source balance
cast call $GRMPS_TOKEN_ADDRESS "balanceOf(address)" \
  $REWARD_SOURCE_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Increase Allowance

As rewards are distributed, you may need to increase allowance:

```bash
npm run approve:distributor
# Then approve new amount
```

### Revoke Authorization

Remove authorization from specific escrow:

```bash
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedCaller(address,bool)" \
  $ESCROW_ADDRESS false \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### Batch Authorization

Authorize multiple escrows at once:

```bash
cast send $REWARD_DISTRIBUTOR_ADDRESS \
  "setAuthorizedCallers(address[],bool)" \
  "[$ESCROW1,$ESCROW2,$ESCROW3]" true \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

## Security Considerations

### Owner Controls
- **RewardDistributor Owner** (Deployer or Gnosis Safe): Can authorize/deauthorize callers, change reward source/token, transfer ownership
- **Reward Source** (Usually Deployer or Gnosis Safe): Holds GRMPS, controls allowance
- **Factory Owner** (Deployer or Gnosis Safe): Can set/unset distributor on factory
- **Escrow Owner** (Arbiter): Configures rewards per escrow, resolves disputes

### Best Practices

1. **Use Gnosis Safe** for RewardDistributor owner (multisig security)
2. **Authorize Factory** instead of individual escrows (less management)
3. **Monitor allowance** regularly and adjust as needed
4. **Set reasonable allowances** (e.g., 1-3 months of expected volume)
5. **Exclude reward source** from GRMPS fees before distributing rewards
6. **Test on testnet** with small amounts first

### Emergency Actions

**Pause rewards:**
```bash
# Remove all authorizations (RewardDistributor owner)
cast send $REWARD_DISTRIBUTOR_ADDRESS "setOpenMode(bool)" false \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

**Revoke allowance:**
```bash
# Reward source approves 0 (uses reward source's private key)
cast send $GRMPS_TOKEN_ADDRESS "approve(address,uint256)" \
  $REWARD_DISTRIBUTOR_ADDRESS 0 \
  --private-key $REWARD_SOURCE_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

## Comparison: Old vs New

| Feature | Old (Direct) | New (Distributor) |
|---------|-------------|-------------------|
| **Approvals needed** | 1 per escrow | 1 total |
| **With 100 escrows** | 100 transactions | 1 transaction |
| **Gnosis Safe overhead** | 100 multisig approvals | 1 multisig approval |
| **Gas cost** | High (100x approve) | Low (1x approve) |
| **Management** | Complex | Simple |
| **Scalability** | ❌ Poor | ✅ Excellent |
| **Security** | Distributed | Centralized (+ access control) |
| **Monitoring** | Per-escrow | Centralized |

## Troubleshooting

### Rewards Not Distributed

**Check:**
1. Is `rewardDistributor` set on escrow?
   ```bash
   cast call $ESCROW_ADDRESS "rewardDistributor()"
   ```

2. Is escrow/factory authorized?
   ```bash
   cast call $REWARD_DISTRIBUTOR_ADDRESS "authorizedCallers(address)" $ESCROW_ADDRESS
   ```

3. Is allowance sufficient?
   ```bash
   cast call $GRMPS_TOKEN_ADDRESS "allowance(address,address)" \
     $REWARD_SOURCE $REWARD_DISTRIBUTOR_ADDRESS
   ```

4. Is reward source excluded from fees?
   ```bash
   # Check GRMPS contract for fee exemption
   ```

### "UnauthorizedCaller" Error

- Escrow is not authorized in RewardDistributor
- Solution: Authorize the escrow or factory

### "InsufficientAllowance" Error

- Reward source hasn't approved enough GRMPS
- Solution: Run `npm run approve:distributor` again with higher amount

### Rewards Failing Silently

- Check escrow events for `RewardSkipped` events
- Reason will be in the event: "insufficient_allowance", "distributor_failed", etc.

## Migration from Old to New

If you have existing escrows using direct transfer:

1. **Deploy RewardDistributor** (Step 1) using `DEPLOYER_PRIVATE_KEY`
2. **Approve it once** (Step 4) - Reward source approves distributor
3. **For each existing escrow:**
   ```bash
   # Arbiter (escrow owner) can revoke old approval if needed (optional)
   # Only if arbiter was the reward source in old method
   cast send $GRMPS_TOKEN_ADDRESS "approve(address,uint256)" $ESCROW_ADDRESS 0 \
     --private-key $ARBITER_PRIVATE_KEY \
     --rpc-url $BSC_TESTNET_RPC_URL
   
   # Arbiter sets new distributor (escrow owner must call)
   cast send $ESCROW_ADDRESS "setRewardDistributor(address)" \
     $REWARD_DISTRIBUTOR_ADDRESS \
     --private-key $ARBITER_PRIVATE_KEY \
     --rpc-url $BSC_TESTNET_RPC_URL
   ```
4. **Configure factory** for future escrows (Step 3) using `DEPLOYER_PRIVATE_KEY`

## Summary

✅ **One approval for unlimited escrows**  
✅ **Factory automatically configures new escrows**  
✅ **Works with EOA and Gnosis Safe**  
✅ **Centralized management and monitoring**  
✅ **Secure with proper access control**  
✅ **Backward compatible (escrows can still use direct method)**  

The RewardDistributor is the recommended approach for production deployments with multiple escrows.

