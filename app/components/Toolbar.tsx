"use client";

import { useState } from "react";

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
    <div className="flex flex-col gap-4">
      <section className="p-4 bg-section-bg rounded-2xl border border-slate-400/12 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-[24px] sm:p-3">
        <header 
          className={`flex items-start justify-between mb-0 gap-4 p-4 cursor-pointer transition-all duration-200 ease-out select-none hover:bg-blue-400/6 hover:rounded-xl lg:flex-col lg:items-start ${openSection === "caption" ? "mb-5" : ""}`}
          onClick={() => toggleSection("caption")}
        >
          <div>
            <h3 className="text-xl font-bold -tracking-wider m-0 text-slate-50">
              {openSection === "caption" ? "▼" : "▶"} Caption
            </h3>
            <p className="mt-1 mb-0 text-sm text-slate-200/75">Dial in your punchlines. Short lines work best.</p>
          </div>
        </header>

        {openSection === "caption" && (
          <div className="animate-slideDown overflow-hidden">
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-1">
          {texts.map((text, index) => (
            <div key={index} className="p-4 rounded-2xl bg-slate-900/55 border border-blue-400/15 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200/8">Line {index + 1}</span>
                <div className="flex gap-1 flex-wrap sm:w-full sm:justify-start">
                  {TEXT_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      className="border border-slate-500/65 rounded-full px-3.5 py-1.5 bg-slate-700/65 text-slate-200/9 text-xs font-semibold tracking-wider cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-400/7 hover:bg-blue-900/55 hover:text-slate-50"
                      onClick={() => handleTextPreset(index, preset.action)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                className="w-full min-h-[68px] rounded-xl border border-blue-400/18 bg-slate-900/75 text-slate-50 p-3.5 text-sm leading-relaxed resize-vertical transition-all duration-200 ease-out focus:outline-none focus:border-blue-400/6 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.25)]"
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

      <section className="p-4 bg-section-bg rounded-2xl border border-slate-400/12 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-[24px] sm:p-3">
        <header 
          className={`flex items-start justify-between mb-0 gap-4 p-4 cursor-pointer transition-all duration-200 ease-out select-none hover:bg-blue-400/6 hover:rounded-xl lg:flex-col lg:items-start ${openSection === "styling" ? "mb-5" : ""}`}
          onClick={() => toggleSection("styling")}
        >
          <div>
            <h3 className="text-xl font-bold -tracking-wider m-0 text-slate-50">
              {openSection === "styling" ? "▼" : "▶"} Styling
            </h3>
            <p className="mt-1 mb-0 text-sm text-slate-200/75">Switch fonts, backgrounds, and export formats.</p>
          </div>
        </header>

        {openSection === "styling" && (
          <div className="animate-slideDown overflow-hidden">
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))] sm:grid-cols-1">
          <div className="p-4 rounded-2xl bg-slate-900/55 border border-blue-400/15 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200/8">Font</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FONT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`border border-slate-500/65 rounded-full px-3.5 py-1.5 bg-slate-700/65 text-slate-200/9 text-xs font-semibold tracking-wider cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-400/7 hover:bg-blue-900/55 hover:text-slate-50 ${font === option.value ? "border-blue-400/95 bg-gradient-to-br from-blue-400/55 to-purple-400/55 text-slate-50 shadow-[0_10px_24px_rgba(79,70,229,0.35)]" : ""}`}
                  onClick={() => setFont(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/55 border border-blue-400/15 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200/8">Background</span>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                aria-label="Pick background color"
                value={background || "#000000"}
                onChange={event => setBackground(event.target.value)}
                className="w-12 h-12 rounded-xl border border-blue-400/25 bg-transparent cursor-pointer p-0"
              />
              <input
                type="text"
                className="flex-1 rounded-xl border border-slate-500/65 bg-slate-900/7 text-slate-200 p-2.5 text-sm focus:outline-none focus:border-blue-400/65 focus:shadow-[0_0_0_2px_rgba(96,165,250,0.2)]"
                placeholder="hex or name"
                value={background}
                onChange={event => setBackground(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_PRESETS.map(option => (
                <button
                  key={option.label}
                  type="button"
                  className={`border border-slate-500/65 rounded-full px-3.5 py-1.5 bg-slate-700/65 text-slate-200/9 text-xs font-semibold tracking-wider cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-400/7 hover:bg-blue-900/55 hover:text-slate-50 ${background === option.value ? "border-blue-400/95 bg-gradient-to-br from-blue-400/55 to-purple-400/55 text-slate-50 shadow-[0_10px_24px_rgba(79,70,229,0.35)]" : ""}`}
                  onClick={() => setBackground(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/55 border border-blue-400/15 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200/8">Format</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXTENSION_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`border border-slate-500/65 rounded-full px-3.5 py-1.5 bg-slate-700/65 text-slate-200/9 text-xs font-semibold tracking-wider cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-400/7 hover:bg-blue-900/55 hover:text-slate-50 ${extension === option.value ? "border-blue-400/95 bg-gradient-to-br from-blue-400/55 to-purple-400/55 text-slate-50 shadow-[0_10px_24px_rgba(79,70,229,0.35)]" : ""}`}
                  onClick={() => setExtension(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-1 mb-0 text-xs text-slate-400/85">PNG keeps transparency, GIF renders animated templates.</p>
          </div>
            </div>
          </div>
        )}
      </section>

      <footer className="p-6 bg-gradient-to-br from-blue-400/18 to-purple-400/25 rounded-[20px] border border-slate-400/2 shadow-[0_18px_40px_rgba(37,99,235,0.25)]">
        <div className="flex flex-wrap gap-4 justify-between items-center lg:flex-col lg:items-stretch">
          <button
            type="button"
            className={`inline-flex items-center justify-center gap-2.5 bg-gradient-to-br from-blue-400 to-purple-500 border-none rounded-2xl p-3.5 text-base font-bold text-slate-50 tracking-wider cursor-pointer shadow-[0_16px_32px_rgba(99,102,241,0.35)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(79,70,229,0.4)] sm:w-full ${loading || waitingForConfirmation ? "opacity-65 cursor-not-allowed shadow-none" : ""}`}
            onClick={generate}
            disabled={loading || waitingForConfirmation}
          >
            <span className="text-xl">⚡</span>
            <span>
              {loading ? "Generating" : waitingForConfirmation ? "Generating" : "Generate"}
            </span>
          </button>

          {generatedMeme && showShareDownload ? (
            <div className="flex gap-3 flex-wrap lg:w-full lg:justify-between sm:flex-col">
              <button type="button" className="bg-slate-900/75 text-slate-200/95 rounded-xl border border-blue-400/35 p-3.5 text-sm font-semibold cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-purple-400/7 lg:flex-1 lg:text-center sm:w-full" onClick={shareToImgbb}>
                <span>🔁 Recast</span>
              </button>
              <button type="button" className="bg-slate-900/75 text-slate-200/95 rounded-xl border border-blue-400/35 p-3.5 text-sm font-semibold cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-purple-400/7 lg:flex-1 lg:text-center sm:w-full" onClick={downloadMeme}>
                <span>💾 Download</span>
              </button>
            </div>
          ) : null}
        </div>
      </footer>
    </div>
  );
}