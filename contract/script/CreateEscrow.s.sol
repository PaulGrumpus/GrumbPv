// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

/// @title CreateEscrow
/// @notice Script to create a new escrow instance via the factory
/// @dev Demonstrates both non-deterministic and deterministic escrow creation
interface IEscrowFactory {
    function createEscrow(
        bytes32 jobId,
        address buyer,
        address seller,
        address arbiter,
        address feeRecipient,
        uint256 feeBps,
        address paymentToken,
        uint256 amountWei
    ) external returns (address escrow);

    function createEscrowDeterministic(
        bytes32 jobId,
        address buyer,
        address seller,
        address arbiter,
        address feeRecipient,
        uint256 feeBps,
        address paymentToken,
        uint256 amountWei,
        bytes32 salt
    ) external returns (address escrow);

    function predictEscrow(bytes32 salt) external view returns (address);
}

contract CreateEscrow is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        
        require(factoryAddress != address(0), "FACTORY_ADDRESS not set");
        
        // Example job parameters - replace with actual values or load from .env
        bytes32 jobId = keccak256(abi.encodePacked("JOB-", block.timestamp));
        address buyer = vm.envOr("BUYER", msg.sender);
        address seller = vm.envOr("SELLER", address(0x1234567890123456789012345678901234567890));
        address arbiter = vm.envOr("ARBITER", address(0)); // No arbiter
        address feeRecipient = vm.envOr("FEE_RECIPIENT", msg.sender);
        uint256 feeBps = 100; // 1%
        address paymentToken = address(0); // Native BNB
        uint256 amountWei = 1 ether; // 1 BNB project amount
        
        IEscrowFactory factory = IEscrowFactory(factoryAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Option 1: Non-deterministic deployment (simpler, unpredictable address)
        // address escrow = factory.createEscrow(
        //     jobId,
        //     buyer,
        //     seller,
        //     arbiter,
        //     feeRecipient,
        //     feeBps,
        //     paymentToken,
        //     amountWei
        // );
        
        // Option 2: Deterministic deployment (predictable address using CREATE2)
        bytes32 salt = keccak256(abi.encodePacked(jobId, buyer, seller));
        address predicted = factory.predictEscrow(salt);
        
        address escrow = factory.createEscrowDeterministic(
            jobId,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            feeBps,
            paymentToken,
            amountWei,
            salt
        );
        
        vm.stopBroadcast();
        
        console2.log("==============================================");
        console2.log("Escrow Created!");
        console2.log("==============================================");
        console2.log("Job ID:", vm.toString(jobId));
        console2.log("Escrow Address:", escrow);
        console2.log("Predicted Address:", predicted);
        console2.log("Addresses Match:", escrow == predicted);
        console2.log("----------------------------------------------");
        console2.log("Buyer:", buyer);
        console2.log("Seller:", seller);
        console2.log("Arbiter:", arbiter);
        console2.log("Fee Recipient:", feeRecipient);
        console2.log("Fee BPS:", feeBps);
        console2.log("Payment Token:", paymentToken);
        console2.log("Amount (Wei):", amountWei);
        console2.log("==============================================");
        
        require(escrow == predicted, "Address mismatch!");
    }
}

