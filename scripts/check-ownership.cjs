const { ethers } = require("hardhat");

async function main() {
  console.log("\n🔍 CHECKING OWNERSHIP STATUS");
  console.log("=".repeat(60));

  const MEMEMINT_ADDRESS = "0x74272c4ed63662df64457BCac4e259C338Ef85C0";
  const LEADERBOARD_ADDRESS = "0xF4C22c98E07804Fd5602893f6125ce94055bB491";

  // Get deployer
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log("Your wallet:", deployer.address);
  console.log("");

  // Connect to contracts
  const memeMint = await ethers.getContractAt("MemeMint", MEMEMINT_ADDRESS);
  const leaderboard = await ethers.getContractAt("MemeMintLeaderboard", LEADERBOARD_ADDRESS);

  // Check MemeMint
  console.log("📋 MemeMint Contract:", MEMEMINT_ADDRESS);
  const memeMintOwner = await memeMint.owner();
  const leaderboardAddressInMint = await memeMint.getLeaderboardAddress();
  console.log("  Owner:", memeMintOwner);
  console.log("  Leaderboard address:", leaderboardAddressInMint);
  console.log("");

  // Check Leaderboard
  console.log("📋 Leaderboard Contract:", LEADERBOARD_ADDRESS);
  const leaderboardOwner = await leaderboard.owner();
  const pendingOwner = await leaderboard.pendingOwner();
  console.log("  Owner:", leaderboardOwner);
  console.log("  Pending owner:", pendingOwner);
  console.log("");

  // Analysis
  console.log("=".repeat(60));
  console.log("📊 ANALYSIS:");
  console.log("=".repeat(60));
  
  if (leaderboardOwner.toLowerCase() === MEMEMINT_ADDRESS.toLowerCase()) {
    console.log("✅ Leaderboard is owned by MemeMint contract");
    console.log("✅ Everything is configured correctly!");
  } else if (pendingOwner.toLowerCase() === MEMEMINT_ADDRESS.toLowerCase()) {
    console.log("⚠️  Ownership transfer initiated but NOT accepted yet!");
    console.log("   Pending owner:", pendingOwner);
    console.log("   Current owner:", leaderboardOwner);
    console.log("");
    console.log("🔧 TO FIX: Run acceptLeaderboardOwnership() on MemeMint");
  } else {
    console.log("❌ Leaderboard is NOT owned by MemeMint");
    console.log("   Current owner:", leaderboardOwner);
    console.log("   Expected owner:", MEMEMINT_ADDRESS);
    console.log("");
    console.log("🔧 NEED TO:");
    console.log("   1. Transfer ownership: leaderboard.transferOwnership(MEMEMINT_ADDRESS)");
    console.log("   2. Accept ownership: memeMint.acceptLeaderboardOwnership()");
  }
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
