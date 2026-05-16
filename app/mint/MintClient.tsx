"use client";

import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { AppHeader } from "../components/AppHeader";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useContractRead } from "wagmi";
import { CONTRACT_ADDRESSES } from "../contracts/addresses";
import { NFT_ABI } from "../contracts/NFTABI";
import { parseEther, formatEther } from "viem";

function formatPrice(priceWei: string) {
  try {
    const s = formatEther(BigInt(priceWei));
    const n = parseFloat(s);
    if (n === 0) return '0';
    if (n >= 0.001) return n.toFixed(3);
    return n.toFixed(6).replace(/\.0+$|(?<=\.[0-9]*?)0+$/,'').replace(/\.$/, '');
  } catch (e) {
    return '0';
  }
}

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
  const { address } = useAccount();

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

  useEffect(() => {
    fetchDrops();
  }, []);

  // Poll drops periodically to keep minted counts up-to-date
  useEffect(() => {
    const id = setInterval(() => fetchDrops(), 10000);
    return () => clearInterval(id);
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

      // Record the mint in DB and get updated minted count
      const resp = await fetch('/api/mints/record', {
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

      const respJson = await resp.json().catch(() => ({}));

      // If server returned updated minted count, use it; otherwise increment optimistically
      if (respJson && typeof respJson.updatedMinted === 'number') {
        setDrops((prev) => prev.map(d => d.drop_id === drop.drop_id ? { ...d, minted: respJson.updatedMinted } : d));
      } else {
        setDrops((prev) => prev.map(d => d.drop_id === drop.drop_id ? { ...d, minted: Math.min(d.minted + 1, d.supply) } : d));
      }

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

  const handleShareNFT = async (drop: Drop) => {
    try {
      await sdk.actions.composeCast({
        text: `Check out this NFT "${drop.name}" on Mememint! 🎨✨`,
        embeds: [`${window.location.origin}/mint/${drop.drop_id}`]
      });
    } catch (error) {
      console.error('Failed to share NFT:', error);
      alert('Failed to share NFT');
    }
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
    <div className="mm-page">
      <AppHeader />

      <main className="p-4 max-w-4xl mx-auto pt-24 md:p-2 md:pt-20 sm:p-1 sm:pt-16">
        <div className="text-center mb-8">
          <h1 className="text-lg md:text-xl font-extrabold mb-3 -tracking-wider">
            Mint NFTs
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--mm-muted)" }}>
            Discover and mint unique NFTs from our exclusive drops. Each NFT is a piece of digital art waiting to be yours.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[color:var(--mm-accent)]" />
          </div>
        ) : drops.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-semibold mb-2">No NFT Drops Available</h3>
            <p style={{ color: "var(--mm-muted)" }}>Check back later for new drops!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {drops.map((drop) => (
              <DropCard
                key={drop.drop_id}
                drop={drop}
                handleMint={handleMint}
                mintingDropId={mintingDropId}
                handleShareNFT={handleShareNFT}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm" style={{ color: "var(--mm-faint)" }}>Powered by Mememint • Built on Base</p>
        </div>
      </main>
    </div>
  );
}

function DropCard({ drop, handleMint, mintingDropId, handleShareNFT }: { drop: Drop; handleMint: (d: Drop) => void; mintingDropId: number | null; handleShareNFT: (d: Drop) => void }) {
  const { address } = useAccount();
  const [expanded, setExpanded] = useState(false);
  const previewSrc = "/uploads/the-emerald-degenerate.png";

  const { data: owned } = useContractRead({
    address: CONTRACT_ADDRESSES.nft,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000', BigInt(drop.drop_id)],
  });

  return (
    <div className="mm-card mm-card-strong p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <div className="aspect-square rounded-xl mb-4 overflow-hidden" style={{ background: "var(--mm-surface)" }}>
        <img
          src={previewSrc}
          alt={drop.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder-nft.svg";
          }}
        />
      </div>

      <h3 className="text-xl font-bold mb-2">{drop.name}</h3>
      <p className={`text-sm mb-2 ${expanded ? '' : 'line-clamp-2'}`} style={{ color: "var(--mm-muted)" }}>{drop.description}</p>
      {drop.description && drop.description.length > 120 && (
        <button className="text-sm hover:underline mb-4" style={{ color: "var(--mm-accent)" }} onClick={() => setExpanded(v => !v)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

        <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--mm-muted)" }}>Price:</span>
          <span className="font-semibold">{formatPrice(drop.price_wei)} ETH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--mm-muted)" }}>Minted:</span>
          <span>{drop.minted}/{drop.supply}</span>
        </div>
        {owned !== undefined && (
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--mm-muted)" }}>You own:</span>
            <span>{Number(owned ?? 0)}</span>
          </div>
        )}
      </div>

      <button onClick={() => handleMint(drop)} disabled={mintingDropId === drop.drop_id || drop.minted >= drop.supply || !address} className="w-full bg-gradient-to-r from-[var(--mm-accent)] to-[var(--mm-accent-2)] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:-translate-y-0.5">
        {mintingDropId === drop.drop_id ? (
          <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Minting...</div>
        ) : drop.minted >= drop.supply ? (
          'Sold Out'
        ) : !address ? (
          'Connect Wallet'
        ) : (
          'Mint NFT'
        )}
      </button>

      <button onClick={() => handleShareNFT(drop)} className="mt-3 w-full font-medium py-2 rounded-lg transition border" style={{ background: "var(--mm-surface)", borderColor: "var(--mm-border)", color: "var(--mm-text)" }}>
        Share NFT
      </button>
    </div>
  );
}
