const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Checking wallet balance on Base Mainnet...");
    
    // Create a provider for Base Mainnet
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    
    // The address we want to check
    const address = "0xb04580Bb4Ba4b0E990FB907AffA039C7Bb326e5b";
    
    // Get balance
    const balance = await provider.getBalance(address);
    
    console.log("Address:", address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance > 0) {
      console.log("✅ Wallet has funds - ready for mainnet transactions!");
    } else {
      console.log("❌ Wallet has no funds - get Base mainnet ETH");
      console.log("   - Bridge from Ethereum mainnet");
      console.log("   - Use a centralized exchange (Binance, Coinbase, etc.)");
    }
  } catch (error) {
    console.error("Error checking balance:", error.message);
  }
}

main();