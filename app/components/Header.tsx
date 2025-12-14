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
import styles from "./Header.module.css";

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
    <header className={styles.header}>
      <div className={styles.logo} onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <Image src="/logo.png" alt="Mememint" width={180} height={100} priority />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isWrongNetwork && (
          <div style={{
            padding: '8px 12px',
            background: '#ff4444',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ⚠️ Wrong Network: {chain?.name} - Switch to Base
          </div>
        )}
        <Wallet>
          <div style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', display: 'inline-block' }}>
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