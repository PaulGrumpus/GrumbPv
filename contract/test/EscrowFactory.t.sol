// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";
import {EscrowFactory} from "../src/EscrowFactory.sol";

/// @title EscrowFactoryTest
/// @notice Comprehensive tests for the EscrowFactory and cloned Escrow contracts
contract EscrowFactoryTest is Test {
    Escrow public implementation;
    EscrowFactory public factory;
    
    address public deployer;
    address public buyer;
    address public seller;
    address public arbiter;
    address public feeRecipient;
    
    uint256 constant FEE_BPS = 100; // 1%
    uint256 constant PROJECT_AMOUNT = 1 ether;
    
    event EscrowCreated(
        bytes32 indexed jobId,
        address indexed escrow,
        address indexed buyer,
        address seller,
        address arbiter,
        address feeRecipient,
        uint256 feeBps,
        address paymentToken,
        uint256 amountWei,
        bool deterministic
    );
    
    function setUp() public {
        deployer = address(this);
        buyer = makeAddr("buyer");
        seller = makeAddr("seller");
        arbiter = makeAddr("arbiter");
        feeRecipient = makeAddr("feeRecipient");
        
        // Deploy implementation
        implementation = new Escrow();
        
        // Deploy factory
        factory = new EscrowFactory(address(implementation));
        
        // Fund test accounts
        vm.deal(buyer, 100 ether);
        vm.deal(seller, 100 ether);
    }
    
    /// @notice Test that implementation and factory deployed correctly
    function test_DeploymentSuccess() public {
        assertEq(factory.implementation(), address(implementation));
        assertEq(factory.owner(), deployer);
    }
    
    /// @notice Test creating a non-deterministic escrow
    function test_CreateEscrow() public {
        bytes32 jobId = keccak256("JOB-001");
        
        // Create escrow
        address escrow = factory.createEscrow(
            jobId,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            FEE_BPS,
            address(0), // Native BNB
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days), // 30 day deadline
            50, // 0.5% buyer fee
            50, // 0.5% vendor fee
            50, // 0.5% dispute fee
            25  // 0.25% reward rate
        );
        
        assertTrue(escrow != address(0), "Escrow should be deployed");
        assertTrue(escrow != address(implementation), "Escrow should be a clone");
        
        // Verify initialization
        Escrow escrowContract = Escrow(payable(escrow));
        (address b, address v, address a, address f) = escrowContract.participants();
        assertEq(b, buyer, "Buyer mismatch");
        assertEq(v, seller, "Seller mismatch");
        assertEq(a, arbiter, "Arbiter mismatch");
        assertEq(f, feeRecipient, "Fee recipient mismatch");
    }
    
    /// @notice Test creating two different escrows have different addresses
    function test_CreateTwoEscrows_DifferentAddresses() public {
        bytes32 jobId1 = keccak256("JOB-001");
        bytes32 jobId2 = keccak256("JOB-002");
        
        address escrow1 = factory.createEscrow(
            jobId1,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            FEE_BPS,
            address(0),
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days),
            50, 50, 50, 25
        );
        
        address escrow2 = factory.createEscrow(
            jobId2,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            FEE_BPS,
            address(0),
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days),
            50, 50, 50, 25
        );
        
        assertTrue(escrow1 != escrow2, "Escrows should have different addresses");
    }
    
    /// @notice Test deterministic escrow creation
    function test_CreateEscrowDeterministic() public {
        bytes32 jobId = keccak256("JOB-DETERMINISTIC");
        bytes32 salt = keccak256(abi.encodePacked(jobId, buyer, seller));
        
        // Predict address before deployment
        address predicted = factory.predictEscrow(salt);
        
        // Create escrow
        address escrow = factory.createEscrowDeterministic(
            jobId,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            FEE_BPS,
            address(0),
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days),
            50, 50, 50, 25,
            salt
        );
        
        assertEq(escrow, predicted, "Escrow address should match prediction");
        
        // Verify initialization
        Escrow escrowContract = Escrow(payable(escrow));
        (address b, address v, address a, address f) = escrowContract.participants();
        assertEq(b, buyer, "Buyer mismatch");
        assertEq(v, seller, "Seller mismatch");
        assertEq(a, arbiter, "Arbiter mismatch");
        assertEq(f, feeRecipient, "Fee recipient mismatch");
    }
    
    /// @notice Test that same salt produces same address prediction
    function test_PredictEscrow_Consistent() public {
        bytes32 salt = keccak256("CONSISTENT-SALT");
        
        address predicted1 = factory.predictEscrow(salt);
        address predicted2 = factory.predictEscrow(salt);
        
        assertEq(predicted1, predicted2, "Predictions should be consistent");
    }
    
    /// @notice Test that escrow cannot be initialized twice
    function test_CannotInitializeTwice() public {
        bytes32 jobId = keccak256("JOB-DOUBLE-INIT");
        
        address escrow = factory.createEscrow(
            jobId,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            FEE_BPS,
            address(0),
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days),
            50, 50, 50, 25
        );
        
        // Try to initialize again
        vm.expectRevert(Escrow.AlreadyInitialized.selector);
        Escrow(payable(escrow)).initialize(
            buyer,
            seller,
            arbiter,
            feeRecipient,
            FEE_BPS,
            address(0),
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days),
            50, 50, 50, 25,
            address(0)  // No reward distributor
        );
    }
    
    /// @notice Test full lifecycle: fund -> deliver -> approve -> withdraw
    function test_FullLifecycle() public {
        bytes32 jobId = keccak256("JOB-LIFECYCLE");
        
        // Create escrow
        address escrowAddr = factory.createEscrow(
            jobId,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            FEE_BPS,
            address(0),
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days),
            50, 50, 50, 25
        );
        
        Escrow escrow = Escrow(payable(escrowAddr));
        
        // 1. Buyer funds the escrow
        uint256 buyerFeeAmount = (PROJECT_AMOUNT * 50) / 10000; // 0.5%
        uint256 totalFundAmount = PROJECT_AMOUNT + buyerFeeAmount;
        
        vm.prank(buyer);
        escrow.fund{value: totalFundAmount}();
        
        assertEq(escrow.getState(), uint256(Escrow.State.Funded), "Should be in Funded state");
        
        // 2. Seller delivers
        string memory cid = "QmTest123";
        bytes32 contentHash = keccak256("content");
        
        vm.prank(seller);
        escrow.deliver(cid, contentHash);
        
        assertEq(escrow.getState(), uint256(Escrow.State.Delivered), "Should be in Delivered state");
        
        // 3. Buyer approves
        vm.prank(buyer);
        escrow.approve(cid);
        
        assertEq(escrow.getState(), uint256(Escrow.State.Releasable), "Should be in Releasable state");
        
        // 4. Seller withdraws
        uint256 sellerBalanceBefore = seller.balance;
        uint256 feeRecipientBalanceBefore = feeRecipient.balance;
        
        vm.prank(seller);
        escrow.withdraw();
        
        assertEq(escrow.getState(), uint256(Escrow.State.Paid), "Should be in Paid state");
        
        // Verify payments
        uint256 vendorFee = (PROJECT_AMOUNT * 50) / 10000; // 0.5%
        uint256 expectedSellerAmount = PROJECT_AMOUNT - vendorFee;
        uint256 expectedFeeTotal = buyerFeeAmount + vendorFee; // 1% total
        
        assertEq(seller.balance - sellerBalanceBefore, expectedSellerAmount, "Seller should receive correct amount");
        assertEq(feeRecipient.balance - feeRecipientBalanceBefore, expectedFeeTotal, "Fee recipient should receive 1%");
    }
    
    /// @notice Test buyer can cancel before delivery
    function test_BuyerCancel() public {
        bytes32 jobId = keccak256("JOB-CANCEL");
        
        address escrowAddr = factory.createEscrow(
            jobId,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            FEE_BPS,
            address(0),
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days),
            50, 50, 50, 25
        );
        
        Escrow escrow = Escrow(payable(escrowAddr));
        
        // Buyer funds
        uint256 buyerFeeAmount = (PROJECT_AMOUNT * 50) / 10000;
        uint256 totalFundAmount = PROJECT_AMOUNT + buyerFeeAmount;
        
        vm.prank(buyer);
        escrow.fund{value: totalFundAmount}();
        
        // Buyer cancels
        uint256 buyerBalanceBefore = buyer.balance;
        
        vm.prank(buyer);
        escrow.cancel();
        
        assertEq(escrow.getState(), uint256(Escrow.State.Refunded), "Should be in Refunded state");
        assertEq(buyer.balance - buyerBalanceBefore, totalFundAmount, "Buyer should get full refund");
    }
    
    /// @notice Test dispute resolution to vendor
    function test_DisputeResolveToVendor() public {
        bytes32 jobId = keccak256("JOB-DISPUTE-VENDOR");
        
        address escrowAddr = factory.createEscrow(
            jobId,
            buyer,
            seller,
            arbiter,
            feeRecipient,
            FEE_BPS,
            address(0),
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days),
            50, 50, 50, 25
        );
        
        Escrow escrow = Escrow(payable(escrowAddr));
        
        // Buyer funds
        uint256 buyerFeeAmount = (PROJECT_AMOUNT * 50) / 10000;
        uint256 totalFundAmount = PROJECT_AMOUNT + buyerFeeAmount;
        
        vm.prank(buyer);
        escrow.fund{value: totalFundAmount}();
        
        // Seller delivers
        vm.prank(seller);
        escrow.deliver("QmDispute", keccak256("disputed"));
        
        // Buyer initiates dispute
        vm.prank(buyer);
        escrow.initiateDispute();
        
        assertEq(escrow.getState(), uint256(Escrow.State.Disputed), "Should be in Disputed state");
        
        // Seller pays dispute fee
        uint256 disputeFee = (PROJECT_AMOUNT * 50) / 10000; // 0.5%
        vm.prank(seller);
        escrow.payDisputeFee{value: disputeFee}();
        
        // Arbiter resolves to vendor
        uint256 sellerBalanceBefore = seller.balance;
        uint256 arbiterBalanceBefore = arbiter.balance;
        uint256 feeRecipientBalanceBefore = feeRecipient.balance;
        
        vm.prank(arbiter);
        escrow.resolveToVendor();
        
        // Verify state
        assertEq(escrow.getState(), uint256(Escrow.State.Paid), "Should be in Paid state");
        
        // Verify payments
        uint256 expectedSellerAmount = PROJECT_AMOUNT + disputeFee; // Gets project + their fee back
        uint256 expectedArbiterShare = disputeFee / 2;
        uint256 expectedFeeRecipientShare = disputeFee - expectedArbiterShare;
        
        assertEq(seller.balance - sellerBalanceBefore, expectedSellerAmount, "Seller should get project + fee");
        assertEq(arbiter.balance - arbiterBalanceBefore, expectedArbiterShare, "Arbiter gets 50% of loser fee");
        assertEq(feeRecipient.balance - feeRecipientBalanceBefore, expectedFeeRecipientShare, "FeeRecipient gets 50% of loser fee");
    }
    
    /// @notice Test factory ownership transfer
    function test_TransferFactoryOwnership() public {
        address newOwner = makeAddr("newOwner");
        
        factory.transferOwnership(newOwner);
        
        assertEq(factory.owner(), newOwner, "Owner should be updated");
    }
    
    /// @notice Test that non-owner cannot transfer ownership
    function test_OnlyOwnerCanTransfer() public {
        address attacker = makeAddr("attacker");
        address newOwner = makeAddr("newOwner");
        
        vm.prank(attacker);
        vm.expectRevert(EscrowFactory.NotOwner.selector);
        factory.transferOwnership(newOwner);
    }
    
    /// @notice Test creating escrow without arbiter
    function test_CreateEscrowNoArbiter() public {
        bytes32 jobId = keccak256("JOB-NO-ARBITER");
        
        address escrowAddr = factory.createEscrow(
            jobId,
            buyer,
            seller,
            address(0), // No arbiter
            feeRecipient,
            FEE_BPS,
            address(0),
            PROJECT_AMOUNT,
            uint64(block.timestamp + 30 days),
            50, 50, 50, 25
        );
        
        Escrow escrow = Escrow(payable(escrowAddr));
        (,, address a,) = escrow.participants();
        
        assertEq(a, address(0), "Arbiter should be zero address");
    }
    
    /// @notice Fuzz test: create multiple escrows with random parameters
    function testFuzz_CreateMultipleEscrows(uint8 count) public {
        vm.assume(count > 0 && count <= 10);
        
        address[] memory escrows = new address[](count);
        
        for (uint8 i = 0; i < count; i++) {
            bytes32 jobId = keccak256(abi.encodePacked("JOB-", i));
            
            escrows[i] = factory.createEscrow(
                jobId,
                buyer,
                seller,
                arbiter,
                feeRecipient,
                FEE_BPS,
                address(0),
                PROJECT_AMOUNT,
                uint64(block.timestamp + 30 days),
                50, 50, 50, 25
            );
            
            assertTrue(escrows[i] != address(0), "Escrow should be deployed");
        }
        
        // Ensure all escrows have unique addresses
        for (uint8 i = 0; i < count; i++) {
            for (uint8 j = i + 1; j < count; j++) {
                assertTrue(escrows[i] != escrows[j], "Escrows should have unique addresses");
            }
        }
    }
}

