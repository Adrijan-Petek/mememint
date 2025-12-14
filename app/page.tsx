"use client";

import { useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import AdminDashboard from "./components/AdminDashboard";
import MemeGenerator from "./components/MemeGenerator";
import styles from "./page.module.css";

export default function Home() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const handleShareApp = async () => {
    try {
      await sdk.actions.composeCast({
        text: "Check out Mememint - Create and generate memes! 🎨✨",
        embeds: ["https://mememint-one.vercel.app"]
      });
    } catch (error) {
      console.error("Failed to share app:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Header onShowAdminDashboard={() => setShowAdminDashboard(true)} />
      <Navigation />

      <main className={styles.main}>
        <MemeGenerator onShowAdminDashboard={() => setShowAdminDashboard(true)} />
      </main>

      <footer className={styles.footer}>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={handleShareApp}
            className={styles.followBtn}
            style={{ cursor: "pointer" }}
          >
            🔁 Recast App
          </button>
          <a
            href="https://farcaster.xyz/adrijan"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.followBtn}
          >
            👤 Follow
          </a>
        </div>
      </footer>

      <AdminDashboard
        isVisible={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />
    </div>
  );
}
