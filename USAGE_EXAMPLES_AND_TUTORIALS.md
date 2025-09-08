# VPay Usage Examples & Tutorials

## 🎯 Overview

This comprehensive guide provides step-by-step tutorials and real-world usage examples for VPay's Web3 workplace management platform. Whether you're an employer setting up payroll or an employee managing your benefits, these tutorials will guide you through every aspect of the system.

## 📚 Table of Contents

1. [Getting Started](#getting-started)
2. [Employer Tutorials](#employer-tutorials)
3. [Employee Tutorials](#employee-tutorials)
4. [Smart Contract Interactions](#smart-contract-interactions)
5. [API Usage Examples](#api-usage-examples)
6. [Advanced Workflows](#advanced-workflows)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### **Tutorial 1: First-Time Setup**

#### **Prerequisites**
- Web3 wallet (MetaMask recommended)
- Some ETH/MATIC for gas fees
- USDC/USDT tokens for testing

#### **Step 1: Connect Your Wallet**
```javascript
// The app automatically detects your wallet
// 1. Visit https://your-vpay-app.com
// 2. Click "Connect Wallet"
// 3. Select your preferred wallet (MetaMask, WalletConnect, etc.)
// 4. Approve the connection request
// 5. Ensure you're on the correct network (Ethereum/Polygon)
```

#### **Step 2: Determine Your Role**
The system automatically detects whether you're an employer or employee:

- **Employer**: If you have employees in the system
- **Employee**: If you don't have employees (default view)

#### **Step 3: Dashboard Overview**
```javascript
// Employer Dashboard shows:
// - Total employees
// - Monthly payroll
// - Pending payments
// - Payment statistics

// Employee Dashboard shows:
// - Total earnings
// - Pending payments
// - Vesting balance
// - Locked savings
```

---

## 👔 Employer Tutorials

### **Tutorial 2: Setting Up Your First Employee**

#### **Step 1: Navigate to Employee Management**
```javascript
// From the sidebar, click "Employees" or navigate to /contact
// You'll see the employee management interface
```

#### **Step 2: Add Your First Employee**
```javascript
// Click "Add Employee" button
// Fill in the form with:

const employeeData = {
  fullName: "Alice Johnson",
  walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Employee's wallet
  email: "alice.johnson@company.com",
  label: "Senior Full Stack Developer",
  isActive: true
};

// The system will:
// 1. Validate the wallet address format
// 2. Check for duplicates
// 3. Send a welcome email to the employee
// 4. Add them to your employee database
```

#### **Step 3: Verify Employee Addition**
```javascript
// After successful addition, you'll see:
// - Employee appears in the employee list
// - Employee count increases in dashboard
// - Welcome email sent confirmation
```

### **Tutorial 3: Setting Up Monthly Payroll**

#### **Step 1: Create Recurring Payroll Invoice**
```javascript
// Navigate to "Invoices" → "Create Invoice"

const payrollInvoice = {
  invoiceNumber: 2024001, // Auto-generated or custom
  client: {
    name: "Alice Johnson",
    email: "alice.johnson@company.com"
  },
  items: [{
    itemName: "Monthly Salary - Senior Developer",
    qty: 1,
    price: 8000, // $8,000 monthly salary
    amtAfterDiscount: 8000
  }],
  grandTotal: 8000,
  currency: "USDC",
  paymentMethod: "crypto",
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  
  // Recurring settings for automatic monthly payroll
  recurring: {
    isRecurring: true,
    frequency: { type: "monthly" },
    endCondition: { type: "never" } // Continuous until stopped
  }
};

// The system will:
// 1. Create the invoice
// 2. Send it to the employee's email
// 3. Set up automatic monthly generation
// 4. Track payment status
```

#### **Step 2: Process Payment**
```javascript
// When employee pays the invoice:
// 1. Employee connects wallet and pays via crypto
// 2. System verifies blockchain transaction
// 3. Updates payment status to "Paid"
// 4. Automatically generates next month's invoice
// 5. Sends payment confirmation emails
```

### **Tutorial 4: Setting Up Employee Equity Vesting**

#### **Step 1: Prepare for Vesting Contract**
```javascript
// You'll need:
// - USDC tokens for the vesting amount
// - ETH for gas fees
// - Employee wallet addresses
// - Vesting parameters

const vestingParams = {
  token: "0xA0b86a33E6441E13C7c6C3B0A4e5Dd96C2D5C7e2", // USDC
  employee: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  amount: "40000", // 40,000 USDC over 4 years
  startTime: Math.floor(Date.now() / 1000), // Now
  endTime: Math.floor(Date.now() / 1000) + (4 * 365 * 24 * 60 * 60), // 4 years
  unlockSchedule: 6, // Monthly (enum value)
  autoClaim: false, // Employee must claim manually
  contractTitle: "Equity Vesting - Alice Johnson",
  employeeEmail: "alice.johnson@company.com",
  cancelPermission: 1, // SENDER_ONLY (employer can cancel)
  changeRecipientPermission: 1 // SENDER_ONLY (employer can change recipient)
};
```

#### **Step 2: Create Vesting Schedule via Frontend**
```javascript
// Navigate to "Create Vesting" or "Payroll" → "Create"

const VestingSetupComponent = () => {
  const [formData, setFormData] = useState({
    employeeWallet: '',
    employeeEmail: '',
    vestingAmount: '',
    vestingDuration: 48, // months
    unlockFrequency: 'monthly',
    startDate: new Date(),
    contractTitle: ''
  });

  const handleSubmit = async () => {
    try {
      // 1. Approve USDC tokens for vesting contract
      const tokenContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
      const approveAmount = ethers.parseUnits(formData.vestingAmount, 6);
      
      const approveTx = await tokenContract.approve(VESTING_CONTRACT_ADDRESS, approveAmount);
      await approveTx.wait();
      
      // 2. Create vesting schedule
      const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, VESTING_ABI, signer);
      
      const tx = await vestingContract.createVestingSchedule(
        USDC_ADDRESS,
        formData.employeeWallet,
        approveAmount,
        Math.floor(new Date(formData.startDate).getTime() / 1000),
        Math.floor(new Date(formData.startDate).getTime() / 1000) + (formData.vestingDuration * 30 * 24 * 60 * 60),
        6, // Monthly
        false,
        formData.contractTitle,
        formData.employeeEmail,
        1, // SENDER_ONLY cancel
        1  // SENDER_ONLY change
      );
      
      const receipt = await tx.wait();
      const scheduleId = receipt.events[0].args.scheduleId;
      
      toast.success(`Vesting schedule created! ID: ${scheduleId}`);
      
      // 3. Store reference in database (optional)
      await fetch('/api/vesting-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: scheduleId.toString(),
          employeeWallet: formData.employeeWallet,
          employeeEmail: formData.employeeEmail,
          amount: formData.vestingAmount,
          createdBy: address
        })
      });
      
    } catch (error) {
      toast.error('Failed to create vesting schedule');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields for vesting setup */}
    </form>
  );
};
```

#### **Step 3: Verify Vesting Creation**
```javascript
// After successful creation:
// 1. Transaction confirmed on blockchain
// 2. Employee receives notification email
// 3. Vesting schedule appears in "Vesting Schedules"
// 4. Employee can see it in their dashboard
```

### **Tutorial 5: Batch Employee Setup**

#### **Step 1: Prepare Employee Data**
```javascript
const employees = [
  {
    fullName: "Alice Johnson",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    email: "alice@company.com",
    label: "Senior Developer",
    salary: 8000,
    equityAmount: 40000,
    vestingYears: 4
  },
  {
    fullName: "Bob Smith", 
    walletAddress: "0x123d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
    email: "bob@company.com",
    label: "Product Manager",
    salary: 7000,
    equityAmount: 30000,
    vestingYears: 4
  },
  {
    fullName: "Carol Williams",
    walletAddress: "0x456d35Cc6634C0532925a3b8D4C9db96C4b4d8b8",
    email: "carol@company.com", 
    label: "UX Designer",
    salary: 6000,
    equityAmount: 25000,
    vestingYears: 3
  }
];
```

#### **Step 2: Batch Add Employees**
```javascript
const batchAddEmployees = async (employees) => {
  const results = [];
  
  for (const employee of employees) {
    try {
      // Add employee to database
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: employee.fullName,
          walletAddress: employee.walletAddress,
          email: employee.email,
          label: employee.label,
          savedBy: address // Your wallet address
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        results.push({ employee: employee.fullName, status: 'added', id: result.data._id });
        console.log(`✅ Added employee: ${employee.fullName}`);
      } else {
        results.push({ employee: employee.fullName, status: 'failed', error: result.message });
        console.log(`❌ Failed to add: ${employee.fullName} - ${result.message}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results.push({ employee: employee.fullName, status: 'error', error: error.message });
      console.log(`❌ Error adding ${employee.fullName}:`, error);
    }
  }
  
  return results;
};

// Usage
const results = await batchAddEmployees(employees);
console.log('Batch add results:', results);
```

#### **Step 3: Batch Create Vesting Schedules**
```javascript
const batchCreateVesting = async (employees) => {
  const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, VESTING_ABI, signer);
  const tokenContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
  
  // Calculate total amount needed
  const totalAmount = employees.reduce((sum, emp) => sum + emp.equityAmount, 0);
  const totalAmountWei = ethers.parseUnits(totalAmount.toString(), 6);
  
  // Approve total amount
  console.log(`Approving ${totalAmount} USDC for vesting...`);
  const approveTx = await tokenContract.approve(VESTING_CONTRACT_ADDRESS, totalAmountWei);
  await approveTx.wait();
  
  // Prepare arrays for batch creation
  const recipients = employees.map(emp => emp.walletAddress);
  const amounts = employees.map(emp => ethers.parseUnits(emp.equityAmount.toString(), 6));
  const titles = employees.map(emp => `Equity Vesting - ${emp.fullName}`);
  const emails = employees.map(emp => emp.email);
  
  // Create multiple vesting schedules in one transaction
  console.log('Creating vesting schedules for all employees...');
  const tx = await vestingContract.createMultipleVestingSchedules(
    USDC_ADDRESS,
    recipients,
    amounts,
    Math.floor(Date.now() / 1000), // Start now
    Math.floor(Date.now() / 1000) + (4 * 365 * 24 * 60 * 60), // 4 years
    6, // Monthly
    false, // Manual claim
    titles,
    emails,
    1, // SENDER_ONLY cancel
    1  // SENDER_ONLY change
  );
  
  const receipt = await tx.wait();
  
  // Extract schedule IDs from events
  const scheduleIds = receipt.events
    .filter(event => event.event === 'VestingScheduleCreated')
    .map(event => event.args.scheduleId);
  
  console.log(`✅ Created ${scheduleIds.length} vesting schedules:`, scheduleIds);
  
  return scheduleIds;
};

// Usage
const scheduleIds = await batchCreateVesting(employees);
```

#### **Step 4: Setup Recurring Payroll for All**
```javascript
const setupBatchPayroll = async (employees) => {
  const payrollInvoices = [];
  
  for (const employee of employees) {
    const invoiceData = {
      invoiceNumber: `PAY-${Date.now()}-${employee.fullName.replace(/\s+/g, '')}`,
      creatorId: address,
      client: {
        name: employee.fullName,
        email: employee.email
      },
      items: [{
        itemName: `Monthly Salary - ${employee.label}`,
        qty: 1,
        price: employee.salary,
        amtAfterDiscount: employee.salary
      }],
      grandTotal: employee.salary,
      currency: "USDC",
      paymentMethod: "crypto",
      notes: `Monthly salary for ${employee.fullName}`,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      recurring: {
        isRecurring: true,
        frequency: { type: "monthly" },
        endCondition: { type: "never" }
      }
    };
    
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        payrollInvoices.push(result.data);
        console.log(`✅ Payroll setup for ${employee.fullName}: Invoice #${result.data.invoiceNumber}`);
      } else {
        console.log(`❌ Failed to setup payroll for ${employee.fullName}:`, result.message);
      }
      
      // Delay to avoid overwhelming the email service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ Error setting up payroll for ${employee.fullName}:`, error);
    }
  }
  
  return payrollInvoices;
};

// Usage
const payrollInvoices = await setupBatchPayroll(employees);
console.log(`✅ Setup complete! Created ${payrollInvoices.length} recurring payroll invoices`);
```

---

## 👤 Employee Tutorials

### **Tutorial 6: Employee Dashboard Overview**

#### **Step 1: Understanding Your Dashboard**
```javascript
// When you connect as an employee, you'll see:

const EmployeeDashboardData = {
  totalEarnings: 96000,        // All-time earnings
  pendingPayments: 8000,       // Outstanding invoices
  vestingBalance: 40000,       // Total equity vested
  availableToClaim: 3333,      // Vested tokens ready to claim
  lockedSavings: 15000,        // Personal savings locks
  activeInvoices: 12,          // Total invoices received
  paidInvoices: 11,           // Completed payments
  nextVestingUnlock: "2024-02-01" // Next vesting release date
};
```

#### **Step 2: Navigation Overview**
```javascript
// Employee sidebar sections:
const employeeNavigation = {
  main: [
    { path: '/', label: 'Dashboard' }
  ],
  income: [
    { path: '/invoices', label: 'My Invoices' },
    { path: '/invoices/create', label: 'Create Invoice' },
    { path: '/payments', label: 'Payment History' },
    { path: '/receipts', label: 'Receipts' }
  ],
  benefits: [
    { path: '/vesting-schedules', label: 'My Vesting' }
  ],
  savings: [
    { path: '/create-lock', label: 'Lock Tokens' },
    { path: '/token-lock', label: 'My Locks' }
  ]
};
```

### **Tutorial 7: Managing Your Salary Payments**

#### **Step 1: View Received Invoices**
```javascript
// Navigate to "My Invoices" to see salary invoices from your employer
// You'll see invoices with status:
// - "Awaiting Payment" (need to pay)
// - "Paid" (completed)
// - "Overdue" (past due date)
// - "Partially Paid" (partial payment made)
```

#### **Step 2: Pay Your Salary Invoice**
```javascript
const payInvoice = async (invoiceId, amount) => {
  try {
    // 1. Ensure you have enough USDC
    const tokenContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
    const balance = await tokenContract.balanceOf(address);
    const paymentAmount = ethers.parseUnits(amount.toString(), 6);
    
    if (balance.lt(paymentAmount)) {
      toast.error('Insufficient USDC balance');
      return;
    }
    
    // 2. Send payment transaction
    const tx = await tokenContract.transfer(employerAddress, paymentAmount);
    const receipt = await tx.wait();
    
    // 3. Record payment in the system
    const paymentData = {
      amountPaid: amount,
      note: `Salary payment - ${new Date().toLocaleDateString()}`,
      payerWalletAddr: address,
      paymentType: "crypto",
      txnHash: receipt.transactionHash,
      cryptoToken: "USDC"
    };
    
    const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Payment sent successfully!');
      // If this was a recurring invoice, next month's invoice is auto-generated
    }
    
  } catch (error) {
    toast.error('Payment failed');
    console.error('Payment error:', error);
  }
};
```

### **Tutorial 8: Managing Your Vesting Schedule**

#### **Step 1: View Your Vesting Schedules**
```javascript
// Navigate to "My Vesting" to see all your equity vesting schedules

const loadVestingData = async () => {
  const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, VESTING_ABI, provider);
  
  // Get your vesting schedule IDs
  const scheduleIds = await vestingContract.getRecipientSchedules(address);
  
  const schedules = [];
  for (const scheduleId of scheduleIds) {
    const schedule = await vestingContract.getScheduleById(scheduleId);
    const releasableAmount = await vestingContract.getReleasableAmount(scheduleId);
    const vestedAmount = await vestingContract.getVestedAmount(scheduleId);
    
    schedules.push({
      id: scheduleId,
      contractTitle: schedule.contractTitle,
      totalAmount: ethers.formatUnits(schedule.totalAmount, 6),
      releasedAmount: ethers.formatUnits(schedule.releasedAmount, 6),
      releasableAmount: ethers.formatUnits(releasableAmount, 6),
      vestedAmount: ethers.formatUnits(vestedAmount, 6),
      startTime: new Date(schedule.startTime * 1000),
      endTime: new Date(schedule.endTime * 1000),
      progress: schedule.totalAmount.gt(0) 
        ? schedule.releasedAmount.mul(100).div(schedule.totalAmount).toNumber()
        : 0
    });
  }
  
  return schedules;
};
```

#### **Step 2: Claim Vested Tokens**
```javascript
const claimVestedTokens = async (scheduleId) => {
  const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, VESTING_ABI, signer);
  
  try {
    // Check releasable amount
    const releasableAmount = await vestingContract.getReleasableAmount(scheduleId);
    
    if (releasableAmount.eq(0)) {
      toast.info('No tokens available to claim yet');
      return;
    }
    
    // Claim tokens
    const tx = await vestingContract.release(scheduleId);
    const receipt = await tx.wait();
    
    // Calculate amount claimed (accounting for fees)
    const releaseEvent = receipt.events.find(e => e.event === 'TokensReleased');
    const claimedAmount = ethers.formatUnits(releaseEvent.args.amount, 6);
    
    toast.success(`Successfully claimed ${claimedAmount} USDC!`);
    
    // Refresh vesting data
    await loadVestingData();
    
  } catch (error) {
    toast.error('Failed to claim tokens');
    console.error('Claim error:', error);
  }
};
```

#### **Step 3: Claim All Available Tokens**
```javascript
const claimAllAvailable = async () => {
  const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, VESTING_ABI, signer);
  
  try {
    const tx = await vestingContract.releaseAll(address);
    const receipt = await tx.wait();
    
    // Parse all release events
    const releaseEvents = receipt.events.filter(e => e.event === 'TokensReleased');
    let totalClaimed = ethers.BigNumber.from(0);
    
    releaseEvents.forEach(event => {
      totalClaimed = totalClaimed.add(event.args.amount);
    });
    
    const claimedAmount = ethers.formatUnits(totalClaimed, 6);
    toast.success(`Claimed ${claimedAmount} USDC from ${releaseEvents.length} schedules!`);
    
  } catch (error) {
    toast.error('Failed to claim tokens');
  }
};
```

### **Tutorial 9: Creating Personal Savings Locks**

#### **Step 1: Lock Tokens for Savings**
```javascript
const createSavingsLock = async (amount, lockDurationMonths) => {
  const lockerContract = new ethers.Contract(TOKEN_LOCKER_ADDRESS, LOCKER_ABI, signer);
  const tokenContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
  
  try {
    // Calculate unlock date
    const unlockDate = new Date();
    unlockDate.setMonth(unlockDate.getMonth() + lockDurationMonths);
    const unlockTimestamp = Math.floor(unlockDate.getTime() / 1000);
    
    const lockAmount = ethers.parseUnits(amount.toString(), 6);
    
    // 1. Approve tokens for locking
    const approveTx = await tokenContract.approve(TOKEN_LOCKER_ADDRESS, lockAmount);
    await approveTx.wait();
    
    // 2. Create lock
    const lockTx = await lockerContract.lock(
      address,                    // Owner
      USDC_ADDRESS,              // Token
      false,                     // Not LP token
      lockAmount,                // Amount
      unlockTimestamp,           // Unlock date
      `Savings Lock - ${lockDurationMonths} months` // Description
    );
    
    const receipt = await lockTx.wait();
    const lockEvent = receipt.events.find(e => e.event === 'LockAdded');
    const lockId = lockEvent.args.id;
    
    toast.success(`Successfully locked ${amount} USDC for ${lockDurationMonths} months!`);
    
    return lockId;
    
  } catch (error) {
    toast.error('Failed to create savings lock');
    console.error('Lock error:', error);
  }
};
```

#### **Step 2: View Your Savings Locks**
```javascript
const loadSavingsLocks = async () => {
  const lockerContract = new ethers.Contract(TOKEN_LOCKER_ADDRESS, LOCKER_ABI, provider);
  
  // Get user's locks
  const locks = await lockerContract.normalLocksForUser(address);
  
  const locksWithDetails = [];
  
  for (const lock of locks) {
    let withdrawableAmount = ethers.BigNumber.from(0);
    
    // Check if lock is withdrawable
    if (lock.tgeBps > 0) {
      // Vesting lock - check withdrawable amount
      withdrawableAmount = await lockerContract.withdrawableTokens(lock.id);
    } else {
      // Simple lock - check if unlock date has passed
      const now = Math.floor(Date.now() / 1000);
      if (now >= lock.tgeDate && lock.unlockedAmount.eq(0)) {
        withdrawableAmount = lock.amount;
      }
    }
    
    locksWithDetails.push({
      id: lock.id,
      description: lock.description,
      amount: ethers.formatUnits(lock.amount, 6),
      unlockedAmount: ethers.formatUnits(lock.unlockedAmount, 6),
      withdrawableAmount: ethers.formatUnits(withdrawableAmount, 6),
      unlockDate: new Date(lock.tgeDate * 1000),
      isUnlockable: withdrawableAmount.gt(0),
      lockDate: new Date(lock.lockDate * 1000)
    });
  }
  
  return locksWithDetails;
};
```

#### **Step 3: Unlock Your Savings**
```javascript
const unlockSavings = async (lockId) => {
  const lockerContract = new ethers.Contract(TOKEN_LOCKER_ADDRESS, LOCKER_ABI, signer);
  
  try {
    // Check if unlockable
    const lock = await lockerContract.getLockById(lockId);
    const now = Math.floor(Date.now() / 1000);
    
    if (now < lock.tgeDate) {
      toast.error('Tokens are not yet unlockable');
      return;
    }
    
    // Unlock tokens
    const tx = await lockerContract.unlock(lockId);
    const receipt = await tx.wait();
    
    // Find unlock event
    const unlockEvent = receipt.events.find(e => 
      e.event === 'LockRemoved' || e.event === 'LockVested'
    );
    
    if (unlockEvent) {
      const unlockedAmount = ethers.formatUnits(unlockEvent.args.amount, 6);
      toast.success(`Successfully unlocked ${unlockedAmount} USDC! (1% fee deducted)`);
    }
    
    // Refresh locks data
    await loadSavingsLocks();
    
  } catch (error) {
    toast.error('Failed to unlock tokens');
    console.error('Unlock error:', error);
  }
};
```

### **Tutorial 10: Creating Freelance Invoices**

#### **Step 1: Create Professional Invoice**
```javascript
const createFreelanceInvoice = async (invoiceData) => {
  try {
    const invoice = {
      invoiceNumber: generateInvoiceNumber(), // Your custom numbering
      creatorId: address, // Your wallet address
      client: {
        name: invoiceData.clientName,
        email: invoiceData.clientEmail
      },
      items: invoiceData.items.map(item => ({
        itemName: item.description,
        qty: item.quantity,
        price: item.rate,
        discPercent: item.discount || 0,
        amtAfterDiscount: item.quantity * item.rate * (1 - (item.discount || 0) / 100),
        discValue: item.quantity * item.rate * (item.discount || 0) / 100,
        amtBeforeDiscount: item.quantity * item.rate
      })),
      issueDate: new Date(),
      dueDate: new Date(Date.now() + invoiceData.paymentTerms * 24 * 60 * 60 * 1000),
      grandTotal: calculateTotal(invoiceData.items),
      currency: "USDC",
      paymentMethod: "crypto",
      notes: invoiceData.notes || '',
      recurring: invoiceData.isRecurring ? {
        isRecurring: true,
        frequency: { type: invoiceData.frequency },
        endCondition: { 
          type: invoiceData.endCondition.type,
          value: invoiceData.endCondition.value
        }
      } : undefined
    };
    
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Invoice created and sent to client!');
      return result.data;
    } else {
      throw new Error(result.message);
    }
    
  } catch (error) {
    toast.error('Failed to create invoice');
    console.error('Invoice creation error:', error);
  }
};

// Example usage
const freelanceInvoiceData = {
  clientName: "ACME Corporation",
  clientEmail: "billing@acme.com",
  items: [
    {
      description: "Frontend Development - User Dashboard",
      quantity: 40,
      rate: 125,
      discount: 0
    },
    {
      description: "API Integration - Payment System", 
      quantity: 20,
      rate: 150,
      discount: 5 // 5% discount
    }
  ],
  paymentTerms: 30, // 30 days
  notes: "Payment due within 30 days. Late fees may apply.",
  isRecurring: false
};

const invoice = await createFreelanceInvoice(freelanceInvoiceData);
```

---

## 🔗 Smart Contract Interactions

### **Tutorial 11: Direct Contract Interactions**

#### **Step 1: Setting Up Contract Instances**
```javascript
// Contract addresses (update with your deployed addresses)
const CONTRACTS = {
  VESTING: "0x...", // VestPayment contract
  LOCKER: "0x...",  // TokenLocker contract
  USDC: "0xA0b86a33E6441E13C7c6C3B0A4e5Dd96C2D5C7e2", // USDC mainnet
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7"  // USDT mainnet
};

// ABI imports (in a real app, these would be imported from generated files)
import { VESTING_ABI } from './abis/VestPayment.json';
import { LOCKER_ABI } from './abis/TokenLocker.json';
import { ERC20_ABI } from './abis/ERC20.json';

// Contract instances
const getContracts = (signer) => ({
  vesting: new ethers.Contract(CONTRACTS.VESTING, VESTING_ABI, signer),
  locker: new ethers.Contract(CONTRACTS.LOCKER, LOCKER_ABI, signer),
  usdc: new ethers.Contract(CONTRACTS.USDC, ERC20_ABI, signer),
  usdt: new ethers.Contract(CONTRACTS.USDT, ERC20_ABI, signer)
});
```

#### **Step 2: Advanced Vesting Operations**
```javascript
// Create vesting schedule with custom parameters
const createAdvancedVesting = async (params) => {
  const { vesting, usdc } = getContracts(signer);
  
  try {
    // Approve tokens
    const approveAmount = ethers.parseUnits(params.amount.toString(), 6);
    await usdc.approve(CONTRACTS.VESTING, approveAmount);
    
    // Create vesting with specific unlock schedule
    const unlockSchedules = {
      DAILY: 3,
      WEEKLY: 4,
      BIWEEKLY: 5,
      MONTHLY: 6,
      QUARTERLY: 7,
      YEARLY: 8
    };
    
    const tx = await vesting.createVestingSchedule(
      CONTRACTS.USDC,
      params.recipient,
      approveAmount,
      params.startTime,
      params.endTime,
      unlockSchedules[params.schedule],
      params.autoClaim,
      params.title,
      params.email,
      params.cancelPermission,
      params.changePermission
    );
    
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'VestingScheduleCreated');
    
    return event.args.scheduleId;
    
  } catch (error) {
    console.error('Advanced vesting creation failed:', error);
    throw error;
  }
};

// Usage example
const vestingParams = {
  recipient: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  amount: 50000, // 50,000 USDC
  startTime: Math.floor(Date.now() / 1000),
  endTime: Math.floor(Date.now() / 1000) + (2 * 365 * 24 * 60 * 60), // 2 years
  schedule: "MONTHLY",
  autoClaim: false,
  title: "Performance Bonus Vesting",
  email: "employee@company.com",
  cancelPermission: 1, // SENDER_ONLY
  changePermission: 1  // SENDER_ONLY
};

const scheduleId = await createAdvancedVesting(vestingParams);
```

#### **Step 3: Advanced Locking Operations**
```javascript
// Create vesting lock with TGE and cycles
const createVestingLock = async (params) => {
  const { locker, usdc } = getContracts(signer);
  
  try {
    const lockAmount = ethers.parseUnits(params.amount.toString(), 6);
    
    // Approve tokens
    await usdc.approve(CONTRACTS.LOCKER, lockAmount);
    
    // Create vesting lock (25% at TGE, then 25% every 3 months)
    const tx = await locker.vestingLock(
      params.owner,
      CONTRACTS.USDC,
      false, // Not LP token
      lockAmount,
      params.tgeDate,
      2500, // 25% at TGE (2500 basis points)
      90 * 24 * 60 * 60, // 3 months cycle
      2500, // 25% per cycle
      params.description
    );
    
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'LockAdded');
    
    return event.args.id;
    
  } catch (error) {
    console.error('Vesting lock creation failed:', error);
    throw error;
  }
};

// Usage example
const lockParams = {
  owner: address,
  amount: 10000, // 10,000 USDC
  tgeDate: Math.floor(Date.now() / 1000), // Start now
  description: "Gradual Release Savings - 25% every 3 months"
};

