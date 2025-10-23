const { ethers } = require('ethers');

/**
 * Simple Example: Transfer factory ownership to Gnosis Safe multisig
 * @notice This is a simplified example. Use web3/scripts/transfer-ownership-to-gnosis.js for production.
 */
async function transferOwnershipToGnosisSafe() {
    // Setup
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);
    
    // Contract addresses
    const factoryAddress = process.env.FACTORY_ADDRESS;
    const gnosisSafeAddress = process.env.GNOSIS_SAFE_ADDRESS;
    
    // Load factory contract
    const factoryABI = [
        "function owner() view returns (address)",
        "function transferOwnership(address newOwner) external"
    ];
    
    const factory = new ethers.Contract(factoryAddress, factoryABI, wallet);
    
    try {
        // Check current owner
        const currentOwner = await factory.owner();
        console.log('Current owner:', currentOwner);
        console.log('Transferring to Gnosis Safe:', gnosisSafeAddress);
        
        // Transfer ownership
        const tx = await factory.transferOwnership(gnosisSafeAddress);
        console.log('Transaction hash:', tx.hash);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('✅ Ownership transferred successfully!');
        
        // Verify new owner
        const newOwner = await factory.owner();
        console.log('New owner:', newOwner);
        
    } catch (error) {
        console.error('❌ Transfer failed:', error.message);
    }
}

/**
 * Example: Create escrow with Gnosis Safe as arbiter
 */
async function createEscrowWithGnosisArbiter() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.BUYER_PRIVATE_KEY, provider);
    
    const factoryAddress = process.env.FACTORY_ADDRESS;
    const gnosisArbiterAddress = process.env.GNOSIS_ARBITER_SAFE;
    
    const factoryABI = [
        "function createEscrow(bytes32 jobId, address buyer, address seller, address arbiter, address feeRecipient, uint256 feeBps, address paymentToken, uint256 amountWei, uint64 deadline, uint256 buyerFeeBps, uint256 vendorFeeBps, uint256 disputeFeeBps, uint256 rewardRateBps) external returns (address)"
    ];
    
    const factory = new ethers.Contract(factoryAddress, factoryABI, wallet);
    
    try {
        const jobId = ethers.keccak256(ethers.toUtf8Bytes("job-" + Date.now()));
        const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
        
        const tx = await factory.createEscrow(
            jobId,
            process.env.BUYER_ADDRESS,
            process.env.VENDOR_ADDRESS,
            gnosisArbiterAddress, // Gnosis Safe as arbiter
            process.env.FEE_RECIPIENT,
            100, // 1% total fee
            ethers.ZeroAddress, // Native BNB
            ethers.parseEther("1.0"), // 1 BNB
            deadline,
            50, // 0.5% buyer fee
            50, // 0.5% vendor fee
            50, // 0.5% dispute fee
            25  // 0.25% reward rate
        );
        
        const receipt = await tx.wait();
        console.log('✅ Escrow created with Gnosis Safe arbiter!');
        console.log('Escrow address:', receipt.logs[0].args.escrow);
        
    } catch (error) {
        console.error('❌ Escrow creation failed:', error.message);
    }
}

/**
 * Example: Resolve dispute using Gnosis Safe
 */
async function resolveDisputeWithGnosisSafe() {
    // This would be called from within the Gnosis Safe interface
    // or using a script that has access to the Safe's signing mechanism
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const safeWallet = new ethers.Wallet(process.env.SAFE_PRIVATE_KEY, provider); // One of the Safe signers
    
    const escrowAddress = process.env.ESCROW_ADDRESS;
    
    const escrowABI = [
        "function resolveToVendor() external",
        "function resolveToBuyer() external",
        "function getState() view returns (uint256)"
    ];
    
    const escrow = new ethers.Contract(escrowAddress, escrowABI, safeWallet);
    
    try {
        const state = await escrow.getState();
        console.log('Current escrow state:', state);
        
        if (state === 3) { // State.Disputed
            // In real scenario, this would be a multisig transaction
            // requiring multiple signatures from Safe members
            
            console.log('Dispute can be resolved by Gnosis Safe');
            console.log('Use Gnosis Safe interface to execute:');
            console.log('- resolveToVendor() - if vendor should win');
            console.log('- resolveToBuyer() - if buyer should win');
        }
        
    } catch (error) {
        console.error('❌ Error checking dispute state:', error.message);
    }
}

// Export functions for use
module.exports = {
    transferOwnershipToGnosisSafe,
    createEscrowWithGnosisArbiter,
    resolveDisputeWithGnosisSafe
};

// Run if called directly
if (require.main === module) {
    transferOwnershipToGnosisSafe()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
