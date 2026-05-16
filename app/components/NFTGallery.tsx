"use client";

import { useState, useEffect } from "react";
import NFTImageFrame from "./NFTImageFrame";

interface NFT {
  id: string;
  name: string;
  description?: string;
  uri?: string;
  staticImage?: string;
  price?: string;
  owner?: string;
}

interface NFTGalleryProps {
  /** Array of NFTs to display */
  nfts: NFT[];
  /** Number of columns in the grid */
  columns?: 1 | 2 | 3 | 4;
  /** Whether to show NFT details */
  showDetails?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Click handler for NFT items */
  onNFTClick?: (nft: NFT) => void;
}

/**
 * NFTGallery - A reusable gallery component for displaying collections of NFTs
 * 
 * Features:
 * - Responsive grid layout
 * - Loading states
 * - Empty states
 * - Click handlers
 * - Customizable columns
 * - Uses NFTImageFrame for robust image display
 * 
 * @example
 * <NFTGallery 
 *   nfts={userNFTs}
 *   columns={3}
 *   showDetails={true}
 *   onNFTClick={(nft) => openNFTModal(nft)}
 * />
 */
export default function NFTGallery({
  nfts,
  columns = 3,
  showDetails = true,
  className = "",
  loading = false,
  emptyMessage = "No NFTs found",
  onNFTClick,
}: NFTGalleryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getGridCols = () => {
    switch (columns) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  if (loading) {
    return (
      <div className={`grid ${getGridCols()} gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse"
          >
            <div className="aspect-square bg-gray-700/50 rounded-xl mb-4"></div>
            {showDetails && (
              <>
                <div className="h-6 bg-gray-700/50 rounded mb-2"></div>
                <div className="h-4 bg-gray-700/30 rounded mb-4"></div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-2xl font-semibold text-white mb-2">No NFTs Available</h3>
        <p className="text-white/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${getGridCols()} gap-6 ${className}`}>
      {nfts.map((nft) => (
        <div
          key={nft.id}
          className={`bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] hover:-translate-y-1 ${
            onNFTClick ? "cursor-pointer" : ""
          }`}
          onMouseEnter={() => setHoveredId(nft.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onNFTClick?.(nft)}
        >
          <NFTImageFrame
            uri={nft.uri}
            staticImage={nft.staticImage}
            alt={nft.name}
            fill
            objectFit="cover"
            className="aspect-square rounded-xl mb-4"
            onError={(error) => console.warn(`Failed to load NFT image for ${nft.name}:`, error)}
          />

          {showDetails && (
            <>
              <h3 className="text-xl font-bold text-white mb-2 truncate">
                {nft.name}
              </h3>
              
              {nft.description && (
                <p className="text-white/60 text-sm mb-3 line-clamp-2">
                  {nft.description}
                </p>
              )}

              <div className="flex justify-between items-center text-sm">
                {nft.price && (
                  <span className="text-blue-400 font-semibold">
                    {nft.price} ETH
                  </span>
                )}
                
                {nft.owner && (
                  <span className="text-white/40 truncate max-w-[100px]">
                    {nft.owner}
                  </span>
                )}
              </div>

              {hoveredId === nft.id && onNFTClick && (
                <div className="mt-3 text-center">
                  <span className="text-blue-400 text-sm font-medium">
                    Click to view details →
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * NFTCard - Individual NFT card component for more granular control
 */
export function NFTCard({
  nft,
  showDetails = true,
  onClick,
  className = "",
}: {
  nft: NFT;
  showDetails?: boolean;
  onClick?: (nft: NFT) => void;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] hover:-translate-y-1 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={() => onClick?.(nft)}
    >
      <NFTImageFrame
        uri={nft.uri}
        staticImage={nft.staticImage}
        alt={nft.name}
        fill
        objectFit="cover"
        className="aspect-square rounded-xl mb-4"
      />

      {showDetails && (
        <>
          <h3 className="text-xl font-bold text-white mb-2 truncate">
            {nft.name}
          </h3>
          
          {nft.description && (
            <p className="text-white/60 text-sm mb-3 line-clamp-2">
              {nft.description}
            </p>
          )}

          <div className="flex justify-between items-center text-sm">
            {nft.price && (
              <span className="text-blue-400 font-semibold">
                {nft.price} ETH
              </span>
            )}
            
            {nft.owner && (
              <span className="text-white/40 truncate max-w-[100px]">
                {nft.owner}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}