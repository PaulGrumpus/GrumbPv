// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";

contract EscrowTest is Test {
    Escrow public escrow;
    
    address buyer = address(0x1);
    address vendor = address(0x2);
    address arbiter = address(0x3);
    uint64 deadline;

    function setUp() public {
        deadline = uint64(block.timestamp + 30 days);
        escrow = new Escrow(buyer, vendor, arbiter, deadline);
    }

    function test_Deployment() public view {
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertEq(info.buyer, buyer);
        assertEq(info.vendor, vendor);
        assertEq(info.arbiter, arbiter);
        assertEq(info.deadline, deadline);
        assertEq(uint(info.state), uint(Escrow.State.Unfunded));
        assertEq(info.cid, "");
        assertEq(info.contentHash, bytes32(0));
    }

    function test_Fund() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        escrow.fund{value: 1 ether}();
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertEq(info.amount, 1 ether);
        assertEq(uint(info.state), uint(Escrow.State.Funded));
    }

    function test_Deliver() public {
        // First fund the escrow
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        escrow.fund{value: 1 ether}();
        
        // Vendor delivers
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertEq(info.proposedCID, "QmTestCID123");
        assertEq(uint(info.state), uint(Escrow.State.Delivered));
        assertTrue(info.vendorApproved);
    }

    function test_ApproveAndWithdraw() public {
        // Fund
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        escrow.fund{value: 1 ether}();
        
        // Deliver
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Approve
        vm.prank(buyer);
        escrow.approve("QmTestCID123");
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertTrue(info.buyerApproved);
        assertEq(uint(info.state), uint(Escrow.State.Releasable));
        
        // Withdraw
        uint256 vendorBalanceBefore = vendor.balance;
        vm.prank(vendor);
        escrow.withdraw();
        
        assertEq(vendor.balance, vendorBalanceBefore + 1 ether);
        
        info = escrow.getAllInfo();
        assertEq(uint(info.state), uint(Escrow.State.Paid));
    }

    function test_Cancel() public {
        // Fund
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        escrow.fund{value: 1 ether}();
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertEq(info.amount, 1 ether);
        assertEq(uint(info.state), uint(Escrow.State.Funded));
        
        // Buyer cancels immediately
        uint256 buyerBalanceBefore = buyer.balance;
        vm.prank(buyer);
        escrow.cancel();
        
        // Check buyer received refund
        assertEq(buyer.balance, buyerBalanceBefore + 1 ether);
        
        // Check escrow state
        info = escrow.getAllInfo();
        assertEq(info.amount, 0);
        assertEq(uint(info.state), uint(Escrow.State.Refunded));
    }

    function test_CannotCancelAfterDelivery() public {
        // Fund
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        escrow.fund{value: 1 ether}();
        
        // Vendor delivers
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        // Buyer tries to cancel - should revert
        vm.prank(buyer);
        vm.expectRevert(Escrow.BadState.selector);
        escrow.cancel();
    }

    function test_OnlyBuyerCanCancel() public {
        // Fund
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        escrow.fund{value: 1 ether}();
        
        // Vendor tries to cancel - should revert
        vm.prank(vendor);
        vm.expectRevert(Escrow.OnlyBuyer.selector);
        escrow.cancel();
        
        // Random address tries to cancel - should revert
        vm.prank(address(0x999));
        vm.expectRevert(Escrow.OnlyBuyer.selector);
        escrow.cancel();
    }
}
