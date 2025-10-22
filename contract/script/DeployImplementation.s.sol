// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";

/// @title DeployImplementation
/// @notice Script to deploy the Escrow implementation contract
/// @dev This implementation will be cloned by the factory
contract DeployImplementation is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the implementation contract
        Escrow implementation = new Escrow();
        
        vm.stopBroadcast();
        
        console2.log("==============================================");
        console2.log("Escrow Implementation deployed at:", address(implementation));
        console2.log("==============================================");
        console2.log("");
        console2.log("Save this address and use it to deploy the factory:");
        console2.log("export ESCROW_IMPLEMENTATION_ADDRESS=%s", address(implementation));
    }
}

