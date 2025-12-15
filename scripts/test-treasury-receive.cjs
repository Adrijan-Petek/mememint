const { ethers } = require("hardhat");

async function main() {
  console.log("=== Testing ETH Transfer to Treasury ===");

  const TREASURY_ADDRESS = "0x4458bFdd688Df499Bc01e4E5890d0e9aA8aFa857";

  try {
    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();

    console.log("Signer:", signerAddress);

    // Check initial treasury balance
    const initialBalance = await ethers.provider.getBalance(TREASURY_ADDRESS);
    console.log("Initial Treasury Balance:", ethers.formatEther(initialBalance), "ETH");

    // Send 0.001 ETH to treasury
    const amount = ethers.parseEther("0.001");
    console.log("Sending", ethers.formatEther(amount), "ETH to Treasury...");

    const tx = await signer.sendTransaction({
      to: TREASURY_ADDRESS,
      value: amount
    });

    console.log("Transaction hash:", tx.hash);
    await tx.wait();

    // Check final treasury balance
    const finalBalance = await ethers.provider.getBalance(TREASURY_ADDRESS);
    console.log("Final Treasury Balance:", ethers.formatEther(finalBalance), "ETH");

    const received = finalBalance - initialBalance;
    console.log("ETH Received:", ethers.formatEther(received), "ETH");

    if (received >= amount) {
      console.log("✅ Treasury can receive ETH successfully!");
    } else {
      console.log("❌ Treasury did not receive ETH properly");
    }

  } catch (error) {
    console.error("❌ Error sending ETH to Treasury:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });