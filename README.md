# 🎨 Mememint - Farcaster Miniapp

🚀 **LIVE ON BASE MAINNET** 🚀

A stunning, modern meme generator miniapp for Farcaster featuring a sleek dark gradient theme with animated backgrounds. Create, customize, and mint memes as NFTs on Base Mainnet with an optimized mobile-first design.

## 🌐 Network Status

**Production Network:** Base Mainnet (Chain ID: 8453)  
**Contract Address:** `0x74272c4ed63662df64457BCac4e259C338Ef85C0`  
**Leaderboard:** `0xF4C22c98E07804Fd5602893f6125ce94055bB491`  
**Status:** ✅ Verified on [BaseScan](https://basescan.org/address/0x74272c4ed63662df64457BCac4e259C338Ef85C0)

## ✨ Features

### 🎨 **Advanced Meme Generation**
- **100+ Templates**: Access all Imgflip meme templates including images
- **Real-time Preview**: See your meme as you type with instant updates
- **Text Customization**: Multiple text fields with preset transformations (Upper, Title, Lower, Trim, Clear)
- **Font Selection**: Choose from Impact, Anton, Arial, Comic Sans, and Times fonts
- **Background Options**: Transparent, White, Black, Sunset, Neon, and Violet presets
- **Export Formats**: PNG, JPG, and GIF support

### 🎭 **Stunning Visual Design**
- **Dark Gradient Theme**: Animated gradient backgrounds with radial overlays
- **Responsive Design**: Optimized for mobile and desktop with adaptive layouts
- **Smooth Animations**: Floating elements, gradient shifts, and hover effects
- **Modern UI**: Clean, minimalist interface with glassmorphism effects
- **Mobile-First**: Touch-friendly controls and optimized spacing

### 👛 **Seamless Wallet Integration**
- **Coinbase OnchainKit**: Effortless wallet connection on Base Mainnet
- **Minting**: Pay 0.000017 ETH (~$0.05) to generate memes as NFTs
- **Low Gas Fees**: Thanks to Base L2 efficiency
- **Network Switching**: Automatic Base network detection and switching

### 🏆 **Interactive Leaderboard**
- **Top 100 Generators**: Compete for the top spots with real-time rankings
- **Live Updates**: Leaderboard auto-updates after each generation
- **On-Chain Data**: All statistics stored securely on Base Mainnet
- **User Stats**: Track your personal generation count and ranking

### 📱 **Enhanced Farcaster Integration**
- **Miniapp Optimized**: Perfectly adapted for Farcaster miniapp environment
- **Social Sharing**: Share generated memes directly on Farcaster
- **Responsive Layout**: Seamless experience across all devices
- **Touch Controls**: Mobile-optimized interaction patterns

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x74272c4ed63662df64457BCac4e259C338Ef85C0
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Deploy Smart Contract (Optional)
```bash
# Start local Hardhat network
npx hardhat node

# Deploy contract in another terminal
npm run deploy
```

## 🎯 Usage Guide

1. **Browse Templates**: Explore 100+ meme templates with filtering options
2. **Customize Text**: Add up to multiple text fields with font and color options
3. **Apply Presets**: Use quick text transformations (Upper, Title, Lower, etc.)
4. **Choose Style**: Select fonts, backgrounds, and export formats
5. **Generate Preview**: See real-time updates as you customize
6. **Mint NFT**: Connect wallet and pay 0.000017 ETH to mint on Base Mainnet
7. **Check Rankings**: View your position on the live leaderboard
8. **Share Creation**: Post your meme on Farcaster instantly

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations and gradients
- **Blockchain**: Base Mainnet (Ethereum L2)
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin UUPS
- **Wallet**: Coinbase OnchainKit, Wagmi, Viem
- **APIs**: Imgflip API (public access)
- **Platform**: Farcaster Miniapp SDK
- **Build**: Turbopack for fast development
- **Design**: Mobile-first responsive design with dark theme

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── memes/          # Template fetching endpoint
│   │   └── generate/       # Meme generation endpoint
│   ├── components/
│   │   ├── Header.tsx      # Navigation header with wallet
│   │   ├── Navigation.tsx  # Main navigation menu
│   │   ├── MemeGenerator.tsx # Main meme creation interface
│   │   ├── SplashScreen.tsx # Animated loading screen
│   │   ├── AdminDashboard.tsx # Admin controls
│   │   └── ...             # Other UI components
│   ├── globals.css         # Global styles and Tailwind imports
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Main application page
├── contracts/
│   ├── MemeMint.sol        # Main smart contract
│   └── MemeMintLeaderboard.sol # Leaderboard contract
├── scripts/                 # Deployment and utility scripts
├── public/                  # Static assets and images
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.cjs       # PostCSS configuration
```

## 🎨 Design System

### Color Palette
- **Primary Gradient**: Dark blues and purples with animated shifts
- **Accent Colors**: Blue (#60a5fa), Purple (#a78bfa), Pink (#f472b6)
- **Background**: Multi-layered gradients with radial overlays
- **Text**: White and gray variants for optimal contrast

### Animations
- **Gradient Shift**: 20-second background animation cycle
- **Float**: Gentle floating motion for decorative elements
- **Hover Effects**: Smooth transitions on interactive elements
- **Loading States**: Pulse and fade animations

### Typography
- **Primary Font**: Inter (via Google Fonts)
- **Fallback**: Sans-serif system fonts
- **Sizes**: Responsive scaling from mobile to desktop
- **Weights**: 400, 600, 700 for various UI elements

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run lint     # Run ESLint for code quality
npm run deploy   # Deploy smart contract to local network
```

### Environment Setup
Required environment variables for full functionality:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x74272c4ed63662df64457BCac4e259C338Ef85C0
```

### API Endpoints

#### GET `/api/memes`
Fetches all available meme templates from Imgflip.
```json
{
  "templates": [
    {
      "id": "181913649",
      "name": "Drake Hotline Bling",
      "url": "https://i.imgflip.com/30b1gx.jpg"
    }
  ]
}
```

#### POST `/api/generate`
Generates a meme with custom parameters.
```json
{
  "template_id": "181913649",
  "texts": ["Top text", "Bottom text"],
  "font": "impact",
  "background": "#ffffff",
  "extension": "png"
}
```

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

### Deployment Documentation
```bash
# View deployment guides
cat contracts/DEPLOYMENT.md    # Complete deployment guide
cat MAINNET_DEPLOYMENT_GUIDE.md    # Mainnet deployment
cat MAINNET_QUICKSTART.md      # Quick reference
cat BASE_MAINNET_STATUS.md     # Current status
```

## 🎯 Why Base Mainnet?

- ⚡ **Lightning Fast**: 1-2 second transaction confirmations
- 💰 **Cost Effective**: Gas fees ~$0.01-0.05 per transaction
- 🔐 **Secure**: Full Ethereum L2 security guarantees
- 🌍 **Production Ready**: Real ETH value and NFT ownership
- 🎨 **Creator Friendly**: Optimized for creative applications

## 🤝 Contributing

We welcome contributions! Here's how to get started:

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

**Built with ❤️ for the Farcaster community**

*Create legendary memes, mint them as NFTs, and climb the leaderboard!*
