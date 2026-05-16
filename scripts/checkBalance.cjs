const { ethers } = require("hardhat");

async function main() {
  console.log("Checking wallet balance on Base Mainnet...");
  
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await signer.provider.getBalance(address);
  
  console.log("Address:", address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance > 0) {
    console.log("✅ Wallet has funds - ready for mainnet transactions!");
  } else {
    console.log("❌ Wallet has no funds - get Base mainnet ETH from:");
    console.log("   - Bridge from Ethereum mainnet");
    console.log("   - Use a centralized exchange (Binance, Coinbase, etc.)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });