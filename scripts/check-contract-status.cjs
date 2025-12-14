require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log('\n=== Contract Status Check ===\n');
  
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  console.log('Contract Address:', contractAddress);
  
  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    console.error('❌ Contract address not set in .env file');
    return;
  }

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log('Checking with wallet:', signer.address);
  console.log('Wallet balance:', ethers.formatEther(await ethers.provider.getBalance(signer.address)), 'ETH\n');

  // Contract ABI for the functions we need
  const contractABI = [
    "function mintFee() view returns (uint256)",
    "function totalMints() view returns (uint256)",
    "function paused() view returns (bool)",
    "function owner() view returns (address)",
  ];

  try {
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Check if contract exists
    const code = await ethers.provider.getCode(contractAddress);
    if (code === '0x') {
      console.error('❌ No contract found at this address!');
      console.log('The contract may not be deployed or the address is wrong.\n');
      return;
    }
    
    console.log('✅ Contract exists at this address\n');
    
    // Get contract info
    const mintFee = await contract.mintFee();
    const totalMints = await contract.totalMints();
    const isPaused = await contract.paused();
    const owner = await contract.owner();
    
    console.log('=== Contract Status ===');
    console.log('Mint Fee:', ethers.formatEther(mintFee), 'ETH');
    console.log('Total Mints:', totalMints.toString());
    console.log('Is Paused:', isPaused);
    console.log('Owner:', owner);
    console.log('You are owner:', signer.address.toLowerCase() === owner.toLowerCase() ? '✅ YES' : '❌ NO');
    
    if (isPaused) {
      console.log('\n⚠️  WARNING: Contract is PAUSED! Minting will fail.');
      console.log('You need to unpause it using the admin dashboard.');
    } else {
      console.log('\n✅ Contract is active and ready for minting');
    }
    
  } catch (error) {
    console.error('\n❌ Error checking contract:', error.message);
    
    if (error.message.includes('invalid address')) {
      console.log('The contract address format is invalid.');
    } else if (error.message.includes('call revert exception')) {
      console.log('The contract exists but one of the functions failed.');
      console.log('This might mean the contract interface is different.');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
