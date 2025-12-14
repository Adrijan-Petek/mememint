"use client";
import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { LEADERBOARD_ABI, LEADERBOARD_ADDRESS } from "../contracts/LeaderboardABI";

export interface LeaderboardEntry {
  user: `0x${string}`;
  totalMints: bigint;
  lastMintTime: bigint;
}

export interface LeaderboardStats {
  totalMinters: bigint;
  minMints: bigint;
}

export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch top 100 minters
  const { data: topMinters, isLoading: loadingTopMinters } = useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LEADERBOARD_ABI,
    functionName: "getTopMinters",
    args: [BigInt(100)],
  });

  // Fetch leaderboard stats
  const { data: leaderboardStats, isLoading: loadingStats } = useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LEADERBOARD_ABI,
    functionName: "getLeaderboardStats",
  });

  useEffect(() => {
    console.log('Leaderboard data received:', { topMinters, isArray: Array.isArray(topMinters), loading: loadingTopMinters });
    if (topMinters && Array.isArray(topMinters)) {
      console.log('Setting leaderboard data, entries:', topMinters.length);
      setLeaderboardData(topMinters as LeaderboardEntry[]);
    } else if (topMinters === undefined && !loadingTopMinters) {
      // If data is undefined after loading, set empty array
      console.log('No leaderboard data available');
      setLeaderboardData([]);
    }
  }, [topMinters, loadingTopMinters]);

  useEffect(() => {
    console.log('Leaderboard stats received:', { leaderboardStats, loading: loadingStats });
    if (leaderboardStats && Array.isArray(leaderboardStats)) {
      console.log('Setting stats:', { totalMinters: leaderboardStats[0], minMints: leaderboardStats[1] });
      setStats({
        totalMinters: leaderboardStats[0] as bigint,
        minMints: leaderboardStats[1] as bigint,
      });
    } else if (leaderboardStats === undefined && !loadingStats) {
      // If stats are undefined after loading, set defaults
      console.log('No stats available, using defaults');
      setStats({
        totalMinters: BigInt(0),
        minMints: BigInt(0),
      });
    }
  }, [leaderboardStats, loadingStats]);

  useEffect(() => {
    setLoading(loadingTopMinters || loadingStats);
  }, [loadingTopMinters, loadingStats]);

  useEffect(() => {
    console.log('Leaderboard address:', LEADERBOARD_ADDRESS);
    if (topMinters === null || leaderboardStats === null) {
      // Check if contract call failed (not loading, not undefined, but null)
      if (!loadingTopMinters && !loadingStats) {
        setError("Failed to fetch leaderboard data. Please check your network connection and contract deployment.");
      }
    } else {
      setError(null);
    }
  }, [topMinters, leaderboardStats, loadingTopMinters, loadingStats]);

  const formatAddress = (address: `0x${string}`) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return {
    leaderboardData,
    stats,
    loading,
    error,
    formatAddress,
    formatTime,
  };
}