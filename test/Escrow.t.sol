// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";

contract EscrowTest is Test {
    Escrow public escrow;
    
    address buyer = address(0x1);
    address vendor = address(0x2);
    address arbiter = address(0x3);
    address feeRecipient = address(0x4);
    uint64 deadline;

    function setUp() public {
        deadline = uint64(block.timestamp + 30 days);
        escrow = new Escrow(buyer, vendor, arbiter, feeRecipient, deadline);
    }

    function test_Deployment() public view {
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertEq(info.buyer, buyer);
        assertEq(info.vendor, vendor);
        assertEq(info.arbiter, arbiter);
        assertEq(info.feeRecipient, feeRecipient);
        assertEq(info.deadline, deadline);
        assertEq(uint(info.state), uint(Escrow.State.Unfunded));
    }

    function test_Fund() public {
        // Buyer must send 1 ETH + 0.5% fee = 1.005 ETH
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertEq(info.amount, 1 ether); // Project amount
        assertEq(info.buyerFeeReserve, 0.005 ether); // 0.5% fee
        assertEq(uint(info.state), uint(Escrow.State.Funded));
    }

    function test_NormalCompletionWithFees() public {
        // Fund
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        // Deliver
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Approve
        vm.prank(buyer);
        escrow.approve("QmTestCID123");
        
        // Withdraw - vendor gets 99.5%, feeRecipient gets 1%
        uint256 vendorBalanceBefore = vendor.balance;
        uint256 feeRecipientBalanceBefore = feeRecipient.balance;
        
        vm.prank(vendor);
        escrow.withdraw();
        
        // Vendor gets 1 ETH - 0.5% = 0.995 ETH
        assertEq(vendor.balance, vendorBalanceBefore + 0.995 ether);
        // FeeRecipient gets 0.5% (buyer) + 0.5% (vendor) = 1% = 0.01 ETH
        assertEq(feeRecipient.balance, feeRecipientBalanceBefore + 0.01 ether);
    }

    function test_Cancel() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        // Buyer cancels and gets everything back
        uint256 buyerBalanceBefore = buyer.balance;
        vm.prank(buyer);
        escrow.cancel();
        
        assertEq(buyer.balance, buyerBalanceBefore + 1.005 ether);
    }

    function test_DisputeBuyerInitiates() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Buyer initiates dispute (uses reserved fee)
        vm.prank(buyer);
        escrow.initiateDispute();
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertEq(uint(info.state), uint(Escrow.State.Disputed));
        assertTrue(info.buyerPaidDisputeFee);
        assertFalse(info.vendorPaidDisputeFee);
        assertEq(info.disputeInitiator, buyer);
        // Vendor gets 48 hours
        assertEq(info.disputeFeeDeadline, uint64(block.timestamp + 48 hours));
    }

    function test_DisputeVendorInitiates() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Vendor initiates dispute (must pay 0.5% of 1 ETH = 0.005 ETH)
        vm.deal(vendor, 0.005 ether);
        vm.prank(vendor);
        escrow.initiateDispute{value: 0.005 ether}();
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertEq(uint(info.state), uint(Escrow.State.Disputed));
        assertFalse(info.buyerPaidDisputeFee);
        assertTrue(info.vendorPaidDisputeFee);
        assertEq(info.disputeInitiator, vendor);
        // Buyer gets 72 hours (longer to protect buyer)
        assertEq(info.disputeFeeDeadline, uint64(block.timestamp + 72 hours));
    }

    function test_DisputeCounterpartyPays() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Buyer initiates
        vm.prank(buyer);
        escrow.initiateDispute();
        
        // Vendor pays their fee
        vm.deal(vendor, 0.005 ether);
        vm.prank(vendor);
        escrow.payDisputeFee{value: 0.005 ether}();
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertTrue(info.buyerPaidDisputeFee);
        assertTrue(info.vendorPaidDisputeFee);
    }

    function test_DisputeResolveToVendor_BothPaid() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Buyer initiates dispute
        vm.prank(buyer);
        escrow.initiateDispute();
        
        // Vendor pays fee
        vm.deal(vendor, 0.005 ether);
        vm.prank(vendor);
        escrow.payDisputeFee{value: 0.005 ether}();
        
        // Arbiter resolves to vendor
        uint256 vendorBalanceBefore = vendor.balance;
        uint256 arbiterBalanceBefore = arbiter.balance;
        uint256 feeRecipientBalanceBefore = feeRecipient.balance;
        
        vm.prank(arbiter);
        escrow.resolveToVendor();
        
        // Vendor (winner) gets 1 ETH + 0.005 ETH (dispute fee refund) = 1.005 ETH
        assertEq(vendor.balance, vendorBalanceBefore + 1.005 ether);
        // Arbiter gets 50% of loser's fee = 0.0025 ETH
        assertEq(arbiter.balance, arbiterBalanceBefore + 0.0025 ether);
        // FeeRecipient gets 50% of loser's fee = 0.0025 ETH
        assertEq(feeRecipient.balance, feeRecipientBalanceBefore + 0.0025 ether);
    }

    function test_DisputeResolveToBuyer_BothPaid() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Buyer initiates dispute
        vm.prank(buyer);
        escrow.initiateDispute();
        
        // Vendor pays fee
        vm.deal(vendor, 0.005 ether);
        vm.prank(vendor);
        escrow.payDisputeFee{value: 0.005 ether}();
        
        // Arbiter resolves to buyer
        uint256 buyerBalanceBefore = buyer.balance;
        uint256 arbiterBalanceBefore = arbiter.balance;
        uint256 feeRecipientBalanceBefore = feeRecipient.balance;
        
        vm.prank(arbiter);
        escrow.resolveToBuyer();
        
        // Buyer (winner) gets 1 ETH + 0.005 ETH (reserved fee refund) = 1.005 ETH
        assertEq(buyer.balance, buyerBalanceBefore + 1.005 ether);
        // Arbiter gets 50% of loser's fee = 0.0025 ETH
        assertEq(arbiter.balance, arbiterBalanceBefore + 0.0025 ether);
        // FeeRecipient gets 50% of loser's fee = 0.0025 ETH
        assertEq(feeRecipient.balance, feeRecipientBalanceBefore + 0.0025 ether);
    }

    function test_DisputeDefaultJudgment_BuyerInitiated() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Buyer initiates dispute
        vm.prank(buyer);
        escrow.initiateDispute();
        
        // Fast forward past deadline (48 hours)
        vm.warp(block.timestamp + 48 hours + 1);
        
        // Anyone can trigger default judgment
        uint256 buyerBalanceBefore = buyer.balance;
        escrow.resolveDisputeByDefault();
        
        // Buyer wins by default, gets 1 ETH + 0.005 ETH (full fee refund) = 1.005 ETH
        assertEq(buyer.balance, buyerBalanceBefore + 1.005 ether);
    }

    function test_DisputeDefaultJudgment_VendorInitiated() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Vendor initiates dispute
        vm.deal(vendor, 0.005 ether);
        vm.prank(vendor);
        escrow.initiateDispute{value: 0.005 ether}();
        
        // Fast forward past deadline (72 hours for buyer)
        vm.warp(block.timestamp + 72 hours + 1);
        
        // Anyone can trigger default judgment
        uint256 vendorBalanceBefore = vendor.balance;
        escrow.resolveDisputeByDefault();
        
        // Vendor wins by default, gets 1 ETH + 0.005 ETH (fee refund) = 1.005 ETH
        assertEq(vendor.balance, vendorBalanceBefore + 1.005 ether);
    }

    function test_CannotInitiateDisputeWithoutPayment() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Vendor tries to initiate without paying enough
        vm.deal(vendor, 0.001 ether);
        vm.prank(vendor);
        vm.expectRevert(Escrow.InsufficientDisputeFee.selector);
        escrow.initiateDispute{value: 0.001 ether}();
    }

    function test_RefundAfterDeadline() public {
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();
        
        // Fast forward past deadline
        vm.warp(deadline + 1);
        
        // Buyer gets full refund
        uint256 buyerBalanceBefore = buyer.balance;
        vm.prank(buyer);
        escrow.refundAfterDeadline();
        
        assertEq(buyer.balance, buyerBalanceBefore + 1.005 ether);
    }
}
