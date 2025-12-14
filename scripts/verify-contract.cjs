const dotenv = require('dotenv');
dotenv.config();
const { ethers } = require('hardhat');

async function main() {
  try {
    console.log('=== Contract Verification ===');
    
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    console.log('Contract Address:', contractAddress);
    
    const [deployer] = await ethers.getSigners();
    console.log('Wallet Address:', await deployer.getAddress());
    
    // Get contract instance
    const MemeMint = await ethers.getContractFactory('MemeMint');
    const contract = MemeMint.attach(contractAddress);
    
    // Test basic contract functions
    const owner = await contract.owner();
    const mintFee = await contract.mintFee();
    const name = await contract.name();
    const symbol = await contract.symbol();
    
    console.log('Contract Owner:', owner);
    console.log('Mint Fee:', ethers.formatEther(mintFee), 'ETH');
    console.log('Token Name:', name);
    console.log('Token Symbol:', symbol);
    
    // Verify the deployer is the owner
    const deployerAddress = await deployer.getAddress();
    if (owner.toLowerCase() === deployerAddress.toLowerCase()) {
      console.log('✅ Contract ownership verified');
    } else {
      console.log('❌ Contract ownership mismatch');
    }
    
    console.log('✅ Contract verification complete');
    
  } catch (error) {
    console.error('Error verifying contract:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });