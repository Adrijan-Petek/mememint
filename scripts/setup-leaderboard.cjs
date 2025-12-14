const { ethers } = require("hardhat");

async function main() {
  console.log("Setting up leaderboard connection...");

  const memeMintAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const leaderboardAddress = process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS;

  if (!memeMintAddress || !leaderboardAddress) {
    console.error("Missing contract addresses in .env file");
    console.log("NEXT_PUBLIC_CONTRACT_ADDRESS:", memeMintAddress);
    console.log("NEXT_PUBLIC_LEADERBOARD_ADDRESS:", leaderboardAddress);
    process.exit(1);
  }

  console.log("MemeMint address:", memeMintAddress);
  console.log("Leaderboard address:", leaderboardAddress);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get contract instances
  const memeMint = await ethers.getContractAt("MemeMint", memeMintAddress);
  const leaderboard = await ethers.getContractAt("MemeMintLeaderboard", leaderboardAddress);

  // Check current leaderboard address
  try {
    const currentLeaderboard = await memeMint.getLeaderboardAddress();
    console.log("Current leaderboard address in MemeMint:", currentLeaderboard);
    
    if (currentLeaderboard.toLowerCase() === leaderboardAddress.toLowerCase()) {
      console.log("✓ Leaderboard is already connected!");
    } else {
      console.log("Setting leaderboard address in MemeMint contract...");
      const tx = await memeMint.setLeaderboardAddress(leaderboardAddress);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✓ Leaderboard address set successfully!");
      
      // Verify
      const newLeaderboard = await memeMint.getLeaderboardAddress();
      console.log("New leaderboard address:", newLeaderboard);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  // Check leaderboard contract
  console.log("\nChecking leaderboard contract...");
  const owner = await leaderboard.owner();
  console.log("Leaderboard owner:", owner);
  
  const stats = await leaderboard.getLeaderboardStats();
  console.log("Total minters:", stats[0].toString());
  console.log("Min mints:", stats[1].toString());

  const topMinters = await leaderboard.getTopMinters(10);
  console.log("\nTop 10 minters:", topMinters.length);
  topMinters.forEach((entry, i) => {
    console.log(`  ${i + 1}. ${entry.user} - ${entry.totalMints.toString()} mints`);
  });

  console.log("\n✓ Leaderboard setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
