"use client";
import React from 'react';
import { useReadContract } from 'wagmi';
import { TREASURY_ABI } from '../contracts/TreasuryABI';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';

export default function TreasuryTokenBalance({ tokenAddress }: { tokenAddress: string }) {
  const { data, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESSES.treasury as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'treasuryBalanceToken',
    args: [tokenAddress as `0x${string}`],
    watch: true,
  } as any);

  if (isLoading) return <span className="text-gray-400">Loading...</span>;
  if (isError) return <span className="text-red-400">Error</span>;

  // `data` may be a BigInt-like object; convert to string then to number safely
  try {
    const raw = data?.toString ? data.toString() : String(data ?? '0');
    const asFloat = Number(raw) / 1e18; // assume 18 decimals
    const formatted = isFinite(asFloat) ? asFloat.toLocaleString(undefined, { maximumFractionDigits: 6 }) : raw;
    return <span className="text-blue-400 font-semibold">{formatted}</span>;
  } catch (e) {
    return <span className="text-blue-400 font-semibold">{String(data)}</span>;
  }
}
