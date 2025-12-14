const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n🚀 Upgrading MemeMint to add acceptLeaderboardOwnership function...\n");

  const MemeMintAddress = "0xE21112fe8BDc7AF8943Af51F6DF3B8Eacb8dAD6d";

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Get the new implementation
  const MemeMintV2 = await ethers.getContractFactory("MemeMint");
  
  console.log("\n📦 Deploying new implementation...");
  
  // Upgrade the contract
  const upgraded = await upgrades.upgradeProxy(MemeMintAddress, MemeMintV2, {
    kind: "uups",
    redeployImplementation: "always"
  });

  await upgraded.waitForDeployment();
  
  const newImplAddress = await upgrades.erc1967.getImplementationAddress(MemeMintAddress);
  
  console.log("\n✅ Upgrade complete!");
  console.log("Proxy address:", MemeMintAddress);
  console.log("New implementation:", newImplAddress);
  
  // Now accept leaderboard ownership
  console.log("\n📝 Accepting leaderboard ownership...");
  
  const MemeMint = await ethers.getContractAt("MemeMint", MemeMintAddress);
  
  const tx = await MemeMint.acceptLeaderboardOwnership();
  console.log("Transaction sent:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  
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
