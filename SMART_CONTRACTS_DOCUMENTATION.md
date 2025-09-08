# VPay Smart Contracts Documentation

## 🏗️ Overview

VPay's smart contract layer provides the foundation for Web3 workplace management, enabling secure token vesting, savings locks, and automated payroll distribution. The contracts are built with security, efficiency, and flexibility in mind.

## 📋 Contract Architecture

```
VPay Smart Contract Ecosystem
├── VestPayment.sol (MultiTokenVestingManager)
│   ├── Employee vesting schedules
│   ├── Equity distribution
│   ├── Automated token releases
│   └── Permission management
├── TokenLocker.sol
│   ├── Personal savings locks
│   ├── LP token locking
│   ├── Vesting locks
│   └── Emergency controls
├── Tether.sol (Mock USDT for testing)
├── Circle.sol (Mock USDC for testing)
└── Multicall3.sol (Batch operations)
```

---

## 🔒 VestPayment.sol - MultiTokenVestingManager

### **Purpose**
The VestPayment contract manages employee equity vesting, token-based compensation, and automated payroll distribution. It's designed for employers to create and manage vesting schedules for multiple employees across different tokens.

### **Key Features**
- ✅ **Multi-token support**: Handle any ERC20 token
- ✅ **Flexible vesting schedules**: Daily, weekly, monthly, quarterly, yearly
- ✅ **Batch operations**: Create multiple vesting schedules efficiently
- ✅ **Permission system**: Control cancellation and recipient changes
- ✅ **Auto-claim functionality**: Automated token distribution
- ✅ **Fee system**: Optional platform fees

### **Contract Structure**

#### **Enums**
```solidity
enum CancelPermission {
    NONE,           // Cannot be cancelled
    SENDER_ONLY,    // Only employer can cancel
    RECIPIENT_ONLY, // Only employee can cancel
    BOTH           // Either party can cancel
}

enum ChangeRecipientPermission {
    NONE,           // Cannot change recipient
    SENDER_ONLY,    // Only employer can change
    RECIPIENT_ONLY, // Only employee can change
    BOTH           // Either party can change
}

enum UnlockSchedule {
    SECOND,    // Every second (for testing)
    MINUTE,    // Every minute (for testing)
    HOUR,      // Every hour
    DAILY,     // Every day
    WEEKLY,    // Every week
    BIWEEKLY,  // Every 2 weeks
    MONTHLY,   // Every month
    QUARTERLY, // Every quarter
    YEARLY     // Every year
}
```

#### **Core Structures**
```solidity
struct VestingSchedule {
    uint256 id;                                    // Unique identifier
    address token;                                 // Token being vested
    address sender;                                // Employer wallet
    address recipient;                             // Employee wallet
    uint256 totalAmount;                           // Total tokens to vest
    uint256 releasedAmount;                        // Already released tokens
    uint256 startTime;                             // Vesting start timestamp
    uint256 endTime;                               // Vesting end timestamp
    UnlockSchedule unlockSchedule;                 // Release frequency
    bool autoClaim;                                // Auto-release tokens
    string contractTitle;                          // Description
    string recipientEmail;                         // Employee email
    CancelPermission cancelPermission;             // Who can cancel
    ChangeRecipientPermission changeRecipientPermission; // Who can change recipient
    uint256 createdAt;                             // Creation timestamp
}

struct TokenVestingInfo {
    address token;                  // Token address
    uint256 totalVestedAmount;      // Total tokens under vesting
    uint256 totalReleasedAmount;    // Total tokens released
    uint256 activeSchedulesCount;   // Number of active schedules
}
```

### **Core Functions**

#### **1. Create Single Vesting Schedule**
```solidity
function createVestingSchedule(
    address _token,                                // Token to vest (USDC, USDT, etc.)
    address _recipient,                            // Employee wallet address
    uint256 _amount,                               // Total amount to vest
    uint256 _startTime,                            // When vesting starts
    uint256 _endTime,                              // When vesting ends
    UnlockSchedule _unlockSchedule,                // Release frequency
    bool _autoClaim,                               // Auto-release tokens
    string memory _contractTitle,                  // Description
    string memory _recipientEmail,                 // Employee email
    CancelPermission _cancelPermission,            // Cancel permissions
    ChangeRecipientPermission _changeRecipientPermission // Change permissions
) external returns (uint256 scheduleId);
```

**Usage Example - Employee Equity Vesting:**
```javascript
// 4-year equity vesting with monthly releases
const createEmployeeVesting = async (employeeWallet, employeeEmail) => {
  const vestingContract = new ethers.Contract(vestingAddress, abi, signer);
  
  const startTime = Math.floor(Date.now() / 1000); // Now
  const endTime = startTime + (4 * 365 * 24 * 60 * 60); // 4 years
  const totalTokens = ethers.parseUnits("40000", 6); // 40,000 USDC
  
  const tx = await vestingContract.createVestingSchedule(
    usdcAddress,                    // Token: USDC
    employeeWallet,                 // Employee wallet
    totalTokens,                    // 40,000 USDC
    startTime,                      // Start now
    endTime,                        // End in 4 years
    6,                             // Monthly releases (enum: MONTHLY)
    false,                         // Manual claim
    "Employee Equity Vesting",      // Title
    employeeEmail,                  // Email
    1,                             // SENDER_ONLY can cancel
    1                              // SENDER_ONLY can change recipient
  );
  
  const receipt = await tx.wait();
  const scheduleId = receipt.events[0].args.scheduleId;
  
  console.log(`Vesting schedule created with ID: ${scheduleId}`);
  return scheduleId;
};
```

#### **2. Create Multiple Vesting Schedules**
```solidity
function createMultipleVestingSchedules(
    address _token,                                // Token to vest
    address[] memory _recipients,                  // Array of employee wallets
    uint256[] memory _amounts,                     // Array of vesting amounts
    uint256 _startTime,                            // Common start time
    uint256 _endTime,                              // Common end time
    UnlockSchedule _unlockSchedule,                // Common release schedule
    bool _autoClaim,                               // Common auto-claim setting
    string[] memory _contractTitles,               // Individual titles
    string[] memory _recipientEmails,              // Individual emails
    CancelPermission _cancelPermission,            // Common cancel permission
    ChangeRecipientPermission _changeRecipientPermission // Common change permission
) external returns (uint256[] memory scheduleIds);
```

**Usage Example - Team Equity Distribution:**
```javascript
// Distribute equity to entire team
const distributeTeamEquity = async (teamMembers) => {
  const vestingContract = new ethers.Contract(vestingAddress, abi, signer);
  
  const recipients = teamMembers.map(member => member.wallet);
  const amounts = teamMembers.map(member => 
    ethers.parseUnits(member.equityAmount.toString(), 6)
  );
  const titles = teamMembers.map(member => 
    `Equity Vesting - ${member.name}`
  );
  const emails = teamMembers.map(member => member.email);
  
  const startTime = Math.floor(Date.now() / 1000);
  const endTime = startTime + (4 * 365 * 24 * 60 * 60); // 4 years
  
  const tx = await vestingContract.createMultipleVestingSchedules(
    usdcAddress,        // Token
    recipients,         // Employee wallets
    amounts,           // Individual amounts
    startTime,         // Start time
    endTime,           // End time
    6,                 // Monthly (MONTHLY)
    false,             // Manual claim
    titles,            // Individual titles
    emails,            // Individual emails
    1,                 // SENDER_ONLY cancel
    1                  // SENDER_ONLY change
  );
  
  const receipt = await tx.wait();
  console.log(`Created ${recipients.length} vesting schedules`);
  
  return receipt;
};
```

#### **3. Release Vested Tokens**
```solidity
function release(uint256 _scheduleId) external nonReentrant;
```

**Usage Example - Employee Token Claim:**
```javascript
// Employee claims their vested tokens
const claimVestedTokens = async (scheduleId) => {
  const vestingContract = new ethers.Contract(vestingAddress, abi, signer);
  
  // Check how much is available to claim
  const releasableAmount = await vestingContract.getReleasableAmount(scheduleId);
  
  if (releasableAmount.gt(0)) {
    const tx = await vestingContract.release(scheduleId);
    const receipt = await tx.wait();
    
    const claimedAmount = ethers.formatUnits(releasableAmount, 6);
    toast.success(`Successfully claimed ${claimedAmount} USDC!`);
    
    return receipt;
  } else {
    toast.info("No tokens available to claim yet");
  }
};
```

#### **4. Release All Available Tokens**
```solidity
function releaseAll(address _recipient) external nonReentrant;
```

**Usage Example - Claim All Available:**
```javascript
// Employee claims from all their vesting schedules
const claimAllAvailable = async () => {
  const vestingContract = new ethers.Contract(vestingAddress, abi, signer);
  
  const tx = await vestingContract.releaseAll(address);
  const receipt = await tx.wait();
  
  // Parse events to see how much was claimed
  const releaseEvents = receipt.events.filter(event => 
    event.event === 'TokensReleased'
  );
  
  let totalClaimed = ethers.BigNumber.from(0);
  releaseEvents.forEach(event => {
    totalClaimed = totalClaimed.add(event.args.amount);
  });
  
  const claimedAmount = ethers.formatUnits(totalClaimed, 6);
  toast.success(`Claimed ${claimedAmount} USDC from ${releaseEvents.length} schedules!`);
};
```

#### **5. Cancel Vesting Schedule**
```solidity
function cancelVestingSchedule(uint256 _scheduleId) external;
```

**Usage Example - Employer Cancels Vesting:**
```javascript
// Employer cancels employee vesting (e.g., employee leaves)
const cancelEmployeeVesting = async (scheduleId) => {
  const vestingContract = new ethers.Contract(vestingAddress, abi, signer);
  
  try {
    const tx = await vestingContract.cancelVestingSchedule(scheduleId);
    const receipt = await tx.wait();
    
    toast.success("Vesting schedule cancelled. Vested tokens released to employee, unvested returned to employer.");
    return receipt;
  } catch (error) {
    if (error.message.includes("Not authorized")) {
      toast.error("You don't have permission to cancel this vesting schedule");
    } else {
      toast.error("Failed to cancel vesting schedule");
    }
  }
};
```

#### **6. Change Recipient**
```solidity
function changeRecipient(uint256 _scheduleId, address _newRecipient) external;
```

**Usage Example - Update Employee Wallet:**
```javascript
// Update employee's wallet address
const updateEmployeeWallet = async (scheduleId, newWallet) => {
  const vestingContract = new ethers.Contract(vestingAddress, abi, signer);
  
  try {
    const tx = await vestingContract.changeRecipient(scheduleId, newWallet);
    const receipt = await tx.wait();
    
    toast.success(`Vesting recipient updated to ${newWallet}`);
    return receipt;
  } catch (error) {
    toast.error("Failed to update recipient");
  }
};
```

### **View Functions**

#### **1. Get Releasable Amount**
```solidity
function getReleasableAmount(uint256 _scheduleId) public view returns (uint256);
```

#### **2. Get Vested Amount**
```solidity
function getVestedAmount(uint256 _scheduleId) public view returns (uint256);
```

#### **3. Get Schedule Details**
```solidity
function getScheduleById(uint256 _scheduleId) public view returns (VestingSchedule memory);
```

#### **4. Get Employee's Schedules**
```solidity
function getRecipientSchedules(address _recipient) public view returns (uint256[] memory);
```

#### **5. Get Employer's Schedules**
```solidity
function getSenderSchedules(address _sender) public view returns (uint256[] memory);
```

**Employee Dashboard Example:**
```javascript
const EmployeeVestingDashboard = () => {
  const [vestingSchedules, setVestingSchedules] = useState([]);
  const [totalVested, setTotalVested] = useState('0');
  const [totalClaimed, setTotalClaimed] = useState('0');
  const [availableToClaim, setAvailableToClaim] = useState('0');
  
  const { address } = useAccount();

  useEffect(() => {
    loadVestingData();
  }, [address]);

  const loadVestingData = async () => {
    if (!address) return;
    
    const contract = new ethers.Contract(vestingAddress, abi, provider);
    
    // Get employee's vesting schedules
    const scheduleIds = await contract.getRecipientSchedules(address);
    
    const schedules = [];
    let totalVestedAmount = ethers.BigNumber.from(0);
    let totalClaimedAmount = ethers.BigNumber.from(0);
    let totalAvailable = ethers.BigNumber.from(0);
    
    for (const scheduleId of scheduleIds) {
      const schedule = await contract.getScheduleById(scheduleId);
      const releasable = await contract.getReleasableAmount(scheduleId);
      
      schedules.push({
        ...schedule,
        releasableAmount: releasable,
        formattedTotal: ethers.formatUnits(schedule.totalAmount, 6),
        formattedReleased: ethers.formatUnits(schedule.releasedAmount, 6),
        formattedReleasable: ethers.formatUnits(releasable, 6)
      });
      
      totalVestedAmount = totalVestedAmount.add(schedule.totalAmount);
      totalClaimedAmount = totalClaimedAmount.add(schedule.releasedAmount);
      totalAvailable = totalAvailable.add(releasable);
    }
    
    setVestingSchedules(schedules);
    setTotalVested(ethers.formatUnits(totalVestedAmount, 6));
    setTotalClaimed(ethers.formatUnits(totalClaimedAmount, 6));
    setAvailableToClaim(ethers.formatUnits(totalAvailable, 6));
  };

  return (
    <div className="vesting-dashboard">
      <div className="stats-grid">
        <StatCard title="Total Vested" value={`${totalVested} USDC`} />
        <StatCard title="Total Claimed" value={`${totalClaimed} USDC`} />
        <StatCard title="Available to Claim" value={`${availableToClaim} USDC`} />
        <StatCard title="Active Schedules" value={vestingSchedules.length} />
      </div>
      
      <div className="schedules-list">
        {vestingSchedules.map((schedule, index) => (
          <VestingScheduleCard 
            key={schedule.id} 
            schedule={schedule}
            onClaim={() => claimVestedTokens(schedule.id)}
          />
        ))}
      </div>
      
      {parseFloat(availableToClaim) > 0 && (
        <button 
          className="claim-all-btn"
          onClick={claimAllAvailable}
        >
          Claim All Available ({availableToClaim} USDC)
        </button>
      )}
    </div>
  );
};
```

---

## 🔐 TokenLocker.sol

### **Purpose**
The TokenLocker contract provides secure token locking functionality for employee savings plans, LP token security, and general token time-locks. It supports both simple time-locks and complex vesting schedules.

### **Key Features**
- ✅ **Multiple lock types**: Simple locks and vesting locks
- ✅ **LP token support**: Secure liquidity provider tokens
- ✅ **Batch operations**: Multiple locks in one transaction
- ✅ **Fee system**: 1% unlock fee (configurable)
- ✅ **Emergency controls**: Owner emergency functions
- ✅ **Transfer ownership**: Lock ownership can be transferred

### **Core Structures**

```solidity
struct Lock {
    uint256 id;             // Unique lock ID
    address token;          // Token being locked
    address owner;          // Lock owner
    uint256 amount;         // Locked amount
    uint256 lockDate;       // When lock was created
    uint256 tgeDate;        // Unlock date (or TGE date for vesting)
    uint256 tgeBps;         // TGE release percentage (basis points)
    uint256 cycle;          // Vesting cycle duration
    uint256 cycleBps;       // Cycle release percentage (basis points)
    uint256 unlockedAmount; // Amount already unlocked
    string description;     // Lock description
}
```

### **Core Functions**

#### **1. Simple Token Lock**
```solidity
function lock(
    address _owner,         // Lock owner
    address token,          // Token to lock
    bool isLpToken,         // Is this an LP token?
    uint256 amount,         // Amount to lock
    uint256 unlockDate,     // When to unlock
    string memory description // Lock description
) external returns (uint256 id);
```

**Usage Example - Employee Savings Lock:**
```javascript
// Employee locks tokens for savings
const lockTokensForSavings = async (amount, months) => {
  const lockerContract = new ethers.Contract(lockerAddress, abi, signer);
  const tokenContract = new ethers.Contract(usdcAddress, erc20Abi, signer);
  
  // Calculate unlock date
  const unlockDate = new Date();
  unlockDate.setMonth(unlockDate.getMonth() + months);
  const unlockTimestamp = Math.floor(unlockDate.getTime() / 1000);
  
  // Parse amount
  const lockAmount = ethers.parseUnits(amount.toString(), 6);
  
  // Approve tokens
  const approveTx = await tokenContract.approve(lockerAddress, lockAmount);
  await approveTx.wait();
  
  // Lock tokens
  const lockTx = await lockerContract.lock(
    address,                    // Owner
    usdcAddress,               // Token
    false,                     // Not LP token
    lockAmount,                // Amount
    unlockTimestamp,           // Unlock date
    `Savings Lock - ${months} months` // Description
  );
  
  const receipt = await lockTx.wait();
  const lockId = receipt.events.find(e => e.event === 'LockAdded').args.id;
  
  toast.success(`Successfully locked ${amount} USDC for ${months} months!`);
  return lockId;
};
```

#### **2. Vesting Lock**
```solidity
function vestingLock(
    address owner,          // Lock owner
    address token,          // Token to lock
    bool isLpToken,         // Is LP token?
    uint256 amount,         // Total amount
    uint256 tgeDate,        // TGE/start date
    uint256 tgeBps,         // Initial release %
    uint256 cycle,          // Vesting cycle
    uint256 cycleBps,       // Cycle release %
    string memory description
) external returns (uint256 id);
```

**Usage Example - Gradual Token Release:**
```javascript
// Lock tokens with gradual release (25% immediately, then 25% every 3 months)
const createVestingLock = async (amount) => {
  const lockerContract = new ethers.Contract(lockerAddress, abi, signer);
  const tokenContract = new ethers.Contract(usdcAddress, erc20Abi, signer);
  
  const lockAmount = ethers.parseUnits(amount.toString(), 6);
  const tgeDate = Math.floor(Date.now() / 1000); // Start now
  const cycle = 90 * 24 * 60 * 60; // 3 months in seconds
  
  // Approve tokens
  await tokenContract.approve(lockerAddress, lockAmount);
  
  // Create vesting lock
  const tx = await lockerContract.vestingLock(
    address,                    // Owner
    usdcAddress,               // Token
    false,                     // Not LP
    lockAmount,                // Amount
    tgeDate,                   // Start now
    2500,                      // 25% initial (2500 basis points)
    cycle,                     // 3 month cycles
    2500,                      // 25% per cycle
    "Gradual Release Savings"   // Description
  );
  
  const receipt = await tx.wait();
  toast.success("Vesting lock created! 25% available now, 25% every 3 months");
  
  return receipt;
};
```

#### **3. Multiple Vesting Locks**
```solidity
function multipleVestingLock(
    address[] calldata owners,     // Array of owners
    uint256[] calldata amounts,    // Array of amounts
    address token,                 // Token
    bool isLpToken,               // Is LP token
    uint256 tgeDate,              // TGE date
    uint256 tgeBps,               // TGE percentage
    uint256 cycle,                // Cycle duration
    uint256 cycleBps,             // Cycle percentage
    string memory description      // Description
) external returns (uint256[] memory);
```

**Usage Example - Team Token Distribution:**
```javascript
// Distribute locked tokens to team members
const distributeTeamTokens = async (teamMembers, totalAmount) => {
  const lockerContract = new ethers.Contract(lockerAddress, abi, signer);
  const tokenContract = new ethers.Contract(usdcAddress, erc20Abi, signer);
  
  const owners = teamMembers.map(member => member.wallet);
  const amounts = teamMembers.map(member => 
    ethers.parseUnits((totalAmount * member.percentage / 100).toString(), 6)
  );
  
  const totalTokens = amounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
  
  // Approve total amount
  await tokenContract.approve(lockerAddress, totalTokens);
  
  // Create multiple locks
  const tx = await lockerContract.multipleVestingLock(
    owners,                         // Team wallets
    amounts,                        // Individual amounts
    usdcAddress,                   // Token
    false,                         // Not LP
    Math.floor(Date.now() / 1000), // Start now
    1000,                          // 10% immediate
    30 * 24 * 60 * 60,            // Monthly cycles
    1000,                          // 10% per month
    "Team Token Distribution"       // Description
  );
  
  const receipt = await tx.wait();
  toast.success(`Created ${owners.length} vesting locks for team members`);
  
  return receipt;
};
```

#### **4. Unlock Tokens**
```solidity
function unlock(uint256 lockId) external;
```

**Usage Example - Unlock Savings:**
```javascript
// Employee unlocks their savings
const unlockSavings = async (lockId) => {
  const lockerContract = new ethers.Contract(lockerAddress, abi, signer);
  
  try {
    // Check if tokens are unlockable
    const lock = await lockerContract.getLockById(lockId);
    const now = Math.floor(Date.now() / 1000);
    
    if (now < lock.tgeDate) {
      toast.error("Tokens are not yet unlockable");
      return;
    }
    
    // For vesting locks, check withdrawable amount
    if (lock.tgeBps > 0) {
      const withdrawable = await lockerContract.withdrawableTokens(lockId);
      if (withdrawable.eq(0)) {
        toast.error("No tokens available to unlock yet");
        return;
      }
    }
    
    const tx = await lockerContract.unlock(lockId);
    const receipt = await tx.wait();
    
    // Calculate amount unlocked (minus 1% fee)
    const unlockEvent = receipt.events.find(e => 
      e.event === 'LockRemoved' || e.event === 'LockVested'
    );
    
    if (unlockEvent) {
      const amount = ethers.formatUnits(unlockEvent.args.amount, 6);
      toast.success(`Successfully unlocked ${amount} USDC!`);
    }
    
    return receipt;
  } catch (error) {
    if (error.message.includes("not time to unlock")) {
      toast.error("Tokens are not yet available for unlock");
    } else {
      toast.error("Failed to unlock tokens");
    }
  }
};
```

### **View Functions**

#### **1. Get User Locks**
```solidity
function normalLocksForUser(address user) external view returns (Lock[] memory);
function lpLocksForUser(address user) external view returns (Lock[] memory);
```

#### **2. Get Withdrawable Amount**
```solidity
function withdrawableTokens(uint256 lockId) external view returns (uint256);
```

#### **3. Get Lock Details**
```solidity
function getLockById(uint256 lockId) public view returns (Lock memory);
```

**Employee Savings Dashboard:**
```javascript
const SavingsDashboard = () => {
  const [locks, setLocks] = useState([]);
  const [totalLocked, setTotalLocked] = useState('0');
  const [totalWithdrawable, setTotalWithdrawable] = useState('0');
  
  const { address } = useAccount();

  useEffect(() => {
    loadSavingsData();
  }, [address]);

  const loadSavingsData = async () => {
    if (!address) return;
    
    const contract = new ethers.Contract(lockerAddress, abi, provider);
    
    // Get user's normal locks
    const userLocks = await contract.normalLocksForUser(address);
    
    const locksWithDetails = [];
    let totalLockedAmount = ethers.BigNumber.from(0);
    let totalWithdrawableAmount = ethers.BigNumber.from(0);
    
    for (const lock of userLocks) {
      let withdrawable = ethers.BigNumber.from(0);
      
      // For vesting locks, get withdrawable amount
      if (lock.tgeBps > 0) {
        withdrawable = await contract.withdrawableTokens(lock.id);
      } else {
        // For simple locks, check if unlockable
        const now = Math.floor(Date.now() / 1000);
        if (now >= lock.tgeDate && lock.unlockedAmount.eq(0)) {
          withdrawable = lock.amount;
        }
      }
      
      locksWithDetails.push({
        ...lock,
        withdrawableAmount: withdrawable,
        formattedAmount: ethers.formatUnits(lock.amount, 6),
        formattedWithdrawable: ethers.formatUnits(withdrawable, 6),
        unlockDate: new Date(lock.tgeDate * 1000),
        isUnlockable: withdrawable.gt(0)
      });
      
      totalLockedAmount = totalLockedAmount.add(lock.amount.sub(lock.unlockedAmount));
      totalWithdrawableAmount = totalWithdrawableAmount.add(withdrawable);
    }
    
    setLocks(locksWithDetails);
    setTotalLocked(ethers.formatUnits(totalLockedAmount, 6));
    setTotalWithdrawable(ethers.formatUnits(totalWithdrawableAmount, 6));
  };

  return (
    <div className="savings-dashboard">
      <div className="stats-grid">
        <StatCard title="Total Locked" value={`${totalLocked} USDC`} />
        <StatCard title="Available to Unlock" value={`${totalWithdrawable} USDC`} />
        <StatCard title="Active Locks" value={locks.length} />
      </div>
      
      <div className="locks-grid">
        {locks.map((lock) => (
          <LockCard 
            key={lock.id} 
            lock={lock}
            onUnlock={() => unlockSavings(lock.id)}
          />
        ))}
      </div>
      
      <div className="actions">
        <button onClick={() => setShowCreateLock(true)}>
          Create New Savings Lock
        </button>
      </div>
    </div>
  );
};

const LockCard = ({ lock, onUnlock }) => {
  return (
    <div className="lock-card">
      <div className="lock-header">
        <h3>{lock.description}</h3>
        <span className="lock-id">#{lock.id.toString()}</span>
      </div>
      
      <div className="lock-details">
        <div className="detail-row">
          <span>Amount:</span>
          <span>{lock.formattedAmount} USDC</span>
        </div>
        
        <div className="detail-row">
          <span>Unlock Date:</span>
          <span>{lock.unlockDate.toLocaleDateString()}</span>
        </div>
        
        {lock.withdrawableAmount.gt(0) && (
          <div className="detail-row highlight">
            <span>Available:</span>
            <span>{lock.formattedWithdrawable} USDC</span>
          </div>
        )}
      </div>
      
      <div className="lock-actions">
        {lock.isUnlockable ? (
          <button onClick={onUnlock} className="unlock-btn">
            Unlock {lock.formattedWithdrawable} USDC
          </button>
        ) : (
          <div className="countdown">
            <Countdown targetDate={lock.unlockDate} />
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🔧 Contract Integration Examples

### **Complete Employer Setup Flow**

```javascript
// Complete setup for a new employer
const setupEmployerContracts = async (employees) => {
  console.log("Setting up VPay contracts for employer...");
  
  // 1. Deploy or connect to contracts
  const vestingContract = new ethers.Contract(vestingAddress, vestingAbi, signer);
  const lockerContract = new ethers.Contract(lockerAddress, lockerAbi, signer);
  const usdcContract = new ethers.Contract(usdcAddress, erc20Abi, signer);
  
  // 2. Calculate total token requirements
  const totalVestingAmount = employees.reduce((sum, emp) => 
    sum + (emp.equityAmount || 0), 0
  );
  const totalSavingsAmount = employees.reduce((sum, emp) => 
    sum + (emp.savingsAmount || 0), 0
  );
  const totalRequired = totalVestingAmount + totalSavingsAmount;
  
  console.log(`Total tokens required: ${totalRequired} USDC`);
  
  // 3. Check and approve tokens
  const balance = await usdcContract.balanceOf(address);
  if (balance.lt(ethers.parseUnits(totalRequired.toString(), 6))) {
    throw new Error("Insufficient USDC balance");
  }
  
  // Approve for vesting
  if (totalVestingAmount > 0) {
    const vestingAmount = ethers.parseUnits(totalVestingAmount.toString(), 6);
    await usdcContract.approve(vestingAddress, vestingAmount);
  }
  
  // Approve for locking
  if (totalSavingsAmount > 0) {
    const savingsAmount = ethers.parseUnits(totalSavingsAmount.toString(), 6);
    await usdcContract.approve(lockerAddress, savingsAmount);
  }
  
  // 4. Create vesting schedules
  const vestingResults = [];
  if (totalVestingAmount > 0) {
    const recipients = employees.filter(e => e.equityAmount > 0);
    
    if (recipients.length === 1) {
      // Single vesting schedule
      const employee = recipients[0];
      const tx = await vestingContract.createVestingSchedule(
        usdcAddress,
        employee.wallet,
        ethers.parseUnits(employee.equityAmount.toString(), 6),
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + (4 * 365 * 24 * 60 * 60), // 4 years
        6, // Monthly
        false,
        `Equity Vesting - ${employee.name}`,
        employee.email,
        1, // SENDER_ONLY cancel
        1  // SENDER_ONLY change
      );
      vestingResults.push(await tx.wait());
    } else {
      // Multiple vesting schedules
      const wallets = recipients.map(e => e.wallet);
      const amounts = recipients.map(e => 
        ethers.parseUnits(e.equityAmount.toString(), 6)
      );
      const titles = recipients.map(e => `Equity Vesting - ${e.name}`);
      const emails = recipients.map(e => e.email);
      
      const tx = await vestingContract.createMultipleVestingSchedules(
        usdcAddress,
        wallets,
        amounts,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + (4 * 365 * 24 * 60 * 60),
        6, // Monthly
        false,
        titles,
        emails,
        1, // SENDER_ONLY cancel
        1  // SENDER_ONLY change
      );
      vestingResults.push(await tx.wait());
    }
  }
  
  // 5. Create savings locks (if any employees want them)
  const lockResults = [];
  for (const employee of employees.filter(e => e.savingsAmount > 0)) {
    const tx = await lockerContract.lock(
      employee.wallet,
      usdcAddress,
      false,
      ethers.parseUnits(employee.savingsAmount.toString(), 6),
      Math.floor(Date.now() / 1000) + (employee.savingsMonths * 30 * 24 * 60 * 60),
      `Initial Savings Lock - ${employee.name}`
    );
    lockResults.push(await tx.wait());
  }
  
  console.log(`Setup complete:`);
  console.log(`- Created ${vestingResults.length} vesting batch(es)`);
  console.log(`- Created ${lockResults.length} savings locks`);
  
  return {
    vesting: vestingResults,
    locks: lockResults,
    totalTokensUsed: totalRequired
  };
};

// Usage
const employees = [
  {
    name: "Alice Johnson",
    wallet: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    email: "alice@company.com",
    equityAmount: 40000,  // 40k USDC equity
    savingsAmount: 5000,  // 5k USDC savings
    savingsMonths: 12     // 1 year lock
  },
  {
    name: "Bob Smith",
    wallet: "0x123d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
    email: "bob@company.com",
    equityAmount: 30000,
    savingsAmount: 3000,
    savingsMonths: 6
  }
];

await setupEmployerContracts(employees);
```

### **Employee Complete Dashboard**

```javascript
const EmployeeFinancialDashboard = () => {
  const [vestingData, setVestingData] = useState({
    schedules: [],
    totalVested: '0',
    totalClaimed: '0',
    availableToClaim: '0'
  });
  
  const [savingsData, setSavingsData] = useState({
    locks: [],
    totalLocked: '0',
    totalWithdrawable: '0'
  });
  
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    loadAllData();
  }, [address]);

  const loadAllData = async () => {
    if (!address) return;
    
    setLoading(true);
    
    try {
      // Load vesting data
      await loadVestingData();
      
      // Load savings data  
      await loadSavingsData();
      
    } catch (error) {
      console.error('Failed to load financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const loadVestingData = async () => {
    const vestingContract = new ethers.Contract(vestingAddress, vestingAbi, provider);
    
    const scheduleIds = await vestingContract.getRecipientSchedules(address);
    const schedules = [];
    
    let totalVested = ethers.BigNumber.from(0);
    let totalClaimed = ethers.BigNumber.from(0);
    let totalAvailable = ethers.BigNumber.from(0);
    
    for (const scheduleId of scheduleIds) {
      const schedule = await vestingContract.getScheduleById(scheduleId);
      const releasable = await vestingContract.getReleasableAmount(scheduleId);
      
      schedules.push({
        ...schedule,
        releasableAmount: releasable,
        progress: schedule.totalAmount.gt(0) 
          ? schedule.releasedAmount.mul(100).div(schedule.totalAmount).toNumber()
          : 0
      });
      
      totalVested = totalVested.add(schedule.totalAmount);
      totalClaimed = totalClaimed.add(schedule.releasedAmount);
      totalAvailable = totalAvailable.add(releasable);
    }
    
    setVestingData({
      schedules,
      totalVested: ethers.formatUnits(totalVested, 6),
      totalClaimed: ethers.formatUnits(totalClaimed, 6),
      availableToClaim: ethers.formatUnits(totalAvailable, 6)
    });
  };

  const loadSavingsData = async () => {
    const lockerContract = new ethers.Contract(lockerAddress, lockerAbi, provider);
    
    const locks = await lockerContract.normalLocksForUser(address);
    const locksWithDetails = [];
    
    let totalLocked = ethers.BigNumber.from(0);
    let totalWithdrawable = ethers.BigNumber.from(0);
    
    for (const lock of locks) {
      let withdrawable = ethers.BigNumber.from(0);
      
      if (lock.tgeBps > 0) {
        withdrawable = await lockerContract.withdrawableTokens(lock.id);
      } else {
        const now = Math.floor(Date.now() / 1000);
        if (now >= lock.tgeDate && lock.unlockedAmount.eq(0)) {
          withdrawable = lock.amount;
        }
      }
      
      locksWithDetails.push({
        ...lock,
        withdrawableAmount: withdrawable,
        isUnlockable: withdrawable.gt(0),
        unlockDate: new Date(lock.tgeDate * 1000)
      });
      
      totalLocked = totalLocked.add(lock.amount.sub(lock.unlockedAmount));
      totalWithdrawable = totalWithdrawable.add(withdrawable);
    }
    
    setSavingsData({
      locks: locksWithDetails,
      totalLocked: ethers.formatUnits(totalLocked, 6),
      totalWithdrawable: ethers.formatUnits(totalWithdrawable, 6)
    });
  };

  const claimAllVesting = async () => {
    const vestingContract = new ethers.Contract(vestingAddress, vestingAbi, signer);
    
    try {
      const tx = await vestingContract.releaseAll(address);
      await tx.wait();
      
      toast.success('Successfully claimed all available vested tokens!');
      await loadVestingData();
    } catch (error) {
      toast.error('Failed to claim vested tokens');
    }
  };

  const unlockAllSavings = async () => {
    const lockerContract = new ethers.Contract(lockerAddress, lockerAbi, signer);
    
    const unlockableIds = savingsData.locks
      .filter(lock => lock.isUnlockable)
      .map(lock => lock.id);
    
    try {
      for (const lockId of unlockableIds) {
        const tx = await lockerContract.unlock(lockId);
        await tx.wait();
      }
      
      toast.success(`Successfully unlocked ${unlockableIds.length} savings locks!`);
      await loadSavingsData();
    } catch (error) {
      toast.error('Failed to unlock savings');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="financial-dashboard">
      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard 
          title="Total Equity Vested"
          value={`${vestingData.totalVested} USDC`}
          subtitle={`${vestingData.totalClaimed} claimed`}
        />
        <SummaryCard 
          title="Available to Claim"
          value={`${vestingData.availableToClaim} USDC`}
          subtitle="From vesting schedules"
          action={parseFloat(vestingData.availableToClaim) > 0 && (
            <button onClick={claimAllVesting}>Claim All</button>
          )}
        />
        <SummaryCard 
          title="Savings Locked"
          value={`${savingsData.totalLocked} USDC`}
          subtitle={`${savingsData.locks.length} active locks`}
        />
        <SummaryCard 
          title="Available to Unlock"
          value={`${savingsData.totalWithdrawable} USDC`}
          subtitle="From savings locks"
          action={parseFloat(savingsData.totalWithdrawable) > 0 && (
            <button onClick={unlockAllSavings}>Unlock All</button>
          )}
        />
      </div>

      {/* Vesting Schedules */}
      <div className="section">
        <h2>Equity Vesting Schedules</h2>
        <div className="schedules-grid">
          {vestingData.schedules.map((schedule) => (
            <VestingScheduleCard 
              key={schedule.id} 
              schedule={schedule}
              onClaim={() => claimVestedTokens(schedule.id)}
            />
          ))}
        </div>
      </div>

      {/* Savings Locks */}
      <div className="section">
        <h2>Savings Locks</h2>
        <div className="locks-grid">
          {savingsData.locks.map((lock) => (
            <SavingsLockCard 
              key={lock.id} 
              lock={lock}
              onUnlock={() => unlockSavings(lock.id)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="actions-section">
        <button onClick={() => setShowCreateLock(true)}>
          Create New Savings Lock
        </button>
        <button onClick={() => setShowTransferTokens(true)}>
          Transfer Tokens
        </button>
      </div>
    </div>
  );
};
```

---

## 🛡️ Security Features

### **Access Control**
- **Owner-only functions**: Emergency controls and fee management
- **Permission-based operations**: Vesting cancellation and recipient changes
- **Non-reentrant functions**: Protection against reentrancy attacks

### **Input Validation**
- **Address validation**: Zero address checks
- **Amount validation**: Positive amount requirements
- **Time validation**: Future date requirements for vesting/locking

### **Fee Protection**
- **Maximum fee limits**: Caps on fee percentages
- **Fee recipient validation**: Prevents zero address fee recipients

### **Emergency Controls**
```solidity
// VestPayment.sol
function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner;
function setVestingFeePercentage(uint256 _feePercentage) external onlyOwner;

// TokenLocker.sol  
function WithdrawETH(address payable _receiver, uint256 _amount) public onlyOwner;
function setFeeRecipient(address _feeRecipient) public onlyOwner;
```

---

## 📊 Gas Optimization

### **Batch Operations**
Both contracts support batch operations to reduce gas costs:
- `createMultipleVestingSchedules`: Create multiple vesting schedules in one transaction
- `multipleVestingLock`: Create multiple locks in one transaction

### **Efficient Storage**
- **Packed structs**: Optimized storage layout
- **EnumerableSet**: Gas-efficient set operations
- **Minimal external calls**: Reduced cross-contract calls

---

## 🧪 Testing

### **Contract Testing with Foundry**

```solidity
// test/VestPayment.t.sol
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/VestPayment.sol";
import "../src/Tether.sol";

contract VestPaymentTest is Test {
    MultiTokenVestingManager vesting;
    Tether usdt;
    
    address employer = address(0x1);
    address employee = address(0x2);
    
    function setUp() public {
        vesting = new MultiTokenVestingManager();
        usdt = new Tether();
        
        // Setup test tokens
        usdt.transfer(employer, 1000000 * 10**6); // 1M USDT
        
        vm.prank(employer);
        usdt.approve(address(vesting), type(uint256).max);
    }
    
    function testCreateVestingSchedule() public {
        vm.prank(employer);
        
        uint256 scheduleId = vesting.createVestingSchedule(
            address(usdt),
            employee,
            100000 * 10**6, // 100k USDT
            block.timestamp,
            block.timestamp + 365 days,
            MultiTokenVestingManager.UnlockSchedule.MONTHLY,
            false,
            "Test Vesting",
            "test@example.com",
            MultiTokenVestingManager.CancelPermission.SENDER_ONLY,
            MultiTokenVestingManager.ChangeRecipientPermission.SENDER_ONLY
        );
        
        assertGt(scheduleId, 0);
        
        // Verify schedule details
        MultiTokenVestingManager.VestingSchedule memory schedule = 
            vesting.getScheduleById(scheduleId);
        
        assertEq(schedule.sender, employer);
        assertEq(schedule.recipient, employee);
        assertEq(schedule.totalAmount, 100000 * 10**6);
    }
    
    function testReleaseTokens() public {
        // Create vesting schedule
        vm.prank(employer);
        uint256 scheduleId = vesting.createVestingSchedule(
            address(usdt),
            employee,
            12000 * 10**6, // 12k USDT (1k per month)
            block.timestamp,
            block.timestamp + 365 days,
            MultiTokenVestingManager.UnlockSchedule.MONTHLY,
            false,
            "Test Vesting",
            "test@example.com",
            MultiTokenVestingManager.CancelPermission.SENDER_ONLY,
            MultiTokenVestingManager.ChangeRecipientPermission.SENDER_ONLY
        );
        
        // Fast forward 1 month
        vm.warp(block.timestamp + 30 days);
        
        // Employee claims tokens
        uint256 releasable = vesting.getReleasableAmount(scheduleId);
        assertGt(releasable, 0);
        
        uint256 balanceBefore = usdt.balanceOf(employee);
        
        vm.prank(employee);
        vesting.release(scheduleId);
        
        uint256 balanceAfter = usdt.balanceOf(employee);
        assertGt(balanceAfter, balanceBefore);
    }
}
```

### **Integration Testing**

```javascript
// test/integration.test.js
describe('VPay Contract Integration', () => {
  let vestingContract, lockerContract, usdcContract;
  let employer, employee;

  beforeEach(async () => {
    [employer, employee] = await ethers.getSigners();
    
    // Deploy contracts
    const VestingFactory = await ethers.getContractFactory('MultiTokenVestingManager');
    vestingContract = await VestingFactory.deploy();
    
    const LockerFactory = await ethers.getContractFactory('TokenLocker');
    lockerContract = await LockerFactory.deploy();
    
    const USDCFactory = await ethers.getContractFactory('Circle');
    usdcContract = await USDCFactory.deploy();
    
    // Setup tokens
    await usdcContract.transfer(employer.address, ethers.parseUnits('1000000', 6));
    await usdcContract.connect(employer).approve(vestingContract.address, ethers.constants.MaxUint256);
    await usdcContract.connect(employer).approve(lockerContract.address, ethers.constants.MaxUint256);
  });

  it('should create complete employee package', async () => {
    const equityAmount = ethers.parseUnits('40000', 6); // 40k USDC equity
    const savingsAmount = ethers.parseUnits('5000', 6);  // 5k USDC savings
    
    // Create vesting schedule
    const vestingTx = await vestingContract.connect(employer).createVestingSchedule(
      usdcContract.address,
      employee.address,
      equityAmount,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + (4 * 365 * 24 * 60 * 60),
      6, // Monthly
      false,
      'Employee Equity',
      'employee@company.com',
      1, 1
    );
    
    const vestingReceipt = await vestingTx.wait();
    const scheduleId = vestingReceipt.events[0].args.scheduleId;
    
    // Create savings lock
    const lockTx = await lockerContract.connect(employer).lock(
      employee.address,
      usdcContract.address,
      false,
      savingsAmount,
      Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
      'Employee Savings'
    );
    
    const lockReceipt = await lockTx.wait();
    const lockId = lockReceipt.events.find(e => e.event === 'LockAdded').args.id;
    
    // Verify both were created
    const schedule = await vestingContract.getScheduleById(scheduleId);
    const lock = await lockerContract.getLockById(lockId);
    
    expect(schedule.recipient).to.equal(employee.address);
    expect(schedule.totalAmount).to.equal(equityAmount);
    expect(lock.owner).to.equal(employee.address);
    expect(lock.amount).to.equal(savingsAmount);
  });

  it('should handle full employee lifecycle', async () => {
    // ... test vesting creation, partial claims, lock creation, unlocking, etc.
  });
});
```

---

This comprehensive smart contract documentation provides everything needed to understand and integrate with VPay's blockchain layer. The contracts are designed for security, efficiency, and ease of use in Web3 workplace management scenarios.