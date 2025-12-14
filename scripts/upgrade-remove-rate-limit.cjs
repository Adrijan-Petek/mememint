const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n🚀 Upgrading MemeMint contract to remove rate limits...\n");

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
  
  // Verify the upgrade
  console.log("\n🔍 Verifying upgrade...");
  const MemeMint = await ethers.getContractAt("MemeMint", MemeMintAddress);
  
  const mintFee = await MemeMint.mintFee();
  const totalMints = await MemeMint.getActualMintCount();
  const balance = await MemeMint.getBalance();
  
  console.log("Mint fee:", ethers.formatEther(mintFee), "ETH");
  console.log("Total mints:", totalMints.toString());
  console.log("Contract balance:", ethers.formatEther(balance), "ETH");
  
  console.log("\n✅ Rate limiting removed! Mints are now unlimited.");
  console.log("\n📝 Next steps:");
  console.log("1. Test minting multiple times from the same address");
  console.log("2. Verify no rate limit errors occur");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
