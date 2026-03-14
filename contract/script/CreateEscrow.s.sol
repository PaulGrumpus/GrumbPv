// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {EscrowFactory} from "../src/EscrowFactory.sol";

/// @title CreateEscrow
/// @notice Script to create a new escrow instance via the factory
/// @dev Supports BNB (paymentToken = 0), USDT, USDC or any BEP-20 via PAYMENT_TOKEN env.
///      Set PAYMENT_TOKEN=0 or unset for BNB; set to token address for BEP-20.
///      For BEP-20, AMOUNT_WEI should be in token decimals (e.g. 100e6 for 100 USDT).
contract CreateEscrow is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");

        require(factoryAddress != address(0), "FACTORY_ADDRESS not set");

        bytes32 jobId = keccak256(abi.encodePacked("JOB-", block.timestamp));
        address buyer = vm.envOr("BUYER", msg.sender);
        address seller = vm.envOr("SELLER", address(0x1234567890123456789012345678901234567890));
        address arbiter = vm.envOr("ARBITER", address(0));
        address feeRecipient = vm.envOr("FEE_RECIPIENT", msg.sender);
        uint256 feeBps = vm.envOr("FEE_BPS", uint256(100));
        // address(0) = native BNB; or set USDT/USDC BSC address for BEP-20
        address paymentToken = vm.envOr("PAYMENT_TOKEN", address(0));
        // For BNB: amount in wei (e.g. 1e18). For USDT/USDC: amount in token decimals (e.g. 100e6)
        uint256 amountWei = vm.envOr("AMOUNT_WEI", uint256(1 ether));
        uint64 deadline = uint64(vm.envOr("DEADLINE", block.timestamp + 30 days));
        uint256 buyerFeeBps = vm.envOr("BUYER_FEE_BPS", uint256(50));
        uint256 vendorFeeBps = vm.envOr("VENDOR_FEE_BPS", uint256(50));
        uint256 disputeFeeBps = vm.envOr("DISPUTE_FEE_BPS", uint256(50));
        uint256 rewardRateBps = vm.envOr("REWARD_RATE_BPS", uint256(25));

        EscrowFactory factory = EscrowFactory(factoryAddress);

        vm.startBroadcast(deployerPrivateKey);

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
            deadline,
            buyerFeeBps,
            vendorFeeBps,
            disputeFeeBps,
            rewardRateBps,
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
        console2.log("Payment Token (0 = BNB):", paymentToken);
        console2.log("Amount (Wei/Token units):", amountWei);
        console2.log("Deadline:", deadline);
        console2.log("==============================================");

        require(escrow == predicted, "Address mismatch!");
    }
}
