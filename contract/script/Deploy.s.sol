// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";

contract DeployScript is Script {
    function run() external returns (Escrow) {
        // Load environment variables
        address buyer = vm.envAddress("BUYER_ADDRESS");
        address vendor = vm.envAddress("VENDOR_ADDRESS");
        address arbiter = vm.envAddress("ARBITER_ADDRESS");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT_ADDRESS");
        uint64 deadline = uint64(vm.envUint("DEADLINE_TIMESTAMP"));

        console.log("Deploying Escrow with:");
        console.log("Buyer:", buyer);
        console.log("Vendor:", vendor);
        console.log("Arbiter:", arbiter);
        console.log("Fee Recipient:", feeRecipient);
        console.log("Deadline:", deadline);

        vm.startBroadcast();
        
        Escrow escrow = new Escrow(buyer, vendor, arbiter, feeRecipient, deadline);
        
        console.log("Escrow deployed at:", address(escrow));
        
        vm.stopBroadcast();
        
        return escrow;
    }
}

