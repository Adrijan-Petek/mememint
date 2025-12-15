"use client";
import { useState, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";

export interface UserProfile {
  address: `0x${string}`;
  name: string;
  pfp: string; // profile picture URL
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
      // First, ensure user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('address')
        .eq('address', userAddress)
        .single();

      if (!existingUser) {
        await supabase
          .from('users')
          .insert([{ address: userAddress }]);
      }

      // Add score entry
      const { data, error } = await supabase
        .from('scores')
        .insert([{
          user_address: userAddress,
          action,
          points
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUserScore(prev => prev + points);

      return { success: true, newScore: data };
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

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (limit: number = 100) => {
    try {
      setLoading(true);
      setError(null);

      // Get users with their total scores and mint counts
      const { data, error: queryError } = await supabase
        .rpc('get_leaderboard', { limit_param: limit });

      if (queryError) throw queryError;

      // Transform the flat data structure to match LeaderboardEntry interface
      const transformedData: LeaderboardEntry[] = (data || []).map((item: any) => ({
        user: {
          address: item.user_address as `0x${string}`,
          name: item.name || '',
          pfp: item.pfp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_address}`,
          score: item.total_score
        },
        score: item.total_score,
        rank: item.rank,
        lastActivity: new Date(item.last_activity)
      }));

      setLeaderboardData(transformedData);

      // Get stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_leaderboard_stats');

      if (!statsError && statsData && statsData.length > 0) {
        setStats({
          totalUsers: statsData[0].total_users,
          totalScore: statsData[0].total_score
        });
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
      const { data, error } = await supabase
        .rpc('get_user_rank', { user_address_param: userAddress });

      if (error) throw error;

      return data?.[0]?.rank || null;
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
      const { data, error } = await supabase
        .from('mint_counts')
        .select('count')
        .eq('user_address', userAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

      return data?.count || 0;
    } catch (error) {
      console.error('Error fetching mint count:', error);
      throw error;
    }
  }, []);

  // Get user's total points including mint bonuses
  const getUserTotalPoints = useCallback(async (userAddress: `0x${string}`) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_total_points', { user_address_param: userAddress });

      if (error) throw error;

      return data?.[0]?.total_points || 0;
    } catch (error) {
      console.error('Error fetching total points:', error);
      throw error;
    }
  }, []);

  // Get mint statistics
  const getMintStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_mint_stats');

      if (error) throw error;

      return data?.[0] || { totalMints: 0, uniqueUsers: 0 };
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