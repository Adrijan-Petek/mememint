const { ethers } = require("hardhat");

async function main() {
  console.log("=== VERIFYING MAINNET CONTRACT ===");

  const contractAddress = "0x6E72bBf3f20688c7685B918d14Fb9267c1047E15";
  console.log("Contract Address:", contractAddress);
  console.log("BaseScan URL:", `https://basescan.org/address/${contractAddress}`);

  try {
    console.log("\n=== CONTRACT VERIFICATION ===");

    // Get contract instance attached to proxy address
    // The proxy will automatically delegate calls to the implementation
    const MemeMint = await ethers.getContractFactory("MemeMint");
    const memeMint = MemeMint.attach(contractAddress);

    console.log("Testing contract functions...");

    const owner = await memeMint.owner();
    console.log("✅ Contract Owner:", owner);

    const mintFee = await memeMint.mintFee();
    console.log("✅ Mint Fee:", ethers.formatEther(mintFee), "ETH");

    const totalSupply = await memeMint.totalSupply();
    console.log("✅ Total Memes Minted:", totalSupply.toString());

    const name = await memeMint.name();
    console.log("✅ Token Name:", name);

    const symbol = await memeMint.symbol();
    console.log("✅ Token Symbol:", symbol);

    console.log("\n✅ CONTRACT SUCCESSFULLY DEPLOYED AND FUNCTIONAL!");
    console.log("🎉 Your MemeMint contract is LIVE on Base mainnet!");
    console.log("🔗 View on BaseScan:", `https://basescan.org/address/${contractAddress}`);

  } catch (error) {
    console.error("❌ Error verifying contract:", error.message);
    console.log("\nPossible issues:");
    console.log("- Contract not deployed at this address");
    console.log("- Network connectivity issues");
    console.log("- Wrong contract ABI");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });