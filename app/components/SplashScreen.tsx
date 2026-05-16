"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowLogo(true), 200);
    const timer2 = setTimeout(() => setShowText(true), 600);
    const timer3 = setTimeout(() => setShowProgress(true), 1000);
    const timer4 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0" style={{ background: "var(--mm-bg-gradient)" }} />
      <div className="absolute inset-0 opacity-70" style={{ background: "var(--mm-hero)" }} />
      <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.6)_1px,transparent_0)] [background-size:20px_20px]" />

      <div className="relative z-10 w-full max-w-sm px-6 text-center">
        <div
          className={`transition-all duration-700 ease-out ${
            showLogo ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
          }`}
        >
          <div className="relative mx-auto w-[240px] p-8">
            <div
              className="absolute inset-0 blur-2xl opacity-80"
              style={{
                background:
                  "radial-gradient(circle at 20% 10%, color-mix(in oklab, var(--mm-accent) 35%, transparent), transparent 60%), radial-gradient(circle at 80% 90%, color-mix(in oklab, var(--mm-accent-2) 28%, transparent), transparent 60%)",
              }}
            />
            <div className="relative flex justify-center">
              <Image
                src="/logo.png"
                alt="Mememint"
                width={200}
                height={150}
                className={`h-auto ${showLogo ? "animate-mm-bounce" : ""}`}
                priority
              />
            </div>
          </div>
        </div>

        <div
          className={`mt-8 transition-all duration-700 delay-150 ease-out ${
            showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--mm-text), color-mix(in oklab, var(--mm-accent) 60%, var(--mm-text)), color-mix(in oklab, var(--mm-accent-2) 55%, var(--mm-text)))",
              }}
            >
              Mememint
            </span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--mm-muted)" }}>
            Create memes. Mint NFTs. Compete on the leaderboard.
          </p>
        </div>

        <div
          className={`mt-10 transition-all duration-700 delay-300 ease-out ${
            showProgress ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <div className="mx-auto h-1.5 w-56 overflow-hidden rounded-full" style={{ background: "var(--mm-surface)" }}>
            <div
              className="h-full w-1/2 animate-pulse"
              style={{
                background: "linear-gradient(90deg, var(--mm-accent), var(--mm-accent-2))",
              }}
            />
          </div>
          <p className="mt-4 text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--mm-faint)" }}>
            Loading…
          </p>
        </div>
      </div>
    </div>
  );
}
