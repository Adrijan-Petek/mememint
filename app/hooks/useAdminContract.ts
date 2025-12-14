"use client";
import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MEME_MINT_ABI, MEME_MINT_ADDRESS } from "../contracts/MemeMintABI";

const CONTRACT_ADDRESS = MEME_MINT_ADDRESS as `0x${string}`;

export function useAdminContract() {
  const { address } = useAccount();
  const [newFee, setNewFee] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Read contract data
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'owner',
  });

  const { data: mintFee } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'mintFee',
  });

  const { data: totalMints } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'totalMints',
  });

  const { data: totalRevenue } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'totalRevenue',
  });

  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'paused',
  });

  const { writeContract } = useWriteContract();

  // Check if current user is owner
  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  const handleSetFee = async () => {
    if (!newFee) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: MEME_MINT_ABI,
        functionName: 'setMintFee',
        args: [parseEther(newFee)],
      });
      setNewFee('');
    } catch (error) {
      console.error('Error setting fee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setIsLoading(true);
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: MEME_MINT_ABI,
        functionName: 'pause',
      });
    } catch (error) {
      console.error('Error pausing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpause = async () => {
    try {
      setIsLoading(true);
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: MEME_MINT_ABI,
        functionName: 'unpause',
      });
    } catch (error) {
      console.error('Error unpausing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: MEME_MINT_ABI,
        functionName: 'withdraw',
      });
    } catch (error) {
      console.error('Error withdrawing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!confirm('Are you sure you want to emergency withdraw all funds?')) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: MEME_MINT_ABI,
        functionName: 'emergencyWithdraw',
      });
    } catch (error) {
      console.error('Error emergency withdrawing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetUserMints = async (userAddress: string) => {
    if (!userAddress) {
      alert('Please enter a valid user address');
      return;
    }
    if (!confirm(`Are you sure you want to reset daily mints for ${userAddress}?`)) return;
    try {
      setIsLoading(true);
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: MEME_MINT_ABI,
        functionName: 'resetUserDailyMints',
        args: [userAddress as `0x${string}`],
      });
    } catch (error) {
      console.error('Error resetting user mints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    newFee,
    setNewFee,
    isLoading,

    // Contract data
    owner,
    mintFee: mintFee ? formatEther(mintFee) : '0',
    totalMints,
    totalRevenue: totalRevenue ? formatEther(totalRevenue) : '0',
    isPaused,

    // Permissions
    isOwner,

    // Actions
    handleSetFee,
    handlePause,
    handleUnpause,
    handleWithdraw,
    handleEmergencyWithdraw,
    handleResetUserMints
  };
}