const { ethers } = require("hardhat");

async function main() {
  console.log("Redeploying Mememint contract with fixed ETH transfer...");

  // Get the deployer account
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const deployerAddress = deployer.address;
  console.log("Deploying with account:", deployerAddress);

  // Use existing treasury address
  const TREASURY_ADDRESS = "0x4458bFdd688Df499Bc01e4E5890d0e9aA8aFa857";
  console.log("Using Treasury:", TREASURY_ADDRESS);

  // Deploy updated Mememint contract
  console.log("Deploying Mememint contract...");
  const Mememint = await ethers.getContractFactory("Mememint");
  const mememint = await Mememint.deploy(TREASURY_ADDRESS);
  await mememint.waitForDeployment();
  const mememintAddress = await mememint.getAddress();
  console.log("✅ New Mememint deployed to:", mememintAddress);

  // Wait for indexing
  console.log("Waiting for contract indexing...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log("\n🚀 UPDATE YOUR FRONTEND:");
  console.log("Old Mememint:", "0x3617fbe729fF3eB2d4377Fd90560111754BB1275");
  console.log("New Mememint:", mememintAddress);
  console.log("Treasury (unchanged):", TREASURY_ADDRESS);

  // Transfer ownership if needed
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Update CONTRACT_ADDRESSES.mememint in addresses.ts");
  console.log("2. Test minting - fees should now go to Treasury");
  console.log("3. Migrate user data if needed");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    treasury: TREASURY_ADDRESS,
    mememint: mememintAddress,
    deployer: deployerAddress,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Environment Variables ===");
  console.log(`NEXT_PUBLIC_MEMEMINT_ADDRESS=${mememintAddress}`);
  console.log(`NEXT_PUBLIC_TREASURY_ADDRESS=${TREASURY_ADDRESS}`);
  console.log(`NEXT_PUBLIC_NETWORK=${hre.network.name}`);

  // Verify contracts if on a public network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await mememint.deploymentTransaction().wait(6);

    console.log("Verifying Mememint contract...");
    try {
      await hre.run("verify:verify", {
        address: mememintAddress,
        constructorArguments: [TREASURY_ADDRESS],
        contract: "contracts/MemeMint.sol:Mememint"
      });
      console.log("✅ Mememint verified");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment completed successfully!");
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });