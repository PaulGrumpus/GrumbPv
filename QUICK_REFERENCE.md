# Quick Reference Card

## 🔑 Key Distinction

| Role | Owner Of | Private Key | Purpose |
|------|----------|-------------|---------|
| **DEPLOYER** | Factory, RewardDistributor | `DEPLOYER_PRIVATE_KEY` | System admin |
| **ARBITER** | Individual Escrows | `ARBITER_PRIVATE_KEY` | Dispute resolver |

**⚠️ They are DIFFERENT** (except when testing with same key)

## 📋 Environment Variables by Role

### Deployer (System Administrator)
```bash
DEPLOYER_PRIVATE_KEY=0x...    # or PRIVATE_KEY
REWARD_SOURCE_PRIVATE_KEY=0x... # Usually same as deployer
```

### Arbiter (Dispute Resolver)
```bash
ARBITER_PRIVATE_KEY=0x...     # DIFFERENT from deployer
ARBITER_ADDRESS=0x...
```

### Others
```bash
BUYER_PRIVATE_KEY=0x...
VENDOR_PRIVATE_KEY=0x...
GRMPS_TOKEN_ADDRESS=0x...
FACTORY_ADDRESS=0x...
REWARD_DISTRIBUTOR_ADDRESS=0x...
```

## 🚀 Quick Setup (5 Steps)

### 1. Deploy (DEPLOYER)
```bash
cd web3
npm install

# Deploy infrastructure
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:implementation
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:factory
DEPLOYER_PRIVATE_KEY=0x... npm run deploy:reward-distributor

# Save addresses to .env:
# FACTORY_ADDRESS=0x...
# REWARD_DISTRIBUTOR_ADDRESS=0x...
```

### 2. Configure System (DEPLOYER)
```bash
# Link factory to distributor
cast send $FACTORY_ADDRESS "setRewardDistributor(address)" \
  $REWARD_DISTRIBUTOR_ADDRESS \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL

# Approve GRMPS (one time for all escrows!)
npm run approve:distributor

# Authorize factory (ONE TIME → all escrows past & future are authorized!)
cast send $REWARD_DISTRIBUTOR_ADDRESS "setAuthorizedFactory(address,bool)" \
  $FACTORY_ADDRESS true \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### 3. Exclude from GRMPS Fees (GRMPS OWNER)
```bash
# GRMPS owner excludes reward source from fees
cast send $GRMPS_TOKEN_ADDRESS "excludeFromFees(address,bool)" \
  $REWARD_SOURCE_ADDRESS true \
  --private-key $GRMPS_OWNER_KEY \
  --rpc-url $BSC_TESTNET_RPC_URL
```

### 4. Create Escrow (ANYONE)
```bash
npm run create:escrow
# Save: ESCROW_ADDRESS=0x...
```

### 5. Configure Escrow (ARBITER)
```bash
# Arbiter sets up rewards for this escrow
ARBITER_PRIVATE_KEY=0x... npm run setup-rewards
```

## 💡 Who Does What

### System Setup (One-time)
| Task | Who | Command |
|------|-----|---------|
| Deploy contracts | DEPLOYER | `npm run deploy:*` |
| Configure factory | DEPLOYER | `factory.setRewardDistributor()` |
| Approve GRMPS | REWARD SOURCE | `npm run approve:distributor` |
| Authorize factory | DEPLOYER | `distributor.setAuthorizedCaller()` |
| Exclude from fees | GRMPS OWNER | `grmps.excludeFromFees()` |

### Per Escrow
| Task | Who | Command |
|------|-----|---------|
| Create escrow | ANYONE | `npm run create:escrow` |
| Configure rewards | ARBITER | `npm run setup-rewards` |
| Fund | BUYER | `npm run fund` |
| Deliver | VENDOR | `npm run deliver` |
| Approve | BUYER | `npm run approve` |
| Withdraw | VENDOR | `npm run withdraw` |
| Resolve dispute | ARBITER | `npm run dispute-resolve` |

## ✅ Checklist

### Initial Deployment
- [ ] Set `DEPLOYER_PRIVATE_KEY` in .env
- [ ] Set `ARBITER_PRIVATE_KEY` in .env (different from deployer!)
- [ ] Set `GRMPS_TOKEN_ADDRESS` in .env
- [ ] Deploy Factory
- [ ] Deploy RewardDistributor
- [ ] Save addresses to .env

### Configuration
- [ ] Factory → setRewardDistributor (deployer)
- [ ] RewardDistributor → approve GRMPS (reward source)
- [ ] RewardDistributor → authorize factory (deployer)
- [ ] GRMPS → exclude reward source from fees (GRMPS owner)

### Per Escrow
- [ ] Create escrow (anyone)
- [ ] Configure rewards (arbiter)
- [ ] Ready for use!

## 🔐 Security

### Testing
```bash
# Can use same key
DEPLOYER_PRIVATE_KEY=0xTestKey
ARBITER_PRIVATE_KEY=0xTestKey
```

### Production
```bash
# MUST be different
DEPLOYER_PRIVATE_KEY=0xKey1
ARBITER_PRIVATE_KEY=0xKey2

# Then transfer to Gnosis Safe
GNOSIS_SAFE_ADDRESS=0xMultisig
# factory.transferOwnership(GNOSIS_SAFE)
# distributor.transferOwnership(GNOSIS_SAFE)
```

## 🆘 Common Errors

### "UnauthorizedCaller"
❌ Escrow/Factory not authorized in RewardDistributor
✅ Run: `distributor.setAuthorizedCaller(factoryAddress, true)`

### "InsufficientAllowance"
❌ Reward source hasn't approved enough GRMPS
✅ Run: `npm run approve:distributor`

### "Ownable: caller is not the owner"
❌ Wrong private key for the function
✅ Check who owns the contract:
- Factory owner = DEPLOYER
- RewardDistributor owner = DEPLOYER
- Escrow owner = ARBITER

### Rewards not distributed
❌ RewardDistributor not set on escrow
✅ Run: `npm run setup-rewards` (arbiter)

## 📚 Full Documentation

- **Complete Guide**: `REWARD_DISTRIBUTOR_GUIDE.md`
- **Roles Explained**: `ROLES_AND_RESPONSIBILITIES.md`
- **All Env Vars**: `web3/ENV_VARIABLES.md`
- **Contract Docs**: `contract/DEPLOYMENT_GUIDE.md`

## 🎯 Remember

1. **Deployer** ≠ **Arbiter** (different roles!)
2. Approve **once** for **all escrows** (that's the point!)
3. Exclude **reward source** from GRMPS fees (not escrow)
4. Factory **auto-configures** new escrows with distributor
5. Arbiter still **configures** token/rate per escrow

## 🌟 Benefits

| Old Way | New Way (RewardDistributor) |
|---------|---------------------------|
| 100 escrows = 100 approvals | 100 escrows = **1 approval** ✅ |
| Complex management | **Simple** ✅ |
| Not scalable | **Highly scalable** ✅ |
| Each escrow approval | **Factory auto-configures** ✅ |

---

**Need help?** Check `ROLES_AND_RESPONSIBILITIES.md` for detailed explanations!

