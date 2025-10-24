// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {RewardDistributor} from "../src/RewardDistributor.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Mock ERC20 for testing
contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "insufficient allowance");
        require(balanceOf[from] >= amount, "insufficient balance");
        
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract RewardDistributorTest is Test {
    RewardDistributor public distributor;
    MockERC20 public token;
    
    address owner = address(1);
    address rewardSource = address(2);
    address escrow1 = address(3);
    address escrow2 = address(4);
    address buyer = address(5);
    address vendor = address(6);
    
    function setUp() public {
        token = new MockERC20();
        distributor = new RewardDistributor(owner, address(token), rewardSource);
        
        // Mint tokens to reward source
        token.mint(rewardSource, 1000000 ether);
    }
    
    function testDeployment() public {
        assertEq(distributor.owner(), owner);
        assertEq(distributor.rewardToken(), address(token));
        assertEq(distributor.rewardSource(), rewardSource);
        assertFalse(distributor.openMode());
    }
    
    function testAuthorizeCallers() public {
        vm.prank(owner);
        distributor.setAuthorizedCaller(escrow1, true);
        
        assertTrue(distributor.authorizedCallers(escrow1));
        assertFalse(distributor.authorizedCallers(escrow2));
    }
    
    function testDistributeRewards() public {
        // Setup
        vm.prank(owner);
        distributor.setAuthorizedCaller(escrow1, true);
        
        vm.prank(rewardSource);
        token.approve(address(distributor), 1000 ether);
        
        // Distribute
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        recipients[0] = buyer;
        recipients[1] = vendor;
        amounts[0] = 100 ether;
        amounts[1] = 100 ether;
        
        vm.prank(escrow1);
        bool success = distributor.distributeRewards(recipients, amounts, "test");
        
        assertTrue(success);
        assertEq(token.balanceOf(buyer), 100 ether);
        assertEq(token.balanceOf(vendor), 100 ether);
    }
    
    function testUnauthorizedCaller() public {
        vm.prank(rewardSource);
        token.approve(address(distributor), 1000 ether);
        
        address[] memory recipients = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        recipients[0] = buyer;
        amounts[0] = 100 ether;
        
        vm.prank(escrow1); // Not authorized
        vm.expectRevert(RewardDistributor.UnauthorizedCaller.selector);
        distributor.distributeRewards(recipients, amounts, "test");
    }
    
    function testOpenMode() public {
        vm.prank(owner);
        distributor.setOpenMode(true);
        
        vm.prank(rewardSource);
        token.approve(address(distributor), 1000 ether);
        
        address[] memory recipients = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        recipients[0] = buyer;
        amounts[0] = 100 ether;
        
        // Anyone can call in open mode
        vm.prank(escrow1);
        bool success = distributor.distributeRewards(recipients, amounts, "test");
        
        assertTrue(success);
        assertEq(token.balanceOf(buyer), 100 ether);
    }
    
    function testInsufficientAllowance() public {
        vm.prank(owner);
        distributor.setAuthorizedCaller(escrow1, true);
        
        // Don't approve enough
        vm.prank(rewardSource);
        token.approve(address(distributor), 50 ether);
        
        address[] memory recipients = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        recipients[0] = buyer;
        amounts[0] = 100 ether;
        
        vm.prank(escrow1);
        bool success = distributor.distributeRewards(recipients, amounts, "test");
        
        assertFalse(success); // Should fail gracefully
        assertEq(token.balanceOf(buyer), 0);
    }
}

