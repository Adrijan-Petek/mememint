const hre = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('=== Force Transfer Ownership (Single Step) ===\n');

  const newOwner = '0x868EDB819AF54a9C938DEA4c2e027FE050b18d0A';
  
  // Get current signer
  const [signer] = await hre.ethers.getSigners();
  console.log('Current signer:', signer.address);
  console.log('Current signer balance:', hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), 'ETH\n');

  // Contract addresses
  const memeMintAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const leaderboardAddress = process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS;

  if (!memeMintAddress || !leaderboardAddress) {
    throw new Error('Contract addresses not found in .env');
  }

  console.log('MemeMint Contract:', memeMintAddress);
  console.log('Leaderboard Contract:', leaderboardAddress);
  console.log('New Owner:', newOwner);
  console.log('');

  try {
    // Get contract instances
    const MemeMint = await hre.ethers.getContractAt('MemeMint', memeMintAddress);
    const Leaderboard = await hre.ethers.getContractAt('MemeMintLeaderboard', leaderboardAddress);

    // Check current owners
    console.log('Checking current owners...');
    const memeMintOwner = await MemeMint.owner();
    const leaderboardOwner = await Leaderboard.owner();
    
    console.log('MemeMint current owner:', memeMintOwner);
    console.log('Leaderboard current owner:', leaderboardOwner);
    console.log('');

    if (memeMintOwner.toLowerCase() === newOwner.toLowerCase()) {
      console.log('✅ MemeMint already owned by', newOwner);
    } else {
      console.log('Transferring MemeMint ownership to', newOwner, '...');
      const tx1 = await MemeMint.transferOwnership(newOwner);
      console.log('Transaction sent:', tx1.hash);
      await tx1.wait();
      console.log('✅ MemeMint ownership transferred!');
    }
    
    if (leaderboardOwner.toLowerCase() === newOwner.toLowerCase()) {
      console.log('✅ Leaderboard already owned by', newOwner);
    } else {
      console.log('\nTransferring Leaderboard ownership to', newOwner, '...');
      const tx2 = await Leaderboard.transferOwnership(newOwner);
      console.log('Transaction sent:', tx2.hash);
      await tx2.wait();
      console.log('✅ Leaderboard ownership transferred!');
    }

    console.log('\n=== IMPORTANT ===');
    console.log('Both contracts use Ownable2Step, which means:');
    console.log('1. The new owner has been SET AS PENDING');
    console.log('2. The new owner MUST call acceptOwnership() to complete the transfer');
    console.log('');
    console.log('To complete the transfer:');
    console.log('1. Update PRIVATE_KEY in .env to the new wallet\'s private key');
    console.log('2. Run: node scripts/accept-ownership.cjs');
    console.log('');
    console.log('Until acceptOwnership() is called, the OLD owner still controls the contracts!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
