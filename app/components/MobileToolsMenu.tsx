"use client";

import { useState } from "react";

interface MobileToolsMenuProps {
  texts: string[];
  onTextChange: (index: number, value: string) => void;
  font: string;
  setFont: (font: string) => void;
  background: string;
  setBackground: (background: string) => void;
  extension: "png" | "jpg" | "gif";
  setExtension: (extension: "png" | "jpg" | "gif") => void;
  showShareDownload: boolean;
  generate: () => void;
  shareToImgbb: () => void;
  downloadMeme: () => void;
  loading: boolean;
  waitingForConfirmation: boolean;
  generatedMeme: string | null;
}

const FONT_OPTIONS = [
  { label: "Impact", value: "impact" },
  { label: "Anton", value: "anton" },
  { label: "Arial", value: "arial" },
  { label: "Comic Sans", value: "comic-sans" },
  { label: "Times", value: "times" }
];

const EXTENSION_OPTIONS: Array<{ label: string; value: "png" | "jpg" | "gif" }> = [
  { label: "PNG", value: "png" },
  { label: "JPG", value: "jpg" },
  { label: "GIF", value: "gif" }
];

const BACKGROUND_PRESETS = [
  { label: "Transparent", value: "" },
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Sunset", value: "#f97316" },
  { label: "Neon", value: "#06b6d4" },
  { label: "Violet", value: "#8b5cf6" }
];

const TEXT_PRESETS = [
  { label: "UPPER", action: "upper" },
  { label: "lower", action: "lower" },
  { label: "Clear", action: "clear" }
];

export default function MobileToolsMenu({
  texts,
  onTextChange,
  font,
  setFont,
  background,
  setBackground,
  extension,
  setExtension,
  showShareDownload,
  generate,
  shareToImgbb,
  downloadMeme,
  loading,
  waitingForConfirmation,
  generatedMeme
}: MobileToolsMenuProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'style' | 'actions'>('text');

  const handleTextPreset = (index: number, action: string) => {
    const currentText = texts[index] || "";
    switch (action) {
      case "upper":
        onTextChange(index, currentText.toUpperCase());
        break;
      case "lower":
        onTextChange(index, currentText.toLowerCase());
        break;
      case "clear":
        onTextChange(index, "");
        break;
    }
  };

  return (
    <div className="bg-gray-900/95 border border-blue-400/20 rounded-xl backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-blue-400/10">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'text'
              ? 'text-white bg-blue-600/20 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('text')}
        >
          ✏️ Text
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'text-white bg-blue-600/20 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('style')}
        >
          🎨 Style
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'actions'
              ? 'text-white bg-blue-600/20 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('actions')}
        >
          ⚡ Actions
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'text' && (
          <div className="space-y-4">
            {texts.map((text, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Line {index + 1}</span>
                  <div className="flex gap-1">
                    {TEXT_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        className="px-2 py-1 text-xs bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 hover:text-white rounded transition-colors"
                        onClick={() => handleTextPreset(index, preset.action)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="w-full px-3 py-2 bg-gray-800/80 border border-blue-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 resize-none"
                  rows={2}
                  placeholder="Enter text"
                  value={text}
                  onChange={event => onTextChange(index, event.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Font</label>
              <select
                className="w-full px-3 py-2 bg-gray-800/80 border border-blue-400/20 rounded-lg text-white focus:outline-none focus:border-blue-400/50"
                value={font}
                onChange={event => setFont(event.target.value)}
              >
                {FONT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Background</label>
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUND_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      background === preset.value
                        ? 'border-blue-400 shadow-lg shadow-blue-400/20'
                        : 'border-gray-600/50 hover:border-gray-500/50'
                    }`}
                    style={{ backgroundColor: preset.value || 'transparent' }}
                    onClick={() => setBackground(preset.value)}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Format</label>
              <select
                className="w-full px-3 py-2 bg-gray-800/80 border border-blue-400/20 rounded-lg text-white focus:outline-none focus:border-blue-400/50"
                value={extension}
                onChange={event => setExtension(event.target.value as "png" | "jpg" | "gif")}
              >
                {EXTENSION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-3">
            <button
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
              onClick={generate}
              disabled={loading || waitingForConfirmation}
            >
              {loading ? "Generating..." : waitingForConfirmation ? "Confirming..." : "Generate Meme"}
            </button>

            {showShareDownload && generatedMeme && (
              <div className="space-y-2 pt-2 border-t border-blue-400/10">
                <button
                  onClick={shareToImgbb}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  📤 Share
                </button>
                <button
                  onClick={downloadMeme}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  💾 Download
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}