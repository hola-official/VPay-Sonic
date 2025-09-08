# VPay API Documentation - Complete Reference

## 🏢 Overview

VPay provides a comprehensive REST API for managing Web3 workplace operations including employee management, payroll processing, invoice generation, and payment tracking. This API is designed for employers and employees to seamlessly integrate traditional business operations with blockchain technology.

## 🔗 Base URLs

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-vpay-app.vercel.app/api`

## 🔐 Authentication

### Wallet-Based Authentication
VPay uses Web3 wallet addresses for authentication. All operations are scoped to the connected wallet address.

```javascript
// Frontend authentication example
import { useAccount } from 'wagmi';

const { address, isConnected } = useAccount();

// All API calls include the wallet address as a parameter
const response = await fetch(`/api/workers?savedBy=${address}`);
```

---

## 👥 Employee Management API

### **Employee Schema**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "fullName": "Alice Johnson",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "email": "alice.johnson@company.com",
  "label": "Senior Full Stack Developer",
  "savedBy": "0x1234567890123456789012345678901234567890",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### **1. Create Employee**
**POST** `/api/workers`

Create a new employee record in your organization.

**Request Body:**
```json
{
  "fullName": "Alice Johnson",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "email": "alice.johnson@company.com",
  "label": "Senior Full Stack Developer",
  "savedBy": "0x1234567890123456789012345678901234567890",
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fullName": "Alice Johnson",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "email": "alice.johnson@company.com",
    "label": "Senior Full Stack Developer",
    "savedBy": "0x1234567890123456789012345678901234567890",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Usage Example:**
```javascript
const addEmployee = async (employeeData) => {
  const response = await fetch('/api/workers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...employeeData,
      savedBy: address // Current employer's wallet
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    toast.success(`Employee ${result.data.fullName} added successfully!`);
    return result.data;
  } else {
    throw new Error(result.message);
  }
};
```

### **2. Get All Employees**
**GET** `/api/workers`

Retrieve all employees for the connected employer.

**Query Parameters:**
- `savedBy` (required): Employer's wallet address
- `isActive` (optional): Filter by active status (true/false)

**Examples:**
```http
GET /api/workers?savedBy=0x1234567890123456789012345678901234567890
GET /api/workers?savedBy=0x1234567890123456789012345678901234567890&isActive=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "count": 5,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "fullName": "Alice Johnson",
      "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "email": "alice.johnson@company.com",
      "label": "Senior Full Stack Developer",
      "savedBy": "0x1234567890123456789012345678901234567890",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**React Hook Example:**
```javascript
const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/workers?savedBy=${address}`);
        const data = await response.json();
        
        if (data.success) {
          setEmployees(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [address]);

  return { employees, loading, refetch: fetchEmployees };
};
```

### **3. Search Employees**
**GET** `/api/workers/search`

Search employees by name, wallet address, email, or job title.

**Query Parameters:**
- `q` (required): Search query
- `savedBy` (required): Employer's wallet address
- `isActive` (optional): Filter by active status

**Examples:**
```http
GET /api/workers/search?q=alice&savedBy=0x1234567890123456789012345678901234567890
GET /api/workers/search?q=developer&savedBy=0x1234567890123456789012345678901234567890&isActive=true
GET /api/workers/search?q=0x742d35Cc&savedBy=0x1234567890123456789012345678901234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "count": 2,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "fullName": "Alice Johnson",
      "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "email": "alice.johnson@company.com",
      "label": "Senior Full Stack Developer",
      "savedBy": "0x1234567890123456789012345678901234567890",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### **4. Get Employee Count**
**GET** `/api/workers/count/:savedBy`

Get the total count of active employees for an employer.

**Parameters:**
- `savedBy` (path): Employer's wallet address

**Example:**
```http
GET /api/workers/count/0x1234567890123456789012345678901234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employee count retrieved successfully",
  "data": {
    "count": 12,
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "activeEmployees": 10,
    "inactiveEmployees": 2
  }
}
```

### **5. Update Employee**
**PUT** `/api/workers/:id`

Update an existing employee's information.

**Parameters:**
- `id` (path): Employee's MongoDB ObjectId

**Request Body:**
```json
{
  "fullName": "Alice Johnson-Smith",
  "email": "alice.johnson-smith@company.com",
  "label": "Lead Full Stack Developer",
  "isActive": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fullName": "Alice Johnson-Smith",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "email": "alice.johnson-smith@company.com",
    "label": "Lead Full Stack Developer",
    "savedBy": "0x1234567890123456789012345678901234567890",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-02-01T14:20:00.000Z"
  }
}
```

### **6. Delete Employee**
**DELETE** `/api/workers/:id`

Remove an employee from the organization.

**Parameters:**
- `id` (path): Employee's MongoDB ObjectId

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employee deleted successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fullName": "Alice Johnson",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "email": "alice.johnson@company.com",
    "label": "Senior Full Stack Developer",
    "savedBy": "0x1234567890123456789012345678901234567890",
    "isActive": true
  }
}
```

---

## 💰 Invoice & Payroll API

### **Invoice Schema**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
  "invoiceNumber": 2024001,
  "creatorId": "0x1234567890123456789012345678901234567890",
  "client": {
    "name": "Alice Johnson",
    "email": "alice.johnson@company.com"
  },
  "payerWalletAddr": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "items": [
    {
      "itemName": "Monthly Salary - Senior Developer",
      "qty": 1,
      "price": 8000,
      "discPercent": 0,
      "amtAfterDiscount": 8000,
      "discValue": 0,
      "amtBeforeDiscount": 8000
    }
  ],
  "issueDate": "2024-01-01T00:00:00.000Z",
  "dueDate": "2024-01-31T23:59:59.000Z",
  "grandTotal": 8000,
  "currency": "USDC",
  "paymentMethod": "crypto",
  "invoiceStatus": "Awaiting Payment",
  "totalAmountReceived": 0,
  "remainingAmount": 8000,
  "paymentRecords": [],
  "recurring": {
    "isRecurring": true,
    "frequency": { "type": "monthly" },
    "endCondition": { "type": "never" },
    "currentCount": 1
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **1. Create Invoice/Payroll**
**POST** `/api/invoices`

Create a new invoice for employee salary or client billing.

**Request Body (Monthly Salary):**
```json
{
  "invoiceNumber": 2024001,
  "creatorId": "0x1234567890123456789012345678901234567890",
  "client": {
    "name": "Alice Johnson",
    "email": "alice.johnson@company.com"
  },
  "items": [
    {
      "itemName": "Monthly Salary - Senior Developer",
      "qty": 1,
      "price": 8000,
      "discPercent": 0,
      "amtAfterDiscount": 8000,
      "discValue": 0,
      "amtBeforeDiscount": 8000
    }
  ],
  "issueDate": "2024-01-01T00:00:00.000Z",
  "dueDate": "2024-01-31T23:59:59.000Z",
  "grandTotal": 8000,
  "currency": "USDC",
  "paymentMethod": "crypto",
  "notes": "Monthly salary payment for January 2024",
  "recurring": {
    "isRecurring": true,
    "frequency": { "type": "monthly" },
    "endCondition": { "type": "never" },
    "currentCount": 1
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "invoiceNumber": 2024001,
    "creatorId": "0x1234567890123456789012345678901234567890",
    "client": {
      "name": "Alice Johnson",
      "email": "alice.johnson@company.com"
    },
    "items": [
      {
        "itemName": "Monthly Salary - Senior Developer",
        "qty": 1,
        "price": 8000,
        "amtAfterDiscount": 8000
      }
    ],
    "grandTotal": 8000,
    "currency": "USDC",
    "paymentMethod": "crypto",
    "invoiceStatus": "Awaiting Payment",
    "recurring": {
      "isRecurring": true,
      "frequency": { "type": "monthly" },
      "endCondition": { "type": "never" },
      "currentCount": 1
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Automated Payroll Setup Example:**
```javascript
const setupMonthlyPayroll = async (employees) => {
  const payrollInvoices = [];
  
  for (const employee of employees) {
    const invoiceData = {
      invoiceNumber: generatePayrollNumber(employee),
      creatorId: companyWallet,
      client: {
        name: employee.fullName,
        email: employee.email
      },
      items: [{
        itemName: `Monthly Salary - ${employee.label}`,
        qty: 1,
        price: employee.salary || 5000,
        amtAfterDiscount: employee.salary || 5000
      }],
      grandTotal: employee.salary || 5000,
      currency: "USDC",
      paymentMethod: "crypto",
      notes: `Monthly salary for ${employee.fullName}`,
      recurring: {
        isRecurring: true,
        frequency: { type: "monthly" },
        endCondition: { type: "never" }
      }
    };
    
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    });
    
    const result = await response.json();
    if (result.success) {
      payrollInvoices.push(result.data);
      console.log(`Payroll setup for ${employee.fullName}: Invoice #${result.data.invoiceNumber}`);
    }
  }
  
  return payrollInvoices;
};
```

### **2. Process Payment**
**POST** `/api/invoices/:id/pay`

Record payment for an invoice (salary payment or client payment).

**Parameters:**
- `id` (path): Invoice MongoDB ObjectId

**Request Body (Crypto Payment):**
```json
{
  "amountPaid": 8000,
  "note": "Monthly salary payment - January 2024",
  "payerWalletAddr": "0x1234567890123456789012345678901234567890",
  "paymentType": "crypto",
  "txnHash": "0xabc123def456789...",
  "nftReceiptId": "receipt_nft_123",
  "cryptoToken": "USDC"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "invoiceNumber": 2024001,
    "invoiceStatus": "Paid",
    "totalAmountReceived": 8000,
    "remainingAmount": 0,
    "paymentRecords": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
        "amountPaid": 8000,
        "paymentDate": "2024-01-31T10:30:00.000Z",
        "note": "Monthly salary payment - January 2024",
        "payerWalletAddr": "0x1234567890123456789012345678901234567890",
        "paymentType": "crypto",
        "txnHash": "0xabc123def456789...",
        "nftReceiptId": "receipt_nft_123",
        "cryptoToken": "USDC"
      }
    ]
  }
}
```

**Payment Processing Example:**
```javascript
const processPayrollPayment = async (invoiceId, paymentDetails) => {
  const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amountPaid: paymentDetails.amount,
      note: `Salary payment - ${new Date().toLocaleDateString()}`,
      payerWalletAddr: companyWallet,
      paymentType: "crypto",
      txnHash: paymentDetails.transactionHash,
      cryptoToken: "USDC"
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Payment recorded successfully
    toast.success(`Payment of $${paymentDetails.amount} processed successfully!`);
    
    // If this was a recurring invoice, next month's invoice is auto-generated
    if (result.data.recurring?.isRecurring) {
      console.log('Next recurring invoice will be generated automatically');
    }
  }
  
  return result;
};
```

### **3. Get Invoice Statistics**
**GET** `/api/invoices/stats/:creatorId`

Get comprehensive payroll and invoicing statistics for an employer.

**Parameters:**
- `creatorId` (path): Employer's wallet address

**Example:**
```http
GET /api/invoices/stats/0x1234567890123456789012345678901234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invoice statistics retrieved successfully",
  "data": {
    "totalInvoices": 25,
    "paidInvoices": 20,
    "pendingInvoices": 3,
    "overdueInvoices": 2,
    "totalAmount": 125000,
    "totalReceived": 100000,
    "totalRemaining": 25000,
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "monthlyPayroll": 40000,
    "averagePaymentTime": 2.5, // days
    "recurringInvoices": 12
  }
}
```

**Dashboard Statistics Example:**
```javascript
const PayrollDashboard = () => {
  const [stats, setStats] = useState({});
  const { address } = useAccount();

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch(`/api/invoices/stats/${address}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    };

    if (address) {
      fetchStats();
    }
  }, [address]);

  return (
    <div className="payroll-dashboard">
      <div className="stats-grid">
        <StatCard 
          title="Monthly Payroll" 
          value={`$${stats.monthlyPayroll?.toLocaleString()}`}
          trend="+5% from last month"
        />
        <StatCard 
          title="Total Employees" 
          value={stats.recurringInvoices}
          trend="Active payroll recipients"
        />
        <StatCard 
          title="Pending Payments" 
          value={`$${stats.totalRemaining?.toLocaleString()}`}
          trend={`${stats.pendingInvoices} invoices`}
        />
        <StatCard 
          title="Payment Efficiency" 
          value={`${stats.averagePaymentTime} days`}
          trend="Average payment time"
        />
      </div>
    </div>
  );
};
```

### **4. Generate Recurring Invoices**
**POST** `/api/invoices/recurring/generate`

Manually trigger generation of due recurring invoices (usually automated).

**Query Parameters:**
- `creatorId` (optional): Filter by specific employer

**Example:**
```http
POST /api/invoices/recurring/generate?creatorId=0x1234567890123456789012345678901234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Recurring invoice generation completed",
  "count": 5,
  "results": [
    {
      "originalInvoiceId": "60f7b3b3b3b3b3b3b3b3b3b4",
      "originalInvoiceNumber": 2024001,
      "newInvoiceId": "60f7b3b3b3b3b3b3b3b3b3b6",
      "newInvoiceNumber": 2024002,
      "status": "generated"
    },
    {
      "originalInvoiceId": "60f7b3b3b3b3b3b3b3b3b3b7",
      "originalInvoiceNumber": 2024003,
      "status": "not yet due"
    }
  ]
}
```

### **5. Send Overdue Reminders**
**POST** `/api/invoices/reminders/overdue`

Send automated email reminders for overdue payments.

**Query Parameters:**
- `creatorId` (optional): Filter by specific employer

**Example:**
```http
POST /api/invoices/reminders/overdue?creatorId=0x1234567890123456789012345678901234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Overdue reminder emails processed",
  "count": 3,
  "results": [
    {
      "invoiceId": "60f7b3b3b3b3b3b3b3b3b3b8",
      "invoiceNumber": 2024005,
      "clientEmail": "client@example.com",
      "status": "sent",
      "daysOverdue": 5
    },
    {
      "invoiceId": "60f7b3b3b3b3b3b3b3b3b3b9",
      "invoiceNumber": 2024006,
      "clientEmail": "another@example.com",
      "status": "sent",
      "daysOverdue": 12
    }
  ]
}
```

### **6. Get Invoices by Wallet**
**GET** `/api/invoices/wallet/:creatorId`

Get all invoices created by a specific employer wallet.

**Parameters:**
- `creatorId` (path): Employer's wallet address

**Example:**
```http
GET /api/invoices/wallet/0x1234567890123456789012345678901234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invoices retrieved successfully",
  "count": 15,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "invoiceNumber": 2024001,
      "client": {
        "name": "Alice Johnson",
        "email": "alice.johnson@company.com"
      },
      "grandTotal": 8000,
      "invoiceStatus": "Paid",
      "recurring": {
        "isRecurring": true,
        "frequency": { "type": "monthly" }
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 📊 Analytics & Reporting API

### **1. Employee Performance Metrics**
**GET** `/api/analytics/employee-performance/:employeeWallet`

Get performance and payment metrics for a specific employee.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "employee": {
      "fullName": "Alice Johnson",
      "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "label": "Senior Developer"
    },
    "paymentHistory": {
      "totalEarnings": 96000,
      "paymentsReceived": 12,
      "averagePaymentAmount": 8000,
      "lastPaymentDate": "2024-01-31T10:30:00.000Z",
      "onTimePayments": 12,
      "latePayments": 0
    },
    "vestingInfo": {
      "totalVested": 40000,
      "releasedAmount": 10000,
      "availableToClaim": 2500,
      "nextUnlockDate": "2024-02-01T00:00:00.000Z"
    },
    "savingsLocks": {
      "totalLocked": 15000,
      "activeLocks": 3,
      "nearestUnlockDate": "2024-06-01T00:00:00.000Z"
    }
  }
}
```

### **2. Company Payroll Summary**
**GET** `/api/analytics/payroll-summary/:companyWallet`

Get comprehensive payroll analytics for the organization.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 25,
    "activeEmployees": 23,
    "monthlyPayrollBudget": 200000,
    "actualMonthlyPayroll": 184000,
    "payrollEfficiency": 92.0,
    "departmentBreakdown": [
      {
        "department": "Engineering",
        "employees": 15,
        "totalSalary": 120000,
        "averageSalary": 8000
      },
      {
        "department": "Product",
        "employees": 5,
        "totalSalary": 35000,
        "averageSalary": 7000
      }
    ],
    "paymentTrends": {
      "lastSixMonths": [180000, 175000, 182000, 184000, 190000, 184000],
      "growthRate": 2.2
    }
  }
}
```

---

## 📧 Notification System API

### **Email Template Configuration**

#### **Available Templates:**
- `invoice-email`: New invoice notifications
- `payment-notification`: Payment confirmation emails
- `overdue-reminder`: Overdue payment reminders
- `recurring-invoice`: Recurring invoice notifications
- `payment-verification`: Bank payment verification emails

### **1. Send Custom Notification**
**POST** `/api/notifications/send`

Send custom email notifications to employees or clients.

**Request Body:**
```json
{
  "to": "alice.johnson@company.com",
  "template": "custom-notification",
  "subject": "Important Update: New Benefits Package",
  "data": {
    "employeeName": "Alice Johnson",
    "companyName": "TechCorp Inc",
    "message": "We're excited to announce our new benefits package...",
    "actionUrl": "https://company.com/benefits",
    "actionText": "View Benefits"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "messageId": "email-123456789",
    "to": "alice.johnson@company.com",
    "subject": "Important Update: New Benefits Package",
    "sentAt": "2024-01-15T14:30:00.000Z"
  }
}
```

### **2. Get Notification History**
**GET** `/api/notifications/history/:walletAddress`

Get notification history for an employer or employee.

**Response (200 OK):**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3ba",
      "type": "invoice_created",
      "recipient": "alice.johnson@company.com",
      "subject": "New Invoice #2024001",
      "status": "delivered",
      "sentAt": "2024-01-01T00:00:00.000Z",
      "openedAt": "2024-01-01T08:30:00.000Z"
    },
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3bb",
      "type": "payment_received",
      "recipient": "employer@company.com",
      "subject": "Payment Received - Invoice #2024001",
      "status": "delivered",
      "sentAt": "2024-01-31T10:30:00.000Z"
    }
  ]
}
```

---

## 🔍 Search & Filter API

### **1. Advanced Invoice Search**
**GET** `/api/invoices/search`

Advanced search across all invoices with multiple filters.

**Query Parameters:**
- `q` (optional): Search term (invoice number, client name, etc.)
- `creatorId` (optional): Filter by employer wallet
- `invoiceStatus` (optional): Filter by status
- `paymentMethod` (optional): Filter by payment method
- `dateFrom` (optional): Start date filter (ISO format)
- `dateTo` (optional): End date filter (ISO format)
- `amountMin` (optional): Minimum amount filter
- `amountMax` (optional): Maximum amount filter

**Examples:**
```http
GET /api/invoices/search?q=alice&creatorId=0x1234567890123456789012345678901234567890
GET /api/invoices/search?invoiceStatus=Paid&paymentMethod=crypto&dateFrom=2024-01-01
GET /api/invoices/search?amountMin=5000&amountMax=10000
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "count": 8,
  "filters": {
    "q": "alice",
    "creatorId": "0x1234567890123456789012345678901234567890",
    "invoiceStatus": null,
    "dateRange": null
  },
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "invoiceNumber": 2024001,
      "client": {
        "name": "Alice Johnson",
        "email": "alice.johnson@company.com"
      },
      "grandTotal": 8000,
      "invoiceStatus": "Paid",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🚨 Error Handling

### **Standard Error Responses**

#### **400 Bad Request**
```json
{
  "success": false,
  "message": "Validation error: Full name is required",
  "errors": [
    {
      "field": "fullName",
      "message": "Full name is required"
    },
    {
      "field": "walletAddress",
      "message": "Invalid wallet address format"
    }
  ]
}
```

#### **401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid wallet signature",
  "code": "INVALID_SIGNATURE"
}
```

#### **404 Not Found**
```json
{
  "success": false,
  "message": "Employee not found",
  "code": "EMPLOYEE_NOT_FOUND"
}
```

#### **409 Conflict**
```json
{
  "success": false,
  "message": "Employee with this wallet address already exists",
  "code": "DUPLICATE_WALLET_ADDRESS"
}
```

#### **429 Too Many Requests**
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again in 60 seconds",
  "retryAfter": 60
}
```

#### **500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR",
  "requestId": "req_123456789"
}
```

### **Error Handling Best Practices**

```javascript
const apiCall = async (endpoint, options) => {
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific error cases
      switch (response.status) {
        case 400:
          throw new ValidationError(data.message, data.errors);
        case 401:
          throw new AuthError(data.message);
        case 404:
          throw new NotFoundError(data.message);
        case 409:
          throw new ConflictError(data.message);
        case 429:
          throw new RateLimitError(data.message, data.retryAfter);
        default:
          throw new APIError(data.message || 'Unknown error occurred');
      }
    }
    
    return data;
  } catch (error) {
    // Log error for debugging
    console.error('API call failed:', error);
    throw error;
  }
};

// Usage with error handling
try {
  const employee = await apiCall('/api/workers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData)
  });
  
  toast.success(`Employee ${employee.data.fullName} added successfully!`);
} catch (error) {
  if (error instanceof ValidationError) {
    // Show validation errors to user
    error.errors.forEach(err => {
      toast.error(`${err.field}: ${err.message}`);
    });
  } else if (error instanceof ConflictError) {
    toast.error('This employee already exists in the system');
  } else {
    toast.error('Failed to add employee. Please try again.');
  }
}
```

---

## 📈 Rate Limiting

### **Rate Limits**
- **General API calls**: 100 requests per minute per IP
- **Authentication**: 10 requests per minute per IP
- **Email sending**: 50 emails per hour per account
- **Search operations**: 30 requests per minute per wallet

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-RetryAfter: 60
```

---

## 🔧 SDK & Integration Examples

### **JavaScript SDK**
```javascript
class VPayAPI {
  constructor(baseURL, walletAddress) {
    this.baseURL = baseURL;
    this.walletAddress = walletAddress;
  }

  // Employee Management
  async addEmployee(employeeData) {
    return this.post('/workers', {
      ...employeeData,
      savedBy: this.walletAddress
    });
  }

  async getEmployees(filters = {}) {
    const params = new URLSearchParams({
      savedBy: this.walletAddress,
      ...filters
    });
    return this.get(`/workers?${params}`);
  }

  // Invoice Management
  async createInvoice(invoiceData) {
    return this.post('/invoices', {
      ...invoiceData,
      creatorId: this.walletAddress
    });
  }

  async processPayment(invoiceId, paymentData) {
    return this.post(`/invoices/${invoiceId}/pay`, {
      ...paymentData,
      payerWalletAddr: this.walletAddress
    });
  }

  // Helper methods
  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// Usage
const vpay = new VPayAPI('https://api.vpay.com/api', userWalletAddress);

// Add employee
const newEmployee = await vpay.addEmployee({
  fullName: "John Doe",
  walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  email: "john.doe@company.com",
  label: "Software Engineer"
});

// Create monthly payroll
const payrollInvoice = await vpay.createInvoice({
  invoiceNumber: generateInvoiceNumber(),
  client: { name: "John Doe", email: "john.doe@company.com" },
  items: [{ itemName: "Monthly Salary", qty: 1, price: 6000 }],
  grandTotal: 6000,
  recurring: { isRecurring: true, frequency: { type: "monthly" } }
});
```

### **React Hooks for VPay**
```javascript
// useVPay.js
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

export const useVPay = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const employees = {
    getAll: () => apiCall(`/workers?savedBy=${address}`),
    add: (data) => apiCall('/workers', {
      method: 'POST',
      body: JSON.stringify({ ...data, savedBy: address })
    }),
    update: (id, data) => apiCall(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => apiCall(`/workers/${id}`, { method: 'DELETE' })
  };

  const invoices = {
    create: (data) => apiCall('/invoices', {
      method: 'POST',
      body: JSON.stringify({ ...data, creatorId: address })
    }),
    getStats: () => apiCall(`/invoices/stats/${address}`),
    processPayment: (id, paymentData) => apiCall(`/invoices/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ ...paymentData, payerWalletAddr: address })
    })
  };

  return {
    loading,
    error,
    employees,
    invoices,
    address
  };
};

// Usage in component
const EmployeeDashboard = () => {
  const { employees, loading, error } = useVPay();
  const [employeeList, setEmployeeList] = useState([]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const result = await employees.getAll();
        setEmployeeList(result.data);
      } catch (err) {
        console.error('Failed to load employees:', err);
      }
    };

    loadEmployees();
  }, [employees]);

  const handleAddEmployee = async (employeeData) => {
    try {
      await employees.add(employeeData);
      // Refresh list
      const result = await employees.getAll();
      setEmployeeList(result.data);
      toast.success('Employee added successfully!');
    } catch (err) {
      toast.error('Failed to add employee');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>Employee Management</h1>
      <EmployeeForm onSubmit={handleAddEmployee} />
      <EmployeeList employees={employeeList} />
    </div>
  );
};
```

---

## 🧪 Testing

### **API Testing with Jest**
```javascript
// tests/api.test.js
import { VPayAPI } from '../src/lib/vpay-api';

describe('VPay API', () => {
  let api;
  
  beforeEach(() => {
    api = new VPayAPI('http://localhost:3000/api', '0x1234567890123456789012345678901234567890');
  });

  describe('Employee Management', () => {
    it('should create a new employee', async () => {
      const employeeData = {
        fullName: 'Test Employee',
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        email: 'test@company.com',
        label: 'Test Role'
      };

      const result = await api.addEmployee(employeeData);
      
      expect(result.success).toBe(true);
      expect(result.data.fullName).toBe(employeeData.fullName);
      expect(result.data.walletAddress).toBe(employeeData.walletAddress);
    });

    it('should get all employees for wallet', async () => {
      const result = await api.getEmployees();
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Invoice Management', () => {
    it('should create a payroll invoice', async () => {
      const invoiceData = {
        invoiceNumber: 2024001,
        client: { name: 'Test Employee', email: 'test@company.com' },
        items: [{ itemName: 'Monthly Salary', qty: 1, price: 5000 }],
        grandTotal: 5000,
        recurring: { isRecurring: true, frequency: { type: 'monthly' } }
      };

      const result = await api.createInvoice(invoiceData);
      
      expect(result.success).toBe(true);
      expect(result.data.invoiceNumber).toBe(invoiceData.invoiceNumber);
      expect(result.data.recurring.isRecurring).toBe(true);
    });
  });
});
```

### **Load Testing**
```javascript
// tests/load.test.js
import { check } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

export default function() {
  const walletAddress = '0x1234567890123456789012345678901234567890';
  
  // Test getting employees
  let response = http.get(`http://localhost:3000/api/workers?savedBy=${walletAddress}`);
  check(response, {
    'employees endpoint returns 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test getting invoice stats
  response = http.get(`http://localhost:3000/api/invoices/stats/${walletAddress}`);
  check(response, {
    'stats endpoint returns 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });
}
```

---

This comprehensive API documentation provides everything needed to integrate with the VPay system for both employers and employees. The API supports all aspects of Web3 workplace management including employee management, payroll processing, invoice generation, payment tracking, and automated notifications.

The documentation includes practical examples, error handling, rate limiting information, and SDK examples to help developers quickly integrate VPay into their applications.