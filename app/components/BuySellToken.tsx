"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES } from "../contracts/addresses";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

export default function SwapToken({ defaultMode }: { defaultMode?: 'buy' | 'sell' } = {}) {
  const { address, isConnected } = useAccount();
  const [tokenAddress] = useState<string>(process.env.NEXT_PUBLIC_MEMEMINT_TOKEN_ADDRESS || CONTRACT_ADDRESSES.token || CONTRACT_ADDRESSES.mememint);
  const [tokenSymbol, setTokenSymbol] = useState<string>("MEMEMINT");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [fromAmount, setFromAmount] = useState<string>("0.01");
  const [isEthInput, setIsEthInput] = useState(defaultMode !== 'sell');

  // ETH balance
  const { data: ethBalance } = useBalance({ address });

  // Token balance via contract read (if connected)
  const { data: tokenBalanceRaw, refetch: refetchToken } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
    enabled: Boolean(isConnected && address)
  } as any);

  useEffect(() => {
    let mounted = true;
    async function fetchMeta() {
      try {
        // Symbol
        const symbolRes = await fetch(`/api/static/erc20-meta?address=${tokenAddress}`);
        if (symbolRes.ok) {
          const json = await symbolRes.json();
          if (mounted && json?.symbol) setTokenSymbol(json.symbol || 'MEMEMINT');
          if (mounted && json?.decimals) setTokenDecimals(Number(json.decimals));
        }
      } catch (e) {
        // ignore
      }
    }
    fetchMeta();
    return () => { mounted = false; };
  }, [tokenAddress]);

  useEffect(() => {
    if (isConnected) refetchToken?.();
  }, [isConnected, address]);

  const tokenBalance = tokenBalanceRaw ? Number(tokenBalanceRaw.toString()) / (10 ** tokenDecimals) : 0;

  const openSwapOnUniswap = () => {
    // Use Uniswap deep-link with explicit chain param (user requested pattern)
    // Buy (ETH -> token): https://app.uniswap.org/swap?outputCurrency=0x...&chain=base
    // Sell (token -> ETH): https://app.uniswap.org/swap?inputCurrency=0x...&chain=base
    const baseUrl = "https://app.uniswap.org/swap";
    const exactAmount = encodeURIComponent(fromAmount || '');
    let url = '';
    if (isEthInput) {
      url = `${baseUrl}?outputCurrency=${encodeURIComponent(tokenAddress)}&chain=base${exactAmount ? `&exactAmount=${exactAmount}` : ''}`;
    } else {
      url = `${baseUrl}?inputCurrency=${encodeURIComponent(tokenAddress)}&chain=base${exactAmount ? `&exactAmount=${exactAmount}` : ''}`;
    }
    window.open(url, "_blank");
  };

  const handleFarcasterSwap = async () => {
    try {
      const mod = await import('@farcaster/miniapp-sdk');
      const { sdk } = mod as any;

      const chainPrefix = 'eip155:8453';
      const tokenCAIP = `${chainPrefix}/erc20:${(tokenAddress || '').toLowerCase()}`;
      const nativeCAIP = `${chainPrefix}/native`;

      let sellToken: string | undefined;
      let buyToken: string | undefined;
      let sellAmount: string | undefined;

      if (isEthInput) {
        sellToken = nativeCAIP;
        buyToken = tokenCAIP;
        sellAmount = parseUnits(fromAmount || '0', 18).toString();
      } else {
        sellToken = tokenCAIP;
        buyToken = nativeCAIP;
        sellAmount = parseUnits(fromAmount || '0', tokenDecimals).toString();
      }

      const result = await sdk.actions.swapToken({ sellToken, buyToken, sellAmount });
      // basic feedback
      if (result?.success) {
        console.info('Farcaster swap succeeded', result.swap);
        alert('Farcaster swap started — check your wallet.');
      } else {
        console.warn('Farcaster swap failed', result);
        alert('Farcaster swap canceled or failed');
      }
    } catch (e) {
      console.error('Farcaster swap error', e);
      alert('Farcaster SDK not available or error occurred');
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
      <div className="mb-3">
        <div className="text-sm text-white/60">Connected Wallet</div>
        <div className="text-base font-medium text-white break-words">{isConnected ? address : 'Not connected'}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
        <div className="p-4 bg-white/3 rounded-lg border border-white/5">
          <div className="text-xs text-white/60 uppercase tracking-wide">ETH Balance</div>
          <div className="text-xl text-white mt-1 font-semibold">{ethBalance?.formatted ?? '—'} {ethBalance?.symbol ?? 'ETH'}</div>
        </div>

        <div className="p-4 bg-white/3 rounded-lg border border-white/5">
          <div className="text-xs text-white/60 uppercase tracking-wide">{tokenSymbol} Balance</div>
          <div className="text-xl text-white mt-1 font-semibold">{tokenBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {tokenSymbol}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setIsEthInput(true)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isEthInput ? 'bg-blue-600 text-white' : 'bg-white/6 text-white/80 hover:bg-white/10'}`}>Buy {tokenSymbol}</button>
            <button onClick={() => setIsEthInput(false)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!isEthInput ? 'bg-blue-600 text-white' : 'bg-white/6 text-white/80 hover:bg-white/10'}`}>Sell {tokenSymbol}</button>
          </div>
          <div className="text-xs text-white/60 hidden sm:block">Choose swap direction</div>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <input value={fromAmount} onChange={e => setFromAmount(e.target.value)} inputMode="decimal" className="flex-1 px-3 py-3 bg-gray-800/80 border border-blue-400/10 rounded-lg text-white placeholder-gray-400 text-base" placeholder="Amount" />
          <div className="flex items-center gap-2 flex-col sm:flex-row">
            <button onClick={openSwapOnUniswap} className="whitespace-nowrap px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium min-w-[140px]">Uniswap Swap</button>
            <button onClick={handleFarcasterSwap} className="whitespace-nowrap px-4 py-3 bg-gray-700/80 text-white rounded-lg text-sm font-medium min-w-[140px]">Farcaster Swap</button>
          </div>
        </div>

        <div className="text-xs text-white/60 bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="font-medium mb-1">Swap Options:</div>
          <div>• Uniswap: Opens external swap interface</div>
          <div>• Farcaster: Native in-app swap (when available)</div>
        </div>
      </div>
    </div>
  );
}
