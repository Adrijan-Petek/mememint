const dotenv = require('dotenv');
dotenv.config();
const { ethers } = require('hardhat');

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    const address = await deployer.getAddress();
    const balance = await ethers.provider.getBalance(address);
    
    console.log('=== Wallet Balance Check ===');
    console.log('Address:', address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    console.log('Balance in Wei:', balance.toString());
    
    const minRequired = ethers.parseEther('0.001'); // Minimum 0.001 ETH required
    
    if (balance >= minRequired) {
      console.log('✅ Sufficient balance for deployment');
    } else {
      console.log('❌ Insufficient balance for deployment');
      console.log('Required:', ethers.formatEther(minRequired), 'ETH');
      console.log('Need to add:', ethers.formatEther(minRequired - balance), 'ETH');
    }
    
  } catch (error) {
    console.error('Error checking balance:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });