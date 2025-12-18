import { useState, useEffect } from 'react';
import { useAdminContract } from '../hooks/useAdminContract';
import dynamic from 'next/dynamic';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from "../contracts/addresses";
import { NFT_ABI } from "../contracts/NFTABI";
import { parseEther } from 'viem';
import TreasuryTokenBalance from './TreasuryTokenBalance';

interface AdminDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Templates {
  images: string[];
}

export default function AdminDashboard({ isVisible, onClose }: AdminDashboardProps) {
  const [newFee, setNewFee] = useState('');
  const [resetAddress, setResetAddress] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [templates, setTemplates] = useState<Templates>({ images: [] });
  const [activeTab, setActiveTab] = useState<'controls' | 'templates' | 'treasury' | 'nft-drops'>('controls');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [dropId, setDropId] = useState('');
  const [dropName, setDropName] = useState('');
  const [dropDescription, setDropDescription] = useState('');
  const [priceEth, setPriceEth] = useState('');
  const [supply, setSupply] = useState('');
  const [uri, setUri] = useState('');
  const [isCreatingDrop, setIsCreatingDrop] = useState(false);
  const [savedDrops, setSavedDrops] = useState<any[]>([]);
  const [editingDrop, setEditingDrop] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [isLoadingDrops, setIsLoadingDrops] = useState(false);

  // Use the admin contract hook
  const {
    isOwner,
    owner,
    generationFee: mintFee,
    totalMints,
    totalRevenue,
    isPaused,
    isLoading,
    setNewFee: setHookNewFee,
    handleSetFee,
    handlePause,
    handleUnpause,
    handleWithdraw,
    handleEmergencyWithdraw,
    handleResetUserMints,
    // Treasury data
    treasury,
    treasuryOwner,
    supportedTokens,
    treasuryPaused,
    treasuryETHBalance,
    getTokenBalance,
    // Treasury state
    newTokenAddress,
    setNewTokenAddress,
    newTokenSymbol,
    setNewTokenSymbol,
    newTokenImage,
    setNewTokenImage,
    rewardUser,
    setRewardUser,
    rewardToken,
    setRewardToken,
    rewardAmount,
    setRewardAmount,
    withdrawToken,
    setWithdrawToken,
    withdrawAmount,
    setWithdrawAmount,
    distributeRecipient,
    setDistributeRecipient,
    distributeToken,
    setDistributeToken,
    distributeAmount,
    setDistributeAmount,
    newTreasuryAddress,
    setNewTreasuryAddress,
    // Treasury actions
    handleAddSupportedToken,
    handleRemoveSupportedToken,
    handleAddReward,
    handleDistributeReward,
    handleWithdrawTokens,
    handleEmergencyWithdrawTokens,
    handleEmergencyWithdrawETH,
    handleWithdrawTreasuryETH,
    handlePauseTreasury,
    handleUnpauseTreasury,
    handleSetTreasuryAddress,
  } = useAdminContract();

  // NFT contract write hook
  const { writeContractAsync } = useWriteContract();

  // Load templates
  useEffect(() => {
    if (isVisible && isOwner) {
      loadTemplates();
    }
  }, [isVisible, isOwner]);

  // Load drops when NFT drops tab is selected
  useEffect(() => {
    if (isVisible && isOwner && activeTab === 'nft-drops') {
      loadDrops();
    }
  }, [isVisible, isOwner, activeTab]);

  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const response = await fetch('/api/admin/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleSetFeeClick = async () => {
    if (!newFee) return;
    try {
      setHookNewFee(newFee);
      await handleSetFee();
      setNewFee('');
    } catch (error) {
      console.error('Error setting fee:', error);
    }
  };

  const handleResetGenerates = async () => {
    if (!resetAddress) {
      alert('Please enter a wallet address');
      return;
    }
    await handleResetUserMints(resetAddress);
    setResetAddress('');
  };

  const handleUploadTemplate = async () => {
    if (!uploadFile) {
      alert('Please select a file');
      return;
    }

    try {
      setIsLoadingTemplates(true);
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        alert('Template uploaded successfully!');
        setUploadFile(null);
        loadTemplates();
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading template:', error);
      alert('Failed to upload template');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleDeleteTemplate = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      setIsLoadingTemplates(true);
      const response = await fetch(`/api/admin/templates?fileName=${encodeURIComponent(fileName)}&type=image`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('Template deleted successfully!');
        loadTemplates();
      } else {
        alert(`Delete failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleCreateDrop = async () => {
    if (!dropId || !dropName || !dropDescription || !priceEth || !supply || !uri) {
      alert('Please fill all fields');
      return;
    }

    try {
      setIsCreatingDrop(true);
      console.log('Creating drop with params:', { dropId, dropName, priceEth, supply, uri });

      // Call contract createDrop
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.nft,
        abi: NFT_ABI,
        functionName: 'createDrop',
        args: [
          BigInt(dropId),
          parseEther(priceEth),
          BigInt(supply),
          uri,
        ],
      });

      console.log('Contract call successful, txHash:', txHash);

      // Save to DB
      const dbPayload = {
        dropId: parseInt(dropId),
        name: dropName,
        description: dropDescription,
        priceWei: parseEther(priceEth).toString(),
        supply: parseInt(supply),
        uri,
        txHash,
      };
      console.log('Saving to DB with payload:', dbPayload);

      const response = await fetch('/api/db/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload),
      });

      const data = await response.json();
      console.log('DB response:', data);

      if (data.success) {
        alert(`Drop created successfully! TX: ${txHash}`);
        setDropId('');
        setDropName('');
        setDropDescription('');
        setPriceEth('');
        setSupply('');
        setUri('');
        loadDrops(); // Refresh the drops list
      } else {
        alert(`Failed to save drop: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating drop:', error);
      alert(`Failed to create drop: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingDrop(false);
    }
  };

  const loadDrops = async () => {
    try {
      setIsLoadingDrops(true);
      const response = await fetch('/api/db/drops');
      const data = await response.json();
      if (data.drops) {
        setSavedDrops(data.drops);
      }
    } catch (error) {
      console.error('Error loading drops:', error);
    } finally {
      setIsLoadingDrops(false);
    }
  };

  const handleEditDropPrice = async (drop: any) => {
    if (!editPrice) {
      alert('Please enter a new price');
      return;
    }

    try {
      // Update DB price only (server-side). On-chain price updates require owner wallet.
      const response = await fetch('/api/db/drops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dropId: drop.drop_id,
          priceWei: parseEther(editPrice).toString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Drop price updated in admin panel successfully! (DB updated)');
        setEditingDrop(null);
        setEditPrice('');
        loadDrops(); // Refresh the drops list
      } else {
        console.error('Failed to update drop price (DB):', data);
        alert(`Failed to update drop price: ${data.error || JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Error updating drop price:', error);
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to update drop price: ${msg}`);
    }
  };

  const handleSaveExistingDrop = async () => {
    const txHash = prompt('Enter the transaction hash of the drop creation:');
    if (!txHash) return;

    try {
      // Try to get drop info from the transaction or prompt for manual entry
      const dropId = prompt('Enter drop ID:');
      const name = prompt('Enter drop name:');
      const description = prompt('Enter drop description:');
      const priceEth = prompt('Enter price in ETH:');
      const supply = prompt('Enter supply:');
      const uri = prompt('Enter IPFS URI:');

      if (!dropId || !name || !description || !priceEth || !supply || !uri) {
        alert('All fields are required');
        return;
      }

      const response = await fetch('/api/db/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dropId: parseInt(dropId),
          name,
          description,
          priceWei: parseEther(priceEth).toString(),
          supply: parseInt(supply),
          uri,
          txHash,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Drop saved successfully!');
        loadDrops(); // Refresh the drops list
      } else {
        alert(`Failed to save drop: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving drop:', error);
      alert('Failed to save drop');
    }
  };

  if (!isVisible || !isOwner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-[10px]">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 border-2 border-indigo-500 rounded-3xl p-8 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_rgba(79,70,229,0.3)] relative">
        <div className="flex justify-between items-center mb-8 border-b-2 border-indigo-500 pb-4">
          <h2 className="text-white m-0 text-3xl font-bold text-shadow-[0_0_10px_rgba(79,70,229,0.5)]">🔧 Admin Dashboard</h2>
          <button onClick={onClose} className="bg-red-500 text-white border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors duration-200 text-xl font-bold">✕</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeTab === 'controls' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setActiveTab('controls')}
          >
            🎛️ Mememint
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeTab === 'treasury' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setActiveTab('treasury')}
          >
            💰 Treasury
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setActiveTab('templates')}
          >
            🎨 Templates
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeTab === 'nft-drops' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setActiveTab('nft-drops')}
          >
            🖼️ NFT Drops
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'controls' && (
            <>
              {/* Contract Stats */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">📊 Mememint Contract Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <span className="text-gray-400 text-sm">Total Generates:</span>
                    <span className="text-white text-lg font-semibold block">{totalMints ? (Number(totalMints) - 1).toString() : '0'}</span>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <span className="text-gray-400 text-sm">Current Fee:</span>
                    <span className="text-white text-lg font-semibold block">{mintFee ? mintFee : '0'} ETH</span>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <span className="text-gray-400 text-sm">Total Revenue:</span>
                    <span className="text-white text-lg font-semibold block">{totalRevenue ? totalRevenue : '0'} ETH</span>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <span className="text-gray-400 text-sm">Status:</span>
                    <span className={`text-lg font-semibold block ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
                      {isPaused ? '⏸️ Paused' : '▶️ Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee Management */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">💰 Fee Management</h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="New fee in ETH"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleSetFeeClick} 
                    disabled={!newFee || isLoading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Set Fee
                  </button>
                </div>
              </div>

              {/* Set Treasury Address */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">🏦 Set Treasury Address</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="New Treasury Address (0x...)"
                    value={newTreasuryAddress}
                    onChange={(e) => setNewTreasuryAddress(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleSetTreasuryAddress}
                    disabled={!newTreasuryAddress || isLoading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Set Treasury
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  ⚠️ Only change if the treasury address is incorrect. Current: {treasury}
                </p>
              </div>

              {/* Contract Controls */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">🎛️ Contract Controls</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={isPaused ? handleUnpause : handlePause}
                    disabled={isLoading}
                    className={`px-6 py-2 text-white rounded-lg font-semibold hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${isPaused ? 'bg-green-600' : 'bg-red-600'}`}
                  >
                    {isPaused ? '▶️ Unpause Contract' : '⏸️ Pause Contract'}
                  </button>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">📋 Mememint Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Address:</span>
                    <span className="text-white font-mono text-sm">{CONTRACT_ADDRESSES.mememint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Owner:</span>
                    <span className="text-white font-mono text-sm">{owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Treasury:</span>
                    <span className="text-white font-mono text-sm">{treasury}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-white">Base Mainnet</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'treasury' && (
            <>
              {/* Treasury Stats */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">📊 Treasury Statistics</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <span className="text-gray-400 text-sm">Supported Tokens:</span>
                    <span className="text-white text-lg font-semibold block">{supportedTokens ? supportedTokens.length : '0'}</span>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <span className="text-gray-400 text-sm">Status:</span>
                    <span className={`text-lg font-semibold block ${treasuryPaused ? 'text-red-400' : 'text-green-400'}`}>
                      {treasuryPaused ? '⏸️ Paused' : '▶️ Active'}
                    </span>
                  </div>
                </div>
                
                {/* ETH Balance */}
                <div className="bg-slate-700/50 p-4 rounded-lg mb-4">
                  <span className="text-gray-400 text-sm">💰 ETH Balance:</span>
                  <span className="text-white text-lg font-semibold block">
                    {
                      (() => {
                        const t: any = treasuryETHBalance;
                        if (!t) return 'Loading...';
                        // Wagmi may return an object with `formatted` or a bigint/value
                        if (typeof t === 'object' && t?.formatted) {
                          const n = parseFloat(t.formatted || '0');
                          return `${isFinite(n) ? n.toFixed(5) : '0.00000'} ETH`;
                        }
                        try {
                          const asNum = Number(t) / 1e18;
                          return `${isFinite(asNum) ? asNum.toFixed(5) : '0.00000'} ETH`;
                        } catch (e) {
                          return '0.00000 ETH';
                        }
                      })()
                    }
                  </span>
                </div>

                {/* Token Balances */}
                {supportedTokens && supportedTokens.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold">Token Balances:</h4>
                    {supportedTokens.map((tokenAddress, index) => {
                      return (
                        <div key={tokenAddress} className="bg-slate-700/30 p-3 rounded-lg flex justify-between items-center">
                          <span className="text-white font-mono text-sm">{tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}</span>
                          <div className="text-blue-400 font-semibold">
                            <TreasuryTokenBalance tokenAddress={tokenAddress} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Supported Token */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">➕ Add Supported Token</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Token Contract Address (0x...)"
                    value={newTokenAddress}
                    onChange={(e) => setNewTokenAddress(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Token Symbol (e.g., USDC)"
                    value={newTokenSymbol}
                    onChange={(e) => setNewTokenSymbol(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Token Image URL"
                    value={newTokenImage}
                    onChange={(e) => setNewTokenImage(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleAddSupportedToken}
                    disabled={!newTokenAddress || !newTokenSymbol || !newTokenImage || isLoading}
                    className="w-full px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Add Token
                  </button>
                </div>
              </div>

              {/* Supported Tokens List */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">🪙 Supported Tokens ({supportedTokens ? supportedTokens.length : 0})</h3>
                <div className="space-y-2">
                  {supportedTokens && supportedTokens.length > 0 ? (
                    supportedTokens.map((tokenAddress, index) => (
                      <div key={tokenAddress} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                        <span className="text-white font-mono text-sm">{tokenAddress}</span>
                        <button 
                          onClick={() => handleRemoveSupportedToken(tokenAddress)}
                          className="px-3 py-1 bg-red-600 text-white rounded font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 text-sm"
                          disabled={isLoading}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No supported tokens</p>
                  )}
                </div>
              </div>

              {/* Add Reward */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">🎁 Add User Reward</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="User Address (0x...)"
                    value={rewardUser}
                    onChange={(e) => setRewardUser(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Token Address (0x...)"
                    value={rewardToken}
                    onChange={(e) => setRewardToken(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Amount (in wei)"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleAddReward}
                    disabled={!rewardUser || !rewardToken || !rewardAmount || isLoading}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Add Reward
                  </button>
                </div>
              </div>

              {/* Distribute Reward */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">🚀 Distribute Reward</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Recipient Address (0x...)"
                    value={distributeRecipient}
                    onChange={(e) => setDistributeRecipient(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Token Address (0x...)"
                    value={distributeToken}
                    onChange={(e) => setDistributeToken(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Amount (in wei)"
                    value={distributeAmount}
                    onChange={(e) => setDistributeAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleDistributeReward}
                    disabled={!distributeRecipient || !distributeToken || !distributeAmount || isLoading}
                    className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Distribute Reward
                  </button>
                </div>
              </div>

              {/* Treasury Controls */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">🎛️ Treasury Controls</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button 
                    onClick={treasuryPaused ? handleUnpauseTreasury : handlePauseTreasury}
                    disabled={isLoading}
                    className={`px-4 py-2 text-white rounded-lg font-semibold hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${treasuryPaused ? 'bg-green-600' : 'bg-red-600'}`}
                  >
                    {treasuryPaused ? '▶️ Unpause Treasury' : '⏸️ Pause Treasury'}
                  </button>
                  <button 
                    onClick={handleEmergencyWithdrawETH}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    🚨 Emergency ETH Withdraw
                  </button>
                </div>
              </div>

              {/* Treasury Withdrawals */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">💰 Treasury Withdrawals</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Token Address (0x...)"
                      value={withdrawToken}
                      onChange={(e) => setWithdrawToken(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder={withdrawToken ? "Amount (token units)" : "Amount (ETH)"}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleWithdrawTokens}
                      disabled={!withdrawToken || !withdrawAmount || isLoading}
                      className="flex-1 px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      💰 Withdraw Tokens
                    </button>
                    <button 
                      onClick={handleWithdrawTreasuryETH}
                      disabled={!withdrawAmount || isLoading}
                      className="flex-1 px-6 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      💎 Withdraw ETH
                    </button>
                  </div>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">📋 Treasury Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Treasury Address:</span>
                    <span className="text-white font-mono text-sm">{CONTRACT_ADDRESSES.treasury}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Treasury Owner:</span>
                    <span className="text-white font-mono text-sm">{treasuryOwner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-white">Base Mainnet</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'templates' && (
            <>
              {/* Upload Template */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">📤 Upload Template</h3>
                <div className="flex gap-4">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                  />
                  <button 
                    onClick={handleUploadTemplate} 
                    disabled={!uploadFile || isLoadingTemplates}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Upload
                  </button>
                </div>
              </div>

              {/* Image Templates */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">🖼️ Image Templates ({templates.images.length})</h3>
                <div className="space-y-2">
                  {isLoadingTemplates ? (
                    <p className="text-gray-400">Loading...</p>
                  ) : templates.images.length === 0 ? (
                    <p className="text-gray-400">No image templates</p>
                  ) : (
                    templates.images.map((fileName) => (
                      <div key={fileName} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                        <span className="text-white text-sm">{fileName}</span>
                        <button 
                          onClick={() => handleDeleteTemplate(fileName)}
                          className="px-3 py-1 bg-red-600 text-white rounded font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 text-sm"
                          disabled={isLoadingTemplates}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'nft-drops' && (
            <>
              {/* Manual Save Drop */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">💾 Save Existing Drop</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Use this to save drops that were created on-chain but not saved to the database.
                </p>
                <button
                  onClick={handleSaveExistingDrop}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                >
                  Save Existing Drop
                </button>
              </div>

              {/* Create NFT Drop */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">🖼️ Create NFT Drop</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Drop ID</label>
                    <input
                      type="number"
                      value={dropId}
                      onChange={(e) => setDropId(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white"
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={dropName}
                      onChange={(e) => setDropName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white"
                      placeholder="e.g., Rare Pepe Meme"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={dropDescription}
                      onChange={(e) => setDropDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white"
                      placeholder="e.g., A rare Pepe meme NFT from the golden era"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Price (ETH)</label>
                    <input
                      type="text"
                      value={priceEth}
                      onChange={(e) => setPriceEth(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white"
                      placeholder="e.g., 0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Supply</label>
                    <input
                      type="number"
                      value={supply}
                      onChange={(e) => setSupply(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white"
                      placeholder="e.g., 1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">IPFS URI</label>
                    <input
                      type="text"
                      value={uri}
                      onChange={(e) => setUri(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white"
                      placeholder="ipfs://..."
                    />
                  </div>
                  <button
                    onClick={handleCreateDrop}
                    disabled={isCreatingDrop}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isCreatingDrop ? 'Creating...' : 'Create Drop'}
                  </button>
                </div>
              </div>

              {/* Saved Drops */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white mb-4">📋 Saved Drops ({savedDrops.length})</h3>
                  <button
                    onClick={loadDrops}
                    disabled={isLoadingDrops}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingDrops ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                {isLoadingDrops ? (
                  <p className="text-gray-400">Loading drops...</p>
                ) : savedDrops.length === 0 ? (
                  <p className="text-gray-400">No saved drops</p>
                ) : (
                  <div className="space-y-4">
                    {savedDrops.map((drop) => (
                      <div key={drop.drop_id} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-semibold">#{drop.drop_id} - {drop.name}</h4>
                            <p className="text-gray-400 text-sm">{drop.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-400 font-semibold">
                              {parseFloat(drop.price_wei) / 1e18} ETH
                            </div>
                            <div className="text-gray-400 text-sm">
                              {drop.minted}/{drop.supply} minted
                            </div>
                          </div>
                        </div>

                        {editingDrop?.drop_id === drop.drop_id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="flex-1 px-3 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                              placeholder="New price in ETH"
                            />
                            <button
                              onClick={() => handleEditDropPrice(drop)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingDrop(null);
                                setEditPrice('');
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm font-semibold hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingDrop(drop);
                                setEditPrice((parseFloat(drop.price_wei) / 1e18).toString());
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
                            >
                              Edit Price
                            </button>
                            {drop.tx_hash && (
                              <a
                                href={`https://basescan.org/tx/${drop.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-semibold hover:bg-purple-700"
                              >
                                View TX
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
            <div className="flex items-center gap-3 text-white">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing transaction...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}