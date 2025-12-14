"use client";

import { useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import AdminDashboard from "./components/AdminDashboard";
import MemeGenerator from "./components/MemeGenerator";

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
    <div className="min-h-screen bg-app-bg font-sans relative before:absolute before:inset-0 before:bg-hero-bg before:pointer-events-none before:opacity-80">
      <Header onShowAdminDashboard={() => setShowAdminDashboard(true)} />
      <Navigation />

      <main className="p-4 max-w-7xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
        <MemeGenerator onShowAdminDashboard={() => setShowAdminDashboard(true)} />
      </main>

      <footer className="text-center p-4 mt-4 bg-app-bg backdrop-blur-[10px] border-t border-white/10 relative before:absolute before:inset-0 before:bg-hero-bg before:pointer-events-none before:opacity-90 md:p-4 md:mt-4 sm:p-2 sm:mt-2">
        <div className="relative z-10 flex gap-4 justify-center flex-wrap">
          <button
            onClick={handleShareApp}
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg no-underline font-medium text-sm transition-all duration-300 ease-out shadow-lg border border-white/20 cursor-pointer backdrop-blur-[10px] hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg md:px-4 md:py-2 md:text-sm sm:px-3 sm:py-1.5 sm:text-xs"
          >
            🔁 Recast App
          </button>
          <a
            href="https://farcaster.xyz/adrijan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg no-underline font-medium text-sm transition-all duration-300 ease-out shadow-lg border border-white/20 cursor-pointer backdrop-blur-[10px] hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg md:px-4 md:py-2 md:text-sm sm:px-3 sm:py-1.5 sm:text-xs"
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
