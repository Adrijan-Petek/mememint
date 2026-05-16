"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface NFTImageFrameProps {
  /** Image URL from database (uri field) */
  uri?: string;
  /** Fallback static image filename (from templets/image/) */
  staticImage?: string;
  /** Alt text for the image */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
  /** Whether to fill the container */
  fill?: boolean;
  /** Object fit style */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  /** Loading placeholder */
  placeholder?: React.ReactNode;
  /** Error placeholder */
  errorPlaceholder?: React.ReactNode;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: string) => void;
}

/**
 * NFTImageFrame - A reusable component for displaying NFT images with smart fallbacks
 * 
 * This component provides a robust way to display NFT images with the following features:
 * - Primary: Uses database URI if available
 * - Fallback 1: Uses static image from templets/image/ directory
 * - Fallback 2: Shows a default placeholder
 * - Loading states and error handling
 * - Optimized with Next.js Image component
 * 
 * @example
 * // Basic usage with database URI
 * <NFTImageFrame 
 *   uri={drop.uri} 
 *   alt={drop.name}
 *   className="w-full h-64 rounded-lg"
 * />
 * 
 * @example
 * // With static fallback
 * <NFTImageFrame 
 *   uri={drop.uri}
 *   staticImage="Distracted-Boyfriend.jpg"
 *   alt="NFT Image"
 *   fill
 *   objectFit="cover"
 * />
 */
export default function NFTImageFrame({
  uri,
  staticImage,
  alt,
  className = "",
  width,
  height,
  fill = false,
  objectFit = "contain",
  placeholder,
  errorPlaceholder,
  onLoad,
  onError,
}: NFTImageFrameProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Determine the image source priority
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");

    if (uri) {
      // Try database URI first
      setCurrentSrc(uri);
    } else if (staticImage) {
      // Fallback to static image
      setCurrentSrc(`/api/static/image/${staticImage}`);
    } else {
      // No image source available
      setCurrentSrc(null);
      setIsLoading(false);
      setHasError(true);
      setErrorMessage("No image source provided");
    }
  }, [uri, staticImage]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    const error = `Failed to load image: ${currentSrc}`;
    
    if (uri && staticImage) {
      // If URI failed, try static image
      console.warn(`URI failed (${uri}), trying static image: ${staticImage}`);
      setCurrentSrc(`/api/static/image/${staticImage}`);
      return;
    }
    
    // All sources failed
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(error);
    onError?.(error);
  };

  // Loading state
  if (isLoading && currentSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-800/50 ${className}`}>
        {placeholder || (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (hasError || !currentSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-800/50 ${className}`}>
        {errorPlaceholder || (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="text-4xl">🎨</div>
            <span className="text-sm text-center px-2">
              {errorMessage || "Image not available"}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Success state - render the image
  const imageProps = {
    src: currentSrc,
    alt,
    onLoad: handleImageLoad,
    onError: handleImageError,
    className: fill ? "object-cover" : "",
    style: fill ? { objectFit } : undefined,
    unoptimized: true, // Since we're dealing with external URLs and static files
  };

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          {...imageProps}
          fill
        />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 400}
      className={className}
    />
  );
}

/**
 * Utility function to get the best image source for an NFT
 * @param uri Database URI
 * @param staticImage Static image filename
 * @returns The best available image source
 */
export function getNFTImageSrc(uri?: string, staticImage?: string): string | null {
  if (uri) return uri;
  if (staticImage) return `/api/static/image/${staticImage}`;
  return null;
}

/**
 * Hook for managing NFT image state
 * @param uri Database URI
 * @param staticImage Static image filename
 * @returns Image state and handlers
 */
export function useNFTImage(uri?: string, staticImage?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    const src = getNFTImageSrc(uri, staticImage);
    setCurrentSrc(src);
    setIsLoading(!!src);
    setHasError(!src);
  }, [uri, staticImage]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return {
    src: currentSrc,
    isLoading,
    hasError,
    handleLoad,
    handleError,
  };
}