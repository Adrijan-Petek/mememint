const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Mememint and Treasury contracts to Base mainnet");

  // Get the deployer account
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable not set");
  }

  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  const wallet = new ethers.Wallet(privateKey, provider);
  const deployerAddress = wallet.address;

  console.log("Deploying contracts with the account:", deployerAddress);

  const balance = await provider.getBalance(deployerAddress);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.0001")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.0001 ETH");
  }

  // Deploy Treasury contract first
  console.log("Deploying Treasury contract...");
  const Treasury = await ethers.getContractFactory("Treasury", wallet);
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury deployed to:", treasuryAddress);

  // Deploy Mememint contract
  console.log("Deploying Mememint contract...");
  const Mememint = await ethers.getContractFactory("Mememint", wallet);
  const mememint = await Mememint.deploy(treasuryAddress);
  await mememint.waitForDeployment();
  const mememintAddress = await mememint.getAddress();
  console.log("Mememint deployed to:", mememintAddress);

  // Wait for contracts to be indexed
  console.log("Waiting for contracts to be indexed...");
  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Treasury:", treasuryAddress);
  console.log("Mememint:", mememintAddress);
  console.log("Owner:", deployerAddress);
  console.log("Network: base");

  console.log("\n=== Environment Variables ===");
  console.log(`NEXT_PUBLIC_MEMEMINT_ADDRESS=${mememintAddress}`);
  console.log(`NEXT_PUBLIC_TREASURY_ADDRESS=${treasuryAddress}`);
  console.log(`NEXT_PUBLIC_NETWORK=base`);

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });