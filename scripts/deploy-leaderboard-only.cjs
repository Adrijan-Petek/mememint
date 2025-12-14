const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("\n📦 DEPLOYING LEADERBOARD CONTRACT ONLY");
  console.log("=" .repeat(60));
  
  const MEMEMINT_ADDRESS = "0xD1E4259A33f58Ee50CF2d0802fD1aDA573FD8821";
  
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  const balance = await deployer.provider.getBalance(deployerAddress);
  
  console.log("Network:", network.name);
  console.log("Deployer:", deployerAddress);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("MemeMint Address:", MEMEMINT_ADDRESS);
  
  console.log("\n📦 Deploying MemeMintLeaderboard...");
  
  const MemeMintLeaderboard = await ethers.getContractFactory("MemeMintLeaderboard");
  const leaderboard = await upgrades.deployProxy(
    MemeMintLeaderboard,
    [deployerAddress],
    { 
      initializer: 'initialize',
      kind: 'uups',
      timeout: 0
    }
  );

  await leaderboard.waitForDeployment();
  const leaderboardAddress = await leaderboard.getAddress();
  
  console.log("✅ Leaderboard Proxy:", leaderboardAddress);
  
  let leaderboardImplementation;
  try {
    leaderboardImplementation = await upgrades.erc1967.getImplementationAddress(leaderboardAddress);
    console.log("✅ Leaderboard Implementation:", leaderboardImplementation);
  } catch (error) {
    console.log("⚠️  Could not retrieve implementation address");
  }

  console.log("\n🔗 Linking to MemeMint...");
  const memeMint = await ethers.getContractAt("MemeMint", MEMEMINT_ADDRESS);
  const setTx = await memeMint.setLeaderboardAddress(leaderboardAddress);
  await setTx.wait();
  console.log("✅ Leaderboard linked to MemeMint!");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\nContract Addresses:");
  console.log("MemeMint:", MEMEMINT_ADDRESS);
  console.log("Leaderboard:", leaderboardAddress);
  console.log("\nUpdate .env:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${MEMEMINT_ADDRESS}`);
  console.log(`NEXT_PUBLIC_LEADERBOARD_ADDRESS=${leaderboardAddress}`);
  console.log(`NEXT_PUBLIC_NETWORK=base`);
  console.log("\nBaseScan:");
  console.log(`https://basescan.org/address/${MEMEMINT_ADDRESS}`);
  console.log(`https://basescan.org/address/${leaderboardAddress}`);
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error(error);
    process.exit(1);
  });
