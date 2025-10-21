// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ConfigureRewardsScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");
        address grmpsToken = vm.envAddress("GRMPS_TOKEN_ADDRESS");
        uint256 rewardRate = vm.envUint("REWARD_RATE_PER_1E18");

        console.log("Configuring rewards for escrow:", escrowAddress);
        console.log("GRMPS Token:", grmpsToken);
        console.log("Reward Rate:", rewardRate);

        Escrow escrow = Escrow(escrowAddress);

        vm.startBroadcast();
        
        escrow.setRewardToken(grmpsToken);
        console.log("Set reward token");
        
        escrow.setRewardRatePer1e18(rewardRate);
        console.log("Set reward rate");
        
        vm.stopBroadcast();
        
        console.log("Rewards configured successfully!");
    }
}

contract FundEscrowScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");
        uint256 fundAmount = vm.envUint("FUND_AMOUNT_WEI");

        console.log("Funding escrow:", escrowAddress);
        console.log("Amount (wei):", fundAmount);
        console.log("Amount (BNB):", fundAmount / 1e18);

        Escrow escrow = Escrow(escrowAddress);

        vm.startBroadcast();
        
        escrow.fund{value: fundAmount}();
        
        vm.stopBroadcast();
        
        console.log("Escrow funded successfully!");
        
        // Display escrow info
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        console.log("Project Amount:", info.amount);
        console.log("Buyer Fee Reserve:", info.buyerFeeReserve);
        console.log("State:", uint(info.state));
    }
}

contract DeliverWorkScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");
        string memory cid = vm.envString("IPFS_CID");
        bytes32 contentHash = vm.envBytes32("CONTENT_HASH");

        console.log("Delivering work to escrow:", escrowAddress);
        console.log("CID:", cid);

        Escrow escrow = Escrow(escrowAddress);

        vm.startBroadcast();
        
        escrow.deliver(cid, contentHash);
        
        vm.stopBroadcast();
        
        console.log("Work delivered successfully!");
    }
}

contract ApproveWorkScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");
        string memory cid = vm.envString("IPFS_CID");

        console.log("Approving work for escrow:", escrowAddress);
        console.log("CID:", cid);

        Escrow escrow = Escrow(escrowAddress);

        vm.startBroadcast();
        
        escrow.approve(cid);
        
        vm.stopBroadcast();
        
        console.log("Work approved successfully!");
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        console.log("State:", uint(info.state));
        console.log("Buyer Approved:", info.buyerApproved);
        console.log("Vendor Approved:", info.vendorApproved);
    }
}

contract WithdrawScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");

        console.log("Withdrawing from escrow:", escrowAddress);

        Escrow escrow = Escrow(escrowAddress);
        
        uint256 vendorBalBefore = address(escrow.getAllInfo().vendor).balance;
        
        vm.startBroadcast();
        
        escrow.withdraw();
        
        vm.stopBroadcast();
        
        console.log("Withdrawal successful!");
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        console.log("Final State:", uint(info.state));
        console.log("Vendor received (wei):", address(info.vendor).balance - vendorBalBefore);
    }
}

contract CancelEscrowScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");

        console.log("Cancelling escrow:", escrowAddress);

        Escrow escrow = Escrow(escrowAddress);

        vm.startBroadcast();
        
        escrow.cancel();
        
        vm.stopBroadcast();
        
        console.log("Escrow cancelled successfully!");
    }
}

contract InitiateDisputeScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");
        // If vendor initiates, need to send dispute fee
        uint256 disputeFee = vm.envOr("DISPUTE_FEE_WEI", uint256(0));

        console.log("Initiating dispute for escrow:", escrowAddress);
        if (disputeFee > 0) {
            console.log("Paying dispute fee:", disputeFee);
        }

        Escrow escrow = Escrow(escrowAddress);

        vm.startBroadcast();
        
        if (disputeFee > 0) {
            escrow.initiateDispute{value: disputeFee}();
        } else {
            escrow.initiateDispute();
        }
        
        vm.stopBroadcast();
        
        console.log("Dispute initiated!");
        
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        console.log("Dispute Initiator:", info.disputeInitiator);
        console.log("Dispute Fee Deadline:", info.disputeFeeDeadline);
    }
}

contract PayDisputeFeeScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");
        uint256 disputeFee = vm.envUint("DISPUTE_FEE_WEI");

        console.log("Paying dispute fee for escrow:", escrowAddress);
        console.log("Fee amount:", disputeFee);

        Escrow escrow = Escrow(escrowAddress);

        vm.startBroadcast();
        
        escrow.payDisputeFee{value: disputeFee}();
        
        vm.stopBroadcast();
        
        console.log("Dispute fee paid!");
    }
}

contract ResolveDisputeScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");
        string memory resolution = vm.envString("RESOLUTION"); // "buyer" or "vendor"

        console.log("Resolving dispute for escrow:", escrowAddress);
        console.log("Resolution:", resolution);

        Escrow escrow = Escrow(escrowAddress);

        vm.startBroadcast();
        
        if (keccak256(bytes(resolution)) == keccak256(bytes("buyer"))) {
            escrow.resolveToBuyer();
            console.log("Resolved to buyer");
        } else if (keccak256(bytes(resolution)) == keccak256(bytes("vendor"))) {
            escrow.resolveToVendor();
            console.log("Resolved to vendor");
        } else {
            revert("Invalid resolution. Use 'buyer' or 'vendor'");
        }
        
        vm.stopBroadcast();
        
        console.log("Dispute resolved!");
    }
}

contract FundGRMPSScript is Script {
    function run() external {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");
        address grmpsToken = vm.envAddress("GRMPS_TOKEN_ADDRESS");
        uint256 amount = vm.envUint("GRMPS_AMOUNT");

        console.log("Funding escrow with GRMPS:");
        console.log("Escrow:", escrowAddress);
        console.log("GRMPS Token:", grmpsToken);
        console.log("Amount:", amount);

        IERC20 grmps = IERC20(grmpsToken);

        vm.startBroadcast();
        
        grmps.transfer(escrowAddress, amount);
        
        vm.stopBroadcast();
        
        console.log("GRMPS transferred to escrow!");
        console.log("Escrow GRMPS balance:", grmps.balanceOf(escrowAddress));
    }
}

contract ViewEscrowInfoScript is Script {
    function run() external view {
        address escrowAddress = vm.envAddress("ESCROW_ADDRESS");
        
        Escrow escrow = Escrow(escrowAddress);
        Escrow.EscrowInfo memory info = escrow.getAllInfo();
        
        console.log("=== ESCROW INFO ===");
        console.log("Address:", escrowAddress);
        console.log("\n--- Participants ---");
        console.log("Buyer:", info.buyer);
        console.log("Vendor:", info.vendor);
        console.log("Arbiter:", info.arbiter);
        console.log("Fee Recipient:", info.feeRecipient);
        
        console.log("\n--- Amounts ---");
        console.log("Project Amount:", info.amount);
        console.log("Buyer Fee Reserve:", info.buyerFeeReserve);
        console.log("Dispute Fee Amount:", info.disputeFeeAmount);
        
        console.log("\n--- State ---");
        console.log("State:", uint(info.state));
        console.log("Buyer Approved:", info.buyerApproved);
        console.log("Vendor Approved:", info.vendorApproved);
        
        console.log("\n--- Deadlines ---");
        console.log("Project Deadline:", info.deadline);
        console.log("Dispute Fee Deadline:", info.disputeFeeDeadline);
        
        console.log("\n--- Content ---");
        console.log("Proposed CID:", info.proposedCID);
        console.log("Finalized CID:", info.cid);
        
        console.log("\n--- Rewards ---");
        console.log("Reward Token:", info.rewardToken);
        console.log("Reward Rate:", info.rewardRatePer1e18);
        
        if (info.rewardToken != address(0)) {
            uint256 balance = IERC20(info.rewardToken).balanceOf(escrowAddress);
            console.log("GRMPS Balance:", balance);
        }
    }
}

