const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Analyzing failed transaction...");
    
    const txHash = "0x3848b5f7eeae06009f08a244dd513b9ade396fda26b87f3b7975b5137f9fda2d";
    const MEME_MINT_ADDRESS = "0xE21112fe8BDc7AF8943Af51F6DF3B8Eacb8dAD6d";
    const USER_ADDRESS = "0x868EDB819AF54a9C938DEA4c2e027FE050b18d0A";

    try {
        // Get transaction receipt
        const receipt = await ethers.provider.getTransactionReceipt(txHash);
        console.log("📋 Transaction Status:", receipt ? "Found" : "Not found");
        
        if (receipt) {
            console.log("❌ Status:", receipt.status === 0 ? "Failed" : "Success");
            console.log("⛽ Gas Used:", receipt.gasUsed.toString());
        }

        // Get contract instance
        const MemeMint = await ethers.getContractFactory("MemeMint");
        const memeMint = MemeMint.attach(MEME_MINT_ADDRESS);

        console.log("\n🔍 Checking contract state:");
        
        // Check if paused
        const isPaused = await memeMint.paused();
        console.log("⏸️  Contract Paused:", isPaused);

        // Check mint fee
        const mintFee = await memeMint.mintFee();
        console.log("💰 Current Mint Fee:", ethers.formatEther(mintFee), "ETH");

        // Check user's daily mints
        const userMintsToday = await memeMint.getUserMintsToday(USER_ADDRESS);
        console.log("📊 User Mints Today:", userMintsToday.toString());

        // Check total mints
        const actualMints = await memeMint.getActualMintCount();
        console.log("📈 Total Mints:", actualMints.toString());

        // Get contract owner
        const owner = await memeMint.owner();
        console.log("👑 Contract Owner:", owner);

        // Try to get the transaction to see the revert reason
        const tx = await ethers.provider.getTransaction(txHash);
        if (tx) {
            console.log("\n📝 Transaction Details:");
            console.log("Value sent:", ethers.formatEther(tx.value), "ETH");
            console.log("From:", tx.from);
            console.log("To:", tx.to);
        }

    } catch (error) {
        console.error("❌ Error analyzing transaction:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });