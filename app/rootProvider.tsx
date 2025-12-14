"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import "@coinbase/onchainkit/styles.css";

// Create wagmi config with Base chain only
// OnchainKit Wallet component automatically detects the environment:
// - Farcaster MiniApp: Uses Farcaster account via MiniKit
// - Coinbase Wallet app: Uses Coinbase Smart Wallet
// - Web browser: Shows all available wallet options
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});

// Create query client
const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  // Use Base Mainnet - Production
  console.log("Using Base Mainnet (Production)");

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              mode: "auto",
            },
            wallet: {
              display: "modal",
              preference: "all",
            },
          }}
          miniKit={{
            enabled: true,
            autoConnect: true,
            notificationProxyUrl: undefined,
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
