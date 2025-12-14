const hre = require("hardhat");

async function main() {
  console.log("\n🔄 TRANSFERRING LEADERBOARD OWNERSHIP");
  console.log("=".repeat(60));

  const MEMEMINT_ADDRESS = "0x74272c4ed63662df64457BCac4e259C338Ef85C0";
  const LEADERBOARD_ADDRESS = "0xF4C22c98E07804Fd5602893f6125ce94055bB491";

  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Connect to contracts
  const memeMint = await hre.ethers.getContractAt("MemeMint", MEMEMINT_ADDRESS);
  const leaderboard = await hre.ethers.getContractAt("MemeMintLeaderboard", LEADERBOARD_ADDRESS);

  // Check current state
  console.log("\n📋 Current State:");
  const currentOwner = await leaderboard.owner();
  const currentLeaderboardInMint = await memeMint.getLeaderboardAddress();
  
  console.log("Leaderboard owner:", currentOwner);
  console.log("Leaderboard address in MemeMint:", currentLeaderboardInMint);

  // Step 1: Set leaderboard address in MemeMint (if not set)
  if (currentLeaderboardInMint.toLowerCase() !== LEADERBOARD_ADDRESS.toLowerCase()) {
    console.log("\n🔗 Setting leaderboard address in MemeMint...");
    const setTx = await memeMint.setLeaderboardAddress(LEADERBOARD_ADDRESS);
    await setTx.wait();
    console.log("✅ Leaderboard address set!");
  } else {
    console.log("✅ Leaderboard address already set in MemeMint");
  }

  // Step 2: Transfer ownership from deployer to MemeMint
  console.log("\n📤 Step 1: Transferring ownership to MemeMint...");
  console.log(`   From: ${currentOwner}`);
  console.log(`   To:   ${MEMEMINT_ADDRESS}`);
  
  const transferTx = await leaderboard.transferOwnership(MEMEMINT_ADDRESS);
  console.log("   Transaction hash:", transferTx.hash);
  await transferTx.wait();
  console.log("✅ Transfer initiated! (Two-step transfer - pending acceptance)");

  // Check pending owner
  const pendingOwner = await leaderboard.pendingOwner();
  console.log("   Pending owner:", pendingOwner);

  // Step 3: Accept ownership from MemeMint contract
  console.log("\n📥 Step 2: Accepting ownership from MemeMint...");
  const acceptTx = await memeMint.acceptLeaderboardOwnership();
  console.log("   Transaction hash:", acceptTx.hash);
  await acceptTx.wait();
  console.log("✅ Ownership accepted!");

  // Verify final state
  console.log("\n🔍 Final Verification:");
  const newOwner = await leaderboard.owner();
  const newPendingOwner = await leaderboard.pendingOwner();
  
  console.log("Leaderboard owner:", newOwner);
  console.log("Pending owner:", newPendingOwner);

  if (newOwner.toLowerCase() === MEMEMINT_ADDRESS.toLowerCase()) {
    console.log("\n" + "=".repeat(60));
    console.log("🎉 SUCCESS! Ownership transfer completed!");
    console.log("=".repeat(60));
    console.log("✅ MemeMint contract now owns the Leaderboard");
    console.log("✅ Leaderboard will be updated automatically on mints");
    console.log("=".repeat(60) + "\n");
  } else {
    console.log("\n❌ ERROR: Ownership transfer failed!");
    console.log("Expected owner:", MEMEMINT_ADDRESS);
    console.log("Actual owner:", newOwner);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ TRANSFER FAILED!");
    console.error(error);
    process.exit(1);
  });
