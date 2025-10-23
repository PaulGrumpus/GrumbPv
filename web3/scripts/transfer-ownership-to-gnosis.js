#!/usr/bin/env node

/**
 * @title Transfer Ownership to Gnosis Safe
 * @notice Script to transfer factory ownership to Gnosis Safe multisig
 * @dev Run this after deploying the factory and creating your Gnosis Safe
 * 
 * Usage:
 *   node web3/scripts/transfer-ownership-to-gnosis.js
 * 
 * Environment Variables Required:
 *   - FACTORY_ADDRESS: Address of deployed EscrowFactory
 *   - GNOSIS_SAFE_ADDRESS: Address of Gnosis Safe multisig
 *   - OWNER_PRIVATE_KEY: Private key of current factory owner
 *   - RPC_URL: RPC endpoint for the network
 */

const { ethers } = require('ethers');
require('dotenv').config();

// Configuration
const CONFIG = {
    factoryAddress: process.env.FACTORY_ADDRESS,
    gnosisSafeAddress: process.env.GNOSIS_SAFE_ADDRESS,
    ownerPrivateKey: process.env.OWNER_PRIVATE_KEY,
    rpcUrl: process.env.RPC_URL
};

// Factory Contract ABI (minimal for ownership transfer)
const FACTORY_ABI = [
    "function owner() view returns (address)",
    "function transferOwnership(address newOwner) external",
    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
];

/**
 * Validate environment configuration
 */
function validateConfig() {
    const required = ['factoryAddress', 'gnosisSafeAddress', 'ownerPrivateKey', 'rpcUrl'];
    const missing = required.filter(key => !CONFIG[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key.toUpperCase()}`));
        console.error('\nPlease check your .env file or environment variables.');
        process.exit(1);
    }
    
    // Validate addresses
    if (!ethers.isAddress(CONFIG.factoryAddress)) {
        console.error('❌ Invalid FACTORY_ADDRESS');
        process.exit(1);
    }
    
    if (!ethers.isAddress(CONFIG.gnosisSafeAddress)) {
        console.error('❌ Invalid GNOSIS_SAFE_ADDRESS');
        process.exit(1);
    }
    
    console.log('✅ Configuration validated');
}

/**
 * Main function to transfer ownership
 */
async function transferOwnership() {
    try {
        console.log('=== Gnosis Safe Ownership Transfer ===\n');
        
        // Validate configuration
        validateConfig();
        
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
        const wallet = new ethers.Wallet(CONFIG.ownerPrivateKey, provider);
        
        console.log('Network:', await provider.getNetwork().then(n => n.name));
        console.log('Factory Address:', CONFIG.factoryAddress);
        console.log('Gnosis Safe Address:', CONFIG.gnosisSafeAddress);
        console.log('Current Owner Address:', wallet.address);
        console.log('');
        
        // Load factory contract
        const factory = new ethers.Contract(CONFIG.factoryAddress, FACTORY_ABI, wallet);
        
        // Check current owner
        console.log('Checking current factory owner...');
        const currentOwner = await factory.owner();
        console.log('Current Owner:', currentOwner);
        
        // Verify we're the current owner
        if (currentOwner.toLowerCase() !== wallet.address.toLowerCase()) {
            console.error('❌ Error: You are not the current owner of the factory');
            console.error('Current owner:', currentOwner);
            console.error('Your address:', wallet.address);
            process.exit(1);
        }
        
        // Check if already transferred
        if (currentOwner.toLowerCase() === CONFIG.gnosisSafeAddress.toLowerCase()) {
            console.log('✅ Factory is already owned by the Gnosis Safe address');
            return;
        }
        
        // Estimate gas
        console.log('Estimating gas...');
        const gasEstimate = await factory.transferOwnership.estimateGas(CONFIG.gnosisSafeAddress);
        console.log('Estimated gas:', gasEstimate.toString());
        
        // Get gas price
        const gasPrice = await provider.getFeeData();
        const gasCost = gasEstimate * gasPrice.gasPrice;
        console.log('Estimated cost:', ethers.formatEther(gasCost), 'BNB');
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        if (balance < gasCost) {
            console.error('❌ Insufficient balance for gas');
            console.error('Required:', ethers.formatEther(gasCost), 'BNB');
            console.error('Available:', ethers.formatEther(balance), 'BNB');
            process.exit(1);
        }
        
        console.log('✅ Sufficient balance for transaction\n');
        
        // Transfer ownership
        console.log('Transferring ownership to Gnosis Safe...');
        const tx = await factory.transferOwnership(CONFIG.gnosisSafeAddress, {
            gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
        });
        
        console.log('Transaction hash:', tx.hash);
        console.log('Waiting for confirmation...');
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed!');
        console.log('Block number:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());
        console.log('Gas price:', ethers.formatUnits(receipt.gasPrice, 'gwei'), 'Gwei');
        
        // Verify transfer
        console.log('\nVerifying ownership transfer...');
        const newOwner = await factory.owner();
        
        if (newOwner.toLowerCase() === CONFIG.gnosisSafeAddress.toLowerCase()) {
            console.log('✅ Ownership transfer successful!');
            console.log('New Owner:', newOwner);
        } else {
            console.error('❌ Ownership transfer verification failed!');
            console.error('Expected:', CONFIG.gnosisSafeAddress);
            console.error('Actual:', newOwner);
            process.exit(1);
        }
        
        // Final summary
        console.log('\n=== Transfer Complete ===');
        console.log('✅ Factory ownership transferred to Gnosis Safe');
        console.log('✅ All admin functions now require multisig approval');
        console.log('✅ Enhanced security achieved');
        console.log('\nNext steps:');
        console.log('1. Test multisig functionality in Gnosis Safe interface');
        console.log('2. Create escrows with Gnosis Safe as arbiter');
        console.log('3. Set up monitoring for factory transactions');
        
    } catch (error) {
        console.error('❌ Transfer failed:', error.message);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error('💡 Tip: Make sure you have enough BNB for gas fees');
        } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
            console.error('💡 Tip: The transaction might fail - check contract state');
        } else if (error.message.includes('NotOwner')) {
            console.error('💡 Tip: Make sure you are the current owner of the factory');
        }
        
        process.exit(1);
    }
}

/**
 * Helper function to check factory status
 */
async function checkFactoryStatus() {
    try {
        const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
        const factory = new ethers.Contract(CONFIG.factoryAddress, FACTORY_ABI, provider);
        
        const owner = await factory.owner();
        console.log('Factory Owner:', owner);
        
        if (owner.toLowerCase() === CONFIG.gnosisSafeAddress.toLowerCase()) {
            console.log('✅ Factory is owned by Gnosis Safe');
        } else {
            console.log('⚠️  Factory is not owned by Gnosis Safe');
        }
        
    } catch (error) {
        console.error('❌ Error checking factory status:', error.message);
    }
}

// Main execution
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'check') {
        checkFactoryStatus();
    } else if (command === 'transfer' || !command) {
        transferOwnership();
    } else {
        console.log('Usage:');
        console.log('  node transfer-ownership-to-gnosis.js [transfer|check]');
        console.log('');
        console.log('Commands:');
        console.log('  transfer  - Transfer ownership to Gnosis Safe (default)');
        console.log('  check     - Check current factory owner');
    }
}

module.exports = {
    transferOwnership,
    checkFactoryStatus
};
