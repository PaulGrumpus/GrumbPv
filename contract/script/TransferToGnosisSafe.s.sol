// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {EscrowFactory} from "../src/EscrowFactory.sol";

/**
 * @title TransferToGnosisSafe
 * @notice Complete example of transferring ownership to Gnosis Safe
 * @dev This script demonstrates the full process
 */
contract TransferToGnosisSafe is Script {
    function run() external {
        // Get addresses from environment
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        address gnosisSafeAddress = vm.envAddress("GNOSIS_SAFE_ADDRESS");
        uint256 ownerPrivateKey = vm.envUint("OWNER_PRIVATE_KEY");
        
        console.log("=== Gnosis Safe Ownership Transfer ===");
        console.log("Factory Address:", factoryAddress);
        console.log("Gnosis Safe Address:", gnosisSafeAddress);
        
        // Start broadcasting
        vm.startBroadcast(ownerPrivateKey);
        
        // Get factory contract
        EscrowFactory factory = EscrowFactory(factoryAddress);
        
        // Check current state
        address currentOwner = factory.owner();
        console.log("Current Owner:", currentOwner);
        
        // Verify we're the current owner
        require(currentOwner == vm.addr(ownerPrivateKey), "Not the current owner");
        
        // Transfer ownership
        console.log("Transferring ownership...");
        factory.transferOwnership(gnosisSafeAddress);
        
        // Verify transfer
        address newOwner = factory.owner();
        require(newOwner == gnosisSafeAddress, "Transfer failed");
        
        console.log(unicode"✅ Ownership transferred successfully!");
        console.log("New Owner:", newOwner);
        
        vm.stopBroadcast();
        
        // Additional verification
        console.log("\n=== Verification ===");
        console.log(unicode"✅ Factory owner is now Gnosis Safe");
        console.log(unicode"✅ All admin functions now require multisig approval");
        console.log(unicode"✅ Enhanced security achieved");
    }
    
    /**
     * @notice Example of creating an escrow with Gnosis Safe as arbiter
     * @dev SECURITY WARNING: This function uses private keys for testing only!
     * In production, use wallet integration instead of private keys.
     * See: web3/examples/secure-wallet-integration.js
     */
    function createEscrowWithGnosisArbiter() external {
        // SECURITY WARNING: Private keys should only be used in testing environments
        // In production, users should connect their own wallets (MetaMask, etc.)
        // This is just for demonstration purposes
        
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        address gnosisArbiterAddress = vm.envAddress("GNOSIS_ARBITER_SAFE");
        uint256 buyerPrivateKey = vm.envUint("BUYER_PRIVATE_KEY");
        
        vm.startBroadcast(buyerPrivateKey);
        
        EscrowFactory factory = EscrowFactory(factoryAddress);
        
        // Create escrow parameters
        bytes32 jobId = keccak256(abi.encodePacked("job-", block.timestamp));
        address buyer = vm.addr(buyerPrivateKey);
        address vendor = vm.envAddress("VENDOR_ADDRESS");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        uint64 deadline = uint64(block.timestamp + 30 days);
        
        // Create escrow with Gnosis Safe as arbiter
        address escrow = factory.createEscrow(
            jobId,
            buyer,
            vendor,
            gnosisArbiterAddress, // Gnosis Safe as arbiter
            feeRecipient,
            100, // 1% total fee
            address(0), // Native BNB
            1 ether, // 1 BNB
            deadline,
            50, // 0.5% buyer fee
            50, // 0.5% vendor fee
            50, // 0.5% dispute fee
            25  // 0.25% reward rate
        );
        
        console.log(unicode"✅ Escrow created with Gnosis Safe arbiter:", escrow);
        console.log(unicode"⚠️  WARNING: This script uses private keys for testing only!");
        console.log(unicode"⚠️  In production, use wallet integration instead.");
        
        vm.stopBroadcast();
    }
}
