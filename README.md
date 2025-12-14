# Mememint - Farcaster Miniapp


🚀 **LIVE ON BASE MAINNET** 🚀

A beautiful meme generator miniapp for Farcaster that allows users to create, customize, and mint memes as NFTs on Base Mainnet.

## 🌐 Network Status

**Production Network:** Base Mainnet (Chain ID: 8453)  
**Contract Address:** `0x74272c4ed63662df64457BCac4e259C338Ef85C0`  
**Leaderboard:** `0xF4C22c98E07804Fd5602893f6125ce94055bB491`  
**Status:** ✅ Verified on [BaseScan](https://basescan.org/address/0x74272c4ed63662df64457BCac4e259C338Ef85C0)

## Features

### 🎨 **Meme Generation**
- **100+ Templates**: Access all Imgflip meme templates including images
- **Real-time Preview**: See your meme as you type
- **Draggable Text**: Position text anywhere on the meme with drag & drop

### 👛 **Wallet Integration**
- **Coinbase OnchainKit**: Seamless wallet connection on Base Mainnet
- **Generating**: Pay 0.000017 ETH (~$0.05) to generate memes as NFTs
- **Low Gas Fees**: Thanks to Base L2 efficiency

### 🏆 **Leaderboard**
- **Top 100 Generators**: Compete for the top spots
- **Real-time Updates**: Leaderboard auto-updates after each generate
- **On-Chain**: All data stored on Base Mainnet

### 📱 **Farcaster Integration**
- **Miniapp**: Optimized for Farcaster miniapp environment
- **Sharing**: Share generated memes on Farcaster
- **Responsive**: Works perfectly on mobile and desktop

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy Smart Contract (Optional)
```bash
# Start local Hardhat network
npx hardhat node

# Deploy contract in another terminal
npm run deploy
```

### 3. Set Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

### 4. Run Development Server
```bash
npm run dev
```

## API Endpoints

### GET `/api/memes`
Fetches all available meme templates from Imgflip.

### POST `/api/generate`
Generates a meme with custom text.
```json
{
  "template_id": "181913649",
  "text0": "Top text",
  "text1": "Bottom text"
}
```

## Smart Contract

### MemeMint.sol (Base Mainnet)
- **Network**: Base Mainnet (Chain ID: 8453)
- **Upgradeable**: Uses OpenZeppelin's UUPS pattern
- **Minting Fee**: 0.000017 ETH (~$0.05)
- **Owner Withdrawal**: Only contract owner can withdraw funds
- **Pausable**: Emergency pause functionality
- **Verified**: ✅ [View on BaseScan](https://basescan.org/address/0x74272c4ed63662df64457BCac4e259C338Ef85C0)

### Leaderboard.sol (Base Mainnet)
- **Network**: Base Mainnet (Chain ID: 8453)
- **Top 100 Minters**: Tracks the top minters
- **Auto-Updates**: Automatically updates on each mint
- **Verified**: ✅ [View on BaseScan](https://basescan.org/address/0xF4C22c98E07804Fd5602893f6125ce94055bB491)

### Deployment Documentation
```bash
# See deployment guides
cat MAINNET_DEPLOYMENT_GUIDE.md    # Full guide
cat MAINNET_QUICKSTART.md          # Quick reference
cat BASE_MAINNET_STATUS.md         # Current status
```

## Usage

1. **Select Template**: Choose from 100+ meme templates (filter by type)
2. **Add Text**: Type your text in the input fields
3. **Position Text**: Drag text elements to position them on the meme
4. **Generate**: Click "Generate Meme" to create your custom meme
5. **Mint**: Connect wallet and pay 0.000017 ETH to mint as NFT on Base Mainnet
6. **Leaderboard**: Check your rank among top 100 minters
7. **Share**: Share your creation on Farcaster

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: CSS Modules with responsive design
- **Blockchain**: Base Mainnet (Ethereum L2)
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin UUPS
- **Wallet**: Coinbase OnchainKit, Wagmi, Viem
- **APIs**: Imgflip API (public access)
- **Platform**: Farcaster Miniapp SDK
- **Network**: Base Mainnet (Chain ID: 8453)

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy smart contract to local network
- `npm run lint` - Run ESLint

### Project Structure
```
├── app/
│   ├── api/
│   │   ├── memes/     # Template fetching
│   │   └── generate/  # Meme generation
│   ├── globals.css
│   └── page.tsx       # Main UI
├── contracts/
│   └── MemeMint.sol   # Smart contract
├── scripts/
│   └── deploy.js      # Deployment script
└── public/            # Static assets
```

## Features in Detail

### Text Positioning
- Click and drag text elements to position them anywhere on the meme
- Visual feedback during dragging
- Responsive positioning that scales with the image

### Template Filtering
- **All**: Show all available templates
- **Images**: Show only static images

### Minting Process (Base Mainnet)
1. Generate your meme
2. Connect wallet to Base Mainnet (Coinbase OnchainKit)
3. Pay 0.000017 ETH fee (~$0.05 with low L2 gas)
4. Transaction confirms in 1-2 seconds
5. Receive NFT confirmation
6. Your stats update on the leaderboard

### Why Base Mainnet?
- ⚡ **Fast**: 1-2 second confirmations
- 💰 **Cheap**: Gas fees ~$0.01-0.05
- 🔐 **Secure**: Ethereum L2 security
- 🌍 **Production**: Real ETH, real value
5. Share on Farcaster

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own meme-generating adventures! 🎭
