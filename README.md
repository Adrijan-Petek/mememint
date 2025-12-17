# 🎨 Mememint

> **A Revolutionary Meme-to-Earn Gaming Ecosystem on Farcaster**

[![Base Mainnet](https://img.shields.io/badge/Network-Base%20Mainnet-0052FF?style=flat-square&logo=ethereum)](https://basescan.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.10-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity)](https://soliditylang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

Mememint is a cutting-edge meme-to-earn gaming platform built on Farcaster, combining creative meme generation with blockchain-powered NFT minting and competitive leaderboards. Create, collect, and compete in the ultimate meme gaming experience.

### ✨ Key Features

- **🎨 Advanced Meme Generation**: 100+ templates with real-time preview
- **🏆 Competitive Leaderboards**: Real-time rankings with points system
- **🖼️ NFT Drops & Minting**: Exclusive NFT collections on Base Mainnet
- **👛 Seamless Wallet Integration**: Coinbase OnchainKit for effortless transactions
- **📊 Analytics Dashboard**: Track performance and achievements
- **🎭 Farcaster Integration**: Native social gaming experience

---

## 🚀 Live Deployment

| Component | Network | Address | Status |
|-----------|---------|---------|--------|
| **Main Contract** | Base Mainnet | [`0x74272c4ed63662df64457BCac4e259C338Ef85C0`](https://basescan.org/address/0x74272c4ed63662df64457BCac4e259C338Ef85C0) | ✅ Verified |
| **Leaderboard Contract** | Base Mainnet | [`0xF4C22c98E07804Fd5602893f6125ce94055bB491`](https://basescan.org/address/0xF4C22c98E07804Fd5602893f6125ce94055bB491) | ✅ Verified |
| **NFT Drops Contract** | Base Mainnet | [`0xB864e9BD48eCfAB4e320aCd448EBa3E10F5690d6`](https://basescan.org/address/0xB864e9BD48eCfAB4e320aCd448EBa3E10F5690d6) | ✅ Verified |
| **Treasury Contract** | Base Mainnet | [`0x4458bFdd688Df499Bc01e4E5890d0e9aA8aFa857`](https://basescan.org/address/0x4458bFdd688Df499Bc01e4E5890d0e9aA8aFa857) | ✅ Verified |
| **Frontend** | Vercel | [mememint-one.vercel.app](https://mememint-one.vercel.app) | ✅ Live |
| **Database** | Nile PostgreSQL | Serverless | ✅ Active |

---

## 🏗️ Architecture

### Core Components

```
├── 🎨 Meme Generation Engine
│   ├── 100+ Professional Templates
│   ├── Real-time Text Rendering
│   ├── Multi-format Export (PNG/JPG/GIF)
│   └── Mobile-Optimized Interface
│
├── 🏆 Leaderboard System
│   ├── Real-time Rankings (Top 100)
│   ├── Points-based Scoring
│   ├── Achievement Tracking
│   └── Social Integration
│
├── 🖼️ NFT Ecosystem
│   ├── ERC-1155 Drop Collections
│   ├── Dynamic Pricing System
│   ├── Treasury Management
│   └── Cross-platform Minting
│
└── 👛 Wallet Integration
    ├── Coinbase OnchainKit
    ├── Base Mainnet Optimized
    ├── Gas-efficient Transactions
    └── Multi-device Support
```

### Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend** | Next.js, React | 16.0.10, 19.0.0 |
| **Language** | TypeScript | 5.0+ |
| **Styling** | Tailwind CSS | Latest |
| **Blockchain** | Solidity, Hardhat | 0.8.24, 2.22.3 |
| **Libraries** | Wagmi, Viem | Latest |
| **Database** | Nile PostgreSQL | Serverless |
| **Platform** | Farcaster Miniapp | SDK v1 |
| **Deployment** | Vercel | Latest |

---

## 🎮 How to Play

### 1. **Create & Generate**
- Access 100+ professional meme templates
- Customize text with multiple fonts and styles
- Preview in real-time with instant updates
- Export in multiple formats

### 2. **Earn & Compete**
- Score points for each creation (150 pts)
- Climb the global leaderboard
- Unlock achievements and badges
- Track your progress with analytics

### 3. **Mint & Collect**
- Browse exclusive NFT drops
- Mint unique digital art pieces
- Build your collection portfolio
- Share achievements on Farcaster

### 4. **Social Gaming**
- Connect with Farcaster community
- Share memes and NFTs
- Compete in tournaments
- Join the meme revolution

---

## 📊 Scoring System

| Action | Points | Frequency |
|--------|--------|-----------|
| Generate Meme | 150 | Per creation |
| Mint NFT | 500 | Per NFT minted |
| Daily Login | 25 | Once per day |
| Special Events | 200-1000 | Event-based |
| Achievements | 100-500 | One-time unlocks |

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Adrijan-Petek/mememint.git
cd mememint

# Install dependencies
npm install
```

### Environment Setup

Create `.env.local`:

```env
# Database Configuration
NILEDB_API_URL="https://eu-central-1.api.thenile.dev/v2/databases/YOUR_DB_ID"
NILEDB_POSTGRES_URL="postgres://eu-central-1.db.thenile.dev/nile_menemint"
DATABASE_URL="postgres://USER:PASS@eu-central-1.db.thenile.dev/nile_menemint"

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=0x74272c4ed63662df64457BCac4e259C338Ef85C0
NEXT_PUBLIC_LEADERBOARD_ADDRESS=0xF4C22c98E07804Fd5602893f6125ce94055bB491
NEXT_PUBLIC_NFT_ADDRESS=0xB864e9BD48eCfAB4e320aCd448EBa3E10F5690d6
NEXT_PUBLIC_TREASURY_ADDRESS=0x4458bFdd688Df499Bc01e4E5890d0e9aA8aFa857
```

### Database Setup

```bash
# Initialize database tables
node setup-database.cjs

# Test database connection
node test-db.cjs
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## 📁 Project Structure

```
mememint/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── db/                   # Database endpoints
│   │   ├── leaderboard/          # Leaderboard API
│   │   ├── mints/               # NFT minting API
│   │   └── profiles/             # User profiles
│   ├── components/               # React Components
│   │   ├── AdminDashboard.tsx    # Admin panel
│   │   ├── MemeGenerator.tsx     # Main creation tool
│   │   ├── WalletButton.tsx      # Wallet connection
│   │   └── NFT components        # Minting interface
│   ├── mint/                     # NFT marketplace page
│   ├── leaderboard/              # Rankings page
│   ├── token/                    # Token trading page
│   └── profile/                  # User profile page
├── contracts/                    # Solidity Contracts
│   ├── MememintERC1155.sol       # NFT drops contract
│   ├── MemeMint.sol             # Main minting contract
│   └── Treasury.sol              # Treasury management
├── scripts/                      # Deployment & Utilities
│   ├── deploy-erc1155.cjs        # NFT contract deployment
│   ├── setup-database.cjs        # Database initialization
│   └── verification scripts      # Contract verification
├── test/                         # Test Suites
│   ├── MememintERC1155.test.cjs  # NFT contract tests
│   └── MemeMint.test.js          # Main contract tests
└── utils/                        # Utilities
    ├── database/                 # Nile database helpers
    └── constants/                # App constants
```

---

## 🔧 Smart Contracts

### MememintERC1155.sol
**ERC-1155 NFT Drops Contract**
- **Features**: Drop creation, payable minting, treasury forwarding
- **Security**: ReentrancyGuard, Pausable, AccessControl
- **Gas Optimized**: Efficient batch operations
- **Upgradeable**: UUPS proxy pattern

### MemeMint.sol
**Main Gaming Contract**
- **Features**: NFT minting, leaderboard tracking
- **Security**: Owner controls, emergency pause
- **Economics**: Dynamic pricing, treasury management

### Treasury.sol
**Fund Management Contract**
- **Features**: Multi-token support, secure withdrawals
- **Security**: Role-based access control
- **Transparency**: Event logging for all transactions

---

## 🎯 Development Guidelines

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Automated code linting
- **Prettier**: Consistent code formatting
- **Testing**: Comprehensive test coverage

### Security
- **Audit Ready**: OpenZeppelin battle-tested contracts
- **Input Validation**: Comprehensive parameter checking
- **Access Control**: Role-based permissions
- **Emergency Controls**: Circuit breakers and pause functionality

### Performance
- **Optimized Builds**: Turbopack for fast development
- **Lazy Loading**: Component-level code splitting
- **Caching**: Intelligent asset caching
- **Mobile First**: Responsive design optimization

---

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run dev
npm run build

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- **Farcaster** for the revolutionary social platform
- **Base** for the exceptional L2 infrastructure
- **Coinbase** for OnchainKit and wallet infrastructure
- **OpenZeppelin** for battle-tested smart contract libraries
- **Nile** for serverless PostgreSQL infrastructure

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs & request features](https://github.com/Adrijan-Petek/mememint/issues)
- **Discussions**: [Community discussions](https://github.com/Adrijan-Petek/mememint/discussions)
- **Farcaster**: Follow [@mememint](https://warpcast.com/mememint) for updates

---

<div align="center">

**Built with ❤️ for the Farcaster gaming community**

*Create. Compete. Collect. Dominate.*

[🚀 Launch App](https://mememint-one.vercel.app) • [📖 Documentation](https://github.com/Adrijan-Petek/mememint/wiki) • [🐛 Report Issue](https://github.com/Adrijan-Petek/mememint/issues)

</div>
