"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowLogo(true), 300);
    const timer2 = setTimeout(() => setShowText(true), 800);
    const timer3 = setTimeout(() => setShowSubtext(true), 1200);
    const timer4 = setTimeout(() => setShowProgress(true), 1600);
    const timer5 = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-[size:400%_400%] animate-gradient-shift flex items-center justify-center z-[9999] overflow-hidden relative before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.6)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.6)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(139,92,246,0.4)_0%,transparent_50%),radial-gradient(circle_at_60%_20%,rgba(6,182,212,0.4)_0%,transparent_50%)] before:pointer-events-none before:opacity-90">
      {/* Animated Background */}
      <div className="absolute w-full h-full overflow-hidden">
        <div className="absolute w-[350px] h-[350px] top-[10%] -left-[15%] rounded-full backdrop-blur-[20px] border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] bg-[radial-gradient(circle,rgba(59,130,246,0.15),rgba(59,130,246,0.05))] animate-float"></div>
        <div className="absolute w-[250px] h-[250px] top-[60%] -right-[10%] rounded-full backdrop-blur-[20px] border border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] bg-[radial-gradient(circle,rgba(16,185,129,0.15),rgba(16,185,129,0.05))] animate-float animation-delay-[2.5s]"></div>
        <div className="absolute w-[180px] h-[180px] bottom-[20%] left-[15%] rounded-full backdrop-blur-[20px] border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] bg-[radial-gradient(circle,rgba(139,92,246,0.15),rgba(139,92,246,0.05))] animate-float animation-delay-[5s]"></div>
        <div className="absolute w-full h-full">
          <span className="absolute text-4xl animate-bounce">😂</span>
          <span className="absolute text-4xl animate-bounce animation-delay-1000">🎭</span>
          <span className="absolute text-4xl animate-bounce animation-delay-2000">🎨</span>
          <span className="absolute text-4xl animate-bounce animation-delay-3000">🚀</span>
          <span className="absolute text-4xl animate-bounce animation-delay-4000">✨</span>
          <span className="absolute text-4xl animate-bounce animation-delay-5000">🔥</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className={`transition-all duration-1000 ${showLogo ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="MemeMint" 
              width={300} 
              height={150}
              className="w-auto h-[150px] drop-shadow-2xl"
              style={{ width: 'auto', height: '150px' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-xl"></div>
          </div>
        </div>

        {/* Main Text */}
        <div className={`transition-all duration-1000 delay-300 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-6xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">MemeMint</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Subtext */}
        <div className={`transition-all duration-1000 delay-500 ${showSubtext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-xl md:text-lg text-gray-300 mb-2 font-semibold">Create • Customize • Mint</p>
          <p className="text-lg md:text-base text-gray-400">Turn your ideas into legendary memes</p>
        </div>

        {/* Loading Progress */}
        <div className={`transition-all duration-1000 delay-700 ${showProgress ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-64 h-2 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-400 text-sm">Loading awesome meme templates...</p>
        </div>
      </div>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={`absolute w-2 h-2 bg-white/20 rounded-full animate-ping ${i % 2 === 0 ? 'animation-delay-1000' : 'animation-delay-2000'}`}></div>
        ))}
      </div>
    </div>
  );
}