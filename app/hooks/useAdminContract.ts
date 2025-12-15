"use client";
import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MEME_MINT_ABI } from "../contracts/MemeMintABI";
import { TREASURY_ABI } from "../contracts/TreasuryABI";
import { CONTRACT_ADDRESSES } from "../contracts/addresses";

const MEME_MINT_ADDRESS = CONTRACT_ADDRESSES.mememint as `0x${string}`;
const TREASURY_ADDRESS = CONTRACT_ADDRESSES.treasury as `0x${string}`;

export function useAdminContract() {
  const { address } = useAccount();
  const [newFee, setNewFee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalMints, setTotalMints] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState('0');

  // Treasury state
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenSymbol, setNewTokenSymbol] = useState('');
  const [newTokenImage, setNewTokenImage] = useState('');
  const [rewardUser, setRewardUser] = useState('');
  const [rewardToken, setRewardToken] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [withdrawToken, setWithdrawToken] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [distributeRecipient, setDistributeRecipient] = useState('');
  const [distributeToken, setDistributeToken] = useState('');
  const [distributeAmount, setDistributeAmount] = useState('');
  const [newTreasuryAddress, setNewTreasuryAddress] = useState('');

  // Read contract data - Mememint
  const { data: owner } = useReadContract({
    address: MEME_MINT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'owner',
  });

  const { data: generationFee } = useReadContract({
    address: MEME_MINT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'generationFee',
  });

  const { data: dailyFreeLimit } = useReadContract({
    address: MEME_MINT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'dailyFreeLimit',
  });

  const { data: treasury } = useReadContract({
    address: MEME_MINT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'treasury',
  });

  // Read contract data - Treasury
  const { data: treasuryOwner } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: 'owner',
  });

  const { data: supportedTokens } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: 'getSupportedTokens',
  });

  const { data: treasuryPaused } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: 'paused',
  });

  // Treasury balance readings
  const { data: treasuryETHBalance } = useBalance({
    address: TREASURY_ADDRESS,
  });

  // Function to get token balance for a specific token
  const getTokenBalance = (tokenAddress: string) => {
    return useReadContract({
      address: TREASURY_ADDRESS,
      abi: TREASURY_ABI,
      functionName: 'treasuryBalanceToken',
      args: [tokenAddress as `0x${string}`],
    });
  };

  const { writeContract } = useWriteContract();

  // Check if current user is owner of either contract
  const isOwner = address && ((owner && address.toLowerCase() === owner.toLowerCase()) || (treasuryOwner && address.toLowerCase() === treasuryOwner.toLowerCase()));

  // Mememint contract functions
  const handleSetFee = async () => {
    if (!newFee) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: MEME_MINT_ADDRESS,
        abi: MEME_MINT_ABI,
        functionName: 'setGenerationFee',
        args: [parseEther(newFee)],
      });
      setNewFee('');
    } catch (error) {
      console.error('Error setting fee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      await writeContract({
        address: MEME_MINT_ADDRESS,
        abi: MEME_MINT_ABI,
        functionName: 'withdrawETH',
      });
    } catch (error) {
      console.error('Error withdrawing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    setIsPaused(true);
  };

  const handleUnpause = async () => {
    setIsPaused(false);
  };

  const handleEmergencyWithdraw = async () => {
    // TODO: Implement emergency withdraw logic
  };

  const handleResetUserMints = async (userAddress?: string) => {
    // TODO: Implement reset user mints logic
  };

  // Set treasury address in Mememint contract
  const handleSetTreasuryAddress = async () => {
    if (!newTreasuryAddress) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: MEME_MINT_ADDRESS,
        abi: MEME_MINT_ABI,
        functionName: 'setTreasury',
        args: [newTreasuryAddress as `0x${string}`],
      });
      setNewTreasuryAddress('');
    } catch (error) {
      console.error('Error setting treasury address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Treasury contract functions
  const handleAddSupportedToken = async () => {
    if (!newTokenAddress || !newTokenSymbol || !newTokenImage) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'addSupportedToken',
        args: [newTokenAddress as `0x${string}`, newTokenSymbol, newTokenImage],
      });
      setNewTokenAddress('');
      setNewTokenSymbol('');
      setNewTokenImage('');
    } catch (error) {
      console.error('Error adding token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSupportedToken = async (tokenAddress: string) => {
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'removeSupportedToken',
        args: [tokenAddress as `0x${string}`],
      });
    } catch (error) {
      console.error('Error removing token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReward = async () => {
    if (!rewardUser || !rewardToken || !rewardAmount) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'addReward',
        args: [rewardUser as `0x${string}`, rewardToken as `0x${string}`, BigInt(rewardAmount)],
      });
      setRewardUser('');
      setRewardToken('');
      setRewardAmount('');
    } catch (error) {
      console.error('Error adding reward:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistributeReward = async () => {
    if (!distributeRecipient || !distributeToken || !distributeAmount) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'distributeReward',
        args: [distributeToken as `0x${string}`, distributeRecipient as `0x${string}`, BigInt(distributeAmount)],
      });
      setDistributeRecipient('');
      setDistributeToken('');
      setDistributeAmount('');
    } catch (error) {
      console.error('Error distributing reward:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawTokens = async () => {
    if (!withdrawToken || !withdrawAmount) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'withdrawTokens',
        args: [withdrawToken as `0x${string}`, BigInt(withdrawAmount)],
      });
      setWithdrawToken('');
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error withdrawing tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyWithdrawTokens = async (tokenAddress: string) => {
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'emergencyWithdrawAllTokens',
        args: [tokenAddress as `0x${string}`],
      });
    } catch (error) {
      console.error('Error emergency withdrawing tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyWithdrawETH = async () => {
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'emergencyWithdrawAllETH',
      });
    } catch (error) {
      console.error('Error emergency withdrawing ETH:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawTreasuryETH = async () => {
    if (!withdrawAmount) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'withdrawETH',
        args: [parseEther(withdrawAmount)],
      });
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error withdrawing ETH:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseTreasury = async () => {
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'pause',
      });
    } catch (error) {
      console.error('Error pausing treasury:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpauseTreasury = async () => {
    try {
      setIsLoading(true);
      await writeContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'unpause',
      });
    } catch (error) {
      console.error('Error unpausing treasury:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    newFee,
    setNewFee,
    isLoading,

    // Contract data - Mememint
    owner,
    generationFee: generationFee ? formatEther(generationFee) : '0',
    dailyFreeLimit,
    treasury,
    totalMints,
    totalRevenue,
    isPaused,

    // Contract data - Treasury
    treasuryOwner,
    supportedTokens,
    treasuryPaused,
    treasuryETHBalance: treasuryETHBalance?.value,
    getTokenBalance,

    // Treasury state
    newTokenAddress,
    setNewTokenAddress,
    newTokenSymbol,
    setNewTokenSymbol,
    newTokenImage,
    setNewTokenImage,
    rewardUser,
    setRewardUser,
    rewardToken,
    setRewardToken,
    rewardAmount,
    setRewardAmount,
    withdrawToken,
    setWithdrawToken,
    withdrawAmount,
    setWithdrawAmount,
    distributeRecipient,
    setDistributeRecipient,
    distributeToken,
    setDistributeToken,
    distributeAmount,
    setDistributeAmount,
    newTreasuryAddress,
    setNewTreasuryAddress,

    // Permissions
    isOwner,

    // Mememint Actions
    handleSetFee,
    handleWithdraw,
    handlePause,
    handleUnpause,
    handleEmergencyWithdraw,
    handleResetUserMints,
    handleSetTreasuryAddress,

    // Treasury Actions
    handleAddSupportedToken,
    handleRemoveSupportedToken,
    handleAddReward,
    handleDistributeReward,
    handleWithdrawTokens,
    handleEmergencyWithdrawTokens,
    handleEmergencyWithdrawETH,
    handleWithdrawTreasuryETH,
    handlePauseTreasury,
    handleUnpauseTreasury,
  };
}