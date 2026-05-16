"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "./WalletButton";
import { ThemeToggle } from "./ThemeToggle";
import { InfoButton } from "./InfoButton";

type AppHeaderProps = {
  onLogoClick?: () => void;
};

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`mm-nav-link ${active ? "mm-nav-link-active" : ""}`}>
      {label}
    </Link>
  );
}

export function AppHeader({ onLogoClick }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="mm-header">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center min-h-[56px]">
          <button
            type="button"
            onClick={onLogoClick}
            className="flex items-center gap-3 cursor-pointer select-none"
            aria-label="Mememint home"
          >
            <Image
              src="/logo.png"
              alt="Mememint"
              priority
              width={140}
              height={64}
              className="w-[120px] h-auto md:w-[150px]"
            />
          </button>

          <div className="flex items-center gap-2">
            <InfoButton />
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>

        <div className="flex justify-center items-center pb-3">
          <nav className="mm-nav">
            <NavLink href="/" label="Create" active={pathname === "/"} />
            <NavLink href="/memeblast" label="MemeBlast" active={pathname === "/memeblast" || pathname === "/game"} />
            <NavLink href="/mint" label="Mint" active={pathname === "/mint"} />
            <NavLink href="/token" label="Token" active={pathname?.startsWith("/token") ?? false} />
            <NavLink href="/leaderboard" label="Leaderboard" active={pathname === "/leaderboard"} />
            <NavLink href="/profile" label="Profile" active={pathname === "/profile"} />
          </nav>
        </div>
      </div>
    </header>
  );
}
