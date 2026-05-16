"use client";
import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

export function NetworkChecker() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chain && chain.id !== base.id) {
      const switchToBase = async () => {
        try {
          console.log(`Wrong network detected: ${chain.name} (${chain.id}). Switching to Base...`);
          await switchChain({ chainId: base.id });
        } catch (error) {
          console.error('Failed to switch network:', error);
          alert(`Please switch to Base network in your wallet. Currently on: ${chain.name}`);
        }
      };
      switchToBase();
    }
  }, [chain, isConnected, switchChain]);

  return null;
}
