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
        assertEq(escrow.buyer(), buyer);
        assertEq(escrow.vendor(), vendor);
        assertEq(escrow.arbiter(), arbiter);
        assertEq(escrow.deadline(), deadline);
        assertEq(uint(escrow.state()), uint(Escrow.State.Unfunded));
    }

    function test_Fund() public {
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        escrow.fund{value: 1 ether}();
        
        assertEq(escrow.amount(), 1 ether);
        assertEq(uint(escrow.state()), uint(Escrow.State.Funded));
    }

    function test_Deliver() public {
        // First fund the escrow
        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        escrow.fund{value: 1 ether}();
        
        // Vendor delivers
        vm.prank(vendor);
        escrow.deliver("QmTestCID123", bytes32(0));
        
        assertEq(escrow.proposedCID(), "QmTestCID123");
        assertEq(uint(escrow.state()), uint(Escrow.State.Delivered));
        assertTrue(escrow.vendorApproved());
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
        
        assertTrue(escrow.buyerApproved());
        assertEq(uint(escrow.state()), uint(Escrow.State.Releasable));
        
        // Withdraw
        uint256 vendorBalanceBefore = vendor.balance;
        vm.prank(vendor);
        escrow.withdraw();
        
        assertEq(vendor.balance, vendorBalanceBefore + 1 ether);
        assertEq(uint(escrow.state()), uint(Escrow.State.Paid));
    }
}
