const { ethers } = require("hardhat");

async function main() {
    console.log("🔄 Resetting user daily mint count for testing...");

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("📋 Current signer:", signer.address);

    // Contract address
    const MEME_MINT_ADDRESS = "0xE21112fe8BDc7AF8943Af51F6DF3B8Eacb8dAD6d";

    // User address to reset
    const USER_ADDRESS = "0x868EDB819AF54a9C938DEA4c2e027FE050b18d0A";

    // Get contract instance
    const MemeMint = await ethers.getContractFactory("MemeMint");
    const memeMint = MemeMint.attach(MEME_MINT_ADDRESS);

    console.log("🔗 Network:", (await ethers.provider.getNetwork()).name);
    console.log("🎯 Resetting daily mints for user:", USER_ADDRESS);

    // Call reset function
    const tx = await memeMint.resetUserDailyMints(USER_ADDRESS);
    console.log("⏳ Waiting for transaction confirmation...");
    await tx.wait();

    console.log("✅ User daily mint count reset successfully!");
    console.log("🎉 User can now test the increased 80 mints/day limit");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });