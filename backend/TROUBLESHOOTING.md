# Troubleshooting Guide

## Issue: "Factory address not configured" but it's in .env

### Root Cause

The `contracts.ts` file was importing environment variables before they were loaded by `dotenv`.

**Import order matters in ES modules!**

```typescript
// ❌ WRONG ORDER
import { index.ts }
  ↓ calls config() to load .env
import { contracts.ts }
  ↓ reads process.env.FACTORY_ADDRESS (empty, not loaded yet!)
  
// ✅ CORRECT ORDER  
import { contracts.ts }
  ↓ calls config() itself
  ↓ reads process.env.FACTORY_ADDRESS (loaded!)
```

### Solution Applied

Updated `backend/src/config/contracts.ts` to load `.env` itself:

```typescript
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST
config();  // ← THIS WAS ADDED!

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### Verify the Fix

```bash
# 1. Check .env has the address
cd backend
grep "^FACTORY_ADDRESS" .env

# Should show:
# FACTORY_ADDRESS=0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59

# 2. Restart the server
npm run dev

# Should start WITHOUT warnings about missing addresses

# 3. Test the endpoint
curl http://localhost:5000/api/v1/factory/owner

# Should return:
# {"success":true,"data":{"owner":"0x..."}}
```

## Common Environment Variable Issues

### 1. Variables Not Loading

**Symptoms:**
- Warnings about missing addresses
- `process.env.VARIABLE` returns `undefined`
- Config files show empty strings

**Solutions:**
- ✅ Make sure `config()` is called before using `process.env`
- ✅ Check `.env` file is in the correct directory (`backend/.env`)
- ✅ No spaces around `=` in `.env` file
- ✅ Values don't need quotes (unless containing spaces)

**Example .env format:**
```env
# ✅ CORRECT
FACTORY_ADDRESS=0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59
PORT=5000

# ❌ WRONG
FACTORY_ADDRESS = 0xc1232E2215A2a39B1c14Af852eEB389BaB41FC59  (spaces around =)
PORT="5000"  (unnecessary quotes)
```

### 2. Import Order Issues

**Symptom:** Variables work in some files but not others

**Solution:** Import and call `config()` in files that use `process.env` directly:

```typescript
import { config } from 'dotenv';
config(); // Load .env before using process.env
```

### 3. Hot Reload Not Picking Up .env Changes

**Symptom:** Changed `.env` but server still uses old values

**Solution:** Restart the dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

Or use `nodemon` with `.env` watching:
```json
{
  "watch": ["src/**/*.ts", ".env"]
}
```

### 4. Different .env Files for Different Environments

**Symptom:** Works locally but not in production

**Solution:** Use environment-specific `.env` files:
```bash
.env              # Default
.env.development  # Development
.env.production   # Production
.env.test         # Testing
```

Load specific file:
```typescript
import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV}` });
```

### 5. Values Look Correct But Still Empty

**Symptoms:**
- `.env` file has values
- `cat .env` shows them
- Server still says missing

**Debugging Steps:**

```typescript
// Add this temporarily to contracts.ts for debugging:
console.log('🔍 Debug - Environment Variables:');
console.log('FACTORY_ADDRESS:', process.env.FACTORY_ADDRESS);
console.log('REWARD_DISTRIBUTOR_ADDRESS:', process.env.REWARD_DISTRIBUTOR_ADDRESS);
console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('ADDRESS')));
```

**Common causes:**
- ❌ Reading wrong `.env` file (check path)
- ❌ File encoding issues (use UTF-8)
- ❌ Hidden characters in file
- ❌ File permissions (needs read access)

### 6. TypeScript Compilation Issues

**Symptom:** Works in dev (`npm run dev`) but not production (`npm start`)

**Check:**
```bash
# Build and check dist folder
npm run build
grep -r "FACTORY_ADDRESS" dist/

# Make sure .env is accessible from dist/
# Either copy .env or use absolute path
```

## Quick Health Check Script

```bash
#!/bin/bash
# backend/check-env.sh

echo "🔍 Environment Variable Health Check"
echo ""

cd backend

# Check .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in $(pwd)"
    exit 1
fi
echo "✅ .env file exists"

# Check critical variables
for var in FACTORY_ADDRESS ESCROW_IMPLEMENTATION_ADDRESS REWARD_DISTRIBUTOR_ADDRESS; do
    value=$(grep "^$var=" .env | cut -d'=' -f2)
    if [ -z "$value" ]; then
        echo "❌ $var is not set"
    elif [ "$value" = "0x..." ]; then
        echo "⚠️  $var is placeholder, needs real address"
    else
        echo "✅ $var = $value"
    fi
done

echo ""
echo "To test live: npm run dev"
```

## Testing Environment Loading

Create `backend/test-env.ts`:

```typescript
import { config } from 'dotenv';

config();

console.log('Environment Test:');
console.log('================');
console.log('FACTORY_ADDRESS:', process.env.FACTORY_ADDRESS || '❌ NOT SET');
console.log('ESCROW_IMPLEMENTATION_ADDRESS:', process.env.ESCROW_IMPLEMENTATION_ADDRESS || '❌ NOT SET');
console.log('REWARD_DISTRIBUTOR_ADDRESS:', process.env.REWARD_DISTRIBUTOR_ADDRESS || '❌ NOT SET');
console.log('BSC_TESTNET_RPC_URL:', process.env.BSC_TESTNET_RPC_URL || '❌ NOT SET');
console.log('PORT:', process.env.PORT || '3000 (default)');
```

Run:
```bash
cd backend
npx tsx test-env.ts
```

## Still Having Issues?

### Complete Reset

```bash
# 1. Clean everything
cd backend
rm -rf node_modules package-lock.json dist logs/*

# 2. Reinstall
npm install

# 3. Verify .env
cat .env | head -20

# 4. Copy ABIs
bash scripts/copy-abis.sh

# 5. Restart
npm run dev
```

### Check System Environment

```bash
# Make sure system env isn't overriding
env | grep FACTORY_ADDRESS

# Should be empty (unless you set it system-wide)
```

### File Permissions

```bash
cd backend
ls -la .env

# Should show read permissions: -rw-rw-r--
# If not: chmod 644 .env
```

## Reference

- ✅ `.env` location: `backend/.env`
- ✅ Config loading: `src/config/contracts.ts` line 7
- ✅ Main entry: `src/index.ts` line 5
- ✅ Validation: `src/config/contracts.ts` lines 34-52

---

**After applying fix, restart server and test endpoints!**

