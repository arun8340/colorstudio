"use client";
import { useEffect, useState, useCallback } from "react";
import { usePalette } from "./hooks/usePalette";
import { useToast } from "./hooks/useToast";
import { HarmonyMode } from "./types";
import ColorColumn from "./components/ColorColumn";
import Toast from "./components/Toast";
import SavedPalettes from "./components/SavedPalettes";
import ExportModal from "./components/ExportModal";
import ImageExtractModal from "./components/ImageExtractModal";
import { isDark, getColorName } from "./utils/color";
import { Color } from "./types";

const HARMONY_MODES: { value: HarmonyMode; label: string; short: string }[] = [
  { value: "random",         label: "Random",         short: "Rnd" },
  { value: "analogous",      label: "Analogous",      short: "Ana" },
  { value: "complementary",  label: "Complementary",  short: "Com" },
  { value: "triadic",        label: "Triadic",        short: "Tri" },
  { value: "split",          label: "Split Comp",     short: "Spl" },
  { value: "monochromatic",  label: "Monochromatic",  short: "Mono" },
];

export default function Home() {
  const {
    colors, savedPalettes, harmonyMode,
    changeHarmony, regenerate, toggleLock, updateColor,
    savePalette, deletePalette, loadPalette,
  } = usePalette();
  const { message, showToast } = useToast();
  const [showExport, setShowExport] = useState(false);
  const [showExtract, setShowExtract] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Spacebar shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        regenerate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [regenerate]);

  // Dark mode persistence
  useEffect(() => {
    if (localStorage.getItem("dark-mode") === "true") setDarkMode(true);
  }, []);

  const toggleDark = () =>
    setDarkMode((prev) => {
      localStorage.setItem("dark-mode", String(!prev));
      return !prev;
    });

  const copyToClipboard = useCallback(
    async (text: string, label = "Copied!") => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(label);
      } catch {
        showToast("Copy failed");
      }
    },
    [showToast]
  );

  const shareUrl = () => {
    const params = new URLSearchParams({
      colors: colors.map((c) => c.hex.slice(1)).join("-"),
    });
    copyToClipboard(`${window.location.origin}?${params}`, "Share link copied!");
  };

  const handleSave = () => {
    savePalette();
    showToast("Palette saved!");
  };

  const handleApplyExtracted = useCallback(
    (hexColors: string[]) => {
      hexColors.forEach((hex, i) => {
        if (colors[i]) updateColor(colors[i].id, hex);
      });
      showToast("Colors extracted!");
    },
    [colors, updateColor, showToast]
  );

  const downloadPalette = useCallback(() => {
    const W = 1400, H = 420;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const colW = W / colors.length;

    colors.forEach((color: Color, i: number) => {
      const x = i * colW;
      ctx.fillStyle = color.hex;
      ctx.fillRect(x, 0, colW, H);

      const dark = isDark(color.hex);
      const textFg = dark ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.85)";
      const nameFg = dark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)";

      // Color name
      ctx.fillStyle = nameFg;
      ctx.font = "600 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(getColorName(color.hex).toUpperCase(), x + colW / 2, H / 2 - 22);

      // Hex value
      ctx.fillStyle = textFg;
      ctx.font = "700 26px monospace";
      ctx.fillText(color.hex.toUpperCase(), x + colW / 2, H / 2 + 14);
    });

    const link = document.createElement("a");
    link.download = "palette.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Palette downloaded!");
  }, [colors, showToast]);

  const gradientStyle =
    colors.length > 0
      ? `linear-gradient(to right, ${colors.map((c) => c.hex).join(", ")})`
      : "linear-gradient(to right, #ccc, #999)";

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex flex-col h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="flex items-center gap-3 px-5 py-3 bg-zinc-950 border-b border-zinc-800 shrink-0">

          {/* Logo */}
          <div className="flex items-center gap-2 mr-2 shrink-0">
            <PaletteLogo colors={colors} />
            <span className="text-sm font-semibold text-white tracking-tight">palette</span>
          </div>

          {/* Harmony mode — desktop pills */}
          <div className="hidden md:flex items-center gap-0.5 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            {HARMONY_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => changeHarmony(m.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  harmonyMode === m.value
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Harmony mode — mobile select */}
          <select
            value={harmonyMode}
            onChange={(e) => changeHarmony(e.target.value as HarmonyMode)}
            className="md:hidden text-xs font-semibold bg-zinc-900 text-zinc-200 border border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          >
            {HARMONY_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Space hint — hidden on mobile */}
            <span className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-600 mr-2">
              <kbd className="bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded text-[10px] font-mono">Space</kbd>
              to generate
            </span>

            <IconBtn onClick={handleSave} title="Save palette">
              <SaveIcon />
            </IconBtn>
            <IconBtn onClick={() => setShowExport(true)} title="Export palette">
              <ExportIcon />
            </IconBtn>
            <IconBtn onClick={shareUrl} title="Share palette">
              <ShareIcon />
            </IconBtn>
            <IconBtn onClick={() => setShowExtract(true)} title="Extract colors from image">
              <ImageIcon />
            </IconBtn>
            <IconBtn onClick={downloadPalette} title="Download palette as PNG">
              <DownloadImageIcon />
            </IconBtn>

            {/* Generate CTA */}
            <button
              onClick={() => regenerate()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-bold transition-colors duration-150 shadow-sm"
            >
              <RefreshIcon />
              Generate
            </button>

            <IconBtn onClick={toggleDark} title="Toggle dark mode">
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </IconBtn>
          </div>
        </header>

        {/* ── Gradient strip ────────────────────────────────────────── */}
        <div
          className="h-1 shrink-0 transition-all duration-700"
          style={{ background: gradientStyle }}
        />

        {/* ── Color columns ─────────────────────────────────────────── */}
        <main className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden">
          {colors.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="color-col bg-zinc-800 animate-pulse" />
              ))
            : colors.map((color) => (
                <ColorColumn
                  key={color.id}
                  color={color}
                  onToggleLock={toggleLock}
                  onCopy={(text) => copyToClipboard(text, "Copied!")}
                  onColorChange={updateColor}
                />
              ))}
        </main>

        {/* ── Saved palettes ────────────────────────────────────────── */}
        <div className="overflow-y-auto max-h-72 shrink-0">
          <SavedPalettes
            palettes={savedPalettes}
            onLoad={(p) => { loadPalette(p); showToast("Palette loaded!"); }}
            onDelete={deletePalette}
            onCopyAll={(hexes) => copyToClipboard(hexes.join(", "), "All colors copied!")}
          />
        </div>
      </div>

      {showExtract && (
        <ImageExtractModal
          onApply={handleApplyExtracted}
          onClose={() => setShowExtract(false)}
        />
      )}

      {showExport && (
        <ExportModal
          colors={colors}
          onClose={() => setShowExport(false)}
          onCopy={(text, label) => { copyToClipboard(text, label); setShowExport(false); }}
        />
      )}

      <Toast message={message} />
    </div>
  );
}

// ── Dynamic logo — mirrors the live palette colors ─────────────────────────
const FALLBACK = ["#E11D48", "#F97316", "#EAB308", "#10B981", "#6366F1"];

function PaletteLogo({ colors }: { colors: { hex: string }[] }) {
  const swatches = colors.length === 5 ? colors.map((c) => c.hex) : FALLBACK;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="shrink-0">
      <defs>
        <clipPath id="logo-clip">
          <rect width="26" height="26" rx="6" ry="6" />
        </clipPath>
      </defs>
      <g clipPath="url(#logo-clip)">
        {swatches.map((hex, i) => (
          <rect
            key={i}
            x={i * 5.2}
            y={0}
            width={5.2}
            height={26}
            fill={hex}
            style={{ transition: "fill 0.5s ease" }}
          />
        ))}
      </g>
    </svg>
  );
}

// ── Small icon button ──────────────────────────────────────────────────────
function IconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors duration-150"
    >
      {children}
    </button>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────
function SaveIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z" />
    </svg>
  );
}
function ExportIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
function DownloadImageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
    </svg>
  );
}
