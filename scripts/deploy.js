const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying MemeMint contract to", network.name);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the upgradeable MemeMint contract
  const MemeMint = await ethers.getContractFactory("MemeMint");
  
  // Initial parameters for the contract
  const initialOwner = deployer.address;
  const initialMintFee = ethers.parseEther("0.000017"); // 0.000017 ETH

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
  
  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(address);
  console.log("Implementation deployed to:", implementationAddress);

  // Verify contract stats
  const mintFee = await memeMint.mintFee();
  const owner = await memeMint.owner();
  console.log("Contract mint fee:", ethers.formatEther(mintFee), "ETH");
  console.log("Contract owner:", owner);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    proxy: address,
    implementation: implementationAddress,
    deployer: deployer.address,
    mintFee: ethers.formatEther(mintFee),
    owner: owner,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n=== Environment Variables ===");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_NETWORK=${network.name}`);

  // Verify the contract on Basescan (if on testnet/mainnet)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await memeMint.deploymentTransaction().wait(6);

    console.log("Verifying contracts...");
    try {
      // Verify the implementation contract
      await hre.run("verify:verify", {
        address: implementationAddress,
        constructorArguments: [],
      });
      console.log("Implementation contract verified!");
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