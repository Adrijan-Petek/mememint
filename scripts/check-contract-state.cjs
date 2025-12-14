const { ethers } = require("hardhat");

async function main() {
  console.log("\n🔍 CHECKING MEMEMINT CONTRACT ON BASE MAINNET");
  console.log("=".repeat(60));

  const CONTRACT_ADDRESS = "0x74272c4ed63662df64457BCac4e259C338Ef85C0";

  try {
    // Get the contract
    const memeMint = await ethers.getContractAt("MemeMint", CONTRACT_ADDRESS);
    
    console.log("📋 Contract Address:", CONTRACT_ADDRESS);
    console.log("");

    // Check basic contract state
    console.log("📊 Contract State:");
    const mintFee = await memeMint.mintFee();
    console.log("  Mint Fee:", ethers.formatEther(mintFee), "ETH");
    console.log("  Mint Fee (wei):", mintFee.toString());
    
    const owner = await memeMint.owner();
    console.log("  Owner:", owner);
    
    const totalMints = await memeMint.getTotalMints();
    console.log("  Total Mints:", totalMints.toString());
    
    const isPaused = await memeMint.paused();
    console.log("  Paused:", isPaused);
    
    const leaderboardAddress = await memeMint.getLeaderboardAddress();
    console.log("  Leaderboard:", leaderboardAddress);
    
    console.log("");
    console.log("=".repeat(60));
    
    if (isPaused) {
      console.log("⚠️  WARNING: Contract is PAUSED!");
    } else {
      console.log("✅ Contract is active and ready");
    }
    
    if (leaderboardAddress === "0x0000000000000000000000000000000000000000") {
      console.log("⚠️  WARNING: Leaderboard not configured!");
    } else {
      console.log("✅ Leaderboard configured");
    }
    
  } catch (error) {
    console.error("❌ Error checking contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
