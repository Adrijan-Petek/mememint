"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { WalletButton } from "../components/WalletButton";
import AdminDashboard from "../components/AdminDashboard";
import { useLeaderboard } from "../hooks/useScoring";
import { sdk } from "@farcaster/miniapp-sdk";

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
  mintCount: number;
}

export default function ProfilePage() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [recasting, setRecasting] = useState(false);
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const queryAddress = searchParams?.get('address') ?? null;

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

      const [profileDbResponse, rankResponse, pointsResponse, mintCountResponse] = await Promise.all([
        profileDbPromise,
        rankPromise,
        pointsPromise,
        mintCountPromise
      ]);

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
        highScore: userInLeaderboard?.total_score || 0,
        lastScore: userInLeaderboard?.total_score || 0, // For now, same as high score
        position: rankData.data || 0,
        totalPoints: pointsData.data || 0,
        mintCount: mintCountData.data || 0
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

  const handleClaimRewards = async () => {
    try {
      setClaiming(true);
      // TODO: Implement reward claiming logic
      // This would interact with your smart contract or reward system
      alert('Reward claiming coming soon! 🪙');
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setClaiming(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg bg-[400%_400%] animate-gradient-shift font-sans relative before:absolute before:inset-0 before:bg-hero-bg before:pointer-events-none before:opacity-80">
        <header className="bg-gradient-to-br from-[rgba(13,13,13,0.95)] to-[rgba(26,26,26,0.95)] backdrop-blur-[20px] border-b border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] z-10">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            {/* Top row: Logo and Wallet */}
            <div className="flex justify-between items-center min-h-[50px] md:min-h-[45px]">
              <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={handleLogoClick}>
                <Image src="/logo.png" alt="Mememint" priority width={120} height={60} className="w-[120px] h-auto transition-transform hover:scale-105 md:w-[150px] md:h-auto" />
              </div>
              <WalletButton />
            </div>

            {/* Bottom row: Navigation */}
            <div className="flex justify-center items-center min-h-[40px] md:min-h-[35px] pt-3">
              <nav className="flex gap-2 md:gap-4 lg:gap-6 items-center overflow-x-auto scrollbar-hide px-2">
                <Link href="/" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${pathname === '/' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Create
                </Link>
                <Link href="/mint" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${pathname === '/mint' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Mint
                </Link>
                <Link href="/token" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${pathname?.startsWith('/token') ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Token
                </Link>
                <Link href="/leaderboard" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${pathname === '/leaderboard' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Leaderboard
                </Link>
                <Link href="/profile" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${pathname === '/profile' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Profile
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="p-4 max-w-7xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
          <div className="flex flex-col items-center justify-center min-h-[300px] text-white/80">
            <div className="w-8 h-8 border-2 border-white/10 border-t-2 border-t-blue-400 rounded-full animate-spin mb-3"></div>
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
    <div className="min-h-screen bg-app-bg bg-[400%_400%] animate-gradient-shift font-sans relative before:absolute before:inset-0 before:bg-hero-bg before:pointer-events-none before:opacity-80">
      <header className="bg-gradient-to-br from-[rgba(13,13,13,0.95)] to-[rgba(26,26,26,0.95)] backdrop-blur-[20px] border-b border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          {/* Top row: Logo and Wallet */}
          <div className="flex justify-between items-center min-h-[50px] md:min-h-[45px]">
            <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={handleLogoClick}>
              <Image src="/logo.png" alt="Mememint" priority width={120} height={60} className="w-[120px] h-auto transition-transform hover:scale-105 md:w-[150px] md:h-auto" />
            </div>
            <WalletButton />
          </div>

          {/* Bottom row: Navigation */}
          <div className="flex justify-center items-center min-h-[40px] md:min-h-[35px] pt-3">
              <nav className="flex gap-4 md:gap-6 items-center">
                <Link
                  href="/"
                  className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname === '/' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}
                >
                  Create
                </Link>
                <Link href="/mint" className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname === '/mint' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Mint
                </Link>
                <Link href="/token" className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname?.startsWith('/token') ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Token
                </Link>
                <Link
                  href="/leaderboard"
                  className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname === '/leaderboard' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}
                >
                  Leaderboard
                </Link>
                <Link
                  href="/profile"
                  className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname === '/profile' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}
                >
                  Profile
                </Link>
              </nav>
          </div>
        </div>
      </header>

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
            <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-6 shadow-2xl">
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
                  <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
                  <p className="text-white/60 text-sm">{formatAddress(profile.address)}</p>
                  {profile.position > 0 && (
                    <p className="text-blue-400 font-semibold mt-2">Rank #{profile.position}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-blue-400 mb-1">{profile.highScore.toLocaleString()}</div>
                <div className="text-white/60 text-sm">High Score</div>
              </div>

              <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-green-400 mb-1">{profile.lastScore.toLocaleString()}</div>
                <div className="text-white/60 text-sm">Last Score</div>
              </div>

              <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-purple-400 mb-1">{profile.totalPoints.toLocaleString()}</div>
                <div className="text-white/60 text-sm">Total Points</div>
              </div>

              <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-orange-400 mb-1">{profile.mintCount}</div>
                <div className="text-white/60 text-sm">NFTs Minted</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleClaimRewards}
                disabled={claiming}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_8px_25px_rgba(34,197,94,0.3)] disabled:transform-none disabled:shadow-none"
              >
                {claiming ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-2 border-t-white rounded-full animate-spin mr-2"></div>
                    Claiming...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="text-xl mr-2">🪙</span>
                    Claim Rewards
                  </div>
                )}
              </button>

              <button
                onClick={handleRecast}
                disabled={recasting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_8px_25px_rgba(139,92,246,0.3)] disabled:transform-none disabled:shadow-none"
              >
                {recasting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-2 border-t-white rounded-full animate-spin mr-2"></div>
                    Sharing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="text-xl mr-2">🔄</span>
                    Share Profile
                  </div>
                )}
              </button>
            </div>

            {/* Achievement Preview */}
            <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4 text-center">🏆 Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className={`text-center p-3 rounded-lg border ${profile.mintCount > 0 ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="text-2xl mb-1">🎨</div>
                  <div className="text-sm text-white/80">First Meme</div>
                  <div className={`text-xs ${profile.mintCount > 0 ? 'text-green-400' : 'text-white/40'}`}>
                    {profile.mintCount > 0 ? 'Unlocked' : 'Locked'}
                  </div>
                </div>

                <div className={`text-center p-3 rounded-lg border ${profile.highScore >= 1000 ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-sm text-white/80">High Scorer</div>
                  <div className={`text-xs ${profile.highScore >= 1000 ? 'text-blue-400' : 'text-white/40'}`}>
                    {profile.highScore >= 1000 ? 'Unlocked' : 'Locked'}
                  </div>
                </div>

                <div className={`text-center p-3 rounded-lg border ${profile.position <= 10 && profile.position > 0 ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="text-2xl mb-1">👑</div>
                  <div className="text-sm text-white/80">Top 10</div>
                  <div className={`text-xs ${profile.position <= 10 && profile.position > 0 ? 'text-purple-400' : 'text-white/40'}`}>
                    {profile.position <= 10 && profile.position > 0 ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
              </div>

              {/* Generated memes grid */}
              <h3 className="text-lg font-semibold text-white mt-6 mb-3">Your Memes</h3>
              {memes.length === 0 ? (
                <p className="text-white/60 text-center">No memes yet. Create one to showcase here.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {memes.map((m: any) => (
                      <div key={m.id} className="bg-white/3 rounded-lg overflow-hidden border border-white/10 cursor-pointer group" onClick={() => setSelectedMeme(m)}>
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
                        className="px-4 py-2 bg-white/6 text-white rounded-lg hover:bg-white/10"
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
                      <div className="bg-gray-900 rounded-lg max-w-3xl w-full mx-4 overflow-hidden">
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