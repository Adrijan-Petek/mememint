"use client";
import { useState } from "react";

export function useUIState() {
  const [showTextControls, setShowTextControls] = useState(false);
  const [showStickersPanel, setShowStickersPanel] = useState(false);
  const [showDrawPanel, setShowDrawPanel] = useState(false);
  const [showShareDownload, setShowShareDownload] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const resetUIState = () => {
    setShowTextControls(false);
    setShowStickersPanel(false);
    setShowDrawPanel(false);
    setShowShareDownload(false);
    setSelectedFilter('none');
    setEditingTextId(null);
  };

  const finishInlineEdit = () => {
    if (editingTextId) {
      setEditingTextId(null);
    }
  };

  return {
    showTextControls,
    setShowTextControls,
    showStickersPanel,
    setShowStickersPanel,
    showDrawPanel,
    setShowDrawPanel,
    showShareDownload,
    setShowShareDownload,
    selectedFilter,
    setSelectedFilter,
    editingTextId,
    setEditingTextId,
    resetUIState,
    finishInlineEdit
  };
}