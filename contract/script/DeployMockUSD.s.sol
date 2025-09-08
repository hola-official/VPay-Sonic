// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Tether.sol";

contract DeployMockUSD is Script {
    function run() external {
        console.log("Deploying MockUSD contract...");
        
        vm.startBroadcast();
        
        MockUSD mockUSD = new MockUSD();
        
        vm.stopBroadcast();
        
        console.log("MockUSD contract deployed at:", address(mockUSD));
        console.log("Owner:", mockUSD.owner());
        console.log("Name:", mockUSD.name());
        console.log("Symbol:", mockUSD.symbol());
        console.log("Decimals:", mockUSD.decimals());
        console.log("Total Supply:", mockUSD.totalSupply());
    }
}
