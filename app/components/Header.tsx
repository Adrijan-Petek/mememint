"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from "@coinbase/onchainkit/wallet";
import { Address, Name, Identity } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { sdk } from "@farcaster/miniapp-sdk";

interface HeaderProps {
  onShowAdminDashboard: () => void;
}

export default function Header({ onShowAdminDashboard }: HeaderProps) {
  const [_adminClickCount, setAdminClickCount] = useState(0);
  const [_isMiniApp, setIsMiniApp] = useState(false);
  const { chain, isConnected } = useAccount();
  
  // Detect if running in MiniApp context
  useEffect(() => {
    try {
      const context = sdk.context;
      setIsMiniApp(!!context);
      console.log('🎭 MiniApp context detected:', !!context);
    } catch {
      setIsMiniApp(false);
      console.log('📱 Running in web browser');
    }
  }, []);
  
  // Check if on wrong network
  const isWrongNetwork = isConnected && chain && chain.id !== base.id;

  const handleLogoClick = () => {
    setAdminClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        onShowAdminDashboard();
        return 0;
      }
      // Reset count after 3 seconds
      setTimeout(() => setAdminClickCount(0), 3000);
      return newCount;
    });
  };

  return (
    <header className="flex justify-between items-center py-3 px-4 md:py-4 md:px-8 bg-[rgba(13,13,13,0.8)] backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={handleLogoClick}>
        <Image src="/logo.png" alt="Mememint" width={120} height={60} priority className="transition-transform hover:scale-105 md:w-[150px] md:h-[75px]" />
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {isWrongNetwork && (
          <div className="px-2 py-1 md:px-3 md:py-2 bg-red-500 text-white rounded-lg text-xs md:text-sm font-bold">
            ⚠️ Wrong Network: {chain?.name} - Switch to Base
          </div>
        )}
        <Wallet>
          <div className="text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 inline-block">
            <ConnectWallet>
              <Name />
            </ConnectWallet>
          </div>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Name />
              <Address />
            </Identity>
            <WalletDropdownBasename />
            <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
              Wallet
            </WalletDropdownLink>
            <WalletDropdownFundLink />
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>
    </header>
  );
}