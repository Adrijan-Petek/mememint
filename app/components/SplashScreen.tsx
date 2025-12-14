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
    <div className="fixed top-0 left-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-[9999] overflow-hidden relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[size:20px_20px]"></div>
      </div>

      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>

      {/* Main Content - Centered Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-sm mx-auto px-6">
        {/* Logo - Perfectly Centered */}
        <div className={`transition-all duration-800 ease-out ${showLogo ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
          <div className="relative mb-12 flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl scale-110"></div>
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl">
              <Image
                src="/logo.png"
                alt="MemeMint"
                width={200}
                height={150}
                className="drop-shadow-lg h-auto"
                priority
              />
            </div>
          </div>
        </div>

        {/* Main Text */}
        <div className={`transition-all duration-800 delay-200 ease-out ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl md:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4 tracking-tight">
            MemeMint
          </h1>
          <p className="text-lg md:text-base text-slate-300 font-medium mb-3">
            Professional Meme Creation
          </p>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Generate, customize, and share memes with advanced tools
          </p>
        </div>

        {/* Loading Progress */}
        <div className={`transition-all duration-800 delay-400 ease-out ${showProgress ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mt-10 mb-4">
            <div className="w-48 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-slate-400 text-sm font-medium">Initializing...</p>
          </div>
        </div>
      </div>

      {/* Minimal floating elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
      <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse animation-delay-2000"></div>
    </div>
  );
}