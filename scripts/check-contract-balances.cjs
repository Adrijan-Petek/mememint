const { ethers } = require("hardhat");

async function main() {
  console.log("=== Contract Balance Check ===");

  const MEMEMINT_ADDRESS = "0x86A43ae089BCD2a0F95542682e513175612BB9C3";
  const TREASURY_ADDRESS = "0x4458bFdd688Df499Bc01e4E5890d0e9aA8aFa857";

  try {
    // Get Mememint balance
    const mememintBalance = await ethers.provider.getBalance(MEMEMINT_ADDRESS);
    console.log("Mememint Contract Balance:", ethers.formatEther(mememintBalance), "ETH");

    // Get Treasury balance
    const treasuryBalance = await ethers.provider.getBalance(TREASURY_ADDRESS);
    console.log("Treasury Contract Balance:", ethers.formatEther(treasuryBalance), "ETH");

    // Check if Treasury has receive function
    const treasuryContract = await ethers.getContractAt("Treasury", TREASURY_ADDRESS);
    console.log("✅ Treasury contract loaded successfully");

    // Check treasury address in Mememint
    const mememintContract = await ethers.getContractAt("Mememint", MEMEMINT_ADDRESS);
    const treasuryAddr = await mememintContract.treasury();
    console.log("Mememint Treasury Address:", treasuryAddr);

    if (treasuryAddr.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
      console.log("✅ Treasury address is correctly set in Mememint");
    } else {
      console.log("❌ Treasury address mismatch!");
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