# VPay - Decentralized Payroll & Invoice System

**VPay is a comprehensive blockchain-based payroll and invoice management system built on Sonic Labs, featuring advanced token vesting and locking mechanisms for secure financial operations.**

## 🚀 Project Overview

VPay revolutionizes traditional payroll and invoice management by leveraging blockchain technology to provide:

- **Automated Payroll Management**: Streamlined salary distribution with customizable vesting schedules
- **Invoice Generation & Tracking**: Digital invoice creation with automated payment processing
- **Token Locking System**: Secure token storage with flexible vesting and withdrawal options
- **Multi-Token Support**: Compatible with various ERC-20 tokens for diverse payment needs
- **Transparent & Auditable**: All transactions are recorded on-chain for complete transparency

## 📋 Core Features

### 💰 Payroll System
- Automated salary distribution
- Customizable vesting schedules
- Multi-token payment support
- Employee management dashboard
- Payment history tracking

### 📄 Invoice Management
- Digital invoice creation
- Automated payment processing
- Due date tracking and reminders
- Multi-currency support
- Payment verification system

### 🔒 Token Locking System
- Secure token storage
- Flexible vesting periods
- Emergency withdrawal options
- Multi-token support
- Lock period management

## 🏗️ Smart Contracts

### Deployed Contracts on Sonic Blaze Testnet (Chain ID: 146)

| Contract | Address | Purpose |
|----------|---------|---------|
| **VestPayment** | `0x17282d6Ad90e84E24ee68fe68fD01014D9B8d7B3` | Multi-token vesting management for payroll |
| **TokenLocker** | `0x2eb02c8b9733b240C6Fa73dDf1b25f373199c56c` | Token locking with vesting capabilities |
| **MockUSD** | `0x0e95b78Fd39Db924862335831F73f0eD9eBdFe32` | Test USD token for platform testing |

### Contract Details

#### VestPayment Contract
- **Address**: `0x17282d6Ad90e84E24ee68fe68fD01014D9B8d7B3`
- **Purpose**: Manages token vesting schedules for payroll distribution
- **Features**: Multi-token support, flexible vesting periods, fee management

#### TokenLocker Contract
- **Address**: `0x2eb02c8b9733b240C6Fa73dDf1b25f373199c56c`
- **Purpose**: Secure token locking with vesting capabilities
- **Features**: Emergency withdrawals, lock period management, multi-token support

#### MockUSD Contract
- **Address**: `0x0e95b78Fd39Db924862335831F73f0eD9eBdFe32`
- **Purpose**: Test USD token for platform development and testing
- **Features**: ERC-20 compliant, mintable by owner

## 🛠️ Development

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 16+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd VPay-Sonic

# Install dependencies
cd contract
forge install

# Install frontend dependencies
cd ../frontend
npm install
```

### Build Contracts

```bash
cd contract
forge build
```

### Run Tests

```bash
forge test
```

### Deploy Contracts

```bash
# Deploy VestPayment
forge script script/DeployVestPayment.s.sol --rpc-url sonic_blaze_testnet --account defaultKey --broadcast

# Deploy TokenLocker
forge script script/DeployTokenLocker.s.sol --rpc-url sonic_blaze_testnet --account defaultKey --broadcast

# Deploy MockUSD
forge script script/DeployMockUSD.s.sol --rpc-url sonic_blaze_testnet --account defaultKey --broadcast
```

### Frontend Development

```bash
cd frontend
npm run dev
```

## 🔗 Network Configuration

- **Network**: Sonic Blaze Testnet
- **Chain ID**: 146
- **RPC URL**: https://rpc.soniclabs.com
- **Explorer**: https://sonicscan.org

## 📚 Documentation

- [Foundry Documentation](https://book.getfoundry.sh/)
- [Sonic Labs Documentation](https://docs.soniclabs.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Foundry and deployed on Sonic Labs**
