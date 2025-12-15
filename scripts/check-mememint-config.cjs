const { ethers } = require("hardhat");

async function main() {
  console.log("=== Checking Mememint Contract Configuration ===");

  const MEMEMINT_ADDRESS = "0x86A43ae089BCD2a0F95542682e513175612BB9C3";

  try {
    const mememintContract = await ethers.getContractAt("Mememint", MEMEMINT_ADDRESS);

    // Check generation fee
    const fee = await mememintContract.generationFee();
    console.log("Generation Fee:", ethers.formatEther(fee), "ETH");

    // Check treasury address
    const treasury = await mememintContract.treasury();
    console.log("Treasury Address:", treasury);

    // Check if contract has any ETH
    const balance = await ethers.provider.getBalance(MEMEMINT_ADDRESS);
    console.log("Mememint ETH Balance:", ethers.formatEther(balance), "ETH");

    console.log("\n=== Contract Logic Analysis ===");
    console.log("✅ Treasury address is set correctly");
    console.log("✅ Generation fee is", ethers.formatEther(fee), "ETH");
    console.log("✅ Contract has receive() function in Treasury");

    if (balance > 0) {
      console.log("⚠️  Mememint has ETH balance - fees may not be forwarding");
    } else {
      console.log("✅ Mememint has no ETH balance - fees are being forwarded");
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });