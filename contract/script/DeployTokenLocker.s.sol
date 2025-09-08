// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/TokenLocker.sol";

contract DeployTokenLocker is Script {
    function run() external {
        console.log("Deploying TokenLocker contract...");
        
        vm.startBroadcast();
        
        TokenLocker tokenLocker = new TokenLocker();
        
        vm.stopBroadcast();
        
        console.log("TokenLocker contract deployed at:", address(tokenLocker));
        console.log("Owner:", tokenLocker.owner());
    }
}
