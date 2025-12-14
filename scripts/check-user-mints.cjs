const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking user daily mint count...");

    // Contract address
    const MEME_MINT_ADDRESS = "0xE21112fe8BDc7AF8943Af51F6DF3B8Eacb8dAD6d";

    // User address to check
    const USER_ADDRESS = "0x868EDB819AF54a9C938DEA4c2e027FE050b18d0A";

    // Get contract instance
    const MemeMint = await ethers.getContractFactory("MemeMint");
    const memeMint = MemeMint.attach(MEME_MINT_ADDRESS);

    console.log("🔗 Network:", (await ethers.provider.getNetwork()).name);
    console.log("👤 Checking mints for user:", USER_ADDRESS);

    try {
        // Try to call getUserMintsToday if it exists
        const todayMints = await memeMint.getUserMintsToday(USER_ADDRESS);
        console.log("📊 Today's mints:", todayMints.toString());
        console.log("📈 Daily limit: 80");
        console.log("✅ Remaining mints today:", (80 - parseInt(todayMints)).toString());
    } catch (error) {
        console.log("❌ getUserMintsToday function not available in ABI");
        console.log("🔧 Function exists in contract but may need ABI regeneration");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });