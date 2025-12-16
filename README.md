# 🎨 Mememint - Farcaster Gaming Ecosystem

🚀 **LIVE ON BASE MAINNET** 🚀

**Mememint is ready!** A revolutionary meme-to-earn gaming ecosystem on Farcaster featuring NFT minting, leaderboard competitions, and an upcoming in-game token economy. Create memes, compete for rewards, collect NFTs, and build your profile in the ultimate meme gaming experience.

## 🌐 Network Status

**Production Network:** Base Mainnet (Chain ID: 8453)  
**Contract Address:** `0x74272c4ed63662df64457BCac4e259C338Ef85C0`  
**Leaderboard:** `0xF4C22c98E07804Fd5602893f6125ce94055bB491`  
**Database:** Nile Serverless PostgreSQL  
**Status:** ✅ Verified on [BaseScan](https://basescan.org/address/0x74272c4ed63662df64457BCac4e259C338Ef85C0)

## ✨ Core Features

### 🎮 **Meme-to-Earn Gaming**
- **Generate & Earn**: Create memes and earn points for leaderboard ranking
- **NFT Minting**: Turn your best memes into collectible NFTs on Base Mainnet
- **Reward System**: Points for generation, gameplay, token purchases, and holding
- **Profile Collection**: Build your gaming profile with achievements and rewards

### 🎨 **Advanced Meme Generation**
- **100+ Templates**: Access all Imgflip meme templates including images
- **Real-time Preview**: See your meme as you type with instant updates
- **Text Customization**: Multiple text fields with preset transformations
- **Font Selection**: Impact, Anton, Arial, Comic Sans, and Times fonts
- **Background Options**: Transparent, White, Black, Sunset, Neon, and Violet presets
- **Export Formats**: PNG, JPG, and GIF support

### 🏆 **Competitive Leaderboard**
- **Real-time Rankings**: Top 100 generators with live updates
- **Scoring System**: Points for different actions (generate: 150pts, game: 200pts, buy: 50pts, hold: 1000pts)
- **User Profiles**: Farcaster integration with PFP and username display
- **Mint Tracking**: Personal statistics and achievement progress

### 👛 **Seamless Wallet Integration**
- **Coinbase OnchainKit**: Effortless wallet connection on Base Mainnet
- **NFT Minting**: Pay 0.000017 ETH (~$0.05) to mint memes as NFTs
- **Low Gas Fees**: Thanks to Base L2 efficiency
- **Network Switching**: Automatic Base network detection and switching

### 🎭 **Farcaster Hub Integration**
- **Official API**: Direct integration with Farcaster Hub for user profiles
- **Real Profiles**: Display actual Farcaster usernames and profile pictures
- **Social Gaming**: Share achievements and memes on Farcaster
- **Miniapp Optimized**: Perfectly adapted for Farcaster miniapp environment

## 🚀 Upcoming Features

### 🪙 **In-Game Token Economy** *(Coming Soon)*
- **MEME Token**: Native utility token for the Mememint ecosystem
- **Token Rewards**: Earn tokens through gameplay and achievements
- **NFT Staking**: Stake NFTs to earn additional token rewards
- **Marketplace**: Trade memes and collectibles within the ecosystem

### 👤 **Enhanced User Profiles**
- **Reward Collection**: Track and claim earned tokens and rewards
- **Achievement System**: Unlock badges and special status
- **NFT Gallery**: Showcase your minted meme collection
- **Social Features**: Follow friends and view their achievements

### 🎯 **Advanced Gaming Features**
- **Daily Challenges**: Complete quests for bonus rewards
- **Tournament Mode**: Special events with increased rewards
- **Guild System**: Team up with other memers for group challenges
- **Seasonal Events**: Limited-time events with exclusive rewards

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Database**: Nile Serverless PostgreSQL (@niledatabase/server)
- **Blockchain**: Base Mainnet (Ethereum L2)
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin UUPS
- **Wallet**: Coinbase OnchainKit, Wagmi, Viem
- **APIs**: Farcaster Hub API, Imgflip API
- **Platform**: Farcaster Miniapp SDK
- **Build**: Turbopack for fast development
- **Styling**: Tailwind CSS with custom animations

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env.local`:
```env
# Nile Database Configuration
NILEDB_API_URL="https://eu-central-1.api.thenile.dev/v2/databases/YOUR_DB_ID"
NILEDB_POSTGRES_URL="postgres://eu-central-1.db.thenile.dev/nile_menemint"
DATABASE_URL="postgres://USER:PASS@eu-central-1.db.thenile.dev/nile_menemint"

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x74272c4ed63662df64457BCac4e259C338Ef85C0
```

### 3. Setup Database
```bash
# Initialize Nile database tables
node setup-database.cjs
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Deploy Smart Contract (Optional)
```bash
# Start local Hardhat network
npx hardhat node

# Deploy contract in another terminal
npm run deploy
```

## 🎯 How to Play

1. **Connect Wallet**: Link your wallet to start earning rewards
2. **Generate Memes**: Create hilarious memes using 100+ templates
3. **Earn Points**: Get points for each generation and special actions
4. **Climb Leaderboard**: Compete with other players for top rankings
5. **Mint NFTs**: Turn your best creations into collectible NFTs
6. **Build Profile**: Collect rewards and showcase achievements
7. **Share & Socialize**: Post memes on Farcaster and connect with friends

## 📊 Scoring System

| Action | Points | Description |
|--------|--------|-------------|
| Generate Meme | 150 | Create a new meme |
| Play Game | 200 | Participate in mini-games |
| Buy Token | 50 | Purchase ecosystem tokens |
| Hold Token | 1000 | Long-term token holding bonus |
| Mint NFT | 500 | Mint a meme as NFT |
| Daily Login | 25 | Daily active user bonus |

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── leaderboard/     # Leaderboard and scoring endpoints
│   │   ├── profiles/        # Farcaster profile integration
│   │   ├── memes/          # Template fetching
│   │   └── generate/       # Meme generation
│   ├── components/
│   │   ├── MemeGenerator.tsx   # Main creation interface
│   │   ├── WalletButton.tsx    # Wallet connection
│   │   ├── Leaderboard.tsx     # Rankings display
│   │   └── ...                 # Other UI components
│   ├── hooks/
│   │   ├── useScoring.ts       # Game scoring logic
│   │   ├── useLeaderboard.ts   # Leaderboard management
│   │   └── useMinting.ts       # NFT minting logic
│   └── leaderboard/            # Leaderboard page
├── contracts/
│   ├── MemeMint.sol           # Main NFT contract
│   └── MemeMintLeaderboard.sol # Leaderboard contract
├── utils/
│   └── database/              # Nile database utilities
├── scripts/                   # Deployment scripts
└── public/                    # Static assets
```

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run lint     # Run ESLint for code quality
npm run deploy   # Deploy smart contract to local network
```

### Database Management
```bash
# Setup database tables
node setup-database.cjs

# Test database connection
node test-db.cjs

# Test leaderboard functionality
node test-leaderboard.cjs
```

### API Endpoints

#### Leaderboard System
- `GET /api/leaderboard` - Get top 100 rankings
- `GET /api/leaderboard/stats` - Global statistics
- `POST /api/leaderboard/add-score` - Add user points
- `GET /api/leaderboard/user-rank` - Get user ranking
- `GET /api/leaderboard/user-points` - Get user total points

#### Profile System
- `GET /api/profiles?address=0x...` - Get single user profile
- `POST /api/profiles` - Batch fetch multiple profiles

## 🏗️ Smart Contracts

### MemeMint.sol (Base Mainnet)
- **Network**: Base Mainnet (Chain ID: 8453)
- **Upgradeable**: OpenZeppelin's UUPS proxy pattern
- **Minting Fee**: 0.000017 ETH (~$0.05)
- **Owner Controls**: Withdrawal and emergency pause functionality
- **Security**: Comprehensive access controls and input validation
- **Verified**: ✅ [View on BaseScan](https://basescan.org/address/0x74272c4ed63662df64457BCac4e259C338Ef85C0)

### MemeMintLeaderboard.sol (Base Mainnet)
- **Network**: Base Mainnet (Chain ID: 8453)
- **Ranking System**: Tracks top 100 minters with automatic updates
- **Real-time Stats**: Live leaderboard with generation counts
- **Gas Optimized**: Efficient on-chain data structures
- **Verified**: ✅ [View on BaseScan](https://basescan.org/address/0xF4C22c98E07804Fd5602893f6125ce94055bB491)

## 🎯 Why Base Mainnet?

- ⚡ **Lightning Fast**: 1-2 second transaction confirmations
- 💰 **Cost Effective**: Gas fees ~$0.01-0.05 per transaction
- 🔐 **Secure**: Full Ethereum L2 security guarantees
- 🌍 **Production Ready**: Real ETH value and NFT ownership
- 🎮 **Gaming Optimized**: Perfect for meme-to-earn mechanics

## 🤝 Contributing

We welcome contributions to the Mememint ecosystem!

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Make** your changes with proper testing
5. **Commit** with clear messages (`git commit -m "Add amazing feature"`)
6. **Push** to your branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request with detailed description

### Development Guidelines
- Follow TypeScript best practices
- Maintain mobile-first responsive design
- Test on both mobile and desktop
- Ensure accessibility compliance
- Keep commit messages descriptive

## 📄 License

**MIT License** - Free to use for your own meme-generating adventures! 🎭

---

**Built with ❤️ for the Farcaster gaming community**

*Create memes, earn rewards, mint NFTs, and dominate the leaderboard!*

## 🚀 Roadmap

- **Phase 1** ✅: Meme generation, NFT minting, leaderboard
- **Phase 2** 🔄: In-game token economy, enhanced profiles
- **Phase 3** 📅: Tournament system, guild features, marketplace
- **Phase 4** 🎯: Cross-platform expansion, advanced gaming mechanics
