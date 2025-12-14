const { ethers } = require("hardhat");

async function main() {
  console.log("=== BASE MAINNET WALLET INVESTIGATION ===");
  
  const [deployer] = await ethers.getSigners();
  console.log("Wallet Address:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Current Balance:", ethers.formatEther(balance), "ETH");
  
  const txCount = await deployer.provider.getTransactionCount(deployer.address);
  console.log("Total Transactions:", txCount);
  
  // Check if any contracts were deployed
  console.log("\n=== CHECKING FOR DEPLOYED CONTRACTS ===");
  console.log("Scan this address on Basescan:");
  console.log(`https://basescan.org/address/${deployer.address}`);
  
  console.log("\n=== RECENT TRANSACTION ANALYSIS ===");
  console.log("Check recent transactions for:");
  console.log("1. Failed deployment attempts");
  console.log("2. Successful contract deployments");
  console.log("3. Gas fees consumed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });