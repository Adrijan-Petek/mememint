"use client";
import { useState } from "react";
import { AppHeader } from "../components/AppHeader";
import AdminDashboard from "../components/AdminDashboard";
import BuySellToken from "../components/BuySellToken";

export default function TokenPage() {
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

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
    <div className="mm-page">
      <AppHeader onLogoClick={handleLogoClick} />

      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto md:px-6 md:py-8">
        <div className="mm-card mm-card-strong p-6 md:p-8 shadow-2xl text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl mb-4 border border-white/10 bg-white/5">
            <img src="https://mememint-one.vercel.app/icon.png" alt="Mememint token" className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold mb-2 tracking-tight">MEMEMINT Token</h1>
          <p className="text-sm md:text-base font-normal max-w-lg mx-auto text-white/60">
            Swap MEMEMINT on Base with trusted providers. Clean balances, clear routing, and quick access.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] text-white/60">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">Network: Base</span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">Ticker: MEMEMINT</span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">Providers: Uniswap, Farcaster</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <BuySellToken defaultMode="buy" />
        </div>

        <section className="max-w-4xl mx-auto mt-6 md:mt-8">
          <div className="mm-card mm-card-strong p-5 md:p-6 border text-left shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold tracking-tight">Staking</h2>
                <p className="mt-1 text-sm text-white/70">
                  Stake MEMEMINT to unlock future rewards and on-chain perks.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-white/80">
                Coming Soon
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Status</div>
                <div className="mt-1 text-sm font-semibold">In development</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Network</div>
                <div className="mt-1 text-sm font-semibold">Base Mainnet</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Token</div>
                <div className="mt-1 text-sm font-semibold">MEMEMINT</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AdminDashboard isVisible={showAdminDashboard} onClose={() => setShowAdminDashboard(false)} />
    </div>
  );
}
