"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { minikitConfig } from "@/minikit.config";
import { CONTRACT_ADDRESSES } from "@/app/contracts/addresses";

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10.5v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function InfoButton() {
  const [open, setOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const info = useMemo(() => {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || "8453";
    const network = process.env.NEXT_PUBLIC_NETWORK || "base";
    const homeUrl = minikitConfig?.frame?.homeUrl || "https://mememint-one.vercel.app";
    const contracts = [
      {
        label: "Mememint",
        value: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || CONTRACT_ADDRESSES.mememint,
      },
      {
        label: "Treasury",
        value: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || CONTRACT_ADDRESSES.treasury,
      },
      {
        label: "MemeBlast Fees",
        value:
          process.env.NEXT_PUBLIC_MEMEBLASTFEES_ADDRESS ||
          process.env.NEXT_PUBLIC_MEMEBLAST_FEES_ADDRESS ||
          CONTRACT_ADDRESSES.memeblastFees,
      },
      {
        label: "Token",
        value: process.env.NEXT_PUBLIC_MEMEMINT_TOKEN_ADDRESS || CONTRACT_ADDRESSES.token,
      },
    ];
    return { chainId, network, homeUrl, contracts };
  }, []);

  const modalRoot = isClient ? document.body : null;

  return (
    <>
      <button
        type="button"
        className="mm-control"
        aria-label="App info"
        title="App info"
        onClick={() => setOpen(true)}
        style={{
          color: "#3b82f6",
          borderColor: "color-mix(in oklab, #3b82f6 35%, var(--mm-border))",
        }}
      >
        <InfoIcon className="h-4 w-4" />
      </button>

      {open &&
        modalRoot &&
        createPortal(
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="relative w-full max-w-xl mm-card mm-card-strong rounded-2xl border shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b p-5 md:p-6" style={{ borderColor: "var(--mm-border)" }}>
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--mm-faint)" }}>
                    App Info
                  </p>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--mm-text)" }}>
                    {minikitConfig?.frame?.name || "Mememint"}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--mm-muted)" }}>
                    {minikitConfig?.frame?.description ||
                      "A Base-native meme studio for creating, playing, and minting."}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full border text-sm transition-all"
                  style={{ borderColor: "var(--mm-border)", color: "var(--mm-muted)" }}
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[72vh] overflow-y-auto p-5 md:p-6 space-y-4">
                <div className="rounded-xl border p-4" style={{ borderColor: "var(--mm-border)" }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--mm-faint)" }}>
                    What Mememint Is
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "var(--mm-text)" }}>
                    Mememint is a Base-native creative suite for designing memes, competing in
                    MemeBlast, and minting collectible creations on-chain.
                  </p>
                </div>

                <div className="rounded-xl border p-4" style={{ borderColor: "var(--mm-border)" }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--mm-faint)" }}>
                    MemeBlast (Game)
                  </p>
                  <ul className="mt-2 space-y-1 text-sm" style={{ color: "var(--mm-text)" }}>
                    <li>Fast-paced challenges to earn points and climb the leaderboard.</li>
                    <li>Scores and stats are tracked automatically.</li>
                  </ul>
                </div>

                <div className="rounded-xl border p-4" style={{ borderColor: "var(--mm-border)" }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--mm-faint)" }}>
                    Minting
                  </p>
                  <ul className="mt-2 space-y-1 text-sm" style={{ color: "var(--mm-text)" }}>
                    <li>Mint your memes on Base and share them to Farcaster.</li>
                    <li>Wallet connection required for minting and claims.</li>
                  </ul>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border p-4" style={{ borderColor: "var(--mm-border)" }}>
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--mm-faint)" }}>
                      Network
                    </p>
                    <div className="mt-2 text-sm" style={{ color: "var(--mm-text)" }}>
                      <div>Base Mainnet</div>
                      <div className="text-xs" style={{ color: "var(--mm-faint)" }}>
                        Chain ID: {info.chainId} · Network: {info.network}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4" style={{ borderColor: "var(--mm-border)" }}>
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--mm-faint)" }}>
                      Wallet Support
                    </p>
                    <div className="mt-2 text-sm" style={{ color: "var(--mm-text)" }}>
                      Farcaster · External (MetaMask) · Base (Coinbase) · WalletConnect
                    </div>
                    <div className="mt-2 text-xs" style={{ color: "var(--mm-faint)" }}>
                      FID and profile photos appear automatically in Farcaster/Base MiniApps when available.
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-4" style={{ borderColor: "var(--mm-border)" }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--mm-faint)" }}>
                    Contracts
                  </p>
                  <div className="mt-2 grid gap-2">
                    {info.contracts.map((contract) => (
                      <div key={contract.label} className="text-xs">
                        <span style={{ color: "var(--mm-faint)" }}>{contract.label}:</span>{" "}
                        <span className="font-mono break-all" style={{ color: "var(--mm-text)" }}>
                          {contract.value || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          modalRoot
        )}
    </>
  );
}
