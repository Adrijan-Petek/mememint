const { ethers, upgrades } = require("hardhat");

async function main() {
  try {
    console.log("Debugging signers...");
    console.log("Network:", network.name);
    
    const signers = await ethers.getSigners();
    console.log("Signers:", signers);
    console.log("Signers length:", signers.length);
    
    if (signers.length > 0) {
      console.log("First signer:", signers[0]);
      console.log("Signer address:", signers[0].address);
    } else {
      console.log("No signers found!");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

main();