"use client";
import { useState, useCallback } from "react";
import { sdk } from '@farcaster/miniapp-sdk';

export interface UserProfile {
  address: `0x${string}`;
  name: string;
  pfp: string; // profile picture URL
  fid: number | null; // Farcaster ID
  score: number;
  rank?: number;
}

export interface ScoringAction {
  type: 'generate' | 'game' | 'buy_token' | 'hold_token';
  points: number;
  description: string;
}

export interface LeaderboardEntry {
  user: UserProfile;
  score: number;
  rank: number;
  lastActivity: Date;
}

// Scoring configuration
export const SCORING_CONFIG = {
  generate: 150,      // +150 points per generate
  game: 200,          // +200 points per game
  buy_token: 50,      // +50 points per token purchase
  hold_token: 1000,   // +1000 points for holding tokens (one-time)
} as const;

export function useScoring() {
  const [userScore, setUserScore] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Add points for different actions
  const addScore = useCallback(async (action: keyof typeof SCORING_CONFIG, userAddress: `0x${string}`) => {
    const points = SCORING_CONFIG[action];

    try {
      const response = await fetch('/api/leaderboard/add-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userAddress: userAddress.toLowerCase(),
          points
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add score');
      }

      const result = await response.json();

      // Update local state
      setUserScore(prev => prev + points);

      return { success: true, newScore: result.data };
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  }, []);

  return {
    userScore,
    userProfile,
    addScore,
    SCORING_CONFIG,
  };
}

export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<{ totalUsers: number; totalScore: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profiles from Farcaster using API
  const fetchFarcasterProfiles = async (addresses: `0x${string}`[]) => {
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: addresses.map(addr => addr.toLowerCase())
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const profiles = await response.json();
      return profiles;
    } catch (error) {
      console.warn('❌ Failed to fetch Farcaster profiles:', error);
      return {};
    }
  };

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (limit: number = 100) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/leaderboard?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const data = result.data;

      if (!Array.isArray(data)) {
        throw new Error('Leaderboard data is not an array');
      }

      // Extract addresses for Farcaster profile fetching
      const userAddresses = (data || []).map((item: any) => item.user_address as `0x${string}`);

      // Fetch all Farcaster profiles in batch
      const farcasterProfiles = await fetchFarcasterProfiles(userAddresses);

      // Transform the flat data structure with database profiles, fetch missing ones
      const transformedData: LeaderboardEntry[] = (data || []).map((item: any) => {
        const address = item.user_address.toLowerCase();
        
        // Use database data if available, otherwise use fetched data
        const dbProfile = {
          username: item.name || null,
          pfp: item.pfp || null,
          fid: item.fid || null,
        };
        
        const farcasterProfile = farcasterProfiles[address] || dbProfile;

        return {
          user: {
            address: item.user_address as `0x${string}`,
            name: farcasterProfile.username || '',
            pfp: farcasterProfile.pfp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_address}`,
            fid: farcasterProfile.fid,
            score: item.total_score
          },
          score: item.total_score,
          rank: item.rank,
          lastActivity: new Date(item.last_activity)
        };
      });

      setLeaderboardData(transformedData);

      // Get stats
      const statsResponse = await fetch('/api/leaderboard/stats');
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        const statsData = statsResult.data;

        if (statsData) {
          setStats({
            totalUsers: Number(statsData.total_users),
            totalScore: Number(statsData.total_score)
          });
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user rank
  const getUserRank = useCallback(async (userAddress: `0x${string}`) => {
    try {
      const response = await fetch(`/api/leaderboard/rank?address=${userAddress.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user rank');
      }

      const result = await response.json();
      return result.data.rank;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      throw error;
    }
  }, []);

  const formatAddress = (address: `0x${string}`) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get user mint count from database
  const getUserMintCount = useCallback(async (userAddress: `0x${string}`) => {
    try {
      const response = await fetch(`/api/leaderboard/user-mint-count?address=${userAddress.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user mint count');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching mint count:', error);
      throw error;
    }
  }, []);

  // Get user's total points including mint bonuses
  const getUserTotalPoints = useCallback(async (userAddress: `0x${string}`) => {
    try {
      const response = await fetch(`/api/leaderboard/user-points?address=${userAddress.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user total points');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching total points:', error);
      throw error;
    }
  }, []);

  // Get mint statistics
  const getMintStats = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard/mint-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch mint stats');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching mint stats:', error);
      throw error;
    }
  }, []);

  return {
    leaderboardData,
    stats,
    loading,
    error,
    fetchLeaderboard,
    getUserRank,
    getUserMintCount,
    getUserTotalPoints,
    getMintStats,
    formatAddress,
    formatTime,
  };
}