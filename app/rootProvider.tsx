"use client";
import { ReactNode, useEffect, useState } from "react";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';
import { sdk } from '@farcaster/miniapp-sdk';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

// Create wagmi config with Base chain and multiple connectors
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    miniAppConnector(),
    injected(), // MetaMask and other injected wallets
    coinbaseWallet({ appName: 'Mememint' }),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id' }),
  ],
  ssr: true,
});

// Create query client
const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false);

  // Use Base Mainnet - Production
  console.log("Using Base Mainnet (Production)");

  useEffect(() => {
    // Detect mini app context
    const checkMiniApp = async () => {
      try {
        const miniAppDetected = await sdk.isInMiniApp();
        setIsMiniApp(miniAppDetected);
        console.log('🎭 MiniApp context detected:', miniAppDetected);
      } catch (error) {
        console.warn('Failed to detect mini app context:', error);
        setIsMiniApp(false);
      }
    };

    checkMiniApp();

    // Initialize Farcaster Mini App SDK
    const initializeApp = async () => {
      try {
        await sdk.actions.ready();
        console.log("Farcaster Mini App initialized");
      } catch (error) {
        console.error("Failed to initialize Farcaster Mini App:", error);
      }
    };

    initializeApp();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={base}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
