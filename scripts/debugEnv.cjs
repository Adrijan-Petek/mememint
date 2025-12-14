const { ethers } = require("hardhat");

async function main() {
  console.log("Checking environment variables...");
  console.log("PRIVATE_KEY exists:", !!process.env.PRIVATE_KEY);
  console.log("PRIVATE_KEY length:", process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0);
  
  if (process.env.PRIVATE_KEY) {
    console.log("PRIVATE_KEY starts with:", process.env.PRIVATE_KEY.substring(0, 10) + "...");
  }
  
  console.log("Network config:", network.config);
}

main();