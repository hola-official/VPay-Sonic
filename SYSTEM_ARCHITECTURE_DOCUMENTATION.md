# VPay System Architecture Documentation

## 🏗️ Architecture Overview

VPay is a comprehensive Web3 workplace management platform built on a modern, scalable architecture that bridges traditional business operations with blockchain technology. The system is designed to serve both employers and employees with seamless integration across multiple layers.

## 📊 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (React SPA)  │  Mobile App (Future)  │  Desktop   │
│  - RainbowKit/Wagmi       │  - React Native       │  - Electron│
│  - TailwindCSS            │  - Web3 Mobile         │  - Tauri   │
│  - Framer Motion          │  - Native UI           │  - Native  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                     React Frontend                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Employer      │  │    Employee     │  │     Admin       │ │
│  │   Dashboard     │  │   Dashboard     │  │   Dashboard     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer │ Rate Limiting │ Authentication │ CORS │ SSL    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                  Node.js/Express Backend                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Employee      │  │    Invoice      │  │  Notification   │ │
│  │   Controller    │  │   Controller    │  │   Controller    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Payroll       │  │   Analytics     │  │   Integration   │ │
│  │   Controller    │  │   Controller    │  │   Controller    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   DATABASE LAYER    │  │   BLOCKCHAIN LAYER  │  │  EXTERNAL SERVICES  │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│     MongoDB         │  │  Smart Contracts    │  │   Email Service     │
│  ┌─────────────────┐│  │ ┌─────────────────┐ │  │ ┌─────────────────┐ │
│  │   Employees     ││  │ │  VestPayment    │ │  │ │    SMTP/SES     │ │
│  │   Collection    ││  │ │   Contract      │ │  │ │   (Nodemailer)  │ │
│  └─────────────────┘│  │ └─────────────────┘ │  │ └─────────────────┘ │
│  ┌─────────────────┐│  │ ┌─────────────────┐ │  │ ┌─────────────────┐ │
│  │   Invoices      ││  │ │  TokenLocker    │ │  │ │   File Storage  │ │
│  │   Collection    ││  │ │   Contract      │ │  │ │    (AWS S3)     │ │
│  └─────────────────┘│  │ └─────────────────┘ │  │ └─────────────────┘ │
│  ┌─────────────────┐│  │ ┌─────────────────┐ │  │ ┌─────────────────┐ │
│  │  Notifications  ││  │ │    ERC20        │ │  │ │   Analytics     │ │
│  │   Collection    ││  │ │  (USDC/USDT)    │ │  │ │  (Mixpanel)     │ │
│  └─────────────────┘│  │ └─────────────────┘ │  │ └─────────────────┘ │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

## 🔄 Data Flow Architecture

### **1. User Authentication Flow**
```
User Wallet Connection
         │
         ▼
┌─────────────────────┐
│   RainbowKit        │ ── Wallet Selection & Connection
│   Web3 Provider     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Wagmi Hooks       │ ── Account Management & Chain Validation
│   (useAccount)      │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Role Detection    │ ── Check if user is Employer/Employee
│   API Call          │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Dashboard         │ ── Load appropriate dashboard
│   Rendering         │
└─────────────────────┘
```

### **2. Employee Management Flow**
```
Employer Dashboard
         │
         ▼
┌─────────────────────┐
│   Add Employee      │ ── Form Submission
│   Form              │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   API Validation    │ ── Wallet Address & Email Validation
│   /api/workers      │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   MongoDB Storage   │ ── Store Employee Data
│   employees         │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Email             │ ── Welcome Email to Employee
│   Notification     │
└─────────────────────┘
```

### **3. Payroll Processing Flow**
```
Create Invoice (Payroll)
         │
         ▼
┌─────────────────────┐
│   Invoice API       │ ── Create recurring invoice
│   /api/invoices     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   MongoDB Storage   │ ── Store invoice with recurring settings
│   invoices          │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Email Service     │ ── Send invoice to employee
│   (Nodemailer)     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Payment           │ ── Employee pays via crypto
│   Processing        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Blockchain        │ ── Verify transaction on-chain
│   Verification     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Auto-Generate     │ ── Create next month's invoice
│   Next Invoice      │
└─────────────────────┘
```

### **4. Token Vesting Flow**
```
Create Vesting Schedule
         │
         ▼
┌─────────────────────┐
│   Frontend Form     │ ── Employer sets vesting parameters
│   Vesting Setup     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Smart Contract    │ ── Call createVestingSchedule
│   VestPayment.sol   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Token Transfer    │ ── Transfer tokens to contract
│   ERC20 → Contract  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Schedule Storage  │ ── Store vesting schedule on-chain
│   Blockchain State  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Employee          │ ── Employee can claim vested tokens
│   Token Claims      │
└─────────────────────┘
```

### **5. Token Locking Flow**
```
Employee Savings Lock
         │
         ▼
┌─────────────────────┐
│   Frontend Form     │ ── Employee sets lock parameters
│   Lock Creation     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Token Approval    │ ── Approve tokens for contract
│   ERC20.approve()   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Smart Contract    │ ── Call lock function
│   TokenLocker.sol   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Token Storage     │ ── Tokens locked in contract
│   Contract Balance  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Unlock Timer      │ ── Wait for unlock date
│   Time-based Logic  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Token Unlock      │ ── Employee unlocks tokens
│   Contract → User   │
└─────────────────────┘
```

## 🏛️ Component Architecture

### **Frontend Component Hierarchy**
```
App.jsx
├── Providers/
│   ├── WagmiProvider (Web3 connection)
│   ├── QueryProvider (Data fetching)
│   └── ToastProvider (Notifications)
├── Layout/
│   ├── Header (Navigation & wallet)
│   ├── Sidebar (Role-based menu)
│   └── BackgroundEffects (UI effects)
└── Pages/
    ├── Dashboard/
    │   ├── EmployerDashboard
    │   └── EmployeeDashboard
    ├── Contact/ (Employee Management)
    │   ├── ContactPage
    │   ├── EmployeeCard
    │   └── EmployeeFormModal
    ├── Invoices/
    │   ├── InvoiceList
    │   ├── InvoiceCard
    │   ├── CreateInvoice
    │   └── InvoiceView
    ├── Payments/
    │   ├── PaymentHistory
    │   └── PaymentCard
    ├── Lock/ (Token Locking)
    │   ├── TokenLockForm
    │   ├── TokenLockList
    │   └── LockCard
    ├── Payroll/ (Vesting)
    │   ├── VestingManagerForm
    │   ├── VestingSchedules
    │   └── VestingCard
    └── VestingSchedules/
        ├── EmployeeVestingView
        └── VestingClaimInterface
```

### **Backend Service Architecture**
```
server.js (Express App)
├── Config/
│   ├── corsOptions.js (CORS configuration)
│   └── allowedOrigins.js (Allowed origins)
├── Database/
│   └── connectDb.js (MongoDB connection)
├── Models/
│   ├── user.js (Employee model)
│   └── invoiceModel.js (Invoice model)
├── Controllers/
│   ├── userController.js (Employee management)
│   └── invoiceController.js (Invoice & payroll)
├── Routes/
│   ├── userRoutes.js (Employee routes)
│   └── invoiceRoutes.js (Invoice routes)
├── Utils/
│   └── sendMail.js (Email service)
└── Middleware/
    ├── validation.js (Input validation)
    ├── authentication.js (Auth middleware)
    └── errorHandler.js (Error handling)
```

### **Smart Contract Architecture**
```
Smart Contracts (Solidity)
├── VestPayment.sol (MultiTokenVestingManager)
│   ├── VestingSchedule struct
│   ├── TokenVestingInfo struct
│   ├── Permission enums
│   ├── Core Functions:
│   │   ├── createVestingSchedule()
│   │   ├── createMultipleVestingSchedules()
│   │   ├── release()
│   │   ├── cancelVestingSchedule()
│   │   └── changeRecipient()
│   └── View Functions:
│       ├── getReleasableAmount()
│       ├── getVestedAmount()
│       └── getRecipientSchedules()
├── TokenLocker.sol
│   ├── Lock struct
│   ├── CumulativeLockInfo struct
│   ├── Core Functions:
│   │   ├── lock()
│   │   ├── vestingLock()
│   │   ├── multipleVestingLock()
│   │   └── unlock()
│   └── View Functions:
│       ├── normalLocksForUser()
│       ├── withdrawableTokens()
│       └── getLockById()
└── Test Tokens/
    ├── Tether.sol (Mock USDT)
    ├── Circle.sol (Mock USDC)
    └── Multicall3.sol (Batch operations)
```

## 📡 API Architecture

### **RESTful API Design**
```
/api/
├── workers/                    # Employee Management
│   ├── GET    /                # Get all employees
│   ├── POST   /                # Create employee
│   ├── GET    /search          # Search employees
│   ├── GET    /wallet/:address # Get by employer wallet
│   ├── GET    /count/:address  # Get employee count
│   ├── GET    /:id             # Get by ID
│   ├── PUT    /:id             # Update employee
│   └── DELETE /:id             # Delete employee
├── invoices/                   # Invoice & Payroll
│   ├── GET    /                # Get all invoices
│   ├── POST   /                # Create invoice
│   ├── GET    /search          # Search invoices
│   ├── GET    /wallet/:address # Get by creator wallet
│   ├── GET    /stats/:address  # Get statistics
│   ├── GET    /:id             # Get by ID
│   ├── PUT    /:id             # Update invoice
│   ├── DELETE /:id             # Delete invoice
│   ├── POST   /:id/pay         # Process payment
│   ├── GET    /recurring       # Get recurring invoices
│   ├── POST   /recurring/generate # Generate recurring
│   └── POST   /reminders/overdue  # Send overdue reminders
└── notifications/              # Notification System
    ├── POST   /send            # Send notification
    └── GET    /history/:wallet # Get notification history
```

### **WebSocket Architecture (Future)**
```
WebSocket Connections
├── /ws/employer/:walletAddress
│   ├── payment_received
│   ├── invoice_paid
│   ├── employee_activity
│   └── system_alerts
└── /ws/employee/:walletAddress
    ├── payment_sent
    ├── vesting_unlock
    ├── savings_unlock
    └── invoice_received
```

## 🗄️ Database Schema Design

### **MongoDB Collections**

#### **Workers Collection**
```javascript
{
  _id: ObjectId,
  fullName: String,           // Employee full name
  walletAddress: String,      // Employee wallet (indexed, unique)
  email: String,              // Email for notifications (indexed)
  label: String,              // Job title/position
  savedBy: String,            // Employer wallet (indexed)
  isActive: Boolean,          // Active status
  metadata: {
    department: String,       // Future: Department
    startDate: Date,          // Future: Employment start date
    salary: Number,           // Future: Base salary
    benefits: [String]        // Future: Benefits array
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// { walletAddress: 1 } - unique
// { savedBy: 1, isActive: 1 }
// { email: 1 }
// { savedBy: 1, createdAt: -1 }
```

#### **Invoices Collection**
```javascript
{
  _id: ObjectId,
  invoiceNumber: Number,      // Invoice number (indexed with creatorId)
  creatorId: String,          // Employer wallet (indexed)
  client: {
    name: String,
    email: String             // Indexed for client lookups
  },
  payerWalletAddr: String,    // Employee wallet (indexed)
  
  // Invoice Details
  items: [{
    itemName: String,
    qty: Number,
    price: Number,
    discPercent: Number,
    amtAfterDiscount: Number,
    discValue: Number,
    amtBeforeDiscount: Number
  }],
  
  // Financial Information
  issueDate: Date,
  dueDate: Date,
  subTotalBeforeDiscount: Number,
  totalDiscountValue: Number,
  vatPercent: Number,
  vatValue: Number,
  grandTotal: Number,
  currency: String,
  totalAmountReceived: Number,
  remainingAmount: Number,
  
  // Payment Information
  paymentMethod: String,      // "crypto" or "bank"
  invoiceStatus: String,      // Indexed for status queries
  rejectReason: String,
  notes: String,
  
  // Payment Records
  paymentRecords: [{
    amountPaid: Number,
    paymentDate: Date,
    note: String,
    payerWalletAddr: String,
    paymentType: String,      // "crypto" or "bank"
    
    // Crypto Payment Fields
    txnHash: String,          // Indexed for transaction lookups
    nftReceiptId: String,     // Indexed for NFT receipt lookups
    cryptoToken: String,      // "USDC" or "USDT"
    
    // Bank Payment Fields
    bankVerificationStatus: String,
    bankVerificationNote: String
  }],
  
  // Recurring Invoice Settings
  recurring: {
    isRecurring: Boolean,     // Indexed for recurring queries
    frequency: {
      type: String,           // "weekly", "monthly", "yearly", "custom"
      customDays: Number      // For custom frequency
    },
    startDate: Date,
    endCondition: {
      type: String,           // "invoiceCount", "endDate", "never"
      value: Mixed            // Number or Date based on type
    },
    currentCount: Number,
    stoppedAt: Date
  },
  
  parentInvoiceId: ObjectId,  // For recurring invoice chains
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// { creatorId: 1, invoiceNumber: 1 } - unique compound
// { creatorId: 1, invoiceStatus: 1 }
// { payerWalletAddr: 1 }
// { "client.email": 1 }
// { "recurring.isRecurring": 1 }
// { "paymentRecords.txnHash": 1 }
// { dueDate: 1, invoiceStatus: 1 } - for overdue queries
```

#### **Notifications Collection (Future)**
```javascript
{
  _id: ObjectId,
  type: String,               // "email", "push", "sms"
  category: String,           // "payment", "invoice", "vesting", "system"
  recipient: String,          // Email or wallet address
  sender: String,             // System or wallet address
  
  // Content
  subject: String,
  message: String,
  data: Object,               // Additional data payload
  
  // Email Specific
  template: String,           // Email template used
  emailId: String,            // External email service ID
  
  // Status
  status: String,             // "pending", "sent", "delivered", "failed"
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date,
  
  // Retry Logic
  retryCount: Number,
  maxRetries: Number,
  nextRetryAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// { recipient: 1, createdAt: -1 }
// { status: 1, nextRetryAt: 1 } - for retry processing
// { category: 1, createdAt: -1 }
```

## 🔐 Security Architecture

### **Authentication & Authorization**
```
Security Layers:
├── Frontend Security
│   ├── Wallet Signature Verification
│   ├── Content Security Policy (CSP)
│   ├── XSS Protection
│   └── HTTPS Only
├── API Security
│   ├── Rate Limiting (100 req/min)
│   ├── CORS Configuration
│   ├── Input Validation & Sanitization
│   ├── SQL Injection Prevention
│   └── Error Handling (no sensitive data exposure)
├── Database Security
│   ├── Connection String Encryption
│   ├── Field-level Encryption (sensitive data)
│   ├── Access Control (role-based)
│   └── Audit Logging
└── Smart Contract Security
    ├── Reentrancy Guards
    ├── Access Control Modifiers
    ├── Input Validation
    ├── Emergency Pause Functionality
    └── Multi-signature Requirements (admin functions)
```

### **Data Privacy & Compliance**
```
Privacy Measures:
├── Data Minimization
│   ├── Only collect necessary data
│   ├── Regular data cleanup
│   └── Retention policies
├── Encryption
│   ├── Data at rest (MongoDB encryption)
│   ├── Data in transit (TLS 1.3)
│   └── Sensitive field encryption
├── Access Control
│   ├── Wallet-based authentication
│   ├── Role-based permissions
│   └── Audit trails
└── Compliance
    ├── GDPR compliance (EU users)
    ├── CCPA compliance (CA users)
    ├── Data portability
    └── Right to deletion
```

## 🚀 Deployment Architecture

### **Production Infrastructure**
```
Production Environment:
├── Frontend Deployment
│   ├── Vercel (Static hosting)
│   ├── CDN Distribution
│   ├── Environment Variables
│   └── Custom Domain + SSL
├── Backend Deployment
│   ├── Vercel Serverless Functions
│   ├── Environment Variables
│   ├── Database Connection Pooling
│   └── Error Monitoring (Sentry)
├── Database
│   ├── MongoDB Atlas (Cloud)
│   ├── Replica Sets (High Availability)
│   ├── Automated Backups
│   └── Performance Monitoring
├── Smart Contracts
│   ├── Ethereum Mainnet
│   ├── Polygon (L2 scaling)
│   ├── Contract Verification
│   └── Multi-signature Governance
└── External Services
    ├── Email Service (AWS SES)
    ├── File Storage (AWS S3)
    ├── Analytics (Mixpanel)
    └── Error Tracking (Sentry)
```

### **Development & Staging**
```
Development Pipeline:
├── Local Development
│   ├── Docker Compose (full stack)
│   ├── Local MongoDB
│   ├── Hardhat Network (blockchain)
│   └── Local SMTP (email testing)
├── Staging Environment
│   ├── Vercel Preview Deployments
│   ├── Staging Database
│   ├── Testnet Contracts (Sepolia)
│   └── Test Email Service
├── CI/CD Pipeline
│   ├── GitHub Actions
│   ├── Automated Testing
│   ├── Code Quality Checks
│   ├── Security Scans
│   └── Deployment Automation
└── Monitoring & Alerting
    ├── Uptime Monitoring
    ├── Performance Metrics
    ├── Error Alerting
    └── Usage Analytics
```

## 📈 Scalability Architecture

### **Horizontal Scaling Strategy**
```
Scaling Approach:
├── Frontend Scaling
│   ├── CDN Distribution (Global)
│   ├── Code Splitting (Lazy loading)
│   ├── Image Optimization
│   └── Caching Strategies
├── Backend Scaling
│   ├── Serverless Functions (Auto-scaling)
│   ├── Database Connection Pooling
│   ├── API Rate Limiting
│   ├── Caching (Redis - future)
│   └── Load Balancing
├── Database Scaling
│   ├── Read Replicas
│   ├── Sharding (by organization)
│   ├── Index Optimization
│   └── Query Optimization
└── Blockchain Scaling
    ├── Layer 2 Solutions (Polygon)
    ├── Batch Operations
    ├── State Channels (future)
    └── Cross-chain Bridges
```

### **Performance Optimization**
```
Optimization Strategies:
├── Frontend Performance
│   ├── React.memo() for components
│   ├── useMemo() for expensive calculations
│   ├── Virtual scrolling (large lists)
│   ├── Image lazy loading
│   └── Bundle optimization
├── Backend Performance
│   ├── Database query optimization
│   ├── Response caching
│   ├── Compression (gzip)
│   ├── Connection pooling
│   └── Async processing
├── Database Performance
│   ├── Proper indexing strategy
│   ├── Query optimization
│   ├── Aggregation pipelines
│   ├── Connection pooling
│   └── Read replicas
└── Blockchain Performance
    ├── Gas optimization
    ├── Batch transactions
    ├── Layer 2 scaling
    └── State management optimization
```

## 🔄 Integration Architecture

### **External Service Integrations**
```
Integration Points:
├── Blockchain Networks
│   ├── Ethereum Mainnet
│   ├── Polygon Network
│   ├── BSC (future)
│   └── Arbitrum (future)
├── Token Protocols
│   ├── ERC20 Tokens (USDC, USDT)
│   ├── ERC721 NFTs (receipts)
│   ├── ERC1155 Multi-tokens
│   └── Custom Tokens
├── Email Services
│   ├── AWS SES (Production)
│   ├── SendGrid (Backup)
│   ├── SMTP (Development)
│   └── Webhook handling
├── Storage Services
│   ├── AWS S3 (Files)
│   ├── IPFS (Decentralized)
│   ├── Arweave (Permanent)
│   └── Local storage (Development)
├── Analytics & Monitoring
│   ├── Google Analytics
│   ├── Mixpanel (Events)
│   ├── Sentry (Errors)
│   └── Custom dashboards
└── Payment Processors
    ├── Crypto payments (Native)
    ├── Stripe (Credit cards)
    ├── PayPal (Future)
    └── Bank transfers (Future)
```

### **API Integration Patterns**
```
Integration Patterns:
├── Synchronous APIs
│   ├── REST endpoints
│   ├── GraphQL (future)
│   ├── Request/Response
│   └── Error handling
├── Asynchronous Processing
│   ├── Background jobs
│   ├── Queue processing
│   ├── Webhook handling
│   └── Event-driven architecture
├── Real-time Updates
│   ├── WebSocket connections
│   ├── Server-Sent Events
│   ├── Push notifications
│   └── Live data sync
└── Batch Processing
    ├── Recurring invoice generation
    ├── Overdue reminder processing
    ├── Analytics computation
    └── Data migration
```

## 📊 Monitoring & Analytics Architecture

### **Application Monitoring**
```
Monitoring Stack:
├── Performance Monitoring
│   ├── Response time tracking
│   ├── Database query performance
│   ├── API endpoint monitoring
│   └── Frontend performance metrics
├── Error Tracking
│   ├── Sentry integration
│   ├── Error categorization
│   ├── Stack trace analysis
│   └── Alert notifications
├── Usage Analytics
│   ├── User behavior tracking
│   ├── Feature usage metrics
│   ├── Conversion funnels
│   └── Retention analysis
├── Business Metrics
│   ├── Invoice creation rates
│   ├── Payment success rates
│   ├── User engagement
│   └── Revenue tracking
└── Infrastructure Monitoring
    ├── Server resource usage
    ├── Database performance
    ├── Network latency
    └── Uptime monitoring
```

### **Data Analytics Pipeline**
```
Analytics Flow:
├── Data Collection
│   ├── Frontend events
│   ├── API interactions
│   ├── Database changes
│   └── Blockchain events
├── Data Processing
│   ├── Event aggregation
│   ├── Metrics calculation
│   ├── Anomaly detection
│   └── Trend analysis
├── Data Storage
│   ├── Time-series database
│   ├── Data warehouse
│   ├── Real-time cache
│   └── Historical archives
└── Data Visualization
    ├── Real-time dashboards
    ├── Custom reports
    ├── Alert systems
    └── Business intelligence
```

This comprehensive system architecture documentation provides a complete overview of how VPay's components interact, scale, and operate together to deliver a robust Web3 workplace management solution. The architecture is designed for scalability, security, and maintainability while providing excellent user experience for both employers and employees.