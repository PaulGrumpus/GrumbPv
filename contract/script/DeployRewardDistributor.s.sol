// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {RewardDistributor} from "../src/RewardDistributor.sol";
import {console} from "forge-std/console.sol";

/**
 * @notice Deploy RewardDistributor for centralized reward management
 * @dev Usage: forge script script/DeployRewardDistributor.s.sol:DeployRewardDistributor --rpc-url $RPC_URL --broadcast
 */
contract DeployRewardDistributor is Script {
    function run() external {
        // Load from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        address rewardToken = vm.envAddress("GRMPS_TOKEN_ADDRESS"); // GRMPS token
        
        // Owner defaults to deployer (can be overridden for testing)
        address owner = vm.envOr("REWARD_DISTRIBUTOR_OWNER", deployer);
        
        // Reward source defaults to owner (who holds GRMPS)
        address rewardSource = vm.envOr("REWARD_SOURCE_ADDRESS", owner);
        
        console.log("Deploying RewardDistributor...");
        console.log("Deployer:", deployer);
        console.log("Owner:", owner);
        console.log("Reward Token (GRMPS):", rewardToken);
        console.log("Reward Source:", rewardSource);
        
        vm.startBroadcast(deployerPrivateKey);
        
        RewardDistributor distributor = new RewardDistributor(
            owner,
            rewardToken,
            rewardSource
        );
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Successful ===");
        console.log("RewardDistributor:", address(distributor));
        console.log("\nNext steps:");
        console.log("1. Reward source must approve distributor:");
        console.log("   grmpsToken.approve(", address(distributor), ", largeAmount)");
        console.log("2. Owner must authorize escrows or factory:");
        console.log("   distributor.setAuthorizedCaller(escrowAddress, true)");
        console.log("   OR: distributor.setAuthorizedCaller(factoryAddress, true)");
        console.log("3. Escrows must set distributor address:");
        console.log("   escrow.setRewardDistributor(", address(distributor), ")");
        console.log("\n Save this address in your .env:");
        console.log("REWARD_DISTRIBUTOR_ADDRESS=", address(distributor));
    }
}

