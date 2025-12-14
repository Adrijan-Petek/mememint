"use client";

import { useState } from "react";
import styles from "./MobileToolsMenu.module.css";

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
    <div className={styles.mobileMenu}>
      {/* Tab Navigation */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'text' ? styles.active : ''}`}
          onClick={() => setActiveTab('text')}
        >
          ✏️ Text
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'style' ? styles.active : ''}`}
          onClick={() => setActiveTab('style')}
        >
          🎨 Style
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'actions' ? styles.active : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          ⚡ Actions
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'text' && (
          <div className={styles.textTab}>
            {texts.map((text, index) => (
              <div key={index} className={styles.textInput}>
                <div className={styles.textHeader}>
                  <span>Line {index + 1}</span>
                  <div className={styles.presetButtons}>
                    {TEXT_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        className={styles.presetBtn}
                        onClick={() => handleTextPreset(index, preset.action)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  className={styles.textArea}
                  placeholder="Enter meme text"
                  value={text}
                  onChange={event => onTextChange(index, event.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'style' && (
          <div className={styles.styleTab}>
            <div className={styles.styleGroup}>
              <label>Font</label>
              <select
                className={styles.select}
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

            <div className={styles.styleGroup}>
              <label>Background</label>
              <div className={styles.colorGrid}>
                {BACKGROUND_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    className={`${styles.colorBtn} ${background === preset.value ? styles.active : ''}`}
                    style={{ backgroundColor: preset.value || 'transparent' }}
                    onClick={() => setBackground(preset.value)}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>

            <div className={styles.styleGroup}>
              <label>Format</label>
              <div className={styles.formatButtons}>
                {EXTENSION_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.formatBtn} ${extension === option.value ? styles.active : ''}`}
                    onClick={() => setExtension(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className={styles.actionsTab}>
            <button
              className={`${styles.generateBtn} ${loading || waitingForConfirmation ? styles.disabled : ''}`}
              onClick={generate}
              disabled={loading || waitingForConfirmation}
            >
              <span className={styles.icon}>⚡</span>
              {loading ? "Generating..." : waitingForConfirmation ? "Generating..." : "Generate Meme"}
            </button>

            {generatedMeme && showShareDownload && (
              <div className={styles.shareButtons}>
                <button className={styles.shareBtn} onClick={shareToImgbb}>
                  <span className={styles.icon}>🔁</span>
                  Recast
                </button>
                <button className={styles.shareBtn} onClick={downloadMeme}>
                  <span className={styles.icon}>💾</span>
                  Download
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}