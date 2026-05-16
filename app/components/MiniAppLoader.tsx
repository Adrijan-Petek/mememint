"use client";
import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export function MiniAppLoader() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        // Check if we're running in a MiniApp context (Farcaster or Base app)
        if (typeof window !== 'undefined') {
          console.log('🎭 Initializing MiniApp SDK...');
          
          // Call ready() to hide loading splash and display the app
          await sdk.actions.ready();
          console.log('✅ MiniApp ready - splash screen hidden');
        }
      } catch {
        // This will fail in regular web browsers, which is expected
        console.log('📱 Running in web browser (not MiniApp)');
      }
    };

    initMiniApp();
  }, []);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  return null; // This component doesn't render anything
}
