// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";

/// @notice DEPRECATED: This script is deprecated. Use DeployImplementation.s.sol and DeployFactory.s.sol instead.
/// @dev This old deployment method creates individual escrow contracts.
///      The new method uses a factory pattern with minimal proxies for gas efficiency.
contract DeployScript is Script {
    function run() external returns (Escrow) {
        // Load environment variables
        address buyer = vm.envAddress("BUYER_ADDRESS");
        address vendor = vm.envAddress("VENDOR_ADDRESS");
        address arbiter = vm.envAddress("ARBITER_ADDRESS");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT_ADDRESS");
        uint256 feeBps = vm.envUint("FEE_BPS");
        uint256 amount = vm.envUint("AMOUNT_WEI");

        console.log("Deploying Escrow with:");
        console.log("Buyer:", buyer);
        console.log("Vendor:", vendor);
        console.log("Arbiter:", arbiter);
        console.log("Fee Recipient:", feeRecipient);

        vm.startBroadcast();
        
        // Deploy and initialize
        Escrow escrow = new Escrow();
        escrow.initialize(Escrow.InitParams({
            buyer: buyer,
            seller: vendor,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: feeBps,
            paymentToken: address(0), // Native BNB
            amountWei: amount,
            deadline: uint64(block.timestamp + 30 days), // 30 day deadline
            buyerFeeBps: 50, // 0.5% buyer fee
            vendorFeeBps: 50, // 0.5% vendor fee
            disputeFeeBps: 50, // 0.5% dispute fee
            rewardRateBps: 25,  // 0.25% reward rate
            rewardDistributor: address(0),  // No reward distributor (deprecated script)
            rewardToken: address(0),  // No reward token (deprecated script)
            rewardRatePer1e18: 0            // No reward rate (deprecated script)
        }));
        
        console.log("Escrow deployed at:", address(escrow));
        
        vm.stopBroadcast();
        
        return escrow;
    }
}

