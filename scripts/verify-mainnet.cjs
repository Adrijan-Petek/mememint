const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("\n🔍 VERIFYING CONTRACTS ON BASESCAN");
  console.log("=" .repeat(60));

  // Get deployment info from user or environment
  const MEMEMINT_PROXY = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const LEADERBOARD_PROXY = process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS;

  if (!MEMEMINT_PROXY || !LEADERBOARD_PROXY) {
    console.error("❌ ERROR: Contract addresses not found!");
    console.error("Please set NEXT_PUBLIC_CONTRACT_ADDRESS and NEXT_PUBLIC_LEADERBOARD_ADDRESS in .env");
    process.exit(1);
  }

  console.log("\n📋 Contract Addresses");
  console.log("-".repeat(60));
  console.log("MemeMint Proxy:", MEMEMINT_PROXY);
  console.log("Leaderboard Proxy:", LEADERBOARD_PROXY);

  // Get implementation addresses
  console.log("\n🔍 Retrieving Implementation Addresses...");
  console.log("-".repeat(60));

  let memeMintImplementation;
  let leaderboardImplementation;

  try {
    memeMintImplementation = await upgrades.erc1967.getImplementationAddress(MEMEMINT_PROXY);
    console.log("MemeMint Implementation:", memeMintImplementation);
  } catch (error) {
    console.error("❌ Could not retrieve MemeMint implementation address");
  }

  try {
    leaderboardImplementation = await upgrades.erc1967.getImplementationAddress(LEADERBOARD_PROXY);
    console.log("Leaderboard Implementation:", leaderboardImplementation);
  } catch (error) {
    console.error("❌ Could not retrieve Leaderboard implementation address");
  }

  // Verify implementation contracts
  console.log("\n✅ Starting Verification Process...");
  console.log("-".repeat(60));

  if (memeMintImplementation) {
    console.log("\nVerifying MemeMint Implementation...");
    try {
      await hre.run("verify:verify", {
        address: memeMintImplementation,
        constructorArguments: [],
      });
      console.log("✅ MemeMint Implementation verified!");
      console.log(`   https://basescan.org/address/${memeMintImplementation}#code`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✓ MemeMint Implementation already verified!");
      } else {
        console.error("❌ MemeMint verification failed:", error.message);
      }
    }
  }

  if (leaderboardImplementation) {
    console.log("\nVerifying Leaderboard Implementation...");
    try {
      await hre.run("verify:verify", {
        address: leaderboardImplementation,
        constructorArguments: [],
      });
      console.log("✅ Leaderboard Implementation verified!");
      console.log(`   https://basescan.org/address/${leaderboardImplementation}#code`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✓ Leaderboard Implementation already verified!");
      } else {
        console.error("❌ Leaderboard verification failed:", error.message);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ VERIFICATION PROCESS COMPLETED!");
  console.log("=".repeat(60));
  console.log("\n🔗 View on BaseScan:");
  console.log(`MemeMint: https://basescan.org/address/${MEMEMINT_PROXY}`);
  console.log(`Leaderboard: https://basescan.org/address/${LEADERBOARD_PROXY}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ VERIFICATION FAILED!");
    console.error(error);
    process.exit(1);
  });
