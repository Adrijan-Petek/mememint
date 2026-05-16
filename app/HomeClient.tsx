"use client";

import { useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { AppHeader } from "./components/AppHeader";
import AdminDashboard from "./components/AdminDashboard";
import MemeGenerator from "./components/MemeGenerator";

export default function Home() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

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

  const handleAddMiniApp = async () => {
    try {
      await sdk.actions.addMiniApp();
      console.log("Mini app added successfully");
    } catch (error) {
      console.error("Failed to add mini app:", error);
    }
  };

  return (
    <div className="mm-page">
      <AppHeader onLogoClick={handleLogoClick} />

      <main className="p-4 max-w-7xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
        <MemeGenerator onShowAdminDashboard={() => setShowAdminDashboard(true)} />
      </main>

      <footer className="text-center p-4 mt-4 backdrop-blur-[10px] border-t md:p-4 md:mt-4 sm:p-2 sm:mt-2" style={{ borderColor: "var(--mm-border)", background: "var(--mm-surface)" }}>
        <div className="relative z-10 flex gap-4 justify-center flex-wrap">
          <button
            onClick={handleShareApp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl no-underline font-semibold text-sm transition-all duration-200 shadow-lg border cursor-pointer backdrop-blur-[10px] md:px-4 md:py-2 md:text-sm sm:px-3 sm:py-1.5 sm:text-xs"
            style={{ background: "var(--mm-surface)", borderColor: "var(--mm-border)", color: "var(--mm-text)" }}
          >
            🔁 Recast App
          </button>
          <a
            href="https://farcaster.xyz/adrijan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl no-underline font-semibold text-sm transition-all duration-200 shadow-lg border cursor-pointer backdrop-blur-[10px] md:px-4 md:py-2 md:text-sm sm:px-3 sm:py-1.5 sm:text-xs"
            style={{ background: "var(--mm-surface)", borderColor: "var(--mm-border)", color: "var(--mm-text)" }}
          >
            👤 Follow
          </a>
          <button
            onClick={handleAddMiniApp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl no-underline font-semibold text-sm transition-all duration-200 shadow-lg border cursor-pointer backdrop-blur-[10px] md:px-4 md:py-2 md:text-sm sm:px-3 sm:py-1.5 sm:text-xs"
            style={{ background: "var(--mm-surface)", borderColor: "var(--mm-border)", color: "var(--mm-text)" }}
          >
            📱 Add Mini App
          </button>
        </div>
      </footer>

      <AdminDashboard
        isVisible={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />
    </div>
  );
}
