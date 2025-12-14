"use client";
import { useState } from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import AdminDashboard from "../components/AdminDashboard";
import { useLeaderboard } from "../hooks/useLeaderboard";

export default function LeaderboardPage() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const { leaderboardData, stats, loading, error, formatAddress, formatTime } = useLeaderboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg bg-[400%_400%] animate-gradient-shift font-sans relative before:absolute before:inset-0 before:bg-hero-bg before:pointer-events-none before:opacity-80">
        <Header onShowAdminDashboard={() => setShowAdminDashboard(true)} />
        <Navigation />
        <main className="p-8 max-w-7xl mx-auto relative z-10 pt-36 md:p-4 md:pt-30 sm:p-3 sm:pt-28">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-white/80">
            <div className="w-12 h-12 border-2 border-white/10 border-t-2 border-t-blue-400 rounded-full animate-spin mb-4"></div>
            <p>Loading leaderboard...</p>
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
        <Header onShowAdminDashboard={() => setShowAdminDashboard(true)} />
        <Navigation />
        <main className="p-8 max-w-7xl mx-auto relative z-10 pt-36 md:p-4 md:pt-30 sm:p-3 sm:pt-28">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-white/80 p-8">
            <h2 className="text-red-500 mb-4 text-3xl">Unable to Load Leaderboard</h2>
            <p className="my-2 text-lg">{error}</p>
            <p className="my-2 text-lg">Please check your contract configuration and try again.</p>
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
      <Header onShowAdminDashboard={() => setShowAdminDashboard(true)} />
      <Navigation />

      <main className="p-8 max-w-7xl mx-auto relative z-10 pt-36 md:p-4 md:pt-30 sm:p-3 sm:pt-28">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 -tracking-wider drop-shadow-[0_0_30px_rgba(96,165,250,0.3)] md:text-4xl sm:text-3xl">🏆 Top Generators Leaderboard</h1>
          <p className="text-xl text-white/80 font-normal md:text-lg sm:text-base">Compete to be among the top 100 meme generators!</p>
        </div>

        {stats && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8 mb-12 md:gap-4 md:mb-8 sm:gap-2 sm:mb-6">
            <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-8 text-center shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-blue-400/30 md:p-6 sm:p-4">
              <div className="text-5xl font-extrabold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)] md:text-4xl sm:text-3xl">{stats.totalMinters.toString()}</div>
              <div className="text-base text-white/70 font-medium uppercase tracking-wider">Total Generators</div>
            </div>
            <div className="bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-2xl p-8 text-center shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-blue-400/30 md:p-6 sm:p-4">
              <div className="text-5xl font-extrabold bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)] md:text-4xl sm:text-3xl">{stats.minMints.toString()}</div>
              <div className="text-base text-white/70 font-medium uppercase tracking-wider">Min Generates to Rank</div>
            </div>
          </div>
        )}

        <div className="bg-white/3 backdrop-blur-[20px] border border-white/10 rounded-[20px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
          <div className="grid grid-cols-[80px_1fr_150px_180px] gap-4 p-6 bg-blue-400/10 border-b border-white/10 font-semibold text-white/90 uppercase tracking-wider text-sm md:grid-cols-[60px_1fr_100px] md:gap-3 md:p-4 md:text-xs sm:grid-cols-[60px_1fr_100px] sm:gap-2 sm:p-3 sm:text-xs">
            <div className="flex items-center gap-2 font-semibold text-white/90">Rank</div>
            <div className="font-mono text-sm">Address</div>
            <div className="text-center">Total Generates</div>
            <div className="text-right md:hidden">Last Generate</div>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="p-16 text-center text-white/60 md:p-8 sm:p-6">
              <p className="text-xl m-0 md:text-lg sm:text-base">No generators yet. Be the first to generate a meme!</p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              {leaderboardData.map((entry, index) => (
                <div key={entry.user} className={`grid grid-cols-[80px_1fr_150px_180px] gap-4 p-5 border-b border-white/5 transition-all duration-200 ease-out items-center hover:bg-white/2 last:border-b-0 md:grid-cols-[60px_1fr_100px] md:gap-3 md:p-4 sm:grid-cols-[60px_1fr_100px] sm:gap-2 sm:p-3 ${index < 3 ? 'bg-gradient-to-br from-blue-400/5 to-green-400/5 border-l-4 border-blue-400' : ''}`}>
                  <div className="flex items-center gap-2 font-semibold text-white/90 md:text-sm sm:text-xs">
                    {index < 3 && (
                      <span className="text-xl md:text-lg sm:text-base">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <span className="text-lg text-white/80 md:text-base sm:text-sm">#{index + 1}</span>
                  </div>
                  <div className="font-mono text-sm md:text-xs sm:text-xs">
                    <span className="text-white/80 bg-white/5 px-2 py-1 rounded-md font-medium md:px-1 md:py-0.5 sm:px-1 sm:py-0.5">{formatAddress(entry.user)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)] md:text-lg sm:text-base">{entry.totalMints.toString()}</span>
                  </div>
                  <div className="text-right text-xs text-white/60 md:hidden">
                    <span className="bg-white/3 px-2 py-1 rounded-md font-medium">
                      {entry.lastMintTime > 0 ? formatTime(entry.lastMintTime) : 'Never'}
                    </span>
                  </div>
                </div>
              ))}
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