"use client";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useSplashScreen } from "./SplashScreenContext";
import { SplashScreen } from "./SplashScreen";

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const { hasShownSplash, setHasShownSplash } = useSplashScreen();

  // Signal to MiniKit that the app is ready
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Show splash screen only once when app starts
  if (!hasShownSplash) {
    return <SplashScreen onComplete={() => setHasShownSplash(true)} />;
  }

  return <>{children}</>;
}