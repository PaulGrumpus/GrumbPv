// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {EscrowFactory} from "../src/EscrowFactory.sol";

/// @title DeployFactory
/// @notice Script to deploy the EscrowFactory contract
/// @dev Requires ESCROW_IMPLEMENTATION_ADDRESS to be set in environment
contract DeployFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address implementation = vm.envAddress("ESCROW_IMPLEMENTATION_ADDRESS");
        
        require(implementation != address(0), "ESCROW_IMPLEMENTATION_ADDRESS not set");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the factory
        EscrowFactory factory = new EscrowFactory(implementation);
        
        vm.stopBroadcast();
        
        console2.log("==============================================");
        console2.log("EscrowFactory deployed at:", address(factory));
        console2.log("Using implementation:", implementation);
        console2.log("Factory owner:", factory.owner());
        console2.log("==============================================");
        console2.log("");
        console2.log("Save this address for creating escrows:");
        console2.log("export FACTORY_ADDRESS=%s", address(factory));
    }
}

