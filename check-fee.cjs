const { ethers } = require("hardhat");

async function main() {
  console.log("=== CHECKING CURRENT MINT FEE ===");
  
  const contractAddress = "0x6E72bBf3f20688c7685B918d14Fb9267c1047E15";
  const MemeMint = await ethers.getContractFactory("MemeMint");
  const memeMint = MemeMint.attach(contractAddress);
  
  try {
    const mintFee = await memeMint.mintFee();
    console.log("Current mint fee:", ethers.formatEther(mintFee), "ETH");
    console.log("Mint fee in wei:", mintFee.toString());
    
    // Calculate USD value (assuming 1 ETH = $2500)
    const ethPrice = 2500;
    const usdValue = parseFloat(ethers.formatEther(mintFee)) * ethPrice;
    console.log("Approximate USD value:", `$${usdValue.toFixed(4)}`);
    
    if (usdValue > 1) {
      console.log("❌ MINT FEE TOO HIGH! Should be much lower for Base mainnet.");
      console.log("💡 Recommended: ~0.0001 ETH ($0.25) or less");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });