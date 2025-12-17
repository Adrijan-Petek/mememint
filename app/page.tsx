"use client";

import { useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./components/WalletButton";
import AdminDashboard from "./components/AdminDashboard";
import MemeGenerator from "./components/MemeGenerator";

export default function Home() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const pathname = usePathname();

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
    <div className="min-h-screen bg-app-bg font-sans relative before:absolute before:inset-0 before:bg-hero-bg before:pointer-events-none before:opacity-80">
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
              <Link
                href="/"
                className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${
                  pathname === '/' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Create
              </Link>
              <Link
                href="/mint"
                className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${
                  pathname === '/mint' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Mint
              </Link>
              <Link href="/token" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${pathname?.startsWith('/token') ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                Token
              </Link>
              <Link
                href="/leaderboard"
                className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${
                  pathname === '/leaderboard' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Leaderboard
              </Link>
              <Link
                href="/profile"
                className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${
                  pathname === '/profile' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

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
          <button
            onClick={handleAddMiniApp}
            className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg no-underline font-medium text-sm transition-all duration-300 ease-out shadow-lg border border-white/20 cursor-pointer backdrop-blur-[10px] hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg md:px-4 md:py-2 md:text-sm sm:px-3 sm:py-1.5 sm:text-xs"
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
