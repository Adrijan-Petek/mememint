const { ethers } = require("hardhat");

async function main() {
  console.log("=== UPDATING MINT FEE TO REASONABLE AMOUNT ===");
  
  const contractAddress = "0x9eb478d4a065dde172c12575b6e6e3a6a2ef2517";
  const [deployer] = await ethers.getSigners();
  
  console.log("Contract address:", contractAddress);
  console.log("Owner address:", deployer.address);
  
  const MemeMint = await ethers.getContractFactory("MemeMint");
  const memeMint = MemeMint.attach(contractAddress);
  
  try {
    // Check current fee
    const currentFee = await memeMint.mintFee();
    console.log("Current mint fee:", ethers.formatEther(currentFee), "ETH");
    
    // Set new reasonable fee for Base mainnet: 0.0001 ETH (~$0.25)
    const newFee = ethers.parseEther("0.0001");
    console.log("Setting new mint fee:", ethers.formatEther(newFee), "ETH");
    
    const tx = await memeMint.setMintFee(newFee);
    console.log("Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ Mint fee updated successfully!");
    
    // Verify the update
    const updatedFee = await memeMint.mintFee();
    console.log("New mint fee:", ethers.formatEther(updatedFee), "ETH");
    
  } catch (error) {
    console.error("❌ Error updating mint fee:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });