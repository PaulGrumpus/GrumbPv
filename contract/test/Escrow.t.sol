// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract EscrowTest is Test {
    Escrow public escrow;
    
    address buyer = address(0x1);
    address vendor = address(0x2);
    address arbiter = address(0x3);
    address feeRecipient = address(0x4);
    uint64 deadline;

    function setUp() public {
        deadline = uint64(block.timestamp + 30 days);
        // Deploy implementation and initialize with parameters
        escrow = new Escrow();
        escrow.initialize(Escrow.InitParams({
            buyer: buyer,
            seller: vendor,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: 100, // 1% total fee
            paymentToken: address(0), // Native BNB
            amountWei: 1 ether, // Amount
            deadline: deadline, // Custom deadline
            buyerFeeBps: 50, // 0.5% buyer fee
            vendorFeeBps: 50, // 0.5% vendor fee
            disputeFeeBps: 50, // 0.5% dispute fee
            rewardRateBps: 25,  // 0.25% reward rate
            rewardDistributor: address(0),  // No reward distributor in tests
            rewardToken: address(0),  // No reward token (set later in tests)
            rewardRatePer1e18: 0            // No reward rate (set later in tests)
        }));
    }

    function test_Deployment() public view {
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        assertEq(info.buyer, buyer);
        assertEq(info.vendor, vendor);
        assertEq(info.arbiter, arbiter);
        assertEq(info.feeRecipient, feeRecipient);
        assertEq(info.paymentToken, address(0));
        assertEq(info.deadline, deadline);
        assertEq(uint(info.state), uint(Escrow.State.Unfunded));
    }

    /// @notice BEP-20 escrow: paymentToken is stored in EscrowInfo
    function test_Deployment_BEP20_StoresPaymentToken() public {
        ERC20Mock usdt = new ERC20Mock();
        Escrow escrowBep20 = new Escrow();
        escrowBep20.initialize(Escrow.InitParams({
            buyer: buyer,
            seller: vendor,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: 100,
            paymentToken: address(usdt),
            amountWei: 1000e18,
            deadline: deadline,
            buyerFeeBps: 50,
            vendorFeeBps: 50,
            disputeFeeBps: 50,
            rewardRateBps: 25,
            rewardDistributor: address(0),
            rewardToken: address(0),
            rewardRatePer1e18: 0
        }));
        Escrow.EscrowInfo memory info = escrowBep20.getAllInfo();
        assertEq(info.paymentToken, address(usdt));
        assertEq(info.amount, 1000e18);
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

    function test_RewardPaidOnNormalWithdraw() public {
        // Deploy mock GRMPS token and fund escrow with rewards
        ERC20Mock grmps = new ERC20Mock();

        // Configure reward: 1 wei native => 1 wei GRMPS
        vm.prank(arbiter);
        escrow.setRewardToken(address(grmps));
        vm.prank(arbiter);
        escrow.setRewardRatePer1e18(1e18);

        // Fund
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();

        // Deliver and approve
        vm.prank(vendor);
        escrow.deliver("QmCID", bytes32(0));
        vm.prank(buyer);
        escrow.approve("QmCID");

        // Compute expected rewards: 0.25% per side of projectAmount (1 ether)
        uint256 expectedPerSide = (1 ether * 25) / 10000; // 0.0025 ether units => 0.0025 GRMPS
        uint256 totalRewards = expectedPerSide * 2;

        // Mint GRMPS to arbiter (owner) and approve escrow to spend
        grmps.mint(arbiter, totalRewards);
        vm.prank(arbiter);
        grmps.approve(address(escrow), totalRewards);

        // Record balances
        uint256 buyerGRBefore = grmps.balanceOf(buyer);
        uint256 vendorGRBefore = grmps.balanceOf(vendor);

        // Withdraw triggers rewards
        vm.prank(vendor);
        escrow.withdraw();

        // Check rewards distributed
        assertEq(grmps.balanceOf(buyer), buyerGRBefore + expectedPerSide);
        assertEq(grmps.balanceOf(vendor), vendorGRBefore + expectedPerSide);
    }

    function test_NoRewardOnDisputePaths() public {
        // Deploy mock GRMPS token and fund escrow with rewards
        ERC20Mock grmps = new ERC20Mock();
        vm.prank(arbiter);
        escrow.setRewardToken(address(grmps));
        vm.prank(arbiter);
        escrow.setRewardRatePer1e18(1e18);

        // Fund
        vm.deal(buyer, 1.005 ether);
        vm.prank(buyer);
        escrow.fund{value: 1.005 ether}();

        // Deliver
        vm.prank(vendor);
        escrow.deliver("QmCID", bytes32(0));

        // Buyer initiates dispute, vendor pays, arbiter resolves to vendor
        vm.prank(buyer);
        escrow.initiateDispute();
        vm.deal(vendor, 0.005 ether);
        vm.prank(vendor);
        escrow.payDisputeFee{value: 0.005 ether}();

        uint256 buyerGRBefore = grmps.balanceOf(buyer);
        uint256 vendorGRBefore = grmps.balanceOf(vendor);

        // Resolve to vendor
        vm.prank(arbiter);
        escrow.resolveToVendor();

        // No GRMPS rewards should be paid in dispute resolution
        assertEq(grmps.balanceOf(buyer), buyerGRBefore);
        assertEq(grmps.balanceOf(vendor), vendorGRBefore);
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

    // ---------- BEP-20 (USDT/USDC-style) flow tests ----------

    function test_Fund_BEP20() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(buyer, 2000e18);

        Escrow escrowBep20 = new Escrow();
        escrowBep20.initialize(Escrow.InitParams({
            buyer: buyer,
            seller: vendor,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: 100,
            paymentToken: address(token),
            amountWei: 1000e18,
            deadline: deadline,
            buyerFeeBps: 50,
            vendorFeeBps: 50,
            disputeFeeBps: 50,
            rewardRateBps: 25,
            rewardDistributor: address(0),
            rewardToken: address(0),
            rewardRatePer1e18: 0
        }));

        uint256 totalToPull = (1000e18 * (10000 + 50)) / 10000; // 1005e18
        vm.prank(buyer);
        token.approve(address(escrowBep20), totalToPull);
        vm.prank(buyer);
        escrowBep20.fund();

        Escrow.EscrowInfo memory info = escrowBep20.getAllInfo();
        assertEq(info.amount, 1000e18);
        assertEq(info.buyerFeeReserve, 5e18);
        assertEq(uint(info.state), uint(Escrow.State.Funded));
        assertEq(token.balanceOf(address(escrowBep20)), totalToPull);
    }

    function test_NormalCompletion_BEP20() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(buyer, 2000e18);

        Escrow escrowBep20 = new Escrow();
        escrowBep20.initialize(Escrow.InitParams({
            buyer: buyer,
            seller: vendor,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: 100,
            paymentToken: address(token),
            amountWei: 1000e18,
            deadline: deadline,
            buyerFeeBps: 50,
            vendorFeeBps: 50,
            disputeFeeBps: 50,
            rewardRateBps: 25,
            rewardDistributor: address(0),
            rewardToken: address(0),
            rewardRatePer1e18: 0
        }));

        uint256 totalToPull = (1000e18 * (10000 + 50)) / 10000;
        vm.prank(buyer);
        token.approve(address(escrowBep20), totalToPull);
        vm.prank(buyer);
        escrowBep20.fund();

        vm.prank(vendor);
        escrowBep20.deliver("QmBEP20", bytes32(0));
        vm.prank(buyer);
        escrowBep20.approve("QmBEP20");

        uint256 vendorBefore = token.balanceOf(vendor);
        uint256 feeRecipientBefore = token.balanceOf(feeRecipient);
        vm.prank(vendor);
        escrowBep20.withdraw();

        uint256 vendorFee = (1000e18 * 50) / 10000;
        assertEq(token.balanceOf(vendor), vendorBefore + 1000e18 - vendorFee);
        assertEq(token.balanceOf(feeRecipient), feeRecipientBefore + 5e18 + vendorFee);
    }

    function test_DisputeVendorInitiates_BEP20() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(buyer, 2000e18);
        token.mint(vendor, 100e18);

        Escrow escrowBep20 = new Escrow();
        escrowBep20.initialize(Escrow.InitParams({
            buyer: buyer,
            seller: vendor,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: 100,
            paymentToken: address(token),
            amountWei: 1000e18,
            deadline: deadline,
            buyerFeeBps: 50,
            vendorFeeBps: 50,
            disputeFeeBps: 50,
            rewardRateBps: 25,
            rewardDistributor: address(0),
            rewardToken: address(0),
            rewardRatePer1e18: 0
        }));

        uint256 totalToPull = (1000e18 * (10000 + 50)) / 10000;
        vm.prank(buyer);
        token.approve(address(escrowBep20), totalToPull);
        vm.prank(buyer);
        escrowBep20.fund();

        vm.prank(vendor);
        escrowBep20.deliver("QmBEP20", bytes32(0));

        uint256 disputeFee = (1000e18 * 50) / 10000; // 5e18
        vm.prank(vendor);
        token.approve(address(escrowBep20), disputeFee);
        vm.prank(vendor);
        escrowBep20.initiateDispute();

        Escrow.EscrowInfo memory info = escrowBep20.getAllInfo();
        assertEq(uint(info.state), uint(Escrow.State.Disputed));
        assertTrue(info.vendorPaidDisputeFee);
        assertEq(info.disputeInitiator, vendor);
    }

    function test_DisputeResolveToVendor_BEP20() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(buyer, 2000e18);
        token.mint(vendor, 100e18);

        Escrow escrowBep20 = new Escrow();
        escrowBep20.initialize(Escrow.InitParams({
            buyer: buyer,
            seller: vendor,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: 100,
            paymentToken: address(token),
            amountWei: 1000e18,
            deadline: deadline,
            buyerFeeBps: 50,
            vendorFeeBps: 50,
            disputeFeeBps: 50,
            rewardRateBps: 25,
            rewardDistributor: address(0),
            rewardToken: address(0),
            rewardRatePer1e18: 0
        }));

        uint256 totalToPull = (1000e18 * (10000 + 50)) / 10000;
        vm.prank(buyer);
        token.approve(address(escrowBep20), totalToPull);
        vm.prank(buyer);
        escrowBep20.fund();

        vm.prank(vendor);
        escrowBep20.deliver("QmBEP20", bytes32(0));
        vm.prank(buyer);
        escrowBep20.initiateDispute();

        uint256 disputeFee = (1000e18 * 50) / 10000;
        vm.prank(vendor);
        token.approve(address(escrowBep20), disputeFee);
        vm.prank(vendor);
        escrowBep20.payDisputeFee();

        uint256 vendorBefore = token.balanceOf(vendor);
        vm.prank(arbiter);
        escrowBep20.resolveToVendor();

        assertEq(token.balanceOf(vendor), vendorBefore + 1000e18 + disputeFee);
    }

    function test_DisputeResolveByDefault_BEP20() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(buyer, 2000e18);
        token.mint(vendor, 100e18);

        Escrow escrowBep20 = new Escrow();
        escrowBep20.initialize(Escrow.InitParams({
            buyer: buyer,
            seller: vendor,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: 100,
            paymentToken: address(token),
            amountWei: 1000e18,
            deadline: deadline,
            buyerFeeBps: 50,
            vendorFeeBps: 50,
            disputeFeeBps: 50,
            rewardRateBps: 25,
            rewardDistributor: address(0),
            rewardToken: address(0),
            rewardRatePer1e18: 0
        }));

        uint256 totalToPull = (1000e18 * (10000 + 50)) / 10000;
        vm.prank(buyer);
        token.approve(address(escrowBep20), totalToPull);
        vm.prank(buyer);
        escrowBep20.fund();

        vm.prank(vendor);
        escrowBep20.deliver("QmBEP20", bytes32(0));
        vm.prank(vendor);
        token.approve(address(escrowBep20), (1000e18 * 50) / 10000);
        vm.prank(vendor);
        escrowBep20.initiateDispute();

        vm.warp(block.timestamp + 72 hours + 1);
        uint256 vendorBefore = token.balanceOf(vendor);
        escrowBep20.resolveDisputeByDefault();
        assertEq(token.balanceOf(vendor), vendorBefore + 1000e18 + (1000e18 * 50) / 10000);
    }

    function test_Fund_BEP20_RevertsWhenSendingBNB() public {
        ERC20Mock token = new ERC20Mock();
        token.mint(buyer, 2000e18);
        vm.deal(buyer, 1 ether); // give buyer BNB so the call can be made; escrow must reject BNB for BEP-20

        Escrow escrowBep20 = new Escrow();
        escrowBep20.initialize(Escrow.InitParams({
            buyer: buyer,
            seller: vendor,
            arbiter: arbiter,
            feeRecipient: feeRecipient,
            feeBps: 100,
            paymentToken: address(token),
            amountWei: 1000e18,
            deadline: deadline,
            buyerFeeBps: 50,
            vendorFeeBps: 50,
            disputeFeeBps: 50,
            rewardRateBps: 25,
            rewardDistributor: address(0),
            rewardToken: address(0),
            rewardRatePer1e18: 0
        }));

        vm.prank(buyer);
        vm.expectRevert(Escrow.BadValue.selector);
        escrowBep20.fund{value: 1 ether}();
    }

}
