const hre = require("hardhat");

async function main() {
  const memeMintAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const leaderboardAddress = process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS;

  console.log("=".repeat(60));
  console.log("ACCEPT OWNERSHIP - NEW OWNER");
  console.log("=".repeat(60));
  console.log("MemeMint:", memeMintAddress);
  console.log("Leaderboard:", leaderboardAddress);
  console.log("=".repeat(60));

  // Get the signer (should be the new owner)
  const [signer] = await hre.ethers.getSigners();
  console.log("\nSigner (New Owner):", signer.address);

  // Get contract instances
  const MemeMint = await hre.ethers.getContractAt("MemeMint", memeMintAddress);
  const Leaderboard = await hre.ethers.getContractAt("MemeMintLeaderboard", leaderboardAddress);

  // ============================================
  // STEP 1: Accept Leaderboard Ownership
  // ============================================
  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: ACCEPT LEADERBOARD OWNERSHIP");
  console.log("=".repeat(60));

  const pendingLeaderboardOwner = await Leaderboard.pendingOwner();
  console.log("Pending Leaderboard owner:", pendingLeaderboardOwner);

  if (pendingLeaderboardOwner.toLowerCase() === signer.address.toLowerCase()) {
    console.log("✓ Signer is the pending leaderboard owner");
    
    console.log("\nAccepting leaderboard ownership...");
    const tx1 = await Leaderboard.acceptOwnership();
    console.log("Transaction hash:", tx1.hash);
    await tx1.wait();
    console.log("✓ Leaderboard ownership accepted!");

    const newLeaderboardOwner = await Leaderboard.owner();
    console.log("New leaderboard owner:", newLeaderboardOwner);
  } else {
    console.log("⚠️  Signer is NOT the pending leaderboard owner!");
    console.log("Expected:", signer.address);
    console.log("Pending:", pendingLeaderboardOwner);
  }

  // ============================================
  // STEP 2: Accept MemeMint Ownership
  // ============================================
  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: ACCEPT MEMEMINT OWNERSHIP");
  console.log("=".repeat(60));

  const pendingMemeMintOwner = await MemeMint.pendingOwner();
  console.log("Pending MemeMint owner:", pendingMemeMintOwner);

  if (pendingMemeMintOwner.toLowerCase() === signer.address.toLowerCase()) {
    console.log("✓ Signer is the pending MemeMint owner");
    
    console.log("\nAccepting MemeMint ownership...");
    const tx2 = await MemeMint.acceptOwnership();
    console.log("Transaction hash:", tx2.hash);
    await tx2.wait();
    console.log("✓ MemeMint ownership accepted!");

    const newMemeMintOwner = await MemeMint.owner();
    console.log("New MemeMint owner:", newMemeMintOwner);
  } else {
    console.log("⚠️  Signer is NOT the pending MemeMint owner!");
    console.log("Expected:", signer.address);
    console.log("Pending:", pendingMemeMintOwner);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ OWNERSHIP TRANSFER COMPLETE!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
