# VPay Frontend Documentation

## 🎨 Overview

VPay's frontend is a modern React application built with TypeScript, providing a comprehensive Web3 workplace management interface. It serves both employers and employees with intuitive dashboards, automated workflows, and seamless blockchain integration.

## 🏗️ Architecture

### **Technology Stack**
```json
{
  "framework": "React 19.1.0",
  "language": "TypeScript (via JSConfig)",
  "styling": "TailwindCSS 4.1.11",
  "web3": "Wagmi 2.16.1 + RainbowKit 2.2.8",
  "routing": "React Router DOM 7.7.1",
  "animations": "Framer Motion 12.23.12",
  "notifications": "React Toastify 11.0.5",
  "state": "React Query (TanStack Query 5.84.1)",
  "icons": "Lucide React 0.536.0",
  "avatars": "DiceBear 9.2.3",
  "build": "Vite 7.0.4"
}
```

### **Project Structure**
```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Header, Sidebar)
│   └── ui/              # Base UI components
├── pages/               # Page components (routes)
│   ├── Dashboard/       # Main dashboard
│   ├── Contact/         # Employee management
│   ├── Invoices/        # Invoice management
│   ├── Payments/        # Payment tracking
│   ├── Lock/            # Token locking
│   ├── Payroll/         # Payroll/vesting
│   └── VestingSchedules/ # Vesting management
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── provider/            # Context providers
├── App.jsx              # Main app component
└── main.jsx            # App entry point
```

---

## 🔧 Core Configuration

### **Vite Configuration**
```javascript
// vite.config.js
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
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    host: true
  }
})
```

### **TailwindCSS Configuration**
```javascript
// tailwind.config.js
import animate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... more color definitions
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [animate],
}
```

### **Web3 Provider Setup**
```javascript
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './lib/wagmi'
import App from './App.jsx'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

---

## 🎯 Core Components

### **1. App Component**
The main application component handling routing and layout.

```javascript
// src/App.jsx
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import Dashboard from "@/pages/Dashboard";
import TokenLockPage from "@/pages/Lock";
import TokenLock from "@/pages/Lock/TOKEN";
import LPLockListPage from "@/pages/Lock/LP";
import Payroll from "@/pages/Payroll";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";
import ContactsPage from "@/pages/Contact";
import InvoicesPage from "@/pages/Invoices";
import PaymentsPage from "@/pages/Payments";
import RecurringPage from "@/pages/Recurring";
import ReceiptsPage from "@/pages/Receipts";
import InvoiceViewPage from "@/pages/InvoiceView";
import CreateInvoicePage from "@/pages/CreateInvoice";
import VestingSchedulesPage from "@/pages/VestingSchedules";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <BackgroundEffects />

      <Header onMenuToggle={toggleSidebar} />

      <div className="flex h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)]">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/invoices/create" element={<CreateInvoicePage />} />
              <Route path="/invoices/:id" element={<InvoiceViewPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/recurring" element={<RecurringPage />} />
              <Route path="/receipts" element={<ReceiptsPage />} />
              <Route path="/create-lock" element={<TokenLockPage />} />
              <Route path="/payroll/create" element={<Payroll />} />
              <Route path="/vesting-schedules" element={<VestingSchedulesPage />} />
              <Route path="/contact" element={<ContactsPage />} />
              <Route path="/token-lock" element={<TokenLock />} />
              <Route path="/lp-lock" element={<LPLockListPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
```

### **2. Header Component**
Main navigation header with wallet connection and user menu.

```javascript
// src/components/layout/Header.jsx
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Menu, Bell, Settings, User } from 'lucide-react';
import { VPayLogo } from '@/components/ui/VPay-logo';
import { Button } from '@/components/ui/button';

export const Header = ({ onMenuToggle }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { address, isConnected } = useAccount();

  return (
    <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
      <div className="flex items-center justify-between h-full">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-700/50"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <VPayLogo className="h-8 w-8 sm:h-10 sm:w-10" />
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                VPay
              </h1>
              <p className="text-xs text-slate-400">
                Web3 Workplace Solution
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isConnected && (
            <>
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700/50"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </Button>
                
                {showNotifications && (
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Wallet Connection */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button
                          onClick={openConnectModal}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          onClick={openChainModal}
                          variant="destructive"
                        >
                          Wrong Network
                        </Button>
                      );
                    }

                    return (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={openChainModal}
                          variant="outline"
                          size="sm"
                          className="hidden sm:flex"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: 'hidden',
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </Button>

                        <Button
                          onClick={openAccountModal}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <User className="h-4 w-4" />
                          <span className="hidden sm:block">
                            {account.displayName}
                          </span>
                          <span className="sm:hidden">
                            {account.displayName?.slice(0, 6)}...
                          </span>
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
};

// Notification Dropdown Component
const NotificationDropdown = ({ onClose }) => {
  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Received',
      message: 'Alice Johnson paid invoice #2024001',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'vesting',
      title: 'Tokens Available',
      message: '2,500 USDC tokens are ready to claim',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'overdue',
      title: 'Overdue Invoice',
      message: 'Invoice #2024003 is 3 days overdue',
      time: '2 hours ago',
      unread: false
    }
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer ${
              notification.unread ? 'bg-slate-700/20' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                notification.unread ? 'bg-blue-500' : 'bg-slate-600'
              }`} />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">
                  {notification.title}
                </h4>
                <p className="text-sm text-slate-400 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {notification.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-blue-400 hover:text-blue-300"
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );
};
```

### **3. Sidebar Component**
Navigation sidebar with role-based menu items.

```javascript
// src/components/layout/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Repeat,
  Receipt,
  Lock,
  Coins,
  Calendar,
  Settings,
  X,
  ChevronDown,
  Building2,
  User
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const [userRole, setUserRole] = useState('employee'); // 'employer' or 'employee'
  const [expandedSections, setExpandedSections] = useState(['main']);

  // Determine user role based on data (simplified for demo)
  useEffect(() => {
    const checkUserRole = async () => {
      if (!address) return;
      
      // Check if user has employees (is an employer)
      try {
        const response = await fetch(`/api/workers/count/${address}`);
        const data = await response.json();
        
        if (data.success && data.data.count > 0) {
          setUserRole('employer');
        } else {
          setUserRole('employee');
        }
      } catch (error) {
        console.error('Failed to determine user role:', error);
      }
    };

    checkUserRole();
  }, [address]);

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Menu items based on user role
  const menuSections = {
    employer: [
      {
        id: 'main',
        title: 'Main',
        items: [
          { path: '/', icon: Home, label: 'Dashboard' },
          { path: '/contact', icon: Users, label: 'Employees' },
        ]
      },
      {
        id: 'payroll',
        title: 'Payroll & Invoicing',
        items: [
          { path: '/invoices', icon: FileText, label: 'Invoices' },
          { path: '/invoices/create', icon: FileText, label: 'Create Invoice' },
          { path: '/payments', icon: CreditCard, label: 'Payments' },
          { path: '/recurring', icon: Repeat, label: 'Recurring' },
          { path: '/receipts', icon: Receipt, label: 'Receipts' },
        ]
      },
      {
        id: 'vesting',
        title: 'Employee Benefits',
        items: [
          { path: '/payroll/create', icon: Coins, label: 'Create Vesting' },
          { path: '/vesting-schedules', icon: Calendar, label: 'Vesting Schedules' },
        ]
      },
      {
        id: 'locking',
        title: 'Token Management',
        items: [
          { path: '/create-lock', icon: Lock, label: 'Create Lock' },
          { path: '/token-lock', icon: Lock, label: 'Token Locks' },
          { path: '/lp-lock', icon: Lock, label: 'LP Locks' },
        ]
      }
    ],
    employee: [
      {
        id: 'main',
        title: 'Main',
        items: [
          { path: '/', icon: Home, label: 'Dashboard' },
        ]
      },
      {
        id: 'income',
        title: 'Income & Payments',
        items: [
          { path: '/invoices', icon: FileText, label: 'My Invoices' },
          { path: '/invoices/create', icon: FileText, label: 'Create Invoice' },
          { path: '/payments', icon: CreditCard, label: 'Payment History' },
          { path: '/receipts', icon: Receipt, label: 'Receipts' },
        ]
      },
      {
        id: 'benefits',
        title: 'Benefits & Vesting',
        items: [
          { path: '/vesting-schedules', icon: Calendar, label: 'My Vesting' },
        ]
      },
      {
        id: 'savings',
        title: 'Savings & Locks',
        items: [
          { path: '/create-lock', icon: Lock, label: 'Lock Tokens' },
          { path: '/token-lock', icon: Lock, label: 'My Locks' },
        ]
      }
    ]
  };

  const currentSections = menuSections[userRole] || menuSections.employee;

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-80 bg-slate-800/95 backdrop-blur-lg border-r border-slate-700/50 z-50 lg:relative lg:top-0 lg:h-full lg:translate-x-0 lg:block"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-2">
              {userRole === 'employer' ? (
                <Building2 className="h-5 w-5 text-blue-400" />
              ) : (
                <User className="h-5 w-5 text-green-400" />
              )}
              <span className="text-sm font-medium text-white capitalize">
                {userRole} Dashboard
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {currentSections.map((section) => (
              <div key={section.id} className="mb-6">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-white transition-colors"
                >
                  {section.title}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.includes(section.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <AnimatePresence>
                  {expandedSections.includes(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
```

---

## 📊 Dashboard Components

### **1. Main Dashboard**
Comprehensive dashboard showing different views for employers vs employees.

```javascript
// src/pages/Dashboard/index.jsx
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Calendar,
  Lock,
  DollarSign,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const [userRole, setUserRole] = useState('employee');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData();
    }
  }, [address, isConnected]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      // Determine user role
      const employeeCountResponse = await fetch(`/api/workers/count/${address}`);
      const employeeData = await employeeCountResponse.json();
      
      const isEmployer = employeeData.success && employeeData.data.count > 0;
      setUserRole(isEmployer ? 'employer' : 'employee');
      
      if (isEmployer) {
        await loadEmployerStats();
      } else {
        await loadEmployeeStats();
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployerStats = async () => {
    try {
      // Load invoice stats
      const invoiceResponse = await fetch(`/api/invoices/stats/${address}`);
      const invoiceData = await invoiceResponse.json();
      
      // Load employee count
      const employeeResponse = await fetch(`/api/workers/count/${address}`);
      const employeeData = await employeeResponse.json();
      
      setStats({
        totalEmployees: employeeData.data?.count || 0,
        activeEmployees: employeeData.data?.activeEmployees || 0,
        totalInvoices: invoiceData.data?.totalInvoices || 0,
        paidInvoices: invoiceData.data?.paidInvoices || 0,
        pendingInvoices: invoiceData.data?.pendingInvoices || 0,
        overdueInvoices: invoiceData.data?.overdueInvoices || 0,
        totalAmount: invoiceData.data?.totalAmount || 0,
        totalReceived: invoiceData.data?.totalReceived || 0,
        totalRemaining: invoiceData.data?.totalRemaining || 0,
        monthlyPayroll: invoiceData.data?.monthlyPayroll || 0
      });
    } catch (error) {
      console.error('Failed to load employer stats:', error);
    }
  };

  const loadEmployeeStats = async () => {
    try {
      // Load personal invoice stats (invoices received)
      const invoiceResponse = await fetch(`/api/invoices?payerWalletAddr=${address}`);
      const invoiceData = await invoiceResponse.json();
      
      // Calculate personal stats
      const invoices = invoiceData.data || [];
      const totalEarnings = invoices.reduce((sum, inv) => sum + (inv.totalAmountReceived || 0), 0);
      const pendingPayments = invoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
      
      setStats({
        totalInvoices: invoices.length,
        totalEarnings,
        pendingPayments,
        paidInvoices: invoices.filter(inv => inv.invoiceStatus === 'Paid').length,
        pendingInvoices: invoices.filter(inv => inv.invoiceStatus === 'Awaiting Payment').length,
        // TODO: Add vesting and locking stats from smart contracts
        vestingBalance: 0,
        lockedSavings: 0,
        availableToClaim: 0
      });
    } catch (error) {
      console.error('Failed to load employee stats:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Welcome to VPay
          </h2>
          <p className="text-slate-400 mb-6">
            Connect your wallet to access your workplace dashboard
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {userRole === 'employer' ? 'Employer Dashboard' : 'Employee Dashboard'}
          </h1>
          <p className="text-slate-400 mt-2">
            {userRole === 'employer' 
              ? 'Manage your team and payroll operations'
              : 'Track your payments and benefits'
            }
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Connected Wallet</p>
          <p className="text-white font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>

      {userRole === 'employer' ? (
        <EmployerDashboard stats={stats} />
      ) : (
        <EmployeeDashboard stats={stats} />
      )}
    </div>
  );
};

// Employer Dashboard Component
const EmployerDashboard = ({ stats }) => {
  const employerStats = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      title: 'Monthly Payroll',
      value: `$${stats.monthlyPayroll?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+5% from last month'
    },
    {
      title: 'Pending Payments',
      value: `$${stats.totalRemaining?.toLocaleString() || 0}`,
      icon: Clock,
      color: 'bg-orange-500',
      change: `${stats.pendingInvoices} invoices`
    },
    {
      title: 'Total Paid',
      value: `$${stats.totalReceived?.toLocaleString() || 0}`,
      icon: CreditCard,
      color: 'bg-purple-500',
      change: `${stats.paidInvoices} invoices`
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employerStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions userRole="employer" />
        <RecentActivity userRole="employer" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PayrollChart />
        <EmployeeGrowthChart />
      </div>
    </div>
  );
};

// Employee Dashboard Component
const EmployeeDashboard = ({ stats }) => {
  const employeeStats = [
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: 'This year'
    },
    {
      title: 'Pending Payments',
      value: `$${stats.pendingPayments?.toLocaleString() || 0}`,
      icon: Clock,
      color: 'bg-orange-500',
      change: `${stats.pendingInvoices} invoices`
    },
    {
      title: 'Vesting Balance',
      value: `$${stats.vestingBalance?.toLocaleString() || 0}`,
      icon: Calendar,
      color: 'bg-blue-500',
      change: 'Available to claim'
    },
    {
      title: 'Locked Savings',
      value: `$${stats.lockedSavings?.toLocaleString() || 0}`,
      icon: Lock,
      color: 'bg-purple-500',
      change: 'Secured tokens'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {employeeStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions userRole="employee" />
        <RecentActivity userRole="employee" />
      </div>

      {/* Personal Finance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VestingOverview />
        <SavingsOverview />
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ userRole }) => {
  const employerActions = [
    { title: 'Add Employee', href: '/contact', icon: Users },
    { title: 'Create Invoice', href: '/invoices/create', icon: FileText },
    { title: 'Setup Vesting', href: '/payroll/create', icon: Calendar },
    { title: 'View Payments', href: '/payments', icon: CreditCard }
  ];

  const employeeActions = [
    { title: 'Create Invoice', href: '/invoices/create', icon: FileText },
    { title: 'Check Vesting', href: '/vesting-schedules', icon: Calendar },
    { title: 'Lock Tokens', href: '/create-lock', icon: Lock },
    { title: 'View Payments', href: '/payments', icon: CreditCard }
  ];

  const actions = userRole === 'employer' ? employerActions : employeeActions;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className="flex flex-col items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <action.icon className="h-6 w-6 text-blue-400 mb-2" />
            <span className="text-sm text-white text-center">{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivity = ({ userRole }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Load recent activities based on user role
    loadRecentActivities();
  }, [userRole]);

  const loadRecentActivities = async () => {
    // Mock data for now - replace with actual API calls
    const mockActivities = userRole === 'employer' ? [
      {
        type: 'payment',
        message: 'Payment received from Alice Johnson',
        time: '2 minutes ago',
        amount: '$8,000'
      },
      {
        type: 'invoice',
        message: 'Monthly payroll invoices generated',
        time: '1 hour ago',
        count: '5 invoices'
      },
      {
        type: 'employee',
        message: 'New employee Bob Smith added',
        time: '2 hours ago'
      }
    ] : [
      {
        type: 'payment',
        message: 'Salary payment received',
        time: '1 hour ago',
        amount: '$5,000'
      },
      {
        type: 'vesting',
        message: 'Tokens available to claim',
        time: '2 hours ago',
        amount: '2,500 USDC'
      },
      {
        type: 'lock',
        message: 'Savings lock created',
        time: '1 day ago',
        amount: '$3,000'
      }
    ];

    setActivities(mockActivities);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div className="flex-1">
              <p className="text-sm text-white">{activity.message}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-400">{activity.time}</p>
                {activity.amount && (
                  <p className="text-xs text-green-400 font-medium">
                    {activity.amount}
                  </p>
                )}
                {activity.count && (
                  <p className="text-xs text-blue-400 font-medium">
                    {activity.count}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## 💼 Employee Management Components

### **1. Contact/Employee Management Page**

```javascript
// src/pages/Contact/index.jsx
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ContactPage } from './components/ContactPage';

const ContactsPage = () => {
  const { address, isConnected } = useAccount();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadEmployees();
    }
  }, [address, isConnected]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workers?savedBy=${address}`);
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (employeeData) => {
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...employeeData,
          savedBy: address
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setEmployees([...employees, result.data]);
        setShowAddForm(false);
        toast.success(`Employee ${result.data.fullName} added successfully!`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (id, updateData) => {
    try {
      const response = await fetch(`/api/workers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (result.success) {
        setEmployees(employees.map(emp => 
          emp._id === id ? result.data : emp
        ));
        toast.success('Employee updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workers/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setEmployees(employees.filter(emp => emp._id !== id));
        toast.success('Employee deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ContactPage
      employees={filteredEmployees}
      loading={loading}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      showAddForm={showAddForm}
      setShowAddForm={setShowAddForm}
      onAddEmployee={handleAddEmployee}
      onUpdateEmployee={handleUpdateEmployee}
      onDeleteEmployee={handleDeleteEmployee}
    />
  );
};

export default ContactsPage;
```

### **2. Employee Management Component**

```javascript
// src/pages/Contact/components/ContactPage.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Users,
  Mail,
  Wallet,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ContactPage = ({
  employees,
  loading,
  searchTerm,
  setSearchTerm,
  showAddForm,
  setShowAddForm,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}) => {
  const [editingEmployee, setEditingEmployee] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Employee Management</h1>
          <p className="text-slate-400 mt-2">
            Manage your team members and their information
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{employees.length}</p>
              <p className="text-slate-400">Total Employees</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">
                {employees.filter(emp => emp.isActive).length}
              </p>
              <p className="text-slate-400">Active</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-orange-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">
                {employees.filter(emp => !emp.isActive).length}
              </p>
              <p className="text-slate-400">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search employees by name, email, position, or wallet address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {employees.map((employee) => (
            <motion.div
              key={employee._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <EmployeeCard
                employee={employee}
                onEdit={() => setEditingEmployee(employee)}
                onDelete={() => onDeleteEmployee(employee._id)}
                onToggleStatus={() => onUpdateEmployee(employee._id, {
                  isActive: !employee.isActive
                })}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No employees found</h3>
          <p className="text-slate-400 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first employee'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Employee
            </Button>
          )}
        </div>
      )}

      {/* Add/Edit Employee Modal */}
      <AnimatePresence>
        {(showAddForm || editingEmployee) && (
          <EmployeeFormModal
            employee={editingEmployee}
            onClose={() => {
              setShowAddForm(false);
              setEditingEmployee(null);
            }}
            onSubmit={(data) => {
              if (editingEmployee) {
                onUpdateEmployee(editingEmployee._id, data);
                setEditingEmployee(null);
              } else {
                onAddEmployee(data);
                setShowAddForm(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Employee Card Component
const EmployeeCard = ({ employee, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {employee.fullName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {employee.fullName}
            </h3>
            <p className="text-slate-400 text-sm">{employee.label}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            employee.isActive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {employee.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Mail className="h-4 w-4 text-slate-400" />
          <span className="text-slate-300 text-sm">{employee.email}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Wallet className="h-4 w-4 text-slate-400" />
          <span className="text-slate-300 text-sm font-mono">
            {employee.walletAddress.slice(0, 6)}...{employee.walletAddress.slice(-4)}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(employee.walletAddress)}
            className="text-blue-400 hover:text-blue-300"
          >
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleStatus}
            className={`p-2 rounded-lg transition-colors ${
              employee.isActive
                ? 'text-slate-400 hover:text-orange-400 hover:bg-slate-700/50'
                : 'text-slate-400 hover:text-green-400 hover:bg-slate-700/50'
            }`}
          >
            {employee.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-xs text-slate-500">
          Added {new Date(employee.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

// Employee Form Modal Component
const EmployeeFormModal = ({ employee, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: employee?.fullName || '',
    walletAddress: employee?.walletAddress || '',
    email: employee?.email || '',
    label: employee?.label || '',
    isActive: employee?.isActive ?? true
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
    } else if (!formData.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors.walletAddress = 'Invalid wallet address format';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
      >
        <h2 className="text-xl font-bold text-white mb-6">
          {employee ? 'Edit Employee' : 'Add New Employee'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
            />
            {errors.walletAddress && (
              <p className="text-red-400 text-xs mt-1">{errors.walletAddress}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Position/Label
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Senior Developer, Product Manager"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-slate-300">
              Active Employee
            </label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {employee ? 'Update' : 'Add'} Employee
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
```

---

This comprehensive frontend documentation covers the core architecture, components, and user interfaces for both employers and employees. The system provides intuitive dashboards, seamless Web3 integration, and comprehensive workplace management features. The documentation includes practical examples and implementation details for building a modern Web3 workplace solution.