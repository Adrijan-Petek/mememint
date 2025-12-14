"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { base } from "wagmi/chains";
import { MEME_MINT_ABI, MEME_MINT_ADDRESS } from "../contracts/MemeMintABI";

export function useMinting() {
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const { address, chain, isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const { data: transactionReceipt, isSuccess: isTransactionConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Fetch current mint fee from contract
  const { data: mintFee, isError: mintFeeError, isLoading: mintFeeLoading, error: mintFeeErrorDetails } = useReadContract({
    address: MEME_MINT_ADDRESS,
    abi: MEME_MINT_ABI,
    functionName: 'mintFee',
  });

  // Debug mint fee fetch
  useEffect(() => {
    console.log('Mint Fee Status:', {
      mintFee: mintFee?.toString(),
      isLoading: mintFeeLoading,
      isError: mintFeeError,
      error: mintFeeErrorDetails,
      contractAddress: MEME_MINT_ADDRESS
    });
  }, [mintFee, mintFeeLoading, mintFeeError, mintFeeErrorDetails]);

  // Onchain Kit handles network management, so we don't need manual network checks

  // Update minting success when transaction is confirmed
  useEffect(() => {
    if (isTransactionConfirmed && transactionReceipt) {
      setWaitingForConfirmation(false);
    }
  }, [isTransactionConfirmed, transactionReceipt]);

  // Trigger minting transaction when waitingForConfirmation becomes true
  useEffect(() => {
    const sendMintTransaction = async () => {
      if (waitingForConfirmation && address && writeContract && mintFee) {
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
        console.log('Starting mint transaction with fee:', mintFee.toString(), 'wei');
        console.log('Contract address:', MEME_MINT_ADDRESS);
        console.log('User address:', address);
        
        try {
          // Use writeContract for proper contract interaction with dynamic mint fee
          console.log('📝 Preparing transaction...');
          console.log('  Chain ID:', chain.id);
          console.log('  Contract:', MEME_MINT_ADDRESS);
          console.log('  Value:', mintFee.toString(), 'wei (', formatEther(mintFee), 'ETH)');
          console.log('  Gas Limit:', '200000');
          
          writeContract({
            address: MEME_MINT_ADDRESS as `0x${string}`,
            abi: MEME_MINT_ABI,
            functionName: 'mintMeme',
            value: mintFee as bigint,
            chainId: base.id,
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
            hasMintFee: !!mintFee,
            mintFee: mintFee?.toString()
          });
        }
      }
    };

    sendMintTransaction();
  }, [waitingForConfirmation, address, writeContract, mintFee, isConnected, chain]);

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
    mintFee: mintFee ? formatEther(mintFee) : '0',
    mintFeeWei: mintFee
  };
}