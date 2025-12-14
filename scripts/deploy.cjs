const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying MemeMint contract to", network.name);

  // Get the deployer account
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const deployerAddress = deployer.address;
  console.log("Deploying contracts with the account:", deployerAddress);
  
  const balance = await deployer.provider.getBalance(deployerAddress);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy the upgradeable MemeMint contract
  const MemeMint = await ethers.getContractFactory("MemeMint");
  
  // Initial parameters for the contract
  const initialOwner = deployerAddress;
  const initialMintFee = ethers.parseEther("0.000017"); // 0.000017 ETH (updated)

  console.log("Deploying MemeMint with initial owner:", initialOwner);
  console.log("Initial mint fee:", ethers.formatEther(initialMintFee), "ETH");

  // Deploy as upgradeable proxy
  const memeMint = await upgrades.deployProxy(
    MemeMint,
    [initialOwner, initialMintFee],
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );

  await memeMint.waitForDeployment();
  const address = await memeMint.getAddress();
  console.log("MemeMint deployed to:", address);
  
  // Wait for contract to be indexed
  console.log("Waiting for contract to be indexed...");
  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  
  // Get implementation address with error handling
  let implementationAddress;
  try {
    implementationAddress = await upgrades.erc1967.getImplementationAddress(address);
    console.log("Implementation deployed to:", implementationAddress);
  } catch {
    console.log("Note: Could not retrieve implementation address immediately (this is normal for new deployments)");
  }

  // Verify contract stats
  const mintFee = await memeMint.mintFee();
  const owner = await memeMint.owner();
  console.log("Contract mint fee:", ethers.formatEther(mintFee), "ETH");
  console.log("Contract owner:", owner);

  // Deploy the upgradeable MemeMintLeaderboard contract
  console.log("\nDeploying MemeMintLeaderboard contract...");
  const MemeMintLeaderboard = await ethers.getContractFactory("MemeMintLeaderboard");

  console.log("Deploying MemeMintLeaderboard with initial owner:", initialOwner);

  // Deploy leaderboard as upgradeable proxy
  const leaderboard = await upgrades.deployProxy(
    MemeMintLeaderboard,
    [initialOwner],
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );

  await leaderboard.waitForDeployment();

  const leaderboardAddress = await leaderboard.getAddress();
  console.log("MemeMintLeaderboard deployed to:", leaderboardAddress);
  
  // Wait for contract to be indexed
  console.log("Waiting for contract to be indexed...");
  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  
  // Get leaderboard implementation address with error handling
  let leaderboardImplementationAddress;
  try {
    leaderboardImplementationAddress = await upgrades.erc1967.getImplementationAddress(leaderboardAddress);
    console.log("Leaderboard implementation deployed to:", leaderboardImplementationAddress);
  } catch {
    console.log("Note: Could not retrieve implementation address immediately (this is normal for new deployments)");
  }

  // Verify leaderboard contract stats
  const leaderboardOwner = await leaderboard.owner();
  console.log("Leaderboard contract owner:", leaderboardOwner);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    memeMint: {
      proxy: address,
      implementation: implementationAddress,
    },
    leaderboard: {
      proxy: leaderboardAddress,
      implementation: leaderboardImplementationAddress,
    },
    deployer: deployerAddress,
    mintFee: ethers.formatEther(mintFee),
    owner: owner,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n=== Environment Variables ===");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_LEADERBOARD_ADDRESS=${leaderboardAddress}`);
  console.log(`NEXT_PUBLIC_NETWORK=${network.name}`);

  // Verify the contracts on Basescan (if on testnet/mainnet)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await memeMint.deploymentTransaction().wait(6);
    await leaderboard.deploymentTransaction().wait(6);

    console.log("Verifying contracts...");
    try {
      // Verify the MemeMint implementation contract
      await hre.run("verify:verify", {
        address: implementationAddress,
        constructorArguments: [],
      });
      console.log("MemeMint implementation contract verified!");

      // Verify the Leaderboard implementation contract
      await hre.run("verify:verify", {
        address: leaderboardImplementationAddress,
        constructorArguments: [],
      });
      console.log("Leaderboard implementation contract verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });