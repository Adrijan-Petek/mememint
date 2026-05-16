const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get treasury address from env
  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
  if (!treasuryAddress) {
    throw new Error("NEXT_PUBLIC_TREASURY_ADDRESS not set in .env.local");
  }
  console.log("Treasury address:", treasuryAddress);

  // Deploy MememintERC1155
  const MememintERC1155 = await ethers.getContractFactory("MememintERC1155");
  const erc1155 = await MememintERC1155.deploy(treasuryAddress);
  await erc1155.waitForDeployment();
  const address = await erc1155.getAddress();
  console.log("MememintERC1155 deployed to:", address);

  // Optional: Verify on Etherscan if on mainnet
  if (network.name === "mainnet") {
    console.log("Verifying contract on Etherscan...");
    await run("verify:verify", {
      address: erc1155.address,
      constructorArguments: [treasuryAddress],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });