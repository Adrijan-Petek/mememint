const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n📝 Accepting leaderboard ownership with higher gas...\n");

  const MemeMintAddress = "0xE21112fe8BDc7AF8943Af51F6DF3B8Eacb8dAD6d";

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const MemeMint = await ethers.getContractAt("MemeMint", MemeMintAddress);
  
  // Get current fee data and increase by 20%
  const feeData = await ethers.provider.getFeeData();
  const maxFeePerGas = (feeData.maxFeePerGas * 120n) / 100n;
  const maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * 120n) / 100n;
  
  console.log("Gas settings:");
  console.log("  Max Fee:", ethers.formatUnits(maxFeePerGas, "gwei"), "gwei");
  console.log("  Priority Fee:", ethers.formatUnits(maxPriorityFeePerGas, "gwei"), "gwei");
  
  const tx = await MemeMint.acceptLeaderboardOwnership({
    maxFeePerGas,
    maxPriorityFeePerGas
  });
  
  console.log("\nTransaction sent:", tx.hash);
  console.log("Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
  
  // Verify
  console.log("\n🔍 Verifying ownership...");
  const LeaderboardAddress = await MemeMint.getLeaderboardAddress();
  const Leaderboard = await ethers.getContractAt("MemeMintLeaderboard", LeaderboardAddress);
  
  const leaderboardOwner = await Leaderboard.owner();
  console.log("Leaderboard owner:", leaderboardOwner);
  console.log("MemeMint address:", MemeMintAddress);
  
  if (leaderboardOwner.toLowerCase() === MemeMintAddress.toLowerCase()) {
    console.log("\n✅ SUCCESS! Leaderboard is now owned by MemeMint contract!");
    console.log("   Scoring system will now work properly.");
  } else {
    console.log("\n❌ Something went wrong. Ownership not transferred.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
