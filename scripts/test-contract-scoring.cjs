const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n🧪 Testing Solidity Contract Scoring System...\n");

  const MemeMintAddress = "0xE21112fe8BDc7AF8943Af51F6DF3B8Eacb8dAD6d";
  const LeaderboardAddress = "0x5C83EFdb9DAec4908e9C8eB9ABF49470E3C67463";
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log("Test user:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Get contracts
  const MemeMint = await ethers.getContractAt("MemeMint", MemeMintAddress);
  const Leaderboard = await ethers.getContractAt("MemeMintLeaderboard", LeaderboardAddress);
  
  // Get initial state
  console.log("📊 Initial State:");
  const mintFee = await MemeMint.mintFee();
  console.log("Mint fee:", ethers.formatEther(mintFee), "ETH");
  
  const initialUserMints = await MemeMint.getUserTotalMints(deployer.address);
  console.log("User's total mints (MemeMint):", initialUserMints.toString());
  
  const initialTotalMints = await MemeMint.getActualMintCount();
  console.log("Total mints (MemeMint):", initialTotalMints.toString());
  
  // Check leaderboard before
  console.log("\n🏆 Leaderboard Before Mint:");
  try {
    const topMinters = await Leaderboard.getTopMinters(10);
    if (topMinters.length === 0) {
      console.log("No minters in leaderboard yet");
    } else {
      console.log(`${topMinters.length} minters in leaderboard`);
      for (let i = 0; i < Math.min(3, topMinters.length); i++) {
        console.log(`  ${i + 1}. ${topMinters[i].user} - ${topMinters[i].totalMints} mints`);
      }
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
  
  // Perform a test mint
  console.log("\n🎨 Performing test mint...");
  try {
    const tx = await MemeMint.mintMeme({ value: mintFee });
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Mint successful! Block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Check if MemeMinted event was emitted
    try {
      const memeMintedEvent = receipt.logs.find(log => {
        try {
          const parsed = MemeMint.interface.parseLog(log);
          return parsed && parsed.name === "MemeMinted";
        } catch {
          return false;
        }
      });
      
      if (memeMintedEvent) {
        const parsed = MemeMint.interface.parseLog(memeMintedEvent);
        console.log("MemeMinted event:", {
          minter: parsed.args.minter,
          fee: ethers.formatEther(parsed.args.fee) + " ETH"
        });
      }
    } catch (e) {
      // Ignore event parsing errors
    }
  } catch (error) {
    console.log("❌ Mint failed:", error.message);
    if (error.message.includes("InsufficientPayment")) {
      console.log("   Error: Insufficient payment sent");
    } else if (error.message.includes("RateLimitExceeded")) {
      console.log("   Error: Rate limit exceeded (but this should be removed!)");
    }
    return;
  }
  
  // Check state after mint
  console.log("\n📊 State After Mint:");
  const finalUserMints = await MemeMint.getUserTotalMints(deployer.address);
  console.log("User's total mints (MemeMint):", finalUserMints.toString());
  console.log("Increase:", (finalUserMints - initialUserMints).toString());
  
  const finalTotalMints = await MemeMint.getActualMintCount();
  console.log("Total mints (MemeMint):", finalTotalMints.toString());
  console.log("Increase:", (finalTotalMints - initialTotalMints).toString());
  
  // Check leaderboard after
  console.log("\n🏆 Leaderboard After Mint:");
  try {
    const topMinters = await Leaderboard.getTopMinters(10);
    
    if (topMinters.length === 0) {
      console.log("⚠️  No minters in leaderboard - leaderboard update may have failed!");
    } else {
      console.log(`${topMinters.length} minters in leaderboard`);
      
      // Find our minter
      let found = false;
      for (let i = 0; i < topMinters.length; i++) {
        const minter = topMinters[i];
        console.log(`  ${i + 1}. ${minter.user} - ${minter.totalMints} mints`);
        if (minter.user.toLowerCase() === deployer.address.toLowerCase()) {
          found = true;
          console.log("     ⭐ This is you!");
        }
      }
      
      if (!found) {
        console.log("\n⚠️  Your address not found in top minters");
      }
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
  
  // Verify leaderboard ownership
  console.log("\n🔐 Ownership Verification:");
  const leaderboardOwner = await Leaderboard.owner();
  console.log("Leaderboard owner:", leaderboardOwner);
  console.log("MemeMint address:", MemeMintAddress);
  
  if (leaderboardOwner.toLowerCase() === MemeMintAddress.toLowerCase()) {
    console.log("✅ Ownership correct - MemeMint can update leaderboard");
  } else {
    console.log("❌ Ownership incorrect - MemeMint CANNOT update leaderboard");
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📝 Test Summary:");
  console.log("=".repeat(60));
  
  if (finalUserMints > initialUserMints) {
    console.log("✅ Mint successful");
    console.log("✅ MemeMint counter updated");
    
    try {
      const topMinters = await Leaderboard.getTopMinters(10);
      const userInLeaderboard = topMinters.some(m => 
        m.user.toLowerCase() === deployer.address.toLowerCase()
      );
      
      if (userInLeaderboard) {
        console.log("✅ Leaderboard updated successfully");
        console.log("\n🎉 SCORING SYSTEM WORKING PERFECTLY!");
      } else if (topMinters.length === 0) {
        console.log("⚠️  Leaderboard empty - update may have silently failed");
        console.log("   (MemeMint catches and ignores leaderboard update errors)");
      } else {
        console.log("⚠️  User not in leaderboard - update may have failed");
      }
    } catch (e) {
      console.log("❌ Could not verify leaderboard update");
    }
  } else {
    console.log("❌ Test failed - mint did not complete");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
