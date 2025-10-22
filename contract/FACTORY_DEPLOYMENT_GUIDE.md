# Factory + Minimal Proxy Deployment Guide

This guide covers deploying and using the Escrow Factory with OpenZeppelin Clones (EIP-1167) for gas-efficient escrow contract creation.

## Architecture Overview

The new architecture uses a **Factory + Minimal Proxy Clone** pattern:

1. **Escrow Implementation** (`Escrow.sol`): A single master contract that contains all the escrow logic
2. **EscrowFactory** (`EscrowFactory.sol`): A factory that deploys minimal proxy clones pointing to the implementation
3. **Escrow Clones**: Lightweight proxies (~45 bytes) that delegate all calls to the implementation

### Benefits

- **Gas Efficiency**: Creating a new escrow costs ~100k gas vs ~3M gas for full deployment
- **Consistency**: All escrows use the same audited implementation
- **Upgradability**: While individual escrows are immutable, new escrows can use updated implementations
- **Deterministic Addresses**: Optional CREATE2 support for predictable escrow addresses

## Prerequisites

1. Foundry installed and configured
2. `.env` file with required variables (see `.env.example`)
3. BNB testnet RPC URL and funded deployer account
4. BscScan API key (optional, for verification)

## Step 1: Configure Environment

Create or update your `.env` file:

```bash
# Deployer private key (funds must be available)
PRIVATE_KEY=0x...

# RPC endpoints
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
BSC_RPC_URL=https://bsc-dataseed.binance.org

# For verification (optional)
BSCSCAN_API_KEY=...

# Will be set during deployment
ESCROW_IMPLEMENTATION_ADDRESS=
FACTORY_ADDRESS=
```

Load the environment:

```bash
source .env
```

## Step 2: Deploy the Implementation

Deploy the Escrow implementation contract first:

```bash
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --chain-id 97 \
  --broadcast \
  --verify \
  -vvv
```

**Output Example:**
```
==============================================
Escrow Implementation deployed at: 0xAbC...123
==============================================

Save this address and use it to deploy the factory:
export ESCROW_IMPLEMENTATION_ADDRESS=0xAbC...123
```

**Important:** Save the implementation address and add it to your `.env` file:

```bash
echo "ESCROW_IMPLEMENTATION_ADDRESS=0xAbC...123" >> .env
source .env
```

## Step 3: Deploy the Factory

Deploy the EscrowFactory using the implementation address:

```bash
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --chain-id 97 \
  --broadcast \
  --verify \
  -vvv
```

**Output Example:**
```
==============================================
EscrowFactory deployed at: 0xDeF...456
Using implementation: 0xAbC...123
Factory owner: 0x789...012
==============================================

Save this address for creating escrows:
export FACTORY_ADDRESS=0xDeF...456
```

**Important:** Save the factory address:

```bash
echo "FACTORY_ADDRESS=0xDeF...456" >> .env
source .env
```

## Step 4: Create Escrow Instances

### Option A: Using the Script

Modify `script/CreateEscrow.s.sol` with your job parameters or set environment variables:

```bash
export BUYER=0x...
export SELLER=0x...
export ARBITER=0x...  # or 0x0000000000000000000000000000000000000000 for no arbiter
export FEE_RECIPIENT=0x...
```

Then run:

```bash
forge script script/CreateEscrow.s.sol:CreateEscrow \
  --rpc-url $BSC_TESTNET_RPC_URL \
  --chain-id 97 \
  --broadcast \
  -vvv
```

### Option B: Calling from Your Application

#### Non-Deterministic Deployment (Simple)

```javascript
const jobId = ethers.utils.solidityKeccak256(['string'], ['JOB-12345']);
const tx = await factory.createEscrow(
  jobId,
  buyerAddress,
  sellerAddress,
  arbiterAddress,    // or ethers.constants.AddressZero
  feeRecipientAddress,
  100,               // 1% fee (100 basis points)
  ethers.constants.AddressZero,  // Native BNB
  ethers.utils.parseEther('1.0') // 1 BNB project amount
);

const receipt = await tx.wait();
const event = receipt.events.find(e => e.event === 'EscrowCreated');
const escrowAddress = event.args.escrow;

console.log(`Escrow created at: ${escrowAddress}`);
```

#### Deterministic Deployment (Predictable Address)

```javascript
const jobId = ethers.utils.solidityKeccak256(['string'], ['JOB-12345']);

// Create a unique salt from job parameters
const salt = ethers.utils.solidityKeccak256(
  ['bytes32', 'address', 'address'],
  [jobId, buyerAddress, sellerAddress]
);

// Predict the address before deployment
const predictedAddress = await factory.predictEscrow(salt);
console.log(`Escrow will be deployed at: ${predictedAddress}`);

// Deploy the escrow
const tx = await factory.createEscrowDeterministic(
  jobId,
  buyerAddress,
  sellerAddress,
  arbiterAddress,
  feeRecipientAddress,
  100,
  ethers.constants.AddressZero,
  ethers.utils.parseEther('1.0'),
  salt
);

const receipt = await tx.wait();
const event = receipt.events.find(e => e.event === 'EscrowCreated');
const escrowAddress = event.args.escrow;

// Verify addresses match
console.log(`Predicted: ${predictedAddress}`);
console.log(`Actual:    ${escrowAddress}`);
console.log(`Match:     ${predictedAddress === escrowAddress}`);
```

## Step 5: Using the Escrow

Once an escrow is created, interact with it using the standard Escrow ABI:

```javascript
const escrow = new ethers.Contract(escrowAddress, EscrowABI, signer);

// 1. Buyer funds the escrow (amount + 0.5% fee)
const projectAmount = ethers.utils.parseEther('1.0');
const buyerFee = projectAmount.mul(50).div(10000); // 0.5%
const totalAmount = projectAmount.add(buyerFee);
await escrow.connect(buyer).fund({ value: totalAmount });

// 2. Seller delivers with IPFS CID
await escrow.connect(seller).deliver('QmYourIPFSHash', contentHash);

// 3. Buyer approves the delivery
await escrow.connect(buyer).approve('QmYourIPFSHash');

// 4. Seller withdraws funds
await escrow.connect(seller).withdraw();
```

## Gas Comparison

| Operation | Full Deployment | Minimal Proxy | Savings |
|-----------|----------------|---------------|---------|
| Deploy Escrow | ~3,000,000 gas | ~100,000 gas | **97%** |
| Estimated Cost (20 gwei) | 0.06 BNB | 0.002 BNB | 0.058 BNB |

## Verification

If verification fails during deployment, you can verify manually:

### Verify Implementation
```bash
forge verify-contract \
  --chain-id 97 \
  --num-of-optimizations 200 \
  --compiler-version v0.8.24 \
  $ESCROW_IMPLEMENTATION_ADDRESS \
  src/Escrow.sol:Escrow \
  --etherscan-api-key $BSCSCAN_API_KEY
```

### Verify Factory
```bash
forge verify-contract \
  --chain-id 97 \
  --num-of-optimizations 200 \
  --compiler-version v0.8.24 \
  --constructor-args $(cast abi-encode "constructor(address)" $ESCROW_IMPLEMENTATION_ADDRESS) \
  $FACTORY_ADDRESS \
  src/EscrowFactory.sol:EscrowFactory \
  --etherscan-api-key $BSCSCAN_API_KEY
```

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
forge test -vv

# Run only factory tests
forge test --match-contract EscrowFactoryTest -vvv

# Run with gas reporting
forge test --gas-report
```

## Security Considerations

1. **Implementation is Immutable**: The implementation contract code cannot be changed after deployment
2. **Initialize Once**: Each escrow clone can only be initialized once (protected by `_initialized` flag)
3. **Factory Owner**: The factory owner can be changed via `transferOwnership()`
4. **No Selfdestruct**: The implementation should never use `selfdestruct` as it would break all clones
5. **Storage Collisions**: Clones use their own storage, isolated from the implementation

## Upgrading to New Implementation

To use a new implementation version:

1. Deploy a new implementation contract
2. Deploy a new factory pointing to the new implementation
3. Update your application to use the new factory address
4. Existing escrows continue working with the old implementation

## Mainnet Deployment (BSC)

For mainnet deployment, change the RPC URL and chain ID:

```bash
forge script script/DeployImplementation.s.sol:DeployImplementation \
  --rpc-url $BSC_RPC_URL \
  --chain-id 56 \
  --broadcast \
  --verify \
  -vvv

# Then deploy factory with the implementation address
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_RPC_URL \
  --chain-id 56 \
  --broadcast \
  --verify \
  -vvv
```

## Troubleshooting

### Issue: "ESCROW_IMPLEMENTATION_ADDRESS not set"
**Solution**: Make sure you've exported the implementation address after Step 2

### Issue: "Insufficient funds"
**Solution**: Ensure your deployer account has enough BNB for gas

### Issue: "Nonce too low"
**Solution**: Clear broadcast cache: `rm -rf broadcast/`

### Issue: "AlreadyInitialized" error
**Solution**: This escrow has already been initialized. Create a new escrow instead.

### Issue: Clone address doesn't match prediction
**Solution**: Ensure you're using the exact same salt and factory address for prediction

## Advanced Usage

### Indexing Events

Listen to factory events to track all created escrows:

```javascript
factory.on('EscrowCreated', (jobId, escrow, buyer, seller, arbiter, feeRecipient, feeBps, paymentToken, amountWei, deterministic) => {
  console.log('New escrow created:', {
    jobId,
    escrow,
    buyer,
    seller,
    deterministic
  });
});
```

### Gas Optimization Tips

1. Use deterministic deployment only when you need predictable addresses
2. Batch multiple escrow creations in a single transaction using a batch contract
3. Consider using multicall for reading multiple escrow states

## Support

For issues or questions:
- Check the test files for usage examples
- Review the inline code documentation
- Open an issue in the project repository

