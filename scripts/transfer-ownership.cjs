const hre = require("hardhat");

async function main() {
  const contractAddress = "0xE21112fe8BDc7AF8943Af51F6DF3B8Eacb8dAD6d";
  const newOwner = "0x868EDB819AF54a9C938DEA4c2e027FE050b18d0A";
  
  console.log("\n🔄 Transferring ownership of MemeMint contract...");
  console.log("Contract:", contractAddress);
  console.log("New Owner:", newOwner);
  
  // Get the contract instance
  const MemeMint = await hre.ethers.getContractAt("MemeMint", contractAddress);
  
  // Get current owner
  const currentOwner = await MemeMint.owner();
  console.log("\nCurrent Owner:", currentOwner);
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Signer Address:", signer.address);
  
  if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("\n❌ Error: Signer is not the current owner!");
    console.error("Current owner:", currentOwner);
    console.error("Your address:", signer.address);
    process.exit(1);
  }
  
  // Transfer ownership
  console.log("\n📤 Initiating ownership transfer...");
  const tx = await MemeMint.transferOwnership(newOwner);
  console.log("Transaction hash:", tx.hash);
  
  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
  
  // Verify new owner
  const verifiedOwner = await MemeMint.owner();
  console.log("\n✅ Ownership transferred successfully!");
  console.log("New Owner:", verifiedOwner);
  
  if (verifiedOwner.toLowerCase() === newOwner.toLowerCase()) {
    console.log("✅ Verification successful!");
  } else {
    console.log("⚠️  Warning: Verification shows different owner:", verifiedOwner);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
