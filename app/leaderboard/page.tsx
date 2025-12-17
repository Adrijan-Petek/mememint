"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "../components/WalletButton";
import AdminDashboard from "../components/AdminDashboard";
import { useLeaderboard } from "../hooks/useScoring";

function ScoringSystem() {
  return (
    <div className="mb-6">
      <div className="text-sm text-white/70">Scoring system:</div>
      <div className="text-xs text-white/60">Points are awarded for meme creations and interactions.</div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const pathname = usePathname();
  const { leaderboardData, stats, loading, error, fetchLeaderboard, formatAddress, formatTime } = useLeaderboard();

  useEffect(() => {
    fetchLeaderboard(100);
  }, [fetchLeaderboard]);

  // Prepare leaderboard rows using transformed leaderboardData
  const leaderboardRows = (leaderboardData || [])
    .filter(entry => {
      const a = (entry.user?.address || '').toLowerCase();
      // Exclude empty/placeholder addresses
      if (!a) return false;
      if (a === '0x0000000000000000000000000000000000000000') return false;
      if (a === '0x00') return false;
      return true;
    })
    .map((entry, index) => {
      const addr = (entry.user.address || '').toLowerCase();
      const displayName = entry.user.name && entry.user.name.length > 0 ? entry.user.name : null;
      const pfpSrc = entry.user.pfp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${addr}`;
      const shortAddr = formatAddress(addr as any);

      return (
        <div key={addr} className={`grid grid-cols-[48px_56px_1fr_64px] gap-3 p-3 border-b border-white/5 transition-all duration-200 ease-out items-center hover:bg-white/2 last:border-b-0 md:grid-cols-[60px_160px_1fr_120px_140px] md:gap-3 md:p-4 sm:grid-cols-[50px_100px_1fr_80px] sm:gap-2 sm:p-3 ${index < 3 ? 'bg-gradient-to-br from-blue-400/5 to-green-400/5 border-l-4 border-blue-400' : ''}`}>
          <div className="flex items-center gap-2 font-semibold text-white/90 md:text-sm sm:text-xs">
            {index < 3 && (
              <span className="text-lg md:text-base sm:text-sm">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
            )}
            <span className="text-base text-white/80 md:text-sm sm:text-xs">#{entry.rank}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0 md:w-10 md:h-10 sm:w-8 sm:h-8">
              <img src={pfpSrc} alt={displayName || 'Player'} width={40} height={40} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="font-medium text-white/90 truncate text-sm md:text-xs sm:text-xs">
            <div className="flex flex-col">
                <Link href={`/profile?address=${addr}`} className="hover:underline truncate">
                  <span>{displayName ?? shortAddr}</span>
                </Link>
            </div>
          </div>

          <div className="text-center">
            <span className="text-lg font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)] md:text-base sm:text-sm">{entry.score.toLocaleString()}</span>
          </div>

          <div className="text-right text-xs text-white/60 md:hidden">
            <span className="bg-white/3 px-2 py-1 rounded-md font-medium">{formatTime(entry.lastActivity)}</span>
          </div>
        </div>
      )
    })

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
              <nav className="flex gap-4 md:gap-6 items-center">
                <Link href="/" className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname === '/' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Create
                </Link>
                <Link href="/token" className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname?.startsWith('/token') ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Token
                </Link>
                <Link href="/leaderboard" className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname === '/leaderboard' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Leaderboard
                </Link>
                <Link href="/profile" className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname === '/profile' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Profile
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="p-4 max-w-7xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
          <div className="flex flex-col items-center justify-center min-h-[300px] text-white/80">
            <div className="w-8 h-8 border-2 border-white/10 border-t-2 border-t-blue-400 rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Loading leaderboard...</p>
          </div>
        </main>
        <AdminDashboard
          isVisible={showAdminDashboard}
          onClose={() => setShowAdminDashboard(false)}
        />
      </div>
    );
  }

  if (error) {
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
                  className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${
                    pathname === '/' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                  }`}
                >
                  Create
                </Link>
                <Link href="/token" className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname?.startsWith('/token') ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Token
                </Link>
                <Link
                  href="/leaderboard"
                  className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${
                    pathname === '/leaderboard' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                  }`}
                >
                  Leaderboard
                </Link>
                <Link href="/profile" className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname === '/profile' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                  Profile
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="p-4 max-w-7xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-white/80 p-4">
            <h2 className="text-red-500 mb-3 text-2xl md:text-xl sm:text-lg">Unable to Load Leaderboard</h2>
            <p className="my-1 text-sm md:text-sm sm:text-xs">{error}</p>
            <p className="my-1 text-sm md:text-sm sm:text-xs">Please check your backend connection and try again.</p>
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
                className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${
                  pathname === '/' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                  Create
              </Link>
              <Link href="/token" className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${pathname?.startsWith('/token') ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                Token
              </Link>
              <Link
                href="/leaderboard"
                className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${
                  pathname === '/leaderboard' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Leaderboard
              </Link>
              <Link
                href="/profile"
                className={`text-white/80 no-underline font-medium text-sm md:text-sm py-1.5 px-3 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${
                  pathname === '/profile' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 -tracking-wider drop-shadow-[0_0_30px_rgba(96,165,250,0.3)] md:text-3xl sm:text-2xl">🏆 Top Scorers Leaderboard</h1>
          <p className="text-lg text-white/80 font-normal md:text-base sm:text-sm">Compete to be among the top 100 meme generators and gamers!</p>
        </div>

        {/* Scoring System */}
        <ScoringSystem />

        {stats && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8 md:gap-3 md:mb-6 sm:gap-2 sm:mb-4">
            <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-4 text-center shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-blue-400/30 md:p-3 sm:p-2">
              <div className="text-3xl font-extrabold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)] md:text-2xl sm:text-xl">{stats.totalUsers.toString()}</div>
              <div className="text-sm text-white/70 font-medium uppercase tracking-wider md:text-xs sm:text-xs">Total Players</div>
            </div>
            <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-4 text-center shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-blue-400/30 md:p-3 sm:p-2">
              <div className="text-4xl font-extrabold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)] md:text-3xl sm:text-2xl">{stats.totalScore.toLocaleString()}</div>
              <div className="text-sm text-white/70 font-medium uppercase tracking-wider md:text-xs sm:text-xs">Total Points Scored</div>
            </div>
          </div>
        )}

        <div className="bg-white/3 backdrop-blur-[20px] border border-white/10 rounded-[20px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
          <div className="grid grid-cols-[60px_160px_1fr_120px_140px] gap-3 p-4 bg-blue-400/10 border-b border-white/10 font-semibold text-white/90 uppercase tracking-wider text-sm md:grid-cols-[50px_120px_1fr_80px] md:gap-2 md:p-3 md:text-xs sm:grid-cols-[50px_100px_1fr_80px] sm:gap-1 sm:p-2 sm:text-xs">
            <div className="flex items-center gap-2 font-semibold text-white/90">Rank</div>
            <div>Player</div>
            <div className="text-center">Name</div>
            <div className="text-center">Score</div>
            <div className="text-right md:hidden">Last Activity</div>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="p-8 text-center text-white/60 md:p-6 sm:p-4">
              <p className="text-lg m-0 md:text-base sm:text-sm">No players yet. Be the first to earn points!</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto md:max-h-[400px] sm:max-h-[300px]">
              {leaderboardRows}
            </div>
          )}
        </div>
      </main>

      <AdminDashboard
        isVisible={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />
    </div>
  );
}