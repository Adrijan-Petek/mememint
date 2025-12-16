"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { base } from "wagmi/chains";
import { MEME_MINT_ABI } from "../contracts/MemeMintABI";
import { CONTRACT_ADDRESSES } from "../contracts/addresses";
import { useScoring } from "./useScoring";

export function useMinting() {
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const { address, chain, isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { data: transactionReceipt, isSuccess: isTransactionConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const { addScore } = useScoring();

  // Fetch current generation fee from contract
  const { data: generationFee, isError: generationFeeError, isLoading: generationFeeLoading, error: generationFeeErrorDetails } = useReadContract({
    address: CONTRACT_ADDRESSES.mememint as `0x${string}`,
    abi: MEME_MINT_ABI,
    functionName: 'generationFee',
  });

  // Debug generation fee fetch
  useEffect(() => {
    console.log('Generation Fee Status:', {
      generationFee: generationFee?.toString(),
      isLoading: generationFeeLoading,
      isError: generationFeeError,
      error: generationFeeErrorDetails,
      contractAddress: CONTRACT_ADDRESSES.mememint
    });
  }, [generationFee, generationFeeLoading, generationFeeError, generationFeeErrorDetails]);

  // Onchain Kit handles network management, so we don't need manual network checks

  // Update minting success when transaction is confirmed
  useEffect(() => {
    if (isTransactionConfirmed && transactionReceipt) {
      setWaitingForConfirmation(false);
      // Award points for successful meme generation
      if (address) {
        addScore('generate', address);
        // Increment mint count via API
        fetch('/api/leaderboard/increment-mint-count', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAddress: address.toLowerCase(),
          }),
        }).catch(error => {
          console.error('Error incrementing mint count:', error);
        });
      }
    }
  }, [isTransactionConfirmed, transactionReceipt, address, addScore]);

  // Trigger minting transaction when waitingForConfirmation becomes true
  useEffect(() => {
    const sendMintTransaction = async () => {
        if (waitingForConfirmation && address && writeContract && generationFee) {
        // Validate wallet connection
        if (!isConnected) {
          console.error('❌ Wallet not connected');
          alert('Please connect your wallet first');
          setWaitingForConfirmation(false);
          return;
        }

        // Validate network
        if (!chain) {
          console.error('❌ Chain not detected');
          alert('Unable to detect network. Please refresh and try again.');
          setWaitingForConfirmation(false);
          return;
        }

        if (chain.id !== base.id) {
          console.error('❌ Wrong network:', chain.name, 'Chain ID:', chain.id);
          alert(`Wrong network! Please switch to Base Mainnet in your wallet.\nCurrent: ${chain.name}\nRequired: Base`);
          setWaitingForConfirmation(false);
          return;
        }

        console.log('✅ Network check passed:', chain.name, 'Chain ID:', chain.id);
        console.log('Starting generation transaction with fee:', generationFee.toString(), 'wei');
        console.log('Contract address:', CONTRACT_ADDRESSES.mememint);
        console.log('User address:', address);
        
        try {
          // Use writeContract for proper contract interaction with dynamic generation fee
          console.log('📝 Preparing transaction...');
          console.log('  Chain ID:', chain.id);
          console.log('  Contract:', CONTRACT_ADDRESSES.mememint);
          console.log('  Value:', generationFee.toString(), 'wei (', formatEther(generationFee), 'ETH)');
          console.log('  Gas Limit:', '200000');
          
          writeContract({
            address: CONTRACT_ADDRESSES.mememint as `0x${string}`,
            abi: MEME_MINT_ABI,
            functionName: 'generateMeme',
            args: [address as `0x${string}`, "default", "Top Text", "Bottom Text"],
            value: generationFee as bigint,
            account: address,
            chain: base,
          });
          console.log('✅ Transaction submitted to wallet');
        } catch (error) {
          console.error('Minting transaction failed:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          setWaitingForConfirmation(false);
          
          // More specific error messages
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage.includes('insufficient funds')) {
            alert('Insufficient funds for minting. Please add more ETH to your wallet.');
          } else if (errorMessage.includes('User rejected')) {
            alert('Transaction was rejected.');
          } else {
            alert(`Minting failed: ${errorMessage}`);
          }
        }
      } else {
        if (waitingForConfirmation) {
          console.log('⏳ Waiting for prerequisites:', {
            isConnected,
            hasAddress: !!address,
            hasChain: !!chain,
            chainId: chain?.id,
            chainName: chain?.name,
            isCorrectChain: chain?.id === base.id,
            hasWriteContract: !!writeContract,
            hasGenerationFee: !!generationFee,
            generationFee: generationFee?.toString()
          });
        }
      }
    };

    sendMintTransaction();
  }, [waitingForConfirmation, address, writeContract, generationFee, isConnected, chain]);

  const startMinting = () => {
    setWaitingForConfirmation(true);
  };

  const resetMinting = () => {
    setWaitingForConfirmation(false);
  };

  return {
    waitingForConfirmation,
    isTransactionConfirmed,
    transactionReceipt,
    startMinting,
    resetMinting,
    mintFee: generationFee ? formatEther(generationFee) : '0',
    mintFeeWei: generationFee
  };
}