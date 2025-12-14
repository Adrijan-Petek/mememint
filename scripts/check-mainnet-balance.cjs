const { ethers } = require("hardhat");

async function main() {
  console.log("\n💰 CHECKING DEPLOYER BALANCE");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  const address = deployer.address;
  const balance = await deployer.provider.getBalance(address);
  const balanceInEth = ethers.formatEther(balance);

  console.log("\n📋 Account Information");
  console.log("-".repeat(60));
  console.log("Network:", network.name);
  console.log("Chain ID:", network.config.chainId);
  console.log("Address:", address);
  console.log("Balance:", balanceInEth, "ETH");

  // Deployment cost estimates
  const estimatedCost = ethers.parseEther("0.04");
  const recommendedBalance = ethers.parseEther("0.05");

  console.log("\n💸 Deployment Estimates");
  console.log("-".repeat(60));
  console.log("Estimated Cost: ~0.04 ETH");
  console.log("Recommended Balance: 0.05+ ETH");

  if (balance < estimatedCost) {
    console.log("\n❌ INSUFFICIENT BALANCE!");
    console.log(`Need at least: ${ethers.formatEther(estimatedCost)} ETH`);
    console.log(`Current balance: ${balanceInEth} ETH`);
    console.log(`Required additional: ${ethers.formatEther(estimatedCost - balance)} ETH`);
  } else if (balance < recommendedBalance) {
    console.log("\n⚠️  WARNING: Balance is below recommended amount");
    console.log("You may not have enough for gas price fluctuations");
  } else {
    console.log("\n✅ Balance is sufficient for deployment!");
  }

  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
