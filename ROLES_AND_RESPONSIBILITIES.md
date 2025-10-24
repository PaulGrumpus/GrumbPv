# Roles and Responsibilities

## Overview

The BSC Escrow system has distinct roles with different responsibilities and access controls. This document clarifies each role and prevents confusion between **Deployer** and **Arbiter**.

## Visual Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     DEPLOYER                             │
│  (System Administrator / Contract Owner)                 │
│                                                          │
│  Responsibilities:                                       │
│  • Deploy Factory and RewardDistributor                  │
│  • Own and manage these contracts                        │
│  • Configure factory settings                            │
│  • Authorize escrows in RewardDistributor                │
│  • Can transfer to Gnosis Safe                           │
│                                                          │
│  Private Key: DEPLOYER_PRIVATE_KEY                       │
└────────────┬────────────────────────────────────────────┘
             │ owns
             ▼
┌────────────────────────┐     ┌──────────────────────────┐
│  EscrowFactory         │     │  RewardDistributor       │
│  owner() = Deployer    │     │  owner() = Deployer      │
└────────────┬───────────┘     └──────────┬───────────────┘
             │ creates                     │ distributes from
             ▼                             ▼
┌────────────────────────┐     ┌──────────────────────────┐
│  Escrow #1             │     │  Reward Source           │
│  owner() = Arbiter ◄───┼─────┤  (holds GRMPS)           │
└────────────────────────┘     │  Usually = Deployer       │
                               └──────────────────────────┘
┌────────────────────────┐
│  Escrow #2             │
│  owner() = Arbiter     │
└────────────────────────┘

             ▲
             │ configured by
             │
┌────────────┴────────────────────────────────────────────┐
│                     ARBITER                              │
│  (Dispute Resolver / Escrow Owner)                       │
│                                                          │
│  Responsibilities:                                       │
│  • Own individual escrows                                │
│  • Resolve disputes                                      │
│  • Configure reward settings per escrow                  │
│  • Set RewardDistributor on escrows                      │
│                                                          │
│  Private Key: ARBITER_PRIVATE_KEY                        │
│  ⚠️  DIFFERENT from Deployer (except testing)            │
└──────────────────────────────────────────────────────────┘
```

## Detailed Roles

### 1. DEPLOYER (System Administrator)

**Who**: Organization owner, system administrator, or Gnosis Safe multisig

**Smart Contract Access**:
- `Factory.owner()` = Deployer
- `RewardDistributor.owner()` = Deployer

**Responsibilities**:
1. Deploy infrastructure contracts (Factory, RewardDistributor)
2. Configure Factory settings:
   - Set RewardDistributor address
   - Transfer ownership to Gnosis Safe
3. Manage RewardDistributor:
   - Authorize/deauthorize callers
   - Set reward token and source
   - Transfer ownership to Gnosis Safe
4. Hold GRMPS tokens (as Reward Source)
5. Approve RewardDistributor to spend GRMPS

**Private Key**: `DEPLOYER_PRIVATE_KEY` or `PRIVATE_KEY`

**Commands Used**:
```bash
npm run deploy:factory
npm run deploy:reward-distributor
npm run approve:distributor
# Factory settings via cast/web3
```

**Can Be Transferred**: Yes, to Gnosis Safe for decentralized management

---

### 2. ARBITER (Dispute Resolver)

**Who**: Trusted third party, dispute resolution service, or DAO

**Smart Contract Access**:
- `Escrow.owner()` = Arbiter
- Each escrow has its own owner (arbiter)

**Responsibilities**:
1. Resolve disputes between buyer and vendor
2. Configure rewards per escrow:
   - Set reward token address
   - Set reward rate (BNB→GRMPS conversion)
   - Set RewardDistributor address
3. Call `resolveToBuyer()` or `resolveToVendor()` in disputes

**Private Key**: `ARBITER_PRIVATE_KEY`

**Commands Used**:
```bash
npm run setup-rewards
npm run dispute-resolve
# Escrow owner functions
```

**Can Be Transferred**: Yes, via `Escrow.transferOwnership()` (inherited from OpenZeppelin Ownable)

**⚠️ IMPORTANT**: Arbiter is **NOT the same as Deployer** (except when testing with same key)

---

### 3. REWARD SOURCE

**Who**: Wallet holding GRMPS tokens (usually Deployer or Gnosis Safe)

**Smart Contract Access**:
- `RewardDistributor.rewardSource()` = Reward Source address

**Responsibilities**:
1. Hold GRMPS tokens for distribution
2. Approve RewardDistributor to spend GRMPS
3. Must be excluded from GRMPS transfer fees

**Private Key**: `REWARD_SOURCE_PRIVATE_KEY` (defaults to `DEPLOYER_PRIVATE_KEY`)

**Commands Used**:
```bash
npm run approve:distributor
# GRMPS token approve()
```

**Note**: Can be separate from Deployer, but typically the same

---

### 4. BUYER

**Who**: Customer, client, paying party

**Responsibilities**:
1. Fund escrow with BNB
2. Approve delivery after review
3. Initiate dispute if work is unsatisfactory
4. Pay dispute fee if disputing

**Private Key**: `BUYER_PRIVATE_KEY`

**Commands Used**:
```bash
npm run fund
npm run approve
npm run dispute-init
npm run dispute-pay
npm run cancel
```

---

### 5. VENDOR

**Who**: Freelancer, service provider, seller

**Responsibilities**:
1. Deliver work (submit IPFS CID)
2. Withdraw payment after both parties approve
3. Respond to disputes
4. Pay dispute fee if counterparty disputes

**Private Key**: `VENDOR_PRIVATE_KEY`

**Commands Used**:
```bash
npm run deliver
npm run withdraw
npm run dispute-init
npm run dispute-pay
```

---

## Key Differences: Deployer vs Arbiter

| Aspect | Deployer | Arbiter |
|--------|----------|---------|
| **Role** | System administrator | Dispute resolver |
| **Owns** | Factory, RewardDistributor | Individual escrows |
| **Deploys** | Infrastructure contracts | Nothing (uses existing) |
| **Manages** | System-wide settings | Per-escrow settings |
| **Resolves Disputes** | No | Yes |
| **Private Key** | `DEPLOYER_PRIVATE_KEY` | `ARBITER_PRIVATE_KEY` |
| **Can be Same** | Only for testing | Different in production |
| **Transfers To** | Gnosis Safe (factory/distributor) | Can transfer escrow ownership |

## Access Control Matrix

| Function | Deployer | Arbiter | Buyer | Vendor |
|----------|----------|---------|-------|--------|
| Deploy Factory | ✅ | ❌ | ❌ | ❌ |
| Deploy RewardDistributor | ✅ | ❌ | ❌ | ❌ |
| Set Factory RewardDistributor | ✅ | ❌ | ❌ | ❌ |
| Authorize Callers in Distributor | ✅ | ❌ | ❌ | ❌ |
| Create Escrow | Anyone | Anyone | Anyone | Anyone |
| Set Escrow Reward Token | ❌ | ✅ | ❌ | ❌ |
| Set Escrow Reward Rate | ❌ | ✅ | ❌ | ❌ |
| Set Escrow RewardDistributor | ❌ | ✅ | ❌ | ❌ |
| Fund Escrow | ❌ | ❌ | ✅ | ❌ |
| Deliver Work | ❌ | ❌ | ❌ | ✅ |
| Approve Delivery | ❌ | ❌ | ✅ | ❌ |
| Withdraw Payment | ❌ | ❌ | ❌ | ✅ |
| Resolve Dispute | ❌ | ✅ | ❌ | ❌ |

## Testing vs Production

### Testing (Same Key Allowed)
```bash
# .env
DEPLOYER_PRIVATE_KEY=0xSameKeyForTesting
ARBITER_PRIVATE_KEY=0xSameKeyForTesting

# Both roles use same wallet for simplicity
```

### Production (MUST Be Different)
```bash
# .env
DEPLOYER_PRIVATE_KEY=0xDeployerKey  # System admin
ARBITER_PRIVATE_KEY=0xArbiterKey    # Dispute resolver

# After deployment, transfer to Gnosis Safe:
GNOSIS_SAFE_ADDRESS=0xMultisigAddress

# Then call:
# Factory.transferOwnership(GNOSIS_SAFE_ADDRESS)
# RewardDistributor.transferOwnership(GNOSIS_SAFE_ADDRESS)
```

## Common Mistakes ❌ and Corrections ✅

### Mistake 1: Using Arbiter Key to Deploy

❌ **Wrong**:
```bash
ARBITER_PRIVATE_KEY=0x... npm run deploy:reward-distributor
```

✅ **Correct**:
```bash
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:reward-distributor
```

**Why**: RewardDistributor owner should be system administrator (deployer), not arbiter

---

### Mistake 2: Using Deployer Key for Escrow Configuration

❌ **Wrong**:
```bash
DEPLOYER_PRIVATE_KEY=0x... npm run setup-rewards
```

✅ **Correct**:
```bash
ARBITER_PRIVATE_KEY=0x... npm run setup-rewards
```

**Why**: Each escrow's owner is the arbiter, only arbiter can call `setRewardToken()`

---

### Mistake 3: Thinking Arbiter Owns Factory

❌ **Wrong Assumption**:
> "Arbiter deploys factory and manages all escrows"

✅ **Correct Understanding**:
> "Deployer owns factory (system-wide), arbiter owns individual escrows (per-job)"

---

### Mistake 4: Not Excluding Correct Address from GRMPS Fees

❌ **Wrong**:
```bash
# Excluding arbiter instead of reward source
GRMPS.excludeFromFees(arbiterAddress, true)
```

✅ **Correct**:
```bash
# Excluding reward source (who sends GRMPS)
GRMPS.excludeFromFees(rewardSourceAddress, true)
```

**Why**: Transfer fees are charged on FROM address (reward source), not escrow owner

---

## Deployment Flow

### Step 1: Deploy Infrastructure (DEPLOYER)
```bash
# Deployer deploys factory and reward system
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:implementation
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:factory
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:reward-distributor
```

### Step 2: Configure System (DEPLOYER)
```bash
# Deployer configures factory to use reward distributor
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $DEPLOYER_PRIVATE_KEY

# Deployer approves GRMPS spending
npm run approve:distributor  # Uses DEPLOYER_PRIVATE_KEY or REWARD_SOURCE_PRIVATE_KEY

# Deployer authorizes factory in distributor
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedCaller(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $DEPLOYER_PRIVATE_KEY
```

### Step 3: Create and Configure Escrows (MIXED)
```bash
# Anyone can create escrow through factory
npm run create:escrow

# Arbiter configures rewards for specific escrow
ARBITER_PRIVATE_KEY=0x... npm run setup-rewards
```

### Step 4: Use Escrow (BUYER/VENDOR)
```bash
# Buyer funds
BUYER_PRIVATE_KEY=0x... npm run fund

# Vendor delivers
VENDOR_PRIVATE_KEY=0x... npm run deliver

# Buyer approves
BUYER_PRIVATE_KEY=0x... npm run approve

# Vendor withdraws (+ rewards auto-distributed)
VENDOR_PRIVATE_KEY=0x... npm run withdraw
```

### Step 5: Transfer to Multisig (DEPLOYER → GNOSIS)
```bash
# Deployer transfers factory ownership
cast send $FACTORY_ADDRESS "transferOwnership(address)" \
  $GNOSIS_SAFE_ADDRESS \
  --private-key $DEPLOYER_PRIVATE_KEY

# Deployer transfers reward distributor ownership
cast send $REWARD_DISTRIBUTOR_ADDRESS "transferOwnership(address)" \
  $GNOSIS_SAFE_ADDRESS \
  --private-key $DEPLOYER_PRIVATE_KEY
```

## Summary

✅ **Deployer** = System administrator (Factory/RewardDistributor owner)
✅ **Arbiter** = Dispute resolver (Escrow owner)
✅ **Different roles**, different responsibilities
✅ **Can use same key for testing**, MUST be different in production
✅ **Both can transfer to Gnosis Safe** for decentralized management

The separation allows:
- System-wide management (deployer) without per-job involvement
- Independent dispute resolution (arbiter) without system admin access
- Clear security boundaries
- Flexible ownership transfer (to DAOs, multisigs, etc.)

