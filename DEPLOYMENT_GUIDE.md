# VPay Deployment Guide

## 🚀 Overview

This comprehensive deployment guide covers all aspects of deploying VPay's Web3 workplace management platform, from local development to production deployment across multiple environments.

## 📋 Prerequisites

### **System Requirements**
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (or yarn/pnpm)
- **MongoDB**: Version 5.0 or higher
- **Git**: Latest version
- **Foundry**: Latest version (for smart contracts)

### **Development Tools**
- **Code Editor**: VS Code (recommended) with extensions:
  - Solidity (for smart contracts)
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - MongoDB for VS Code
- **Browser**: Chrome/Firefox with MetaMask extension
- **Terminal**: Command line interface

### **Accounts & Services**
- **MongoDB Atlas**: For production database
- **Vercel**: For hosting frontend and backend
- **Email Service**: Gmail/AWS SES for notifications
- **Blockchain**: Ethereum/Polygon wallet with testnet ETH
- **GitHub**: For version control and CI/CD

---

## 🏠 Local Development Setup

### **1. Repository Setup**

```bash
# Clone the repository
git clone https://github.com/your-org/vpay.git
cd vpay

# Check project structure
ls -la
# Expected: backend/, frontend/, contract/, README.md
```

### **2. Backend Setup**

#### **Install Dependencies**
```bash
cd backend
npm install

# Verify installation
npm list --depth=0
```

#### **Environment Configuration**
```bash
# Create environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Backend Environment Variables (.env):**
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/vpay-dev
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/vpay

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
CORS_ORIGIN=http://localhost:5173

# Optional: Analytics
MIXPANEL_TOKEN=your-mixpanel-token
SENTRY_DSN=your-sentry-dsn
```

#### **Database Setup**

**Option 1: Local MongoDB**
```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify connection
mongosh
> show dbs
> exit
```

**Option 2: MongoDB Atlas (Recommended)**
```bash
# 1. Create account at https://www.mongodb.com/atlas
# 2. Create new cluster (free tier available)
# 3. Create database user
# 4. Whitelist IP addresses (0.0.0.0/0 for development)
# 5. Get connection string and update MONGO_URI in .env
```

#### **Start Backend Server**
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start

# Verify server is running
curl http://localhost:3000
# Expected: {"message":"VPay API is up and running!"}
```

#### **Test Backend APIs**
```bash
# Run API tests
npm run test:all

# Or run individual tests
node test-api.js
node test-controller-working.js
```

### **3. Frontend Setup**

#### **Install Dependencies**
```bash
cd ../frontend
npm install

# Verify installation
npm list --depth=0
```

#### **Environment Configuration**
```bash
# Create environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Frontend Environment Variables (.env):**
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Blockchain Configuration
VITE_CHAIN_ID=1337
VITE_CHAIN_NAME=Localhost

# Contract Addresses (update after deployment)
VITE_VESTING_CONTRACT_ADDRESS=0x...
VITE_TOKEN_LOCKER_CONTRACT_ADDRESS=0x...
VITE_USDC_CONTRACT_ADDRESS=0x...
VITE_USDT_CONTRACT_ADDRESS=0x...

# Optional: Analytics
VITE_MIXPANEL_TOKEN=your-mixpanel-token
VITE_SENTRY_DSN=your-sentry-dsn

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
```

#### **Start Frontend Development Server**
```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# Verify app loads and wallet connection works
```

### **4. Smart Contract Setup**

#### **Install Foundry**
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
cast --version
anvil --version
```

#### **Setup Contracts**
```bash
cd ../contract

# Install dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test

# Check test coverage
forge coverage
```

#### **Deploy to Local Network**

**Start Local Blockchain:**
```bash
# Terminal 1: Start Anvil (local blockchain)
anvil

# Note the private keys and addresses provided
# Use the first address as your deployer account
```

**Deploy Contracts:**
```bash
# Terminal 2: Deploy contracts
# Create deployment script
cat > script/Deploy.s.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/VestPayment.sol";
import "../src/TokenLocker.sol";
import "../src/Tether.sol";
import "../src/Cirlcle.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy test tokens
        Tether usdt = new Tether();
        Circle usdc = new Circle();

        // Deploy main contracts
        MultiTokenVestingManager vesting = new MultiTokenVestingManager();
        TokenLocker locker = new TokenLocker();

        console.log("USDT deployed to:", address(usdt));
        console.log("USDC deployed to:", address(usdc));
        console.log("VestPayment deployed to:", address(vesting));
        console.log("TokenLocker deployed to:", address(locker));

        vm.stopBroadcast();
    }
}
EOF

# Set private key (use one from Anvil output)
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Deploy to local network
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast

# Save contract addresses to environment file
```

**Update Environment Variables:**
```bash
# Update frontend/.env with deployed contract addresses
VITE_VESTING_CONTRACT_ADDRESS=0x... # From deployment output
VITE_TOKEN_LOCKER_CONTRACT_ADDRESS=0x...
VITE_USDC_CONTRACT_ADDRESS=0x...
VITE_USDT_CONTRACT_ADDRESS=0x...
```

### **5. Complete Local Setup Verification**

#### **Test Full Stack Integration**
```bash
# 1. Ensure all services are running:
# - MongoDB (port 27017)
# - Backend API (port 3000)
# - Frontend (port 5173)
# - Anvil blockchain (port 8545)

# 2. Open browser to http://localhost:5173
# 3. Connect MetaMask to localhost:8545
# 4. Import an account using private key from Anvil
# 5. Test wallet connection
# 6. Test employee management
# 7. Test invoice creation
# 8. Test token locking/vesting
```

---

## 🧪 Staging Environment Setup

### **1. Database Setup**

#### **MongoDB Atlas Staging**
```bash
# 1. Create staging cluster on MongoDB Atlas
# 2. Create staging database user
# 3. Configure IP whitelist
# 4. Get connection string
MONGO_URI=mongodb+srv://staging-user:password@staging-cluster.mongodb.net/vpay-staging
```

### **2. Backend Staging Deployment**

#### **Vercel Deployment**
```bash
cd backend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Configure vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "staging"
  }
}
EOF

# Deploy to staging
vercel --prod

# Configure environment variables in Vercel dashboard
# Or via CLI:
vercel env add MONGO_URI
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add JWT_SECRET
```

### **3. Frontend Staging Deployment**

```bash
cd ../frontend

# Build for staging
npm run build

# Deploy to Vercel
vercel --prod

# Configure environment variables
vercel env add VITE_API_URL
vercel env add VITE_VESTING_CONTRACT_ADDRESS
vercel env add VITE_TOKEN_LOCKER_CONTRACT_ADDRESS
```

### **4. Smart Contract Staging Deployment**

#### **Deploy to Sepolia Testnet**
```bash
cd ../contract

# Get Sepolia ETH from faucet
# https://sepoliafaucet.com/

# Set environment variables
export PRIVATE_KEY=your-private-key
export SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# Deploy to Sepolia
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Update frontend environment with Sepolia addresses
```

---

## 🏭 Production Deployment

### **1. Pre-deployment Checklist**

#### **Security Checklist**
- [ ] All environment variables are set securely
- [ ] Database access is restricted to application servers
- [ ] API rate limiting is configured
- [ ] CORS is properly configured
- [ ] HTTPS is enforced
- [ ] Smart contracts are audited
- [ ] Error handling doesn't expose sensitive data
- [ ] Input validation is comprehensive
- [ ] Authentication is properly implemented

#### **Performance Checklist**
- [ ] Database indexes are optimized
- [ ] API responses are cached where appropriate
- [ ] Frontend assets are optimized
- [ ] Images are compressed and lazy-loaded
- [ ] Bundle size is minimized
- [ ] CDN is configured
- [ ] Monitoring is set up

### **2. Production Database Setup**

#### **MongoDB Atlas Production**
```bash
# 1. Create production cluster (M2+ recommended)
# 2. Enable backup
# 3. Configure security:
#    - Network access (specific IPs only)
#    - Database users (minimal permissions)
#    - Enable encryption at rest
# 4. Set up monitoring alerts
# 5. Configure connection pooling
```

**Production MongoDB Configuration:**
```javascript
// backend/db/connectDb.js - Production optimizations
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Connection pool size
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### **3. Production Backend Deployment**

#### **Vercel Production Configuration**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "server.js": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

**Production Environment Variables:**
```env
# Database
MONGO_URI=mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/vpay-prod

# Server
NODE_ENV=production
PORT=3000

# Security
JWT_SECRET=super-secure-production-secret-key
CORS_ORIGIN=https://your-domain.com

# Email (AWS SES recommended for production)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-access-key
SMTP_PASS=your-ses-secret-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
MIXPANEL_TOKEN=your-mixpanel-token

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **Deploy to Production**
```bash
cd backend

# Set production environment
export NODE_ENV=production

# Deploy
vercel --prod

# Verify deployment
curl https://your-api-domain.vercel.app
```

### **4. Production Frontend Deployment**

#### **Build Optimization**
```javascript
// vite.config.js - Production optimizations
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['wagmi', '@rainbow-me/rainbowkit', 'viem'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable in production
    minify: 'terser'
  },
  define: {
    global: 'globalThis',
  }
})
```

**Production Environment Variables:**
```env
# API
VITE_API_URL=https://your-api-domain.vercel.app/api

# Blockchain (Mainnet)
VITE_CHAIN_ID=1
VITE_CHAIN_NAME=Ethereum

# Contract Addresses (Mainnet)
VITE_VESTING_CONTRACT_ADDRESS=0x...
VITE_TOKEN_LOCKER_CONTRACT_ADDRESS=0x...
VITE_USDC_CONTRACT_ADDRESS=0xA0b86a33E6441E13C7c6C3B0A4e5Dd96C2D5C7e2
VITE_USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7

# Analytics
VITE_MIXPANEL_TOKEN=your-production-mixpanel-token
VITE_SENTRY_DSN=your-production-sentry-dsn

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

#### **Deploy Frontend**
```bash
cd frontend

# Build for production
npm run build

# Test build locally
npm run preview

# Deploy to Vercel
vercel --prod

# Configure custom domain (optional)
vercel domains add your-domain.com
```

### **5. Production Smart Contract Deployment**

#### **Mainnet Deployment Preparation**
```bash
# Security checklist for mainnet deployment:
# 1. Code audit completed
# 2. Test coverage > 95%
# 3. All tests pass
# 4. Gas optimization completed
# 5. Multi-signature setup for admin functions
# 6. Emergency pause mechanism tested
# 7. Upgrade mechanism (if needed) tested
```

#### **Deploy to Ethereum Mainnet**
```bash
cd contract

# Final testing
forge test
forge coverage

# Set mainnet environment variables
export PRIVATE_KEY=your-mainnet-private-key
export MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
export ETHERSCAN_API_KEY=your-etherscan-api-key

# Deploy to mainnet
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $MAINNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --gas-price 20000000000 # 20 gwei, adjust based on network conditions

# Verify contracts on Etherscan
forge verify-contract \
  --chain-id 1 \
  --num-of-optimizations 200 \
  --compiler-version v0.8.24+commit.e11b9ed9 \
  CONTRACT_ADDRESS \
  src/VestPayment.sol:MultiTokenVestingManager \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

#### **Alternative: Deploy to Polygon (Lower Fees)**
```bash
# Set Polygon environment variables
export POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
export POLYGONSCAN_API_KEY=your-polygonscan-api-key

# Deploy to Polygon
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $POLYGON_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $POLYGONSCAN_API_KEY
```

---

## 🔄 CI/CD Pipeline Setup

### **1. GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy VPay

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install Backend Dependencies
      run: |
        cd backend
        npm ci
    
    - name: Install Frontend Dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Setup Foundry
      uses: foundry-rs/foundry-toolchain@v1
    
    - name: Install Contract Dependencies
      run: |
        cd contract
        forge install
    
    - name: Run Backend Tests
      run: |
        cd backend
        npm test
      env:
        MONGO_URI: mongodb://localhost:27017/test
        NODE_ENV: test
    
    - name: Run Frontend Tests
      run: |
        cd frontend
        npm test
    
    - name: Run Contract Tests
      run: |
        cd contract
        forge test
    
    - name: Build Frontend
      run: |
        cd frontend
        npm run build
    
    - name: Run Security Audit
      run: |
        cd backend
        npm audit --audit-level high
        cd ../frontend
        npm audit --audit-level high

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy Backend to Vercel (Staging)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_BACKEND }}
        working-directory: ./backend
        scope: staging
    
    - name: Deploy Frontend to Vercel (Staging)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_FRONTEND }}
        working-directory: ./frontend
        scope: staging

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy Backend to Vercel (Production)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_BACKEND }}
        working-directory: ./backend
        vercel-args: '--prod'
    
    - name: Deploy Frontend to Vercel (Production)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_FRONTEND }}
        working-directory: ./frontend
        vercel-args: '--prod'
    
    - name: Notify Deployment
      run: |
        curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"VPay Production Deployment Completed ✅"}' \
        ${{ secrets.SLACK_WEBHOOK_URL }}
```

### **2. Environment Management**

#### **GitHub Secrets Configuration**
```bash
# Required secrets in GitHub repository settings:
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID_BACKEND=backend-project-id
VERCEL_PROJECT_ID_FRONTEND=frontend-project-id

# Database
MONGO_URI_STAGING=mongodb-staging-connection-string
MONGO_URI_PRODUCTION=mongodb-production-connection-string

# Email
SMTP_USER=your-email-user
SMTP_PASS=your-email-password

# Security
JWT_SECRET_STAGING=staging-jwt-secret
JWT_SECRET_PRODUCTION=production-jwt-secret

# Blockchain
PRIVATE_KEY_STAGING=staging-deployment-private-key
PRIVATE_KEY_PRODUCTION=production-deployment-private-key

# Optional: Notifications
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

---

## 📊 Monitoring & Logging Setup

### **1. Application Monitoring**

#### **Sentry Integration**
```bash
# Install Sentry
cd backend
npm install @sentry/node @sentry/profiling-node

cd ../frontend
npm install @sentry/react @sentry/tracing
```

**Backend Sentry Configuration:**
```javascript
// backend/server.js
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// Error handling middleware
app.use(Sentry.Handlers.errorHandler());
```

**Frontend Sentry Configuration:**
```javascript
// frontend/src/main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
});
```

### **2. Analytics Setup**

#### **Mixpanel Integration**
```bash
# Install Mixpanel
cd frontend
npm install mixpanel-browser
```

```javascript
// frontend/src/lib/analytics.js
import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN);
}

export const analytics = {
  track: (event, properties) => {
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      mixpanel.track(event, properties);
    }
  },
  identify: (userId) => {
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      mixpanel.identify(userId);
    }
  }
};
```

### **3. Health Check Endpoints**

```javascript
// backend/routes/health.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  };
  
  res.status(200).json(health);
});

router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    res.status(200).json({
      status: 'Ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'Not Ready',
      error: error.message
    });
  }
});

module.exports = router;
```

---

## 🔧 Maintenance & Updates

### **1. Database Maintenance**

#### **Backup Strategy**
```bash
# Automated backup script
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/vpay"
DB_NAME="vpay-prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/backup_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/backup_$DATE"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

#### **Database Indexing**
```javascript
// Create indexes for production performance
db.workers.createIndex({ "savedBy": 1, "isActive": 1 })
db.workers.createIndex({ "walletAddress": 1 }, { unique: true })
db.workers.createIndex({ "email": 1 })

db.invoices.createIndex({ "creatorId": 1, "invoiceNumber": 1 }, { unique: true })
db.invoices.createIndex({ "creatorId": 1, "invoiceStatus": 1 })
db.invoices.createIndex({ "payerWalletAddr": 1 })
db.invoices.createIndex({ "dueDate": 1, "invoiceStatus": 1 })
db.invoices.createIndex({ "recurring.isRecurring": 1 })
```

### **2. Smart Contract Upgrades**

#### **Upgrade Strategy**
```solidity
// Upgradeable contract pattern (if needed)
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract VestPaymentUpgradeable is Initializable, OwnableUpgradeable {
    function initialize() public initializer {
        __Ownable_init();
        // Initialize contract state
    }
    
    // Contract implementation
}
```

### **3. Zero-Downtime Deployment**

#### **Rolling Deployment Strategy**
```bash
#!/bin/bash
# deploy.sh - Zero downtime deployment

echo "Starting zero-downtime deployment..."

# 1. Deploy new version to staging
vercel --prod --scope staging

# 2. Run health checks
curl -f https://staging-api.yourapp.com/health || exit 1

# 3. Run integration tests
npm run test:integration:staging || exit 1

# 4. Deploy to production
vercel --prod

# 5. Verify production deployment
curl -f https://api.yourapp.com/health || exit 1

# 6. Run smoke tests
npm run test:smoke:production || exit 1

echo "Deployment completed successfully!"
```

---

## 🚨 Troubleshooting Guide

### **Common Issues & Solutions**

#### **Database Connection Issues**
```bash
# Issue: MongoDB connection timeout
# Solution: Check network access and connection string

# Test connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/database"

# Check firewall settings
curl -v telnet://cluster.mongodb.net:27017
```

#### **Smart Contract Deployment Issues**
```bash
# Issue: Gas estimation failed
# Solution: Increase gas limit or check network congestion

forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --gas-limit 3000000

# Issue: Contract verification failed
# Solution: Ensure compiler version matches

forge verify-contract \
  --compiler-version v0.8.24+commit.e11b9ed9 \
  --num-of-optimizations 200 \
  CONTRACT_ADDRESS \
  src/Contract.sol:ContractName
```

#### **Frontend Build Issues**
```bash
# Issue: Build fails with memory error
# Solution: Increase Node.js memory limit

NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Issue: Environment variables not loading
# Solution: Check .env file format and restart dev server

# Verify environment variables
npm run dev -- --debug
```

#### **API Issues**
```bash
# Issue: CORS errors
# Solution: Check CORS configuration

# backend/config/corsOptions.js
const allowedOrigins = [
  'http://localhost:5173',
  'https://yourdomain.com'
];

# Issue: Rate limiting
# Solution: Implement proper rate limiting

npm install express-rate-limit
```

---

This comprehensive deployment guide covers all aspects of deploying VPay from local development to production. Follow these steps carefully and adapt them to your specific infrastructure needs. Remember to test thoroughly at each stage and maintain proper security practices throughout the deployment process.