const { ethers } = require("hardhat");

async function main() {
  console.log("Generating new wallet...");
  
  // Create a new random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log("🔑 New Wallet Generated:");
  console.log("Address:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("");
  console.log("⚠️  SAVE THIS PRIVATE KEY SAFELY!");
  console.log("Add this to your .env file:");
  console.log(`PRIVATE_KEY=${wallet.privateKey.substring(2)}`);
  console.log("");
  console.log("📝 Next steps:");
  console.log("1. Update your .env file with the new private key");
  console.log("2. Get Base Mainnet ETH for address:", wallet.address);
  console.log("   - Bridge from Ethereum mainnet");
  console.log("   - Use a centralized exchange (Binance, Coinbase, etc.)");
}

main();