"use client";

import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "../components/WalletButton";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES } from "../contracts/addresses";
import { NFT_ABI } from "../contracts/NFTABI";
import { parseEther, formatEther } from "viem";

interface Drop {
  drop_id: number;
  name: string;
  description: string;
  price_wei: string;
  supply: number;
  minted: number;
  uri: string;
}

export default function Mint() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingDropId, setMintingDropId] = useState<number | null>(null);
  const pathname = usePathname();
  const { address } = useAccount();

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  useEffect(() => {
    fetchDrops();
  }, []);

  const fetchDrops = async () => {
    try {
      const response = await fetch('/api/db/drops');
      const data = await response.json();
      if (data.drops) {
        setDrops(data.drops);
      }
    } catch (error) {
      console.error('Error fetching drops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async (drop: Drop) => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setMintingDropId(drop.drop_id);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.nft,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [BigInt(drop.drop_id), BigInt(1)], // dropId, quantity
        value: BigInt(drop.price_wei),
      });

      // Wait for transaction confirmation
      // For now, we'll just wait a bit and assume success
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record the mint in DB
      await fetch('/api/mints/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          dropId: drop.drop_id,
          tokenId: drop.drop_id, // Assuming tokenId = dropId for simplicity
          amount: 1,
          txHash: hash,
        }),
      });

      // Share the mint
      await sdk.actions.composeCast({
        text: `Just minted "${drop.name}" NFT on Mememint! 🎨✨ #NFT #Mememint`,
        embeds: [`https://mememint-one.vercel.app/mint`],
      });

      alert(`Successfully minted "${drop.name}"!`);

      // Refresh drops to update counts
      fetchDrops();

    } catch (error) {
      console.error('Mint error:', error);
      alert('Failed to mint NFT');
    } finally {
      setMintingDropId(null);
    }
  };

  const handleLogoClick = () => {
    // Could add admin access here if needed
  };

  const handleShareApp = async () => {
    try {
      await sdk.actions.composeCast({
        text: "Check out Mememint - Create memes and mint NFTs! 🎨✨",
        embeds: ["https://mememint-one.vercel.app"]
      });
    } catch (error) {
      console.error("Failed to share app:", error);
    }
  };

  const handleAddMiniApp = async () => {
    try {
      await sdk.actions.addMiniApp();
      console.log("Mini app added successfully");
    } catch (error) {
      console.error("Failed to add mini app:", error);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg font-sans relative before:absolute before:inset-0 before:bg-hero-bg before:pointer-events-none before:opacity-80">
      <header className="bg-gradient-to-br from-[rgba(13,13,13,0.95)] to-[rgba(26,26,26,0.95)] backdrop-blur-[20px] border-b border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          {/* Top row: Logo and Wallet */}
          <div className="flex justify-between items-center min-h-[50px] md:min-h-[45px]">
            <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={handleLogoClick}>
              <Image src="/logo.png" alt="Mememint" priority width={120} height={60} className="w-[120px] h-auto transition-transform hover:scale-105 md:w-[150px] md:h-auto" />
            </div>
            <WalletButton />
          </div>

          {/* Bottom row: Navigation */}
          <div className="flex justify-center items-center min-h-[40px] md:min-h-[35px] pt-3">
            <nav className="flex gap-2 md:gap-4 lg:gap-6 items-center overflow-x-auto scrollbar-hide px-2">
              <Link
                href="/"
                className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${
                  pathname === '/' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Create
              </Link>
              <Link
                href="/mint"
                className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${
                  pathname === '/mint' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Mint
              </Link>
              <Link href="/token" className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${pathname?.startsWith('/token') ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''}`}>
                Token
              </Link>
              <Link
                href="/leaderboard"
                className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${
                  pathname === '/leaderboard' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Leaderboard
              </Link>
              <Link
                href="/profile"
                className={`text-white/80 no-underline font-medium text-xs md:text-sm py-1.5 px-2 md:px-3 lg:px-4 rounded-lg transition-all duration-300 ease-out relative overflow-hidden tracking-wide uppercase hover:text-white hover:bg-white/12 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.1)] whitespace-nowrap ${
                  pathname === '/profile' ? 'text-white bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/40 shadow-[0_8px_32px_rgba(59,130,246,0.3)] font-semibold' : ''
                }`}
              >
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 -tracking-wider drop-shadow-[0_0_30px_rgba(96,165,250,0.3)] md:text-3xl sm:text-2xl">
            Mint NFTs
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Discover and mint unique NFTs from our exclusive drops. Each NFT is a piece of digital art waiting to be yours.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : drops.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No NFT Drops Available</h3>
            <p className="text-white/60">Check back later for new drops!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drops.map((drop) => (
              <div
                key={drop.drop_id}
                className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] hover:-translate-y-1"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-4 overflow-hidden">
                  {drop.uri ? (
                    <img
                      src={drop.uri}
                      alt={drop.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-nft.png'; // Fallback image
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-4xl">
                      🎨
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{drop.name}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{drop.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Price:</span>
                    <span className="text-white font-semibold">{parseFloat(formatEther(BigInt(drop.price_wei))).toFixed(3)} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Minted:</span>
                    <span className="text-white">{drop.minted}/{drop.supply}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleMint(drop)}
                  disabled={mintingDropId === drop.drop_id || drop.minted >= drop.supply || !address}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-[0_4px_16px_rgba(59,130,246,0.4)] hover:-translate-y-0.5"
                >
                  {mintingDropId === drop.drop_id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Minting...
                    </div>
                  ) : drop.minted >= drop.supply ? (
                    'Sold Out'
                  ) : !address ? (
                    'Connect Wallet'
                  ) : (
                    'Mint NFT'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleShareApp}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:shadow-[0_4px_16px_rgba(34,197,94,0.4)] hover:-translate-y-0.5"
            >
              Share App
            </button>
            <button
              onClick={handleAddMiniApp}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:shadow-[0_4px_16px_rgba(147,51,234,0.4)] hover:-translate-y-0.5"
            >
              Add to Frame
            </button>
          </div>
          <p className="text-white/40 text-sm">
            Powered by Mememint • Built on Base
          </p>
        </div>
      </main>
    </div>
  );
}