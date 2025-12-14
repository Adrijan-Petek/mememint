const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Read the compiled contract ABIs
const memeMintPath = path.join(__dirname, '../artifacts/contracts/MemeMint.sol/MemeMint.json');
const leaderboardPath = path.join(__dirname, '../artifacts/contracts/MemeMintLeaderboard.sol/MemeMintLeaderboard.json');

const memeMintContract = JSON.parse(fs.readFileSync(memeMintPath, 'utf8'));
const leaderboardContract = JSON.parse(fs.readFileSync(leaderboardPath, 'utf8'));

// Extract ABIs
const memeMintAbi = memeMintContract.abi;
const leaderboardAbi = leaderboardContract.abi;

// Get addresses from environment
const memeMintAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const leaderboardAddress = process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS || '';
const network = process.env.NEXT_PUBLIC_NETWORK || 'base';

// Write to TypeScript files
const memeMintOutput = `// Auto-generated contract ABI
// Generated on: ${new Date().toISOString()}
// Network: ${network}
// Contract Address: ${memeMintAddress}

export const MEME_MINT_ADDRESS = "${memeMintAddress}" as const;

export const MEME_MINT_ABI = ${JSON.stringify(memeMintAbi, null, 2)} as const;
`;

const leaderboardOutput = `// Auto-generated contract ABI
// Generated on: ${new Date().toISOString()}
// Network: ${network}
// Contract Address: ${leaderboardAddress}

export const LEADERBOARD_ADDRESS = "${leaderboardAddress}" as const;

export const LEADERBOARD_ABI = ${JSON.stringify(leaderboardAbi, null, 2)} as const;
`;

const outputDir = path.join(__dirname, '../app/contracts');

// Create contracts directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write files
fs.writeFileSync(path.join(outputDir, 'MemeMintABI.ts'), memeMintOutput);
fs.writeFileSync(path.join(outputDir, 'LeaderboardABI.ts'), leaderboardOutput);

console.log('\n✅ ABIs exported successfully!');
console.log('='.repeat(60));
console.log(`📁 Output directory: ${outputDir}`);
console.log('');
console.log('📋 MemeMint Contract:');
console.log(`   Address: ${memeMintAddress}`);
console.log(`   Functions: ${memeMintAbi.filter(item => item.type === 'function').length}`);
console.log(`   Events: ${memeMintAbi.filter(item => item.type === 'event').length}`);
console.log(`   Errors: ${memeMintAbi.filter(item => item.type === 'error').length}`);
console.log('');
console.log('📋 Leaderboard Contract:');
console.log(`   Address: ${leaderboardAddress}`);
console.log(`   Functions: ${leaderboardAbi.filter(item => item.type === 'function').length}`);
console.log(`   Events: ${leaderboardAbi.filter(item => item.type === 'event').length}`);
console.log(`   Errors: ${leaderboardAbi.filter(item => item.type === 'error').length}`);
console.log('='.repeat(60));
