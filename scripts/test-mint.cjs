require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log('\n=== Test Minting Transaction ===\n');
  
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  console.log('Contract Address:', contractAddress);
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log('Wallet:', signer.address);
  
  const initialBalance = await ethers.provider.getBalance(signer.address);
  console.log('Initial Balance:', ethers.formatEther(initialBalance), 'ETH\n');

  // Contract ABI
  const contractABI = [
    "function mintFee() view returns (uint256)",
    "function mintMeme() payable",
    "function totalMints() view returns (uint256)",
  ];

  try {
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Get mint fee
    const mintFee = await contract.mintFee();
    console.log('Required Mint Fee:', ethers.formatEther(mintFee), 'ETH');
    console.log('Mint Fee in Wei:', mintFee.toString(), '\n');
    
    // Get current total mints
    const totalMintsBefore = await contract.totalMints();
    console.log('Total Mints Before:', totalMintsBefore.toString(), '\n');
    
    // Try to mint
    console.log('Attempting to mint meme...');
    const tx = await contract.mintMeme({ 
      value: mintFee,
      gasLimit: 200000 // Set explicit gas limit
    });
    
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...\n');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    // Check new total
    const totalMintsAfter = await contract.totalMints();
    console.log('\nTotal Mints After:', totalMintsAfter.toString());
    
    const finalBalance = await ethers.provider.getBalance(signer.address);
    console.log('Final Balance:', ethers.formatEther(finalBalance), 'ETH');
    console.log('Cost:', ethers.formatEther(initialBalance - finalBalance), 'ETH');
    
    console.log('\n✅ Minting test successful!');
    
  } catch (error) {
    console.error('\n❌ Minting failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\nThe wallet does not have enough ETH to cover the mint fee + gas.');
    } else if (error.message.includes('execution reverted')) {
      console.log('\nThe transaction was reverted by the contract.');
      console.log('Possible reasons:');
      console.log('- Incorrect mint fee sent');
      console.log('- Contract is paused');
      console.log('- Contract has a bug');
    } else if (error.message.includes('gas')) {
      console.log('\nGas-related error. Try increasing the gas limit.');
    }
    
    console.error('\nFull error:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
