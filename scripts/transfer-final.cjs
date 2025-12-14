const { ethers } = require("hardhat");

async function main() {
  console.log("\n🔄 TRANSFERRING LEADERBOARD OWNERSHIP TO MEMEMINT");
  console.log("=".repeat(60));

  const MEMEMINT_ADDRESS = "0x74272c4ed63662df64457BCac4e259C338Ef85C0";
  const LEADERBOARD_ADDRESS = "0xF4C22c98E07804Fd5602893f6125ce94055bB491";

  // Get deployer
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log("Using account:", deployer.address);

  // Connect to contracts
  const memeMint = await ethers.getContractAt("MemeMint", MEMEMINT_ADDRESS, deployer);
  const leaderboard = await ethers.getContractAt("MemeMintLeaderboard", LEADERBOARD_ADDRESS, deployer);

  // Check current state
  console.log("\n📋 Current State:");
  const currentOwner = await leaderboard.owner();
  const currentLeaderboardInMint = await memeMint.getLeaderboardAddress();
  
  console.log("Leaderboard owner:", currentOwner);
  console.log("Leaderboard in MemeMint:", currentLeaderboardInMint);

  // Step 1: Set leaderboard address in MemeMint (if not set)
  if (currentLeaderboardInMint.toLowerCase() !== LEADERBOARD_ADDRESS.toLowerCase()) {
    console.log("\n🔗 Setting leaderboard address in MemeMint...");
    const setTx = await memeMint.setLeaderboardAddress(LEADERBOARD_ADDRESS);
    await setTx.wait();
    console.log("✅ Leaderboard address set!");
  } else {
    console.log("✅ Leaderboard address already set");
  }

  // Step 2: Transfer ownership
  console.log("\n📤 Step 1/2: Initiating ownership transfer...");
  const transferTx = await leaderboard.transferOwnership(MEMEMINT_ADDRESS);
  console.log("Transaction:", transferTx.hash);
  await transferTx.wait();
  console.log("✅ Transfer initiated!");

  const pendingOwner = await leaderboard.pendingOwner();
  console.log("Pending owner:", pendingOwner);

  // Step 3: Accept ownership
  console.log("\n📥 Step 2/2: Accepting ownership...");
  const acceptTx = await memeMint.acceptLeaderboardOwnership();
  console.log("Transaction:", acceptTx.hash);
  await acceptTx.wait();
  console.log("✅ Ownership accepted!");

  // Verify
  console.log("\n🔍 Final Verification:");
  const newOwner = await leaderboard.owner();
  console.log("New owner:", newOwner);

  if (newOwner.toLowerCase() === MEMEMINT_ADDRESS.toLowerCase()) {
    console.log("\n" + "=".repeat(60));
    console.log("🎉 SUCCESS!");
    console.log("=".repeat(60));
    console.log("✅ MemeMint now owns the Leaderboard");
    console.log("✅ Leaderboard updates will work automatically");
    console.log("=".repeat(60) + "\n");
  } else {
    console.log("\n❌ ERROR: Transfer failed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ FAILED!");
    console.error(error);
    process.exit(1);
  });
