"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { WalletButton } from "../components/WalletButton";
import { AppHeader } from "../components/AppHeader";
import AdminDashboard from "../components/AdminDashboard";
import { useLeaderboard } from "../hooks/useScoring";
import { sdk } from "@farcaster/miniapp-sdk";
import { TREASURY_ABI } from "../contracts/TreasuryABI";
import { CONTRACT_ADDRESSES } from "../contracts/addresses";

// Profile data interface
interface UserProfile {
  address: `0x${string}`;
  name: string;
  pfp: string;
  fid: number | null;
  highScore: number;
  lastScore: number;
  position: number;
  totalPoints: number;
  gamesPlayed: number;
  mintCount: number;
  totalMemes: number;
}

const TREASURY_ADDRESS = CONTRACT_ADDRESSES.treasury as `0x${string}`
const REWARD_DECIMALS = 18

type RewardTokenCardProps = {
  tokenAddress: `0x${string}`
  userAddress: `0x${string}`
}

function RewardTokenCard({ tokenAddress, userAddress }: RewardTokenCardProps) {
  const { data: tokenSymbol } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "tokenSymbols",
    args: [tokenAddress],
  });

  const { data: tokenImage } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "tokenImages",
    args: [tokenAddress],
  });

  const { data: rewardAmount, refetch: refetchReward } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "getUserReward",
    args: [userAddress, tokenAddress],
  });

  const {
    writeContract,
    data: claimTxHash,
    isPending: claimPending,
    error: claimError,
  } = useWriteContract();

  const { isSuccess: claimSuccess, isLoading: claimConfirming } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  useEffect(() => {
    if (claimSuccess) {
      refetchReward?.()
    }
  }, [claimSuccess, refetchReward])

  const rewardValue = typeof rewardAmount === "bigint" ? rewardAmount : BigInt(0)
  const rewardFloat = Number(formatUnits(rewardValue, REWARD_DECIMALS))
  const rewardLabel = Number.isFinite(rewardFloat)
    ? rewardFloat.toLocaleString(undefined, { maximumFractionDigits: 4 })
    : formatUnits(rewardValue, REWARD_DECIMALS)
  const hasReward = rewardValue > BigInt(0)
  const symbolLabel = typeof tokenSymbol === "string" && tokenSymbol ? tokenSymbol : "TOKEN"
  const imageLabel = typeof tokenImage === "string" && tokenImage ? tokenImage : null

  const handleClaim = async () => {
    if (!hasReward || claimPending || claimConfirming) return
    writeContract({
      address: TREASURY_ADDRESS,
      abi: TREASURY_ABI,
      functionName: "claimReward",
      args: [tokenAddress],
    })
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {imageLabel ? (
          <img src={imageLabel} alt={symbolLabel} className="h-11 w-11 rounded-xl object-cover border border-white/10" />
        ) : (
          <div className="h-11 w-11 rounded-xl bg-white/10 text-white/70 flex items-center justify-center text-sm font-semibold">
            {symbolLabel.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">{symbolLabel}</div>
          <div className="text-xs text-white/60">Claimable: {rewardLabel}</div>
        </div>
        <button
          onClick={handleClaim}
          disabled={!hasReward || claimPending || claimConfirming}
          className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/80 text-white hover:bg-emerald-500 disabled:bg-white/10 disabled:text-white/40"
        >
          {claimPending || claimConfirming ? "Claiming..." : claimSuccess ? "Claimed" : "Claim"}
        </button>
      </div>
      {claimError && <div className="mt-2 text-[11px] text-red-400">Claim failed. Try again.</div>}
    </div>
  )
}

export default function ProfilePage() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recasting, setRecasting] = useState(false);
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const queryAddress = searchParams?.get('address') ?? null;

  const { data: supportedTokens, isLoading: supportedTokensLoading } = useReadContract({
    address: TREASURY_ADDRESS,
    abi: TREASURY_ABI,
    functionName: "getSupportedTokens",
  });

  const supportedTokenList = Array.isArray(supportedTokens)
    ? (supportedTokens as `0x${string}`[])
    : []

  const { fetchLeaderboard, formatAddress } = useLeaderboard();

  useEffect(() => {
    loadUserProfile();
  }, [address, isConnected, queryAddress]);

  const loadUserProfile = async () => {
    const targetAddress = queryAddress ?? address;
    if (!targetAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user profile data (prefer DB record, fallback to Farcaster)
      const profileDbPromise = fetch(`/api/user?address=${targetAddress}`);
      const rankPromise = fetch(`/api/leaderboard/user-rank?address=${targetAddress}`);
      const pointsPromise = fetch(`/api/leaderboard/user-points?address=${targetAddress}`);
      const mintCountPromise = fetch(`/api/leaderboard/user-mint-count?address=${targetAddress}`);
      const totalMemesPromise = fetch(`/api/memes/count?address=${targetAddress}`);
      const gameStatsPromise = fetch(`/api/leaderboard/user-game-stats?address=${targetAddress}`);

      const [profileDbResponse, rankResponse, pointsResponse, mintCountResponse, totalMemesResponse] = await Promise.all([
        profileDbPromise,
        rankPromise,
        pointsPromise,
        mintCountPromise,
        totalMemesPromise
      ]);
      const gameStatsResponse = await gameStatsPromise;

      let profileData = null;
      if (profileDbResponse.ok) {
        const dbJson = await profileDbResponse.json();
        if (dbJson?.data) {
          profileData = dbJson.data;
        }
      }
      // fallback to Farcaster hub if DB record missing
      if (!profileData) {
        const remote = await fetch(`/api/profiles?address=${targetAddress}`);
        if (remote.ok) {
          const remoteJson = await remote.json();
          profileData = remoteJson;
        }
      }
      const rankData = rankResponse.ok ? await rankResponse.json() : { data: null };
      const pointsData = pointsResponse.ok ? await pointsResponse.json() : { data: 0 };
      const mintCountData = mintCountResponse.ok ? await mintCountResponse.json() : { data: 0 };
      const totalMemesData = totalMemesResponse.ok ? await totalMemesResponse.json() : { data: 0 };
      const gameStatsData = gameStatsResponse.ok ? await gameStatsResponse.json() : { data: { high_score: 0, last_score: 0, games_played: 0 } };

      // Get leaderboard to find high score and last activity
      const leaderboardResponse = await fetch('/api/leaderboard?limit=100');
      const leaderboardData = leaderboardResponse.ok ? await leaderboardResponse.json() : { data: [] };

      const userInLeaderboard = leaderboardData.data?.find((user: any) =>
        user.user_address.toLowerCase() === targetAddress.toLowerCase()
      );

      setProfile({
        address: targetAddress as `0x${string}`,
        name: profileData?.username || profileData?.name || 'Anonymous',
        pfp: profileData?.pfp || profileData?.pfpUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetAddress}`,
        fid: profileData?.fid || null,
        highScore: Number(gameStatsData.data?.high_score || 0),
        lastScore: Number(gameStatsData.data?.last_score || 0),
        position: rankData.data || 0,
        totalPoints: Number(pointsData.data || 0),
        gamesPlayed: Number(gameStatsData.data?.games_played || 0),
        mintCount: mintCountData.data || 0,
        totalMemes: totalMemesData.data || 0
      });

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    setAdminClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowAdminDashboard(true);
        return 0;
      }
      // Reset count after 3 seconds
      setTimeout(() => setAdminClickCount(0), 3000);
      return newCount;
    });
  };

  const handleRecast = async () => {
    try {
      setRecasting(true);
      if (!profile) return;

      const shareText = `🎨 Check out my Mememint profile!\n\n🏆 High Score: ${profile.highScore}\n📊 Position: #${profile.position}\n🖼️ NFTs Minted: ${profile.mintCount}\n\nJoin the meme-to-earn revolution! #Mememint #Farcaster`;

      await sdk.actions.composeCast({
        text: shareText,
        embeds: ["https://mememint-one.vercel.app/profile"]
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    } finally {
      setRecasting(false);
    }
  };

  // Memes (achievements) list with pagination + modal
  const PAGE_SIZE = 6
  const [memes, setMemes] = useState<Array<any>>([])
  const [loadingMemes, setLoadingMemes] = useState(false)
  const [hasMoreMemes, setHasMoreMemes] = useState(false)
  const [selectedMeme, setSelectedMeme] = useState<any | null>(null)

  const loadMemes = async (reset = false) => {
    if (!profile?.address) return
    try {
      setLoadingMemes(true)
      const offset = reset ? 0 : memes.length
      const res = await fetch(`/api/memes?address=${profile.address}&limit=${PAGE_SIZE}&offset=${offset}`)
      if (res.ok) {
        const json = await res.json()
        const items = json.data || []
        setMemes(prev => reset ? items : [...prev, ...items])
        setHasMoreMemes(items.length === PAGE_SIZE)
      }
    } catch (err) {
      console.warn('Failed to load memes:', err)
    } finally {
      setLoadingMemes(false)
    }
  }

  useEffect(() => {
    setMemes([])
    if (profile?.address) loadMemes(true)
  }, [profile?.address])

  const achievementStyles = {
    emerald: {
      card: "border-emerald-500/40 bg-emerald-500/10",
      icon: "bg-emerald-500/15 text-emerald-200",
      text: "text-emerald-200",
      bar: "bg-emerald-400",
      glow: "shadow-[0_10px_30px_rgba(16,185,129,0.18)]"
    },
    teal: {
      card: "border-teal-500/40 bg-teal-500/10",
      icon: "bg-teal-500/15 text-teal-200",
      text: "text-teal-200",
      bar: "bg-teal-400",
      glow: "shadow-[0_10px_30px_rgba(45,212,191,0.18)]"
    },
    cyan: {
      card: "border-cyan-500/40 bg-cyan-500/10",
      icon: "bg-cyan-500/15 text-cyan-200",
      text: "text-cyan-200",
      bar: "bg-cyan-400",
      glow: "shadow-[0_10px_30px_rgba(34,211,238,0.18)]"
    },
    blue: {
      card: "border-blue-500/40 bg-blue-500/10",
      icon: "bg-blue-500/15 text-blue-200",
      text: "text-blue-200",
      bar: "bg-blue-400",
      glow: "shadow-[0_10px_30px_rgba(59,130,246,0.18)]"
    },
    indigo: {
      card: "border-indigo-500/40 bg-indigo-500/10",
      icon: "bg-indigo-500/15 text-indigo-200",
      text: "text-indigo-200",
      bar: "bg-indigo-400",
      glow: "shadow-[0_10px_30px_rgba(99,102,241,0.18)]"
    },
    violet: {
      card: "border-violet-500/40 bg-violet-500/10",
      icon: "bg-violet-500/15 text-violet-200",
      text: "text-violet-200",
      bar: "bg-violet-400",
      glow: "shadow-[0_10px_30px_rgba(139,92,246,0.18)]"
    },
    rose: {
      card: "border-rose-500/40 bg-rose-500/10",
      icon: "bg-rose-500/15 text-rose-200",
      text: "text-rose-200",
      bar: "bg-rose-400",
      glow: "shadow-[0_10px_30px_rgba(244,63,94,0.18)]"
    },
    amber: {
      card: "border-amber-500/40 bg-amber-500/10",
      icon: "bg-amber-500/15 text-amber-200",
      text: "text-amber-200",
      bar: "bg-amber-400",
      glow: "shadow-[0_10px_30px_rgba(245,158,11,0.18)]"
    },
    orange: {
      card: "border-orange-500/40 bg-orange-500/10",
      icon: "bg-orange-500/15 text-orange-200",
      text: "text-orange-200",
      bar: "bg-orange-400",
      glow: "shadow-[0_10px_30px_rgba(249,115,22,0.18)]"
    },
    sky: {
      card: "border-sky-500/40 bg-sky-500/10",
      icon: "bg-sky-500/15 text-sky-200",
      text: "text-sky-200",
      bar: "bg-sky-400",
      glow: "shadow-[0_10px_30px_rgba(14,165,233,0.18)]"
    },
    neutral: {
      card: "border-white/10 bg-white/5",
      icon: "bg-white/5 text-white/60",
      text: "text-white/50",
      bar: "bg-white/20",
      glow: ""
    }
  } as const

  type AchievementTone = keyof typeof achievementStyles
  type Achievement = {
    id: string
    icon: string
    title: string
    description: string
    current: number
    target: number
    tone: AchievementTone
    unlocked?: boolean
    progressText?: string
  }

  const achievements: Achievement[] = profile
    ? [
        {
          id: "first-meme",
          icon: "🎨",
          title: "First Meme",
          description: "Create your first meme",
          current: profile.totalMemes,
          target: 1,
          tone: "emerald"
        },
        {
          id: "meme-creator",
          icon: "📝",
          title: "Meme Creator",
          description: "Create 10 memes",
          current: profile.totalMemes,
          target: 10,
          tone: "teal"
        },
        {
          id: "meme-master",
          icon: "✨",
          title: "Meme Master",
          description: "Create 50 memes",
          current: profile.totalMemes,
          target: 50,
          tone: "cyan"
        },
        {
          id: "meme-legend",
          icon: "🌟",
          title: "Meme Legend",
          description: "Create 100 memes",
          current: profile.totalMemes,
          target: 100,
          tone: "sky"
        },
        {
          id: "first-run",
          icon: "🎮",
          title: "First Run",
          description: "Play MemeBlast",
          current: profile.gamesPlayed,
          target: 1,
          tone: "blue"
        },
        {
          id: "arcade-regular",
          icon: "🕹️",
          title: "Arcade Regular",
          description: "Play 10 games",
          current: profile.gamesPlayed,
          target: 10,
          tone: "indigo"
        },
        {
          id: "arcade-legend",
          icon: "🏆",
          title: "Arcade Legend",
          description: "Play 50 games",
          current: profile.gamesPlayed,
          target: 50,
          tone: "violet"
        },
        {
          id: "high-scorer",
          icon: "⭐",
          title: "High Scorer",
          description: "Score 1,000+ in MemeBlast",
          current: profile.highScore,
          target: 1000,
          tone: "blue"
        },
        {
          id: "memeblast-pro",
          icon: "💥",
          title: "MemeBlast Pro",
          description: "Score 2,500+ in MemeBlast",
          current: profile.highScore,
          target: 2500,
          tone: "indigo"
        },
        {
          id: "memeblast-elite",
          icon: "🚀",
          title: "MemeBlast Elite",
          description: "Score 5,000+ in MemeBlast",
          current: profile.highScore,
          target: 5000,
          tone: "rose"
        },
        {
          id: "hot-streak",
          icon: "🔥",
          title: "Hot Streak",
          description: "Score 500+ in your last run",
          current: profile.lastScore,
          target: 500,
          tone: "orange"
        },
        {
          id: "first-nft",
          icon: "🧿",
          title: "First NFT",
          description: "Mint your first NFT",
          current: profile.mintCount,
          target: 1,
          tone: "amber"
        },
        {
          id: "nft-collector",
          icon: "🏺",
          title: "NFT Collector",
          description: "Mint 3 NFTs",
          current: profile.mintCount,
          target: 3,
          tone: "amber"
        },
        {
          id: "nft-whale",
          icon: "🐋",
          title: "NFT Whale",
          description: "Mint 10 NFTs",
          current: profile.mintCount,
          target: 10,
          tone: "cyan"
        },
        {
          id: "point-grinder",
          icon: "🏦",
          title: "Point Grinder",
          description: "Earn 1,000 total points",
          current: profile.totalPoints,
          target: 1000,
          tone: "orange"
        },
        {
          id: "point-master",
          icon: "💎",
          title: "Point Master",
          description: "Earn 5,000 total points",
          current: profile.totalPoints,
          target: 5000,
          tone: "rose"
        },
        {
          id: "point-tycoon",
          icon: "👑",
          title: "Point Tycoon",
          description: "Earn 10,000 total points",
          current: profile.totalPoints,
          target: 10000,
          tone: "violet"
        },
        {
          id: "top-50",
          icon: "🏅",
          title: "Top 50",
          description: "Reach top 50 leaderboard",
          current: profile.position > 0 && profile.position <= 50 ? 1 : 0,
          target: 1,
          tone: "sky",
          unlocked: profile.position > 0 && profile.position <= 50,
          progressText: profile.position > 0 ? `Rank #${profile.position}` : "No rank yet"
        },
        {
          id: "top-10",
          icon: "🥇",
          title: "Top 10",
          description: "Reach top 10 leaderboard",
          current: profile.position > 0 && profile.position <= 10 ? 1 : 0,
          target: 1,
          tone: "emerald",
          unlocked: profile.position > 0 && profile.position <= 10,
          progressText: profile.position > 0 ? `Rank #${profile.position}` : "No rank yet"
        },
        {
          id: "world-1",
          icon: "👑",
          title: "World #1",
          description: "Claim the top spot",
          current: profile.position === 1 ? 1 : 0,
          target: 1,
          tone: "amber",
          unlocked: profile.position === 1,
          progressText: profile.position > 0 ? `Rank #${profile.position}` : "No rank yet"
        }
      ]
    : []

  if (loading) {
    return (
      <div className="mm-page">
        <AppHeader onLogoClick={handleLogoClick} />

        <main className="p-4 max-w-7xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
          <div className="flex flex-col items-center justify-center min-h-[300px]" style={{ color: "var(--mm-muted)" }}>
            <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[color:var(--mm-accent)] animate-spin mb-3"></div>
            <p className="text-sm">Loading profile...</p>
          </div>
        </main>
        <AdminDashboard
          isVisible={showAdminDashboard}
          onClose={() => setShowAdminDashboard(false)}
        />
      </div>
    );
  }

  return (
    <div className="mm-page">
      <AppHeader onLogoClick={handleLogoClick} />

      <main className="p-4 max-w-4xl mx-auto pt-24 md:p-6 md:pt-20 sm:p-3 sm:pt-16">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-white/60 mb-6 max-w-md">
              Connect your wallet to view your Mememint profile, track your rewards, and share your achievements on Farcaster.
            </p>
            <WalletButton />
          </div>
        ) : profile && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="mm-card mm-card-strong rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={profile.pfp}
                    alt={profile.name}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-blue-500/50 shadow-lg object-cover w-[120px] h-[120px]"
                  />
                  {profile.fid && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      #{profile.fid}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h1 className="text-lg md:text-xl font-extrabold text-white mb-1">{profile.name}</h1>
                  <p className="text-white/60 text-sm">{formatAddress(profile.address)}</p>
                  {profile.position > 0 && (
                    <p className="text-blue-400 font-semibold mt-2">Rank #{profile.position}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="mm-card mm-card-strong rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-blue-400 mb-1">{profile.highScore.toLocaleString()}</div>
                <div className="text-white/60 text-sm">High Score</div>
              </div>

              <div className="mm-card mm-card-strong rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-green-400 mb-1">{profile.lastScore.toLocaleString()}</div>
                <div className="text-white/60 text-sm">Last Score</div>
              </div>

              <div className="mm-card mm-card-strong rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-purple-400 mb-1">{profile.totalPoints.toLocaleString()}</div>
                <div className="text-white/60 text-sm">Total Points</div>
              </div>

              <div className="mm-card mm-card-strong rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-orange-400 mb-1">{profile.mintCount}</div>
                <div className="text-white/60 text-sm">NFTs Minted</div>
              </div>

              <div className="mm-card mm-card-strong rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-pink-400 mb-1">{profile.totalMemes}</div>
                <div className="text-white/60 text-sm">Memes Generated</div>
              </div>
            </div>

            {/* Rewards */}
            <div className="mm-card mm-card-strong rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">🎁 Rewards</h2>
                  <p className="text-xs text-white/50">Claim tokens earned from gameplay and mints.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/40 uppercase tracking-wide">On-chain</span>
                  <button
                    onClick={handleRecast}
                    disabled={recasting}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/80 text-white hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/40"
                  >
                    {recasting ? "Sharing..." : "Share"}
                  </button>
                </div>
              </div>
              {supportedTokensLoading ? (
                <div className="text-sm text-white/60">Loading rewards...</div>
              ) : supportedTokenList.length === 0 ? (
                <div className="text-sm text-white/60">No reward tokens configured yet.</div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {supportedTokenList.map((token) => (
                    <RewardTokenCard key={token} tokenAddress={token} userAddress={profile.address} />
                  ))}
                </div>
              )}
              <div className="mt-3 text-[11px] text-white/40">Each claim triggers a wallet transaction.</div>
            </div>

            {/* Achievement Preview */}
            <div className="mm-card mm-card-strong rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-2 text-center">🏆 Achievements</h2>
              <p className="text-xs text-white/50 text-center mb-5">Progress across memes, games, and collectibles.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.map((item) => {
                  const unlocked = item.unlocked ?? item.current >= item.target
                  const progress = item.target > 0 ? Math.min(100, (item.current / item.target) * 100) : 0
                  const progressText = item.progressText ?? `${Math.min(item.current, item.target)}/${item.target}`
                  const style = achievementStyles[item.tone] ?? achievementStyles.neutral
                  const cardClass = unlocked ? `${style.card} ${style.glow}` : "border-white/10 bg-white/5"
                  const iconClass = unlocked ? style.icon : "bg-white/5 text-white/60"
                  const textClass = unlocked ? style.text : "text-white/40"
                  const barClass = unlocked ? style.bar : "bg-white/20"

                  return (
                    <div key={item.id} className={`rounded-2xl border p-4 backdrop-blur-xl ${cardClass}`}>
                      <div className="flex items-start gap-3">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl ${iconClass}`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <div className="text-xs text-white/60">{item.description}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide ${unlocked ? "bg-white/10 text-white" : "bg-white/5 text-white/40"}`}>
                          {unlocked ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full ${barClass}`} style={{ width: `${unlocked ? 100 : progress}%` }} />
                      </div>
                      <div className={`mt-2 text-[11px] ${textClass}`}>{progressText}</div>
                    </div>
                  )
                })}
              </div>

              {/* Generated memes grid */}
              <h3 className="text-lg font-semibold text-white mt-6 mb-3">Your Memes</h3>
              {memes.length === 0 ? (
                <p className="text-white/60 text-center">No memes yet. Create one to showcase here.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {memes.map((m: any) => (
                      <div key={m.id} className="mm-card mm-card-strong rounded-lg overflow-hidden cursor-pointer group" onClick={() => setSelectedMeme(m)}>
                        <img src={m.image_url} alt={m.title || 'Meme'} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                        <div className="p-2 flex items-center justify-between">
                          <div className="text-sm text-white/90 truncate">{m.title || 'Meme'}</div>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                await sdk.actions.composeCast({ text: `Check out my meme: ${m.title || ''}`, embeds: [m.image_url] })
                                alert('Recasted!')
                              } catch (err) {
                                console.error('Recast failed', err)
                                alert('Failed to recast')
                              }
                            }}
                            className="text-xs bg-blue-500 px-2 py-1 rounded text-white"
                          >
                            Recast
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-4">
                    {hasMoreMemes ? (
                      <button
                        onClick={() => loadMemes(false)}
                        disabled={loadingMemes}
                        className="px-4 py-2 rounded-lg border text-white hover:opacity-90"
                        style={{ borderColor: "var(--mm-border)", background: "var(--mm-surface-2)" }}
                      >
                        {loadingMemes ? 'Loading...' : 'Load more'}
                      </button>
                    ) : (
                      memes.length > 0 && <div className="text-white/60">End of list</div>
                    )}
                  </div>

                  {/* Modal */}
                  {selectedMeme && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                      <div className="mm-card mm-card-strong rounded-lg max-w-3xl w-full mx-4 overflow-hidden">
                        <div className="p-3 flex items-center justify-between">
                          <div className="text-white font-semibold">{selectedMeme.title || 'Meme'}</div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await sdk.actions.composeCast({ text: `Check out my meme: ${selectedMeme.title || ''}`, embeds: [selectedMeme.image_url] })
                                  alert('Recasted!')
                                } catch (err) {
                                  console.error('Recast failed', err)
                                  alert('Failed to recast')
                                }
                              }}
                              className="px-3 py-1 bg-blue-500 text-white rounded"
                            >
                              Recast
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(selectedMeme.image_url)
                                  alert('Link copied')
                                } catch (err) {
                                  console.error('Copy failed', err)
                                }
                              }}
                              className="px-3 py-1 bg-white/6 text-white rounded"
                            >
                              Copy Link
                            </button>
                            <button onClick={() => setSelectedMeme(null)} className="px-3 py-1 bg-red-600 text-white rounded">Close</button>
                          </div>
                        </div>
                        <div className="p-4">
                          <img src={selectedMeme.image_url} alt={selectedMeme.title || 'Meme'} className="w-full h-auto max-h-[70vh] object-contain mx-auto" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <AdminDashboard
        isVisible={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />
    </div>
  );
}
