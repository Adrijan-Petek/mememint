"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './SplashScreen.module.css';

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
    <div className={styles.splashContainer}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
        <div className={styles.floatingEmojis}>
          <span className={styles.emoji}>😂</span>
          <span className={styles.emoji}>🎭</span>
          <span className={styles.emoji}>🎨</span>
          <span className={styles.emoji}>🚀</span>
          <span className={styles.emoji}>✨</span>
          <span className={styles.emoji}>🔥</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Logo */}
        <div className={`${styles.logoContainer} ${showLogo ? styles.slideUp : ''}`}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/logo.png" 
              alt="MemeMint" 
              width={300} 
              height={150}
              className={styles.logo}
              style={{ width: 'auto', height: '150px' }}
            />
            <div className={styles.logoGlow}></div>
          </div>
        </div>

        {/* Main Text */}
        <div className={`${styles.textContainer} ${showText ? styles.fadeIn : ''}`}>
          <h1 className={styles.mainTitle}>MemeMint</h1>
          <div className={styles.titleUnderline}></div>
        </div>

        {/* Subtext */}
        <div className={`${styles.subtextContainer} ${showSubtext ? styles.fadeIn : ''}`}>
          <p className={styles.subtitle}>Create • Customize • Mint</p>
          <p className={styles.description}>Turn your ideas into legendary memes</p>
        </div>

        {/* Loading Progress */}
        <div className={`${styles.progressContainer} ${showProgress ? styles.fadeIn : ''}`}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
          <p className={styles.loadingText}>Loading awesome meme templates...</p>
        </div>
      </div>

      {/* Particles */}
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={`${styles.particle} ${styles[`particle${i % 5}`]}`}></div>
        ))}
      </div>
    </div>
  );
}