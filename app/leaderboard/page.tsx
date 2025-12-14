"use client";
import { useState } from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import AdminDashboard from "../components/AdminDashboard";
import { useLeaderboard } from "../hooks/useLeaderboard";
import styles from "./page.module.css";

export default function LeaderboardPage() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const { leaderboardData, stats, loading, error, formatAddress, formatTime } = useLeaderboard();

  if (loading) {
    return (
      <div className={styles.container}>
        <Header onShowAdminDashboard={() => setShowAdminDashboard(true)} />
        <Navigation />
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
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
      <div className={styles.container}>
        <Header onShowAdminDashboard={() => setShowAdminDashboard(true)} />
        <Navigation />
        <main className={styles.main}>
          <div className={styles.error}>
            <h2>Unable to Load Leaderboard</h2>
            <p>{error}</p>
            <p>Please check your contract configuration and try again.</p>
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
    <div className={styles.container}>
      <Header onShowAdminDashboard={() => setShowAdminDashboard(true)} />
      <Navigation />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>🏆 Top Generators Leaderboard</h1>
          <p>Compete to be among the top 100 meme generators!</p>
        </div>

        {stats && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalMinters.toString()}</div>
              <div className={styles.statLabel}>Total Generators</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.minMints.toString()}</div>
              <div className={styles.statLabel}>Min Generates to Rank</div>
            </div>
          </div>
        )}

        <div className={styles.leaderboard}>
          <div className={styles.tableHeader}>
            <div className={styles.rank}>Rank</div>
            <div className={styles.address}>Address</div>
            <div className={styles.generates}>Total Generates</div>
            <div className={styles.lastGenerate}>Last Generate</div>
          </div>

          {leaderboardData.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No generators yet. Be the first to generate a meme!</p>
            </div>
          ) : (
            <div className={styles.tableBody}>
              {leaderboardData.map((entry, index) => (
                <div key={entry.user} className={`${styles.tableRow} ${index < 3 ? styles.topThree : ''}`}>
                  <div className={styles.rank}>
                    {index < 3 && (
                      <span className={styles.medal}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <span className={styles.rankNumber}>#{index + 1}</span>
                  </div>
                  <div className={styles.address}>
                    <span className={styles.addressText}>{formatAddress(entry.user)}</span>
                  </div>
                  <div className={styles.generates}>
                    <span className={styles.mintCount}>{entry.totalMints.toString()}</span>
                  </div>
                  <div className={styles.lastGenerate}>
                    <span className={styles.lastGenerateTime}>
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