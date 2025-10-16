// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";

contract EscrowScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Example deployment parameters
        address buyer = address(0x1);    // Replace with actual buyer address
        address vendor = address(0x2);   // Replace with actual vendor address
        address arbiter = address(0x3);  // Replace with actual arbiter address or address(0)
        uint64 deadline = uint64(block.timestamp + 30 days);

        Escrow escrow = new Escrow(buyer, vendor, arbiter, deadline);

        vm.stopBroadcast();
    }
}