const lockId = await createVestingLock(lockParams);
```

#### **Step 4: Batch Operations**
```javascript
// Create multiple locks in one transaction
const createMultipleLocks = async (lockData) => {
  const { locker, usdc } = getContracts(signer);
  
  const owners = lockData.map(data => data.owner);
  const amounts = lockData.map(data => ethers.parseUnits(data.amount.toString(), 6));
  const totalAmount = amounts.reduce((sum, amount) => sum.add(amount), ethers.BigNumber.from(0));
  
  try {
    // Approve total amount
    await usdc.approve(CONTRACTS.LOCKER, totalAmount);
    
    // Create multiple vesting locks
    const tx = await locker.multipleVestingLock(
      owners,
      amounts,
      CONTRACTS.USDC,
      false, // Not LP tokens
      Math.floor(Date.now() / 1000), // TGE date
      1000, // 10% at TGE
      30 * 24 * 60 * 60, // Monthly cycles
      1000, // 10% per cycle
      "Batch Employee Savings Locks"
    );
    
    const receipt = await tx.wait();
    const events = receipt.events.filter(e => e.event === 'LockAdded');
    const lockIds = events.map(e => e.args.id);
    
    return lockIds;
    
  } catch (error) {
    console.error('Batch lock creation failed:', error);
    throw error;
  }
};
```

---

## 🔧 API Usage Examples

### **Tutorial 12: Advanced API Operations**

#### **Step 1: Employee Analytics API**
```javascript
// Get comprehensive employee analytics
const getEmployeeAnalytics = async (employerWallet) => {
  try {
    // Get employee list
    const employeesResponse = await fetch(`/api/workers?savedBy=${employerWallet}`);
    const employeesData = await employeesResponse.json();
    
    // Get invoice statistics
    const invoiceStatsResponse = await fetch(`/api/invoices/stats/${employerWallet}`);
    const invoiceStats = await invoiceStatsResponse.json();
    
    // Get recent invoices
    const recentInvoicesResponse = await fetch(`/api/invoices/wallet/${employerWallet}`);
    const recentInvoices = await recentInvoicesResponse.json();
    
    // Calculate analytics
    const analytics = {
      totalEmployees: employeesData.data?.length || 0,
      activeEmployees: employeesData.data?.filter(emp => emp.isActive).length || 0,
      monthlyPayroll: invoiceStats.data?.monthlyPayroll || 0,
      totalPaid: invoiceStats.data?.totalReceived || 0,
      totalPending: invoiceStats.data?.totalRemaining || 0,
      averageSalary: employeesData.data?.length > 0 
        ? (invoiceStats.data?.monthlyPayroll || 0) / employeesData.data.length 
        : 0,
      paymentEfficiency: invoiceStats.data?.totalInvoices > 0
        ? (invoiceStats.data?.paidInvoices / invoiceStats.data.totalInvoices) * 100
        : 0,
      recentActivity: recentInvoices.data?.slice(0, 5) || []
    };
    
    return analytics;
    
  } catch (error) {
    console.error('Failed to get employee analytics:', error);
    throw error;
  }
};
```

#### **Step 2: Automated Payroll Processing**
```javascript
// Automated monthly payroll processing
const processMonthlyPayroll = async (employerWallet) => {
  try {
    // 1. Get all active employees
    const employeesResponse = await fetch(`/api/workers?savedBy=${employerWallet}&isActive=true`);
    const employees = await employeesResponse.json();
    
    if (!employees.success || employees.data.length === 0) {
      console.log('No active employees found');
      return;
    }
    
    // 2. Generate recurring invoices (this happens automatically, but we can trigger it)
    const recurringResponse = await fetch(`/api/invoices/recurring/generate?creatorId=${employerWallet}`, {
      method: 'POST'
    });
    const recurringResult = await recurringResponse.json();
    
    console.log('Recurring invoice generation:', recurringResult);
    
    // 3. Send overdue reminders for any overdue invoices
    const overdueResponse = await fetch(`/api/invoices/reminders/overdue?creatorId=${employerWallet}`, {
      method: 'POST'
    });
    const overdueResult = await overdueResponse.json();
    
    console.log('Overdue reminders sent:', overdueResult);
    
    // 4. Get updated statistics
    const stats = await fetch(`/api/invoices/stats/${employerWallet}`);
    const statsData = await stats.json();
    
    return {
      employeesProcessed: employees.data.length,
      recurringGenerated: recurringResult.count || 0,
      overdueReminders: overdueResult.count || 0,
      totalPayroll: statsData.data?.monthlyPayroll || 0,
      pendingAmount: statsData.data?.totalRemaining || 0
    };
    
  } catch (error) {
    console.error('Payroll processing failed:', error);
    throw error;
  }
};

// Schedule monthly payroll processing
const scheduleMonthlyPayroll = (employerWallet) => {
  // Run on the 1st of every month
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const timeUntilNext = nextMonth.getTime() - now.getTime();
  
  setTimeout(async () => {
    console.log('Running monthly payroll processing...');
    const result = await processMonthlyPayroll(employerWallet);
    console.log('Monthly payroll completed:', result);
    
    // Schedule next month
    scheduleMonthlyPayroll(employerWallet);
  }, timeUntilNext);
  
  console.log(`Next payroll processing scheduled for: ${nextMonth.toLocaleDateString()}`);
};
```

#### **Step 3: Advanced Search and Filtering**
```javascript
// Advanced employee search with multiple filters
const advancedEmployeeSearch = async (searchParams) => {
  const params = new URLSearchParams();
  
  // Build query parameters
  if (searchParams.query) params.append('q', searchParams.query);
  if (searchParams.savedBy) params.append('savedBy', searchParams.savedBy);
  if (searchParams.isActive !== undefined) params.append('isActive', searchParams.isActive);
  if (searchParams.department) params.append('department', searchParams.department);
  if (searchParams.startDate) params.append('startDate', searchParams.startDate);
  if (searchParams.endDate) params.append('endDate', searchParams.endDate);
  
  try {
    const response = await fetch(`/api/workers/search?${params}`);
    const data = await response.json();
    
    if (data.success) {
      // Additional client-side filtering if needed
      let filteredEmployees = data.data;
      
      // Filter by salary range
      if (searchParams.minSalary || searchParams.maxSalary) {
        filteredEmployees = filteredEmployees.filter(emp => {
          const salary = emp.salary || 0;
          const meetsMin = !searchParams.minSalary || salary >= searchParams.minSalary;
          const meetsMax = !searchParams.maxSalary || salary <= searchParams.maxSalary;
          return meetsMin && meetsMax;
        });
      }
      
      // Sort results
      if (searchParams.sortBy) {
        filteredEmployees.sort((a, b) => {
          const aVal = a[searchParams.sortBy];
          const bVal = b[searchParams.sortBy];
          
          if (searchParams.sortOrder === 'desc') {
            return bVal > aVal ? 1 : -1;
          } else {
            return aVal > bVal ? 1 : -1;
          }
        });
      }
      
      return {
        success: true,
        data: filteredEmployees,
        count: filteredEmployees.length,
        filters: searchParams
      };
    }
    
    return data;
    
  } catch (error) {
    console.error('Advanced search failed:', error);
    throw error;
  }
};

// Usage example
const searchResults = await advancedEmployeeSearch({
  query: 'developer',
  savedBy: employerWallet,
  isActive: true,
  minSalary: 5000,
  maxSalary: 10000,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

---

## 🔄 Advanced Workflows

### **Tutorial 13: Complete Onboarding Workflow**

#### **Step 1: New Employee Onboarding**
```javascript
const completeEmployeeOnboarding = async (employeeData) => {
  const onboardingSteps = [];
  
  try {
    // Step 1: Add employee to database
    console.log('Step 1: Adding employee to database...');
    const employeeResponse = await fetch('/api/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: employeeData.fullName,
        walletAddress: employeeData.walletAddress,
        email: employeeData.email,
        label: employeeData.position,
        savedBy: employerWallet
      })
    });
    
    const employeeResult = await employeeResponse.json();
    if (!employeeResult.success) throw new Error('Failed to add employee');
    
    onboardingSteps.push({ step: 'employee_added', status: 'completed', data: employeeResult.data });
    
    // Step 2: Create vesting schedule (if applicable)
    if (employeeData.equityAmount > 0) {
      console.log('Step 2: Creating equity vesting schedule...');
      
      const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, VESTING_ABI, signer);
      const tokenContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
      
      const vestingAmount = ethers.parseUnits(employeeData.equityAmount.toString(), 6);
      
      // Approve and create vesting
      await tokenContract.approve(VESTING_CONTRACT_ADDRESS, vestingAmount);
      
      const vestingTx = await vestingContract.createVestingSchedule(
        USDC_ADDRESS,
        employeeData.walletAddress,
        vestingAmount,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + (employeeData.vestingYears * 365 * 24 * 60 * 60),
        6, // Monthly
        false,
        `Equity Vesting - ${employeeData.fullName}`,
        employeeData.email,
        1, 1
      );
      
      const vestingReceipt = await vestingTx.wait();
      const scheduleId = vestingReceipt.events[0].args.scheduleId;
      
      onboardingSteps.push({ step: 'vesting_created', status: 'completed', scheduleId });
    }
    
    // Step 3: Setup recurring payroll
    console.log('Step 3: Setting up recurring payroll...');
    
    const payrollInvoice = {
      invoiceNumber: `PAY-${Date.now()}-${employeeData.fullName.replace(/\s+/g, '')}`,
      creatorId: employerWallet,
      client: {
        name: employeeData.fullName,
        email: employeeData.email
      },
      items: [{
        itemName: `Monthly Salary - ${employeeData.position}`,
        qty: 1,
        price: employeeData.salary,
        amtAfterDiscount: employeeData.salary
      }],
      grandTotal: employeeData.salary,
      currency: "USDC",
      paymentMethod: "crypto",
      recurring: {
        isRecurring: true,
        frequency: { type: "monthly" },
        endCondition: { type: "never" }
      }
    };
    
    const payrollResponse = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payrollInvoice)
    });
    
    const payrollResult = await payrollResponse.json();
    if (!payrollResult.success) throw new Error('Failed to setup payroll');
    
    onboardingSteps.push({ step: 'payroll_setup', status: 'completed', invoice: payrollResult.data });
    
    // Step 4: Send welcome email with onboarding information
    console.log('Step 4: Sending welcome email...');
    
    const welcomeEmailData = {
      to: employeeData.email,
      template: 'employee-welcome',
      subject: `Welcome to ${companyName}!`,
      data: {
        employeeName: employeeData.fullName,
        position: employeeData.position,
        salary: employeeData.salary,
        equityAmount: employeeData.equityAmount,
        vestingYears: employeeData.vestingYears,
        startDate: new Date().toLocaleDateString(),
        walletAddress: employeeData.walletAddress,
        dashboardUrl: 'https://your-vpay-app.com'
      }
    };
    
    // In a real implementation, you'd have a welcome email endpoint
    // const emailResponse = await fetch('/api/notifications/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(welcomeEmailData)
    // });
    
    onboardingSteps.push({ step: 'welcome_email', status: 'completed' });
    
    console.log('✅ Employee onboarding completed successfully!');
    
    return {
      success: true,
      employee: employeeResult.data,
      onboardingSteps,
      summary: {
        employeeAdded: true,
        vestingCreated: employeeData.equityAmount > 0,
        payrollSetup: true,
        welcomeEmailSent: true
      }
    };
    
  } catch (error) {
    console.error('❌ Employee onboarding failed:', error);
    
    return {
      success: false,
      error: error.message,
      onboardingSteps,
      failedStep: onboardingSteps.length
    };
  }
};

// Usage example
const newEmployee = {
  fullName: "David Chen",
  walletAddress: "0x789d35Cc6634C0532925a3b8D4C9db96C4b4d8b9",
  email: "david.chen@company.com",
  position: "Senior Backend Engineer",
  salary: 9000,
  equityAmount: 35000,
  vestingYears: 4
};

const onboardingResult = await completeEmployeeOnboarding(newEmployee);
```

### **Tutorial 14: Employee Offboarding Workflow**

#### **Step 1: Employee Departure Process**
```javascript
const processEmployeeDeparture = async (employeeId, departureData) => {
  const offboardingSteps = [];
  
  try {
    // Step 1: Get employee information
    console.log('Step 1: Retrieving employee information...');
    
    const employeeResponse = await fetch(`/api/workers/${employeeId}`);
    const employee = await employeeResponse.json();
    
    if (!employee.success) throw new Error('Employee not found');
    
    const employeeData = employee.data;
    offboardingSteps.push({ step: 'employee_retrieved', status: 'completed' });
    
    // Step 2: Handle vesting schedules
    console.log('Step 2: Processing vesting schedules...');
    
    const vestingContract = new ethers.Contract(VESTING_CONTRACT_ADDRESS, VESTING_ABI, signer);
    
    // Get employee's vesting schedules
    const scheduleIds = await vestingContract.getRecipientSchedules(employeeData.walletAddress);
    
    for (const scheduleId of scheduleIds) {
      const schedule = await vestingContract.getScheduleById(scheduleId);
      
      if (!schedule.cancelled) {
        if (departureData.cancelVesting) {
          // Cancel vesting schedule (releases vested tokens, returns unvested to employer)
          const cancelTx = await vestingContract.cancelVestingSchedule(scheduleId);
          await cancelTx.wait();
          
          console.log(`✅ Cancelled vesting schedule ${scheduleId}`);
        } else {
          // Keep vesting schedule active but change recipient if needed
          if (departureData.newRecipient) {
            const changeTx = await vestingContract.changeRecipient(scheduleId, departureData.newRecipient);
            await changeTx.wait();
            
            console.log(`✅ Changed recipient for vesting schedule ${scheduleId}`);
          }
        }
      }
    }
    
    offboardingSteps.push({ 
      step: 'vesting_processed', 
      status: 'completed', 
      schedulesProcessed: scheduleIds.length 
    });
    
    // Step 3: Stop recurring payroll
    console.log('Step 3: Stopping recurring payroll...');
    
    // Get employee's recurring invoices
    const recurringResponse = await fetch(`/api/invoices?creatorId=${employerWallet}&recurring.isRecurring=true`);
    const recurringData = await recurringResponse.json();
    
    if (recurringData.success) {
      const employeeInvoices = recurringData.data.filter(invoice => 
        invoice.client.email === employeeData.email
      );
      
      for (const invoice of employeeInvoices) {
        // Stop recurring invoice
        const stopResponse = await fetch(`/api/invoices/${invoice._id}/stop-recurring`, {
          method: 'POST'
        });
        
        if (stopResponse.ok) {
          console.log(`✅ Stopped recurring invoice ${invoice.invoiceNumber}`);
        }
      }
    }
    
    offboardingSteps.push({ step: 'payroll_stopped', status: 'completed' });
    
    // Step 4: Update employee status
    console.log('Step 4: Updating employee status...');
    
    const updateResponse = await fetch(`/api/workers/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isActive: false,
        departureDate: departureData.departureDate,
        departureReason: departureData.reason,
        notes: departureData.notes
      })
    });
    
    const updateResult = await updateResponse.json();
    if (!updateResult.success) throw new Error('Failed to update employee status');
    
    offboardingSteps.push({ step: 'status_updated', status: 'completed' });
    
    // Step 5: Send departure notification
    console.log('Step 5: Sending departure notifications...');
    
    // Send final payslip/summary email
    const departureEmailData = {
      to: employeeData.email,
      template: 'employee-departure',
      subject: 'Final Employment Summary',
      data: {
        employeeName: employeeData.fullName,
        departureDate: departureData.departureDate,
        finalPayAmount: departureData.finalPay || 0,
        vestingSchedules: scheduleIds.length,
        vestingStatus: departureData.cancelVesting ? 'Cancelled' : 'Continued',
        accessCutoffDate: departureData.accessCutoffDate
      }
    };
    
    offboardingSteps.push({ step: 'departure_email', status: 'completed' });
    
    console.log('✅ Employee offboarding completed successfully!');
    
    return {
      success: true,
      employee: employeeData,
      offboardingSteps,
      summary: {
        vestingSchedulesProcessed: scheduleIds.length,
        payrollStopped: true,
        statusUpdated: true,
        notificationsSent: true
      }
    };
    
  } catch (error) {
    console.error('❌ Employee offboarding failed:', error);
    
    return {
      success: false,
      error: error.message,
      offboardingSteps,
      failedStep: offboardingSteps.length
    };
  }
};

// Usage example
const departureData = {
  departureDate: new Date(),
  reason: "New opportunity",
  cancelVesting: false, // Keep vesting active
  newRecipient: null, // Keep same recipient
  finalPay: 8000, // Final month's salary
  accessCutoffDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  notes: "Departed on good terms, eligible for rehire"
};

const offboardingResult = await processEmployeeDeparture(employeeId, departureData);
```

---

## 🚨 Troubleshooting

### **Common Issues and Solutions**

#### **Issue 1: Wallet Connection Problems**
```javascript
// Problem: Wallet won't connect or shows wrong network
// Solution: Network detection and switching

const ensureCorrectNetwork = async () => {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const requiredChainId = '0x1'; // Ethereum mainnet
  
  if (chainId !== requiredChainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: requiredChainId }],
      });
    } catch (error) {
      if (error.code === 4902) {
        // Network not added to wallet
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: requiredChainId,
            chainName: 'Ethereum Mainnet',
            rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            blockExplorerUrls: ['https://etherscan.io'],
          }],
        });
      }
    }
  }
};
```

#### **Issue 2: Transaction Failures**
```javascript
// Problem: Smart contract transactions fail
// Solution: Better error handling and gas estimation

const executeTransactionWithRetry = async (contractMethod, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Estimate gas
      const gasEstimate = await contractMethod.estimateGas();
      const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer
      
      // Get current gas price
      const gasPrice = await provider.getGasPrice();
      const adjustedGasPrice = gasPrice.mul(110).div(100); // Add 10% buffer
      
      // Execute transaction
      const tx = await contractMethod({
        gasLimit,
        gasPrice: adjustedGasPrice
      });
      
      return await tx.wait();
      
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

#### **Issue 3: API Rate Limiting**
```javascript
// Problem: API requests being rate limited
// Solution: Request queuing and retry logic

class APIQueue {
  constructor(maxConcurrent = 5, delayMs = 1000) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
    this.delayMs = delayMs;
  }
  
  async add(apiCall) {
    return new Promise((resolve, reject) => {
      this.queue.push({ apiCall, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { apiCall, resolve, reject } = this.queue.shift();
    
    try {
      const result = await apiCall();
      resolve(result);
    } catch (error) {
      if (error.status === 429) {
        // Rate limited, put back in queue
        this.queue.unshift({ apiCall, resolve, reject });
        await new Promise(resolve => setTimeout(resolve, this.delayMs));
      } else {
        reject(error);
      }
    } finally {
      this.running--;
      setTimeout(() => this.process(), 100);
    }
  }
}

// Usage
const apiQueue = new APIQueue();

const safeApiCall = (url, options) => {
  return apiQueue.add(() => fetch(url, options));
};
```

#### **Issue 4: Data Synchronization**
```javascript
// Problem: Frontend data out of sync with blockchain/database
// Solution: Automatic data refresh and event listening

const useDataSync = (address) => {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  const refreshData = useCallback(async () => {
    try {
      // Fetch latest data from multiple sources
      const [apiData, blockchainData] = await Promise.all([
        fetch(`/api/workers?savedBy=${address}`).then(r => r.json()),
        getBlockchainData(address)
      ]);
      
      // Merge and validate data
      const mergedData = mergeDataSources(apiData.data, blockchainData);
      
      setData(mergedData);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Data sync failed:', error);
    }
  }, [address]);
  
  useEffect(() => {
    if (!address) return;
    
    // Initial load
    refreshData();
    
    // Set up periodic refresh
    const interval = setInterval(refreshData, 30000); // 30 seconds
    
    // Listen for blockchain events
    const eventFilter = vestingContract.filters.VestingScheduleCreated(null, null, address);
    vestingContract.on(eventFilter, refreshData);
    
    return () => {
      clearInterval(interval);
      vestingContract.off(eventFilter, refreshData);
    };
  }, [address, refreshData]);
  
  return { data, lastUpdate, refresh: refreshData };
};
```

---

This comprehensive tutorial and examples guide covers all major aspects of using VPay for both employers and employees. The examples are practical and can be adapted to specific use cases. Remember to test thoroughly in a development environment before using in production, and always follow security best practices when handling sensitive data and blockchain transactions.