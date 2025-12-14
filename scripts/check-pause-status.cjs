const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking contract pause status...");
    
    const MEME_MINT_ADDRESS = "0xE21112fe8BDc7AF8943Af51F6DF3B8Eacb8dAD6d";

    // Create interface manually
    const abi = [
        "function paused() view returns (bool)",
        "function mintFee() view returns (uint256)",
        "function owner() view returns (address)",
        "function getActualMintCount() view returns (uint256)"
    ];

    const memeMint = new ethers.Contract(MEME_MINT_ADDRESS, abi, ethers.provider);

    try {
        const isPaused = await memeMint.paused();
        console.log("⏸️  Contract Paused:", isPaused);

        const mintFee = await memeMint.mintFee();
        console.log("💰 Mint Fee:", ethers.formatEther(mintFee), "ETH");

        const owner = await memeMint.owner();
        console.log("👑 Owner:", owner);

        const totalMints = await memeMint.getActualMintCount();
        console.log("📊 Total Mints:", totalMints.toString());

        if (isPaused) {
            console.log("\n❌ CONTRACT IS PAUSED - This is why the transaction failed!");
            console.log("💡 The owner needs to call unpause() to allow minting");
        } else {
            console.log("\n✅ Contract is NOT paused");
            console.log("🤔 Transaction failed for another reason");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });