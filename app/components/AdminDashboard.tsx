import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
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
    <div className={styles.overlay}>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h2>🔧 Admin Dashboard</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'controls' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            🎛️ Controls
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'templates' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            🎨 Templates
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'controls' && (
            <>
              {/* Contract Stats */}
              <div className={styles.section}>
                <h3>📊 Contract Statistics</h3>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.label}>Total Generates:</span>
                    <span className={styles.value}>{totalMints ? (Number(totalMints) - 1).toString() : '0'}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Current Fee:</span>
                    <span className={styles.value}>{mintFee ? mintFee : '0'} ETH</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Total Revenue:</span>
                    <span className={styles.value}>{totalRevenue ? totalRevenue : '0'} ETH</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.value} ${isPaused ? styles.paused : styles.active}`}>
                      {isPaused ? '⏸️ Paused' : '▶️ Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee Management */}
              <div className={styles.section}>
                <h3>💰 Fee Management</h3>
                <div className={styles.feeControl}>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="New fee in ETH"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className={styles.input}
                  />
                  <button 
                    onClick={handleSetFeeClick} 
                    disabled={!newFee || isLoading}
                    className={styles.actionBtn}
                  >
                    Set Fee
                  </button>
                </div>
              </div>

              {/* Reset User Generates */}
              <div className={styles.section}>
                <h3>🔄 Reset User Generates</h3>
                <div className={styles.feeControl}>
                  <input
                    type="text"
                    placeholder="User wallet address (0x...)"
                    value={resetAddress}
                    onChange={(e) => setResetAddress(e.target.value)}
                    className={styles.input}
                  />
                  <button 
                    onClick={handleResetGenerates} 
                    disabled={!resetAddress || isLoading}
                    className={styles.actionBtn}
                  >
                    Reset Daily Generates
                  </button>
                </div>
              </div>

              {/* Contract Controls */}
              <div className={styles.section}>
                <h3>🎛️ Contract Controls</h3>
                <div className={styles.controls}>
                  <button 
                    onClick={isPaused ? handleUnpause : handlePause}
                    disabled={isLoading}
                    className={`${styles.actionBtn} ${isPaused ? styles.unpauseBtn : styles.pauseBtn}`}
                  >
                    {isPaused ? '▶️ Unpause Contract' : '⏸️ Pause Contract'}
                  </button>
                </div>
              </div>

              {/* Revenue Management */}
              <div className={styles.section}>
                <h3>💳 Revenue Management</h3>
                <div className={styles.controls}>
                  <button 
                    onClick={handleWithdraw}
                    disabled={isLoading || !totalRevenue || totalRevenue === '0'}
                    className={`${styles.actionBtn} ${styles.withdrawBtn}`}
                    title={!totalRevenue || totalRevenue === '0' ? 'No funds to withdraw' : 'Withdraw all revenue to owner'}
                  >
                    💰 Withdraw Revenue
                  </button>
                  <button 
                    onClick={handleEmergencyWithdraw}
                    disabled={isLoading || !totalRevenue || totalRevenue === '0'}
                    className={`${styles.actionBtn} ${styles.emergencyBtn}`}
                    title="Emergency withdrawal - use only if normal withdraw fails"
                  >
                    🚨 Emergency Withdraw
                  </button>
                </div>
                <p className={styles.hint}>
                  💡 Emergency withdraw should only be used if normal withdraw fails
                </p>
              </div>

              {/* Contract Info */}
              <div className={styles.section}>
                <h3>📋 Contract Information</h3>
                <div className={styles.info}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Contract Address:</span>
                    <span className={styles.address}>{CONTRACT_ADDRESS}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Owner:</span>
                    <span className={styles.address}>{owner}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Network:</span>
                    <span className={styles.value}>Base Mainnet</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'templates' && (
            <>
              {/* Upload Template */}
              <div className={styles.section}>
                <h3>📤 Upload Template</h3>
                <div className={styles.uploadControl}>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className={styles.fileInput}
                  />
                  <button 
                    onClick={handleUploadTemplate} 
                    disabled={!uploadFile || isLoadingTemplates}
                    className={styles.actionBtn}
                  >
                    Upload
                  </button>
                </div>
              </div>

              {/* Image Templates */}
              <div className={styles.section}>
                <h3>🖼️ Image Templates ({templates.images.length})</h3>
                <div className={styles.templateList}>
                  {isLoadingTemplates ? (
                    <p>Loading...</p>
                  ) : templates.images.length === 0 ? (
                    <p>No image templates</p>
                  ) : (
                    templates.images.map((fileName) => (
                      <div key={fileName} className={styles.templateItem}>
                        <span className={styles.fileName}>{fileName}</span>
                        <button 
                          onClick={() => handleDeleteTemplate(fileName)}
                          className={styles.deleteBtn}
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
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Processing transaction...</span>
          </div>
        )}
      </div>
    </div>
  );
}