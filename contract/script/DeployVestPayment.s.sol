// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/VestPayment.sol";

contract DeployVestPayment is Script {
    function run() external {
        console.log("Deploying VestPayment contract...");
        
        vm.startBroadcast();
        
        MultiTokenVestingManager vestingManager = new MultiTokenVestingManager();
        
        vm.stopBroadcast();
        
        console.log("VestPayment contract deployed at:", address(vestingManager));
        console.log("Owner:", vestingManager.owner());
        console.log("Vesting fee percentage:", vestingManager.vestingFeePercentage());
    }
}
