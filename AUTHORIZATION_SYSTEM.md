# Authorization System - How It Works

## 🎯 Your Question Answered

**Q: "Do I need to authorize all escrow addresses?"**  
**A: NO!** You authorize the **factory once**, and ALL escrows (past and future) are automatically authorized!

## 🔐 How Authorization Works

### Old (Wrong) Approach ❌
```
Authorize:
- Escrow #1  ← manual
- Escrow #2  ← manual
- Escrow #3  ← manual
- Escrow #4  ← manual
... (100 escrows = 100 transactions!)
```

### New (Correct) Approach ✅
```
Authorize:
- Factory   ← ONE TIME!

Automatically authorized:
- All existing escrows
- All future escrows
- No manual work needed!
```

## 📊 Architecture Diagram

```
                    ┌──────────────────────┐
                    │ RewardDistributor    │
                    │ (owns GRMPS access)  │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼────────────┐
                    │ Authorized Factories   │
                    │ [Factory#1] ✅         │
                    └──────────┬────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
    ┌────▼────┐           ┌────▼────┐          ┌────▼────┐
    │Escrow#1 │           │Escrow#2 │          │Escrow#3 │
    │(auto ✅)│           │(auto ✅)│          │(auto ✅)│
    └─────────┘           └─────────┘          └─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌──────────▼────────────┐
                    │ When escrow calls      │
                    │ distributeRewards():   │
                    │                        │
                    │ 1. Check: Was caller   │
                    │    created by factory? │
                    │ 2. Factory says: YES!  │
                    │ 3. ✅ Authorized!      │
                    └────────────────────────┘
```

## 🔍 How It Works Internally

### 1. Factory Tracks Escrows
```solidity
// In EscrowFactory.sol
mapping(address => bool) public isEscrowCreated;

function createEscrow(...) {
    escrow = Clones.clone(implementation);
    isEscrowCreated[escrow] = true;  // ← Tracked!
}
```

### 2. Distributor Authorizes Factory
```solidity
// In RewardDistributor.sol
mapping(address => bool) public authorizedFactories;
address[] public authorizedFactoryList;

function setAuthorizedFactory(address _factory, bool _authorized) {
    authorizedFactories[_factory] = _authorized;
    if (_authorized) authorizedFactoryList.push(_factory);
}
```

### 3. Escrow Calls Distributor
```solidity
// When vendor withdraws and rewards are distributed
escrow.withdraw() 
  → calls distributor.distributeRewards([buyer, vendor], [amount, amount])
```

### 4. Distributor Checks Authorization
```solidity
function _isAuthorized(address _caller) internal view returns (bool) {
    // Check if directly authorized
    if (authorizedCallers[_caller]) return true;
    
    // Check if created by any authorized factory
    for (uint256 i = 0; i < authorizedFactoryList.length; i++) {
        address factory = authorizedFactoryList[i];
        if (IEscrowFactory(factory).isEscrowCreated(_caller)) {
            return true;  // ← Automatically authorized!
        }
    }
    
    return false;
}
```

## ✨ Key Benefits

### 1. One-Time Authorization
```bash
# Deploy factory
npm run deploy:factory

# Authorize factory (ONCE!)
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true --private-key $DEPLOYER_PRIVATE_KEY

# Create 1000 escrows → All automatically authorized!
npm run create:escrow  # Escrow #1 ✅
npm run create:escrow  # Escrow #2 ✅
npm run create:escrow  # Escrow #3 ✅
# ... all authorized!
```

### 2. Works for Past Escrows
```bash
# Timeline:
# Day 1: Create Escrow #1, #2, #3
npm run create:escrow  # Create 3 escrows

# Day 30: Authorize factory
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true

# Result: Escrow #1, #2, #3 are NOW authorized! (retroactive)
```

### 3. Works for Future Escrows
```bash
# Timeline:
# Day 1: Authorize factory
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true

# Day 2-365: Create escrows whenever needed
npm run create:escrow  # Auto-authorized ✅
npm run create:escrow  # Auto-authorized ✅
# Forever... all auto-authorized!
```

## 📝 What Gets Authorized?

### ✅ Authorized: Factories (Callers)
- Factory contracts
- Individual escrows (if needed)

### ❌ NOT Authorized: Recipients
- Buyer addresses
- Vendor addresses
- Any reward recipients

**Why?** Recipients are parameters in `distributeRewards()`, not callers. Only the escrow contract is the caller.

## 🔧 Setup Commands

### Deploy and Configure
```bash
# 1. Deploy RewardDistributor
npm run deploy:reward-distributor
# Save: REWARD_DISTRIBUTOR_ADDRESS=0x...

# 2. Link factory to distributor
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $DEPLOYER_PRIVATE_KEY

# 3. Authorize factory (ONE TIME!)
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $DEPLOYER_PRIVATE_KEY

# 4. Done! All escrows (past & future) are authorized!
```

### Check Authorization
```bash
# Check if factory is authorized
cast call $REWARD_DISTRIBUTOR_ADDRESS "authorizedFactories(address)" \
  $FACTORY_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL

# Check if escrow was created by factory
cast call $FACTORY_ADDRESS "isEscrowCreated(address)" \
  $ESCROW_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC_URL

# Get all authorized factories
cast call $REWARD_DISTRIBUTOR_ADDRESS "getAuthorizedFactories()" \
  --rpc-url $BSC_TESTNET_RPC_URL
```

## 🎓 Complete Flow Example

```bash
# === DAY 1: Setup ===
# Deploy factory
npm run deploy:factory
# FACTORY_ADDRESS=0xABC...

# Deploy reward distributor
npm run deploy:reward-distributor
# REWARD_DISTRIBUTOR_ADDRESS=0xDEF...

# Link factory to distributor
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" 0xDEF... \
  --private-key $DEPLOYER_PRIVATE_KEY

# Authorize factory
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  0xABC... true \
  --private-key $DEPLOYER_PRIVATE_KEY

# Approve GRMPS
npm run approve:distributor

# === DAY 2: Create escrows ===
npm run create:escrow  # Escrow #1 created at 0x111...
npm run create:escrow  # Escrow #2 created at 0x222...
npm run create:escrow  # Escrow #3 created at 0x333...

# === DAY 3: Use escrows ===
# Escrow #1: buyer funds, vendor delivers, buyer approves
BUYER_PRIVATE_KEY=0x... npm run fund
VENDOR_PRIVATE_KEY=0x... npm run deliver
BUYER_PRIVATE_KEY=0x... npm run approve

# === DAY 4: Vendor withdraws ===
VENDOR_PRIVATE_KEY=0x... npm run withdraw

# Behind the scenes:
# 1. Escrow calls: distributor.distributeRewards([buyer, vendor], [amount, amount])
# 2. Distributor checks: "Is escrow 0x111... authorized?"
# 3. Distributor queries: factory.isEscrowCreated(0x111...)
# 4. Factory responds: "Yes!"
# 5. Distributor: "✅ Authorized! Distributing rewards..."
# 6. GRMPS transferred to buyer and vendor!
```

## 🚀 Summary

| Question | Answer |
|----------|--------|
| **Do I authorize individual escrows?** | NO ❌ |
| **Do I authorize recipients (buyer/vendor)?** | NO ❌ |
| **What do I authorize?** | Factory (one time!) ✅ |
| **Do I authorize the factory for each escrow?** | NO - just once! ✅ |
| **Does it work for past escrows?** | YES ✅ |
| **Does it work for future escrows?** | YES ✅ |
| **How many transactions needed?** | ONE (factory authorization) ✅ |
| **Scalable for 1000 escrows?** | YES ✅ |

## 🎉 The Magic

**ONE factory authorization** = **UNLIMITED escrow authorizations**

No manual work. No per-escrow transactions. Just create escrows and they work automatically! 🚀

