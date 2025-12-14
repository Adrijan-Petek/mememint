const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Debugging transaction failure...");
    
    const MEME_MINT_ADDRESS = "0xE21112fe8BDc7AF8943Af51F6DF3B8Eacb8dAD6d";
    const USER_ADDRESS = "0x868EDB819AF54a9C938DEA4c2e027FE050b18d0A";
    const FAILED_TX = "0x3848b5f7eeae06009f08a244dd513b9ade396fda26b87f3b7975b5137f9fda2d";

    const abi = [
        "function paused() view returns (bool)",
        "function mintFee() view returns (uint256)",
        "function getUserMintsToday(address) view returns (uint256)",
        "function getBalance() view returns (uint256)"
    ];

    const memeMint = new ethers.Contract(MEME_MINT_ADDRESS, abi, ethers.provider);

    console.log("📋 Contract:", MEME_MINT_ADDRESS);
    console.log("👤 User:", USER_ADDRESS);
    console.log("💥 Failed TX:", FAILED_TX);
    console.log("");

    // Get transaction details
    const tx = await ethers.provider.getTransaction(FAILED_TX);
    if (tx) {
        console.log("📝 Transaction Details:");
        console.log("   From:", tx.from);
        console.log("   To:", tx.to);
        console.log("   Value:", ethers.formatEther(tx.value), "ETH");
        console.log("   Data:", tx.data.substring(0, 10) + "...");
        console.log("");
    }

    // Check current state
    const isPaused = await memeMint.paused();
    const mintFee = await memeMint.mintFee();
    const userMints = await memeMint.getUserMintsToday(USER_ADDRESS);
    const balance = await memeMint.getBalance();

    console.log("🔧 Current Contract State:");
    console.log("   Paused:", isPaused);
    console.log("   Mint Fee:", ethers.formatEther(mintFee), "ETH");
    console.log("   User Mints Today:", userMints.toString());
    console.log("   Contract Balance:", ethers.formatEther(balance), "ETH");
    console.log("");

    // Try to simulate the call
    try {
        console.log("🔄 Simulating mint call...");
        await ethers.provider.call({
            to: MEME_MINT_ADDRESS,
            from: USER_ADDRESS,
            value: ethers.parseEther("0.000017"),
            data: "0x1249c58b" // mintMeme() function selector
        });
        console.log("✅ Simulation succeeded - minting should work now!");
    } catch (error) {
        console.log("❌ Simulation failed:", error.message);
        
        // Try to decode the error
        if (error.data) {
            console.log("🔍 Error data:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });