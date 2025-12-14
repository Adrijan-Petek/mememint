"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gradient-to-br from-[rgba(13,13,13,0.95)] to-[rgba(26,26,26,0.95)] backdrop-blur-[20px] border-b border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] z-10">
      <div className="max-w-5xl mx-auto px-4 md:px-6 flex justify-center items-center min-h-[50px] md:min-h-[45px]">
        <div className="flex gap-8 md:gap-6 items-center">
          <Link
            href="/"
            className={`text-white/80 no-underline font-semibold text-lg md:text-base py-2 px-6 md:px-4 rounded-xl transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${
              pathname === '/' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-bold' : ''
            }`}
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className={`text-white/80 no-underline font-semibold text-lg md:text-base py-2 px-6 md:px-4 rounded-xl transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] ${
              pathname === '/leaderboard' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-bold' : ''
            }`}
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
}