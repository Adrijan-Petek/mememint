"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface SplashScreenContextType {
  hasShownSplash: boolean;
  setHasShownSplash: (shown: boolean) => void;
}

const SplashScreenContext = createContext<SplashScreenContextType | undefined>(undefined);

export function SplashScreenProvider({ children }: { children: ReactNode }) {
  const [hasShownSplash, setHasShownSplash] = useState(false);

  return (
    <SplashScreenContext.Provider value={{ hasShownSplash, setHasShownSplash }}>
      {children}
    </SplashScreenContext.Provider>
  );
}

export function useSplashScreen() {
  const context = useContext(SplashScreenContext);
  if (context === undefined) {
    throw new Error('useSplashScreen must be used within a SplashScreenProvider');
  }
  return context;
}