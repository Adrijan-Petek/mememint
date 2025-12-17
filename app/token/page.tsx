"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "../components/WalletButton";
import AdminDashboard from "../components/AdminDashboard";
import BuySellToken from "../components/BuySellToken";

export default function TokenPage() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const pathname = usePathname();

  const handleLogoClick = () => {
    setAdminClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdminDashboard(true);
        return 0;
      }
      setTimeout(() => setAdminClickCount(0), 3000);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-app-bg bg-[400%_400%] animate-gradient-shift font-sans relative before:absolute before:inset-0 before:bg-hero-bg before:pointer-events-none before:opacity-80">
      <header className="bg-gradient-to-br from-[rgba(13,13,13,0.95)] to-[rgba(26,26,26,0.95)] backdrop-blur-[20px] border-b border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] z-10 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center min-h-[50px] md:min-h-[45px]">
            <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={handleLogoClick}>
              <Image src="/logo.png" alt="Mememint" priority width={120} height={60} className="w-[120px] h-auto transition-transform hover:scale-105 md:w-[150px] md:h-auto" />
            </div>
            <WalletButton />
          </div>

          <div className="flex justify-center items-center min-h-[40px] md:min-h-[35px] pt-3 pb-2">
            <nav className="flex gap-2 md:gap-6 items-center overflow-x-auto scrollbar-hide">
              <Link href="/" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 whitespace-nowrap ${pathname === '/' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 font-semibold' : ''}`}>
                    Create
                  </Link>
              <Link href="/token" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 whitespace-nowrap ${pathname?.startsWith('/token') ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 font-semibold' : ''}`}>
                Token
              </Link>
              <Link href="/leaderboard" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 whitespace-nowrap ${pathname === '/leaderboard' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 font-semibold' : ''}`}>
                Leaderboard
              </Link>
              <Link href="/profile" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 whitespace-nowrap ${pathname === '/profile' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 font-semibold' : ''}`}>
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto md:px-6 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full mb-4 border border-white/10">
            <img src="https://mememint-one.vercel.app/icon.png" alt="Mememint token" className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 -tracking-wider drop-shadow-[0_0_30px_rgba(96,165,250,0.3)]">💎 Mememint Token</h1>
          <p className="text-base md:text-lg text-white/80 font-normal max-w-md mx-auto">Trade MEMEMINT token seamlessly with integrated swap options.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <BuySellToken defaultMode="buy" />
        </div>
      </main>

      <AdminDashboard isVisible={showAdminDashboard} onClose={() => setShowAdminDashboard(false)} />
    </div>
  );
}
