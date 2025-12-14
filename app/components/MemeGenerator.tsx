"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import styles from "./MemeGenerator_new.module.css";
import { useMemeGeneration } from "../hooks/useMemeGeneration";
import { useTemplates } from "../hooks/useTemplates";
import { useMinting } from "../hooks/useMinting";
import { shareToImgbb, downloadMeme } from "../utils/memeSharing";

interface MemeGeneratorProps {
  onShowAdminDashboard: () => void;
}

const sanitizeSegment = (text: string) => {
  if (!text) return "_";
  return text
    .replace(/_/g, "__")
    .replace(/-/g, "--")
    .replace(/\s+/g, "_")
    .replace(/\?/g, "~q")
    .replace(/%/g, "~p")
    .replace(/#/g, "~h")
    .replace(/\//g, "~s");
};

const buildPreviewUrl = (
  templateId: string,
  texts: string[],
  extension: "png" | "jpg" | "gif",
  font: string,
  textColor: string
) => {
  const segments = (texts.length ? texts : ["", ""]).map(sanitizeSegment);
  const path = segments.join("/");
  const params = new URLSearchParams();
  if (font) params.set("font", font);
  if (textColor) params.set("color", textColor);
  const query = params.toString();
  return `https://api.memegen.link/images/${templateId}/${path}.${extension}${
    query ? `?${query}` : ""
  }`;
};

export default function MemeGenerator({ onShowAdminDashboard: _ }: MemeGeneratorProps) {
  const [_isMobile, setIsMobile] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollTemplates = (direction: 'left' | 'right') => {
    if (templatesRef.current) {
      const scrollAmount = 200;
      const currentScroll = templatesRef.current.scrollLeft;
      const newScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      templatesRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const {
    generatedMeme,
    permanentMemeUrl,
    loading,
    waitingForConfirmation,
    generate,
    resetGeneration
  } = useMemeGeneration();

  const { templates, selectedTemplate, setSelectedTemplate } = useTemplates();

  const { startMinting, resetMinting, isTransactionConfirmed } = useMinting();

  const [texts, setTexts] = useState<string[]>(["", ""]);
  const [font, setFont] = useState("impact");
  const [textColor, setTextColor] = useState("");
  const [extension, setExtension] = useState<"png" | "jpg" | "gif">("png");
  const [showTools, setShowTools] = useState(false);
  const [showShareDownload, setShowShareDownload] = useState(false);

  useEffect(() => {
    if (!selectedTemplate) return;
    const lines = Math.max(selectedTemplate.lines ?? 2, 1);
    setTexts(prev => Array.from({ length: lines }, (_, index) => prev[index] ?? ""));
  }, [selectedTemplate]);

  useEffect(() => {
    if (isTransactionConfirmed) {
      setShowShareDownload(true);
    }
  }, [isTransactionConfirmed]);

  const previewUrl = useMemo(() => {
    if (!selectedTemplate) return null;
    const baseUrl = buildPreviewUrl(selectedTemplate.id, texts, extension, font, textColor);
    // Add cache-busting parameter to ensure color changes are reflected
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }, [selectedTemplate, texts, extension, font, textColor]);

  const handleTextChange = (index: number, value: string) => {
    setTexts(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    setShowShareDownload(false);
    generate(selectedTemplate, texts, startMinting, {
      font,
      textColor,
      extension
    });
  };

  const handleShare = () => {
    if (permanentMemeUrl) {
      shareToImgbb(permanentMemeUrl);
    }
  };

  const handleDownload = () => {
    if (generatedMeme) {
      downloadMeme(generatedMeme);
    }
  };

  const selectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setSelectedTemplate(template);
    resetMinting();
    resetGeneration();
    setShowShareDownload(false);
  };

  const displayImageUrl = generatedMeme ?? (texts.some(t => t.trim()) ? previewUrl : selectedTemplate?.url) ?? null;

  return (
    <div className={styles.memeCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h1 className={styles.cardTitle}>MemeMint – Create Meme</h1>
      </div>

      {/* Preview Section */}
      <section className={styles.previewSection}>
        <div className={styles.preview}>
          <div className={styles.imageContainer}>
            {displayImageUrl ? (
              <Image
                src={displayImageUrl}
                alt={selectedTemplate?.name || "Meme preview"}
                fill
                style={{
                  objectFit: "contain"
                }}
                unoptimized
              />
            ) : (
              <div className={styles.placeholder}>
                <span>Select a template to start</span>
              </div>
            )}
          </div>
        </div>

        {selectedTemplate && (
          <div className={styles.templateInfo}>
            <span className={styles.templateName}>{selectedTemplate.name}</span>
            <span className={styles.templateSize}>
              {selectedTemplate.width}×{selectedTemplate.height}
            </span>
          </div>
        )}
      </section>

      {/* Controls Section */}
      <section className={styles.controlsSection}>
        {/* Template Selection */}
        <div className={styles.templateSection}>
          <label className={styles.sectionLabel}>Template</label>

          <div className={styles.carouselContainer}>
            <button
              type="button"
              className={`${styles.scrollBtn} ${styles.scrollLeft}`}
              onClick={() => scrollTemplates('left')}
              aria-label="Scroll templates left"
            >
              ◀
            </button>

            <div className={styles.templatesCarousel} ref={templatesRef}>
              {templates.map((template, index) => (
                <button
                  type="button"
                  key={`${template.id}-${index}`}
                  className={`${styles.templateCard} ${
                    selectedTemplate?.id === template.id ? styles.selected : ""
                  }`}
                  onClick={() => selectTemplate(template.id)}
                >
                  <div className={styles.imageWrapper}>
                    <Image
                      src={template.url}
                      alt={template.name}
                      width={80}
                      height={60}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      unoptimized
                    />
                  </div>
                  <div className={styles.templateName}>
                    {template.name.length > 12 ? `${template.name.substring(0, 12)}...` : template.name}
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`${styles.scrollBtn} ${styles.scrollRight}`}
              onClick={() => scrollTemplates('right')}
              aria-label="Scroll templates right"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Captions */}
        <div className={styles.captionsSection}>
          <div className={styles.captionsHeader}>
            <div className={styles.captionsGrid}>
              {texts.map((text, index) => (
                <div key={index} className={styles.captionInput}>
                  <label className={styles.inputLabel}>
                    {index === 0 ? "Top text" : "Bottom text"}
                  </label>
                  <input
                    type="text"
                    className={styles.textInput}
                    placeholder={`Enter ${index === 0 ? "top" : "bottom"} text`}
                    value={text}
                    onChange={event => handleTextChange(index, event.target.value)}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.toolsBtn}
              onClick={() => setShowTools(!showTools)}
            >
              ⚙️ Tools
            </button>
          </div>

          {/* Tools Modal */}
          {showTools && (
            <div className={styles.modalOverlay} onClick={() => setShowTools(false)}>
              <div className={styles.toolsModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h4 className={styles.modalTitle}>Meme Settings</h4>
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={() => setShowTools(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.settingsGrid}>
                  <div className={styles.settingGroup}>
                    <label className={styles.inputLabel}>Font</label>
                    <select
                      className={styles.selectInput}
                      value={font}
                      onChange={event => setFont(event.target.value)}
                    >
                      <option value="impact">Impact</option>
                      <option value="titilliumweb">Titillium Web</option>
                      <option value="kalam">Kalam</option>
                      <option value="notosans">Noto Sans</option>
                      <option value="notosanshebrew">Noto Sans Hebrew</option>
                      <option value="hgminchob">HG Mincho</option>
                    </select>
                  </div>

                  <div className={styles.settingGroup}>
                    <label className={styles.inputLabel}>Format</label>
                    <select
                      className={styles.selectInput}
                      value={extension}
                      onChange={event => setExtension(event.target.value as "png" | "jpg" | "gif")}
                    >
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="gif">GIF</option>
                    </select>
                  </div>

                  <div className={styles.settingGroup}>
                    <label className={styles.inputLabel}>Text Color</label>
                    <div className={styles.colorPickerContainer}>
                      <input
                        type="color"
                        value={textColor || "#ffffff"}
                        onChange={(e) => setTextColor(e.target.value)}
                        className={styles.colorInput}
                        title="Choose text color"
                      />
                      <span className={styles.colorValue}>{textColor || "#ffffff"}</span>
                      <button
                        type="button"
                        className={styles.resetColorBtn}
                        onClick={() => setTextColor("")}
                        title="Reset to default"
                      >
                        ↺
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mint Bar */}
        <div className={styles.mintBar}>
          <div className={styles.mintInfo}>
            {selectedTemplate ? (
              <>
                {selectedTemplate.width}×{selectedTemplate.height} · {extension.toUpperCase()} · Network: Base
              </>
            ) : (
              "Select a template to begin"
            )}
          </div>
          <div className={styles.mintActions}>
            <button
              type="button"
              className={styles.mintBtn}
              onClick={handleGenerate}
              disabled={loading || waitingForConfirmation}
            >
              {loading ? "Generating..." : waitingForConfirmation ? "Generating..." : "Generate Meme"}
            </button>
          </div>
        </div>
      </section>

      {/* Share/Download Popup */}
      {showShareDownload && (
        <div className={styles.modalOverlay} onClick={() => setShowShareDownload(false)}>
          <div className={styles.shareModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Meme Generated!</h4>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowShareDownload(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.shareActions}>
              <button
                type="button"
                className={styles.shareBtn}
                onClick={handleShare}
              >
                🔄 Recast
              </button>
              <button
                type="button"
                className={styles.downloadBtn}
                onClick={handleDownload}
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}