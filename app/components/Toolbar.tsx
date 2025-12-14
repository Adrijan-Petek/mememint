"use client";

import { useState } from "react";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  texts: string[];
  onTextChange: (index: number, value: string) => void;
  font: string;
  setFont: (font: string) => void;
  background: string;
  setBackground: (background: string) => void;
  extension: "png" | "jpg" | "gif";
  setExtension: (extension: "png" | "jpg" | "gif") => void;
  style?: string;
  setStyle?: (style: string) => void;
  availableStyles?: string[];
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

const transformTitleCase = (value: string) =>
  value.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

const TEXT_PRESETS = [
  { label: "Upper", action: (value: string) => value.toUpperCase() },
  { label: "Title", action: transformTitleCase },
  { label: "Lower", action: (value: string) => value.toLowerCase() },
  { label: "Trim", action: (value: string) => value.trim() },
  { label: "Clear", action: () => "" }
];

export default function Toolbar({
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
}: ToolbarProps) {
  const [openSection, setOpenSection] = useState<"caption" | "styling" | null>("caption");

  const toggleSection = (section: "caption" | "styling") => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleTextPreset = (index: number, preset: (value: string) => string) => {
    onTextChange(index, preset(texts[index] ?? ""));
  };

  return (
    <div className={styles.toolbarContainer}>
      <section className={styles.section}>
        <header 
          className={`${styles.sectionHeader} ${openSection === "caption" ? styles.open : ""}`}
          onClick={() => toggleSection("caption")}
        >
          <div>
            <h3>
              {openSection === "caption" ? "▼" : "▶"} Caption
            </h3>
            <p>Dial in your punchlines. Short lines work best.</p>
          </div>
        </header>

        {openSection === "caption" && (
          <div className={styles.sectionContent}>
            <div className={styles.gridTwoColumn}>
          {texts.map((text, index) => (
            <div key={index} className={styles.controlCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardBadge}>Line {index + 1}</span>
                <div className={styles.lineActions}>
                  {TEXT_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      className={styles.chipButton}
                      onClick={() => handleTextPreset(index, preset.action)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                className={styles.textArea}
                placeholder="Enter meme text"
                value={text}
                onChange={event => onTextChange(index, event.target.value)}
              />
            </div>
          ))}
            </div>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <header 
          className={`${styles.sectionHeader} ${openSection === "styling" ? styles.open : ""}`}
          onClick={() => toggleSection("styling")}
        >
          <div>
            <h3>
              {openSection === "styling" ? "▼" : "▶"} Styling
            </h3>
            <p>Switch fonts, backgrounds, and export formats.</p>
          </div>
        </header>

        {openSection === "styling" && (
          <div className={styles.sectionContent}>
            <div className={styles.gridResponsive}>
          <div className={styles.controlCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardBadge}>Font</span>
            </div>
            <div className={styles.chipGroup}>
              {FONT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.chipButton} ${font === option.value ? styles.chipActive : ""}`}
                  onClick={() => setFont(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardBadge}>Background</span>
            </div>
            <div className={styles.colorField}>
              <input
                type="color"
                aria-label="Pick background color"
                value={background || "#000000"}
                onChange={event => setBackground(event.target.value)}
                className={styles.colorInput}
              />
              <input
                type="text"
                className={styles.colorHexInput}
                placeholder="hex or name"
                value={background}
                onChange={event => setBackground(event.target.value)}
              />
            </div>
            <div className={styles.chipGroup}>
              {BACKGROUND_PRESETS.map(option => (
                <button
                  key={option.label}
                  type="button"
                  className={`${styles.chipButton} ${background === option.value ? styles.chipActive : ""}`}
                  onClick={() => setBackground(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.controlCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardBadge}>Format</span>
            </div>
            <div className={styles.chipGroup}>
              {EXTENSION_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.chipButton} ${extension === option.value ? styles.chipActive : ""}`}
                  onClick={() => setExtension(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className={styles.helperText}>PNG keeps transparency, GIF renders animated templates.</p>
          </div>
            </div>
          </div>
        )}
      </section>

      <footer className={styles.toolbox}>
        <div className={styles.toolRow}>
          <button
            type="button"
            className={`${styles.primaryAction} ${loading || waitingForConfirmation ? styles.actionDisabled : ""}`}
            onClick={generate}
            disabled={loading || waitingForConfirmation}
          >
            <span className={styles.primaryIcon}>⚡</span>
            <span>
              {loading ? "Generating" : waitingForConfirmation ? "Generating" : "Generate"}
            </span>
          </button>

          {generatedMeme && showShareDownload ? (
            <div className={styles.secondaryActions}>
              <button type="button" className={styles.secondaryAction} onClick={shareToImgbb}>
                <span>🔁 Recast</span>
              </button>
              <button type="button" className={styles.secondaryAction} onClick={downloadMeme}>
                <span>💾 Download</span>
              </button>
            </div>
          ) : null}
        </div>
      </footer>
    </div>
  );
}