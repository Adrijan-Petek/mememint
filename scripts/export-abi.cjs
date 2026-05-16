const fs = require('fs');
const path = require('path');

// Read the compiled contract ABI
const contractPath = path.join(__dirname, '../artifacts/contracts/MemeMint.sol/MemeMint.json');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

// Extract only the ABI
const abi = contract.abi;

// Write to a TypeScript file that can be imported
const output = `// Auto-generated contract ABI
// Generated on: ${new Date().toISOString()}

export const MEME_MINT_ABI = ${JSON.stringify(abi, null, 2)} as const;

export const MEME_MINT_ADDRESS = "${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}" as const;
`;

const outputPath = path.join(__dirname, '../app/contracts/MemeMintABI.ts');

// Create contracts directory if it doesn't exist
const contractsDir = path.join(__dirname, '../app/contracts');
if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
}

fs.writeFileSync(outputPath, output);

console.log('✅ ABI exported successfully to app/contracts/MemeMintABI.ts');
console.log('📝 Total functions in ABI:', abi.filter(item => item.type === 'function').length);
console.log('📝 Total events in ABI:', abi.filter(item => item.type === 'event').length);
console.log('📝 Total errors in ABI:', abi.filter(item => item.type === 'error').length);