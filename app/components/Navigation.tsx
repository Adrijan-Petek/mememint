"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <div className={styles.navLinks}>
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className={`${styles.navLink} ${pathname === '/leaderboard' ? styles.active : ''}`}
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
}