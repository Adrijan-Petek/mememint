import { useState, useEffect } from 'react';
import { useAdminContract } from '../hooks/useAdminContract';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

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
  const [activeTab, setActiveTab] = useState<'controls' | 'templates'>('controls');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Use the admin contract hook
  const {
    isOwner,
    owner,
    mintFee,
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
    handleResetUserMints
  } = useAdminContract();

  // Load templates
  useEffect(() => {
    if (isVisible && isOwner) {
      loadTemplates();
    }
  }, [isVisible, isOwner]);

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
            🎛️ Controls
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setActiveTab('templates')}
          >
            🎨 Templates
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'controls' && (
            <>
              {/* Contract Stats */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">📊 Contract Statistics</h3>
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

              {/* Reset User Generates */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">🔄 Reset User Generates</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="User wallet address (0x...)"
                    value={resetAddress}
                    onChange={(e) => setResetAddress(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleResetGenerates} 
                    disabled={!resetAddress || isLoading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Reset Daily Generates
                  </button>
                </div>
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

              {/* Revenue Management */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">💳 Revenue Management</h3>
                <div className="flex gap-4 mb-4">
                  <button 
                    onClick={handleWithdraw}
                    disabled={isLoading || !totalRevenue || totalRevenue === '0'}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    title={!totalRevenue || totalRevenue === '0' ? 'No funds to withdraw' : 'Withdraw all revenue to owner'}
                  >
                    💰 Withdraw Revenue
                  </button>
                  <button 
                    onClick={handleEmergencyWithdraw}
                    disabled={isLoading || !totalRevenue || totalRevenue === '0'}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    title="Emergency withdrawal - use only if normal withdraw fails"
                  >
                    🚨 Emergency Withdraw
                  </button>
                </div>
                <p className="text-gray-400 text-sm">
                  💡 Emergency withdraw should only be used if normal withdraw fails
                </p>
              </div>

              {/* Contract Info */}
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">📋 Contract Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Address:</span>
                    <span className="text-white font-mono text-sm">{CONTRACT_ADDRESS}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Owner:</span>
                    <span className="text-white font-mono text-sm">{owner}</span>
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