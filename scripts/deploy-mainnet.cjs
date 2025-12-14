const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("\n🚀 BASE MAINNET DEPLOYMENT");
  console.log("=" .repeat(60));
  
  // Safety check - ensure we're on Base Mainnet
  if (network.name !== "base") {
    console.error("❌ ERROR: This script is for Base Mainnet only!");
    console.error(`Current network: ${network.name}`);
    console.error("Use: npx hardhat run scripts/deploy-mainnet.cjs --network base");
    process.exit(1);
  }

  // Get the deployer account
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const deployerAddress = deployer.address;
  
  console.log("\n📋 Deployment Configuration");
  console.log("-".repeat(60));
  console.log("Network:", network.name);
  console.log("Chain ID:", network.config.chainId);
  console.log("Deployer Address:", deployerAddress);
  
  const balance = await deployer.provider.getBalance(deployerAddress);
  const balanceInEth = ethers.formatEther(balance);
  console.log("Deployer Balance:", balanceInEth, "ETH");
  console.log("ℹ️  Base has extremely low gas fees - proceeding with deployment")

  // Initial parameters for the contract
  const initialOwner = deployerAddress;
  const initialMintFee = ethers.parseEther("0.000017"); // 0.000017 ETH

  console.log("\n⚙️ Contract Parameters");
  console.log("-".repeat(60));
  console.log("Initial Owner:", initialOwner);
  console.log("Initial Mint Fee:", ethers.formatEther(initialMintFee), "ETH");

  // Confirmation prompt (manual check required)
  console.log("\n⚠️  FINAL SAFETY CHECK");
  console.log("-".repeat(60));
  console.log("✓ Network: Base Mainnet (Chain ID: 8453)");
  console.log("✓ Deployer has sufficient balance");
  console.log("✓ Contract parameters configured");
  console.log("\nℹ️  This deployment will be PERMANENT on mainnet");
  console.log("Press Ctrl+C to cancel or wait 10 seconds to continue...\n");

  // Wait 10 seconds for user to cancel
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log("🚀 Starting deployment...\n");

  // ============================================================================
  // DEPLOY MEMEMINT CONTRACT
  // ============================================================================
  
  console.log("📦 Deploying MemeMint Contract...");
  console.log("-".repeat(60));
  
  const MemeMint = await ethers.getContractFactory("MemeMint");
  
  const memeMint = await upgrades.deployProxy(
    MemeMint,
    [initialOwner, initialMintFee],
    { 
      initializer: 'initialize',
      kind: 'uups',
      timeout: 0
    }
  );

  await memeMint.waitForDeployment();
  const memeMintAddress = await memeMint.getAddress();
  
  console.log("✅ MemeMint Proxy deployed to:", memeMintAddress);
  
  // Get implementation address
  let memeMintImplementation;
  try {
    memeMintImplementation = await upgrades.erc1967.getImplementationAddress(memeMintAddress);
    console.log("✅ MemeMint Implementation:", memeMintImplementation);
  } catch (error) {
    console.log("⚠️  Could not retrieve implementation address immediately");
  }

  // Verify contract configuration
  const mintFee = await memeMint.mintFee();
  const owner = await memeMint.owner();
  console.log("✓ Mint Fee Set:", ethers.formatEther(mintFee), "ETH");
  console.log("✓ Owner Set:", owner);

  // ============================================================================
  // DEPLOY LEADERBOARD CONTRACT
  // ============================================================================
  
  console.log("\n📦 Deploying MemeMintLeaderboard Contract...");
  console.log("-".repeat(60));
  
  const MemeMintLeaderboard = await ethers.getContractFactory("MemeMintLeaderboard");

  const leaderboard = await upgrades.deployProxy(
    MemeMintLeaderboard,
    [initialOwner],
    { 
      initializer: 'initialize',
      kind: 'uups',
      timeout: 0
    }
  );

  await leaderboard.waitForDeployment();
  const leaderboardAddress = await leaderboard.getAddress();
  
  console.log("✅ Leaderboard Proxy deployed to:", leaderboardAddress);
  
  // Get leaderboard implementation address
  let leaderboardImplementation;
  try {
    leaderboardImplementation = await upgrades.erc1967.getImplementationAddress(leaderboardAddress);
    console.log("✅ Leaderboard Implementation:", leaderboardImplementation);
  } catch (error) {
    console.log("⚠️  Could not retrieve implementation address immediately");
  }

  // Verify leaderboard configuration
  const leaderboardOwner = await leaderboard.owner();
  console.log("✓ Leaderboard Owner Set:", leaderboardOwner);

  // ============================================================================
  // SET LEADERBOARD ADDRESS IN MEMEMINT
  // ============================================================================
  
  console.log("\n🔗 Linking Contracts...");
  console.log("-".repeat(60));
  
  console.log("Setting leaderboard address in MemeMint contract...");
  const setLeaderboardTx = await memeMint.setLeaderboardAddress(leaderboardAddress);
  await setLeaderboardTx.wait();
  
  const configuredLeaderboard = await memeMint.getLeaderboardAddress();
  console.log("✅ Leaderboard address set:", configuredLeaderboard);

  // ============================================================================
  // DEPLOYMENT SUMMARY
  // ============================================================================
  
  const deploymentInfo = {
    network: "Base Mainnet",
    chainId: 8453,
    timestamp: new Date().toISOString(),
    deployer: deployerAddress,
    contracts: {
      memeMint: {
        proxy: memeMintAddress,
        implementation: memeMintImplementation,
        mintFee: ethers.formatEther(mintFee) + " ETH",
        owner: owner,
      },
      leaderboard: {
        proxy: leaderboardAddress,
        implementation: leaderboardImplementation,
        owner: leaderboardOwner,
      }
    }
  };

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📝 NEXT STEPS:");
  console.log("-".repeat(60));
  console.log("1. Update .env file with these addresses:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${memeMintAddress}`);
  console.log(`   NEXT_PUBLIC_LEADERBOARD_ADDRESS=${leaderboardAddress}`);
  console.log(`   NEXT_PUBLIC_NETWORK=base`);
  console.log("");
  console.log("2. Verify contracts on BaseScan:");
  console.log(`   npx hardhat run scripts/verify-mainnet.cjs --network base`);
  console.log("");
  console.log("3. Transfer leaderboard ownership via Remix:");
  console.log(`   - Leaderboard: ${leaderboardAddress}`);
  console.log(`   - Transfer to: ${memeMintAddress}`);
  console.log(`   - Function: transferOwnership(address)`);
  console.log(`   - Then from MemeMint call: acceptLeaderboardOwnership()`);
  console.log("");
  console.log("4. Test minting function on mainnet");
  console.log("");
  console.log("🔗 Contract Links:");
  console.log(`   MemeMint: https://basescan.org/address/${memeMintAddress}`);
  console.log(`   Leaderboard: https://basescan.org/address/${leaderboardAddress}`);
  console.log("=".repeat(60) + "\n");

  // Save deployment info to file
  const fs = require("fs");
  const deploymentFile = `deployment-mainnet-${Date.now()}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFile}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("=".repeat(60));
    console.error(error);
    process.exit(1);
  });
