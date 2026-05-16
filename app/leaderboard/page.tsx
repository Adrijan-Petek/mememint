"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "../components/AppHeader";
import AdminDashboard from "../components/AdminDashboard";
import { useLeaderboard } from "../hooks/useScoring";

function ScoringSystem() {
  return (
    <div className="mm-card mm-card-strong p-4 mb-6 border">
      <div className="text-sm font-semibold" style={{ color: "var(--mm-text)" }}>Scoring</div>
      <div className="text-xs mt-1" style={{ color: "var(--mm-muted)" }}>
        Points are awarded for meme creations, gameplay, and on-chain activity.
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
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
        <div
          key={addr}
          className={`mm-leaderboard-row md:grid-cols-[60px_160px_1fr_120px_140px] md:gap-3 sm:grid-cols-[50px_100px_1fr_80px] sm:gap-2 ${index < 3 ? "mm-leaderboard-row-top" : ""}`}
        >
          <div className="mm-rank md:text-sm sm:text-xs">
            {index < 3 && (
              <span className="text-lg md:text-base sm:text-sm">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
            )}
            <span className="mm-rank-number text-base md:text-sm sm:text-xs">#{entry.rank}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="mm-avatar md:w-10 md:h-10 sm:w-8 sm:h-8">
              <img src={pfpSrc} alt={displayName || 'Player'} width={40} height={40} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="mm-player-name md:text-xs sm:text-xs">
            <div className="flex flex-col">
                <Link href={`/profile?address=${addr}`} className="mm-player-link truncate">
                  <span>{displayName ?? shortAddr}</span>
                </Link>
            </div>
          </div>

          <div className="text-center">
            <span className="mm-score md:text-base sm:text-sm">{entry.score.toLocaleString()}</span>
          </div>

          <div className="mm-last-activity md:hidden">
            <span
              className="px-2 py-1 rounded-md font-medium border"
              style={{
                borderColor: "var(--mm-border)",
                background: "var(--mm-surface)",
                color: "var(--mm-muted)",
              }}
            >
              {formatTime(entry.lastActivity)}
            </span>
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
      <div className="mm-page">
        <AppHeader onLogoClick={handleLogoClick} />

        <main className="p-4 max-w-7xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
          <div className="flex flex-col items-center justify-center min-h-[300px]" style={{ color: "var(--mm-muted)" }}>
            <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[color:var(--mm-accent)] animate-spin mb-3"></div>
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
      <div className="mm-page">
        <AppHeader onLogoClick={handleLogoClick} />
        <main className="p-4 max-w-7xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4" style={{ color: "var(--mm-muted)" }}>
            <h2 className="mb-3 text-2xl md:text-xl sm:text-lg" style={{ color: "var(--mm-accent)" }}>Unable to Load Leaderboard</h2>
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
    <div className="mm-page">
      <AppHeader onLogoClick={handleLogoClick} />

      <main className="p-4 max-w-4xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
        <div className="text-center mb-8">
          <h1 className="mm-section-title mb-2">Leaderboard</h1>
          <p className="mm-section-subtitle md:text-base sm:text-sm">
            Top players ranked by points earned across memes and MemeBlast.
          </p>
        </div>

        {/* Scoring System */}
        <ScoringSystem />

        {stats && (
          <div className="mm-stat-grid mb-8 md:mb-6 sm:mb-4 sm:gap-2">
            <div className="mm-stat-card md:p-3 sm:p-2">
              <div className="mm-stat-value mb-1 md:text-3xl sm:text-2xl">{stats.totalUsers.toString()}</div>
              <div className="mm-stat-label md:text-xs sm:text-xs">Total Players</div>
            </div>
            <div className="mm-stat-card md:p-3 sm:p-2">
              <div className="mm-stat-value mb-1 md:text-3xl sm:text-2xl">{stats.totalScore.toLocaleString()}</div>
              <div className="mm-stat-label md:text-xs sm:text-xs">Total Points</div>
            </div>
          </div>
        )}

        <div className="mm-leaderboard">
          <div className="mm-leaderboard-head md:grid-cols-[50px_120px_1fr_80px] md:gap-2 md:p-3 md:text-xs sm:grid-cols-[50px_100px_1fr_80px] sm:gap-1 sm:p-2 sm:text-xs">
            <div className="flex items-center gap-2 font-semibold">Rank</div>
            <div>Player</div>
            <div className="text-center">Name</div>
            <div className="text-center">Score</div>
            <div className="text-right md:hidden">Last Activity</div>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="p-8 text-center md:p-6 sm:p-4" style={{ color: "var(--mm-muted)" }}>
              <p className="text-lg m-0 md:text-base sm:text-sm">No players yet. Be the first to earn points.</p>
            </div>
          ) : (
            <div className="mm-leaderboard-body md:max-h-[400px] sm:max-h-[300px]">
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
