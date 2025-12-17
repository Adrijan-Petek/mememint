"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useBalance, useContractRead } from "wagmi";
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

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
      <div className="mb-3">
        <div className="text-sm text-white/60">Connected Wallet</div>
        <div className="text-base font-medium text-white break-words">{isConnected ? address : 'Not connected'}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
        <div className="p-3 bg-white/3 rounded flex flex-col">
          <div className="text-xs text-white/60">ETH Balance</div>
          <div className="text-lg text-white mt-1">{ethBalance?.formatted ?? '—'} {ethBalance?.symbol ?? 'ETH'}</div>
        </div>

        <div className="p-3 bg-white/3 rounded flex flex-col">
          <div className="text-xs text-white/60">{tokenSymbol} Balance</div>
          <div className="text-lg text-white mt-1">{tokenBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {tokenSymbol}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEthInput(true)} className={`px-3 py-1 rounded-lg ${isEthInput ? 'bg-blue-600 text-white' : 'bg-white/6 text-white/80'}`}>From ETH</button>
            <button onClick={() => setIsEthInput(false)} className={`px-3 py-1 rounded-lg ${!isEthInput ? 'bg-blue-600 text-white' : 'bg-white/6 text-white/80'}`}>From {tokenSymbol}</button>
          </div>
          <div className="text-xs text-white/60">Swap via Uniswap</div>
        </div>

        <div className="flex gap-2 flex-col sm:flex-row">
          <input value={fromAmount} onChange={e => setFromAmount(e.target.value)} inputMode="decimal" className="flex-1 px-3 py-2 bg-gray-800/80 border border-blue-400/10 rounded-lg text-white placeholder-gray-400" placeholder="Amount" />
          <button onClick={openSwapOnUniswap} className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">Open Uniswap Swap</button>
        </div>

        <div className="text-xs text-white/60">This opens Uniswap with prefilled input/output currencies. For on-site swaps we would implement router calls (approvals, slippage).</div>
      </div>
    </div>
  );
}
