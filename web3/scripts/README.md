# Web3 Scripts

This directory contains production-ready scripts for interacting with the BSC Escrow system.

## Gnosis Safe Integration

### Transfer Ownership to Gnosis Safe

Transfer factory ownership to a Gnosis Safe multisig wallet for enhanced security.

```bash
# Transfer ownership
npm run transfer:ownership

# Check current ownership
npm run check:ownership

# Or run directly
node scripts/transfer-ownership-to-gnosis.js
node scripts/transfer-ownership-to-gnosis.js check
```

#### Environment Variables Required

```bash
FACTORY_ADDRESS=0xYourDeployedFactoryAddress
GNOSIS_SAFE_ADDRESS=0xYourGnosisSafeAddress
OWNER_PRIVATE_KEY=0xYourCurrentOwnerPrivateKey
RPC_URL=https://bsc-dataseed.binance.org/
```

#### Features

- ✅ **Validation**: Checks all inputs and contract state
- ✅ **Gas Estimation**: Estimates and validates gas costs
- ✅ **Error Handling**: Comprehensive error messages and tips
- ✅ **Verification**: Confirms successful ownership transfer
- ✅ **Status Check**: Command to check current factory owner

#### Example Output

```
=== Gnosis Safe Ownership Transfer ===

✅ Configuration validated
Network: bsc
Factory Address: 0x1234...
Gnosis Safe Address: 0x5678...
Current Owner Address: 0x9abc...

Checking current factory owner...
Current Owner: 0x9abc...

Estimating gas...
Estimated gas: 50000
Estimated cost: 0.001 BNB
✅ Sufficient balance for transaction

Transferring ownership to Gnosis Safe...
Transaction hash: 0xabcd...
Waiting for confirmation...
✅ Transaction confirmed!
Block number: 12345678
Gas used: 52000

Verifying ownership transfer...
✅ Ownership transfer successful!
New Owner: 0x5678...

=== Transfer Complete ===
✅ Factory ownership transferred to Gnosis Safe
✅ All admin functions now require multisig approval
✅ Enhanced security achieved

Next steps:
1. Test multisig functionality in Gnosis Safe interface
2. Create escrows with Gnosis Safe as arbiter
3. Set up monitoring for factory transactions
```

## Other Scripts

### Factory Operations
- `deploy:implementation` - Deploy escrow implementation
- `deploy:factory` - Deploy factory contract
- `create:escrow` - Create new escrow via factory
- `list:escrows` - List created escrows
- `predict:address` - Predict deterministic escrow address

### Escrow Operations
- `fund` - Fund an escrow
- `deliver` - Deliver work (vendor)
- `approve` - Approve delivery (buyer)
- `withdraw` - Withdraw funds (vendor)
- `cancel` - Cancel escrow (buyer)

### Dispute Operations
- `dispute-init` - Initiate dispute
- `dispute-pay` - Pay dispute fee
- `dispute-resolve` - Resolve dispute (arbiter)

### Utility Operations
- `info` - Get escrow information
- `setup-rewards` - Setup reward token
- `fund-grmps` - Fund GRMPS rewards

## Usage Examples

### Complete Gnosis Safe Setup

```bash
# 1. Deploy contracts
npm run deploy:implementation
npm run deploy:factory

# 2. Create Gnosis Safe wallet (via web interface)
# 3. Transfer ownership to Gnosis Safe
npm run transfer:ownership

# 4. Verify transfer
npm run check:ownership

# 5. Create escrow with Gnosis Safe as arbiter
npm run create:escrow
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
FACTORY_ADDRESS=0x...
GNOSIS_SAFE_ADDRESS=0x...
OWNER_PRIVATE_KEY=0x...
RPC_URL=https://bsc-dataseed.binance.org/
```

## Security Notes

- **Private Keys**: Never commit private keys to version control
- **Environment Files**: Use `.env` files and add to `.gitignore`
- **Test First**: Always test on testnet before mainnet
- **Multisig**: Use Gnosis Safe for production deployments
- **Monitoring**: Set up transaction monitoring and alerts

## Troubleshooting

### Common Issues

1. **"Not the current owner"**
   - Check if you're using the correct private key
   - Verify the factory address is correct

2. **"Insufficient funds"**
   - Ensure you have enough BNB for gas fees
   - Check current gas prices

3. **"Invalid address"**
   - Verify all addresses are valid Ethereum addresses
   - Check for typos in environment variables

### Getting Help

- Check the main project README
- Review contract documentation
- Test on BSC testnet first
- Use the examples in `/examples` folder
