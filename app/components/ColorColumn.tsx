"use client";
import { useState, useRef } from "react";
import { Color, ColorFormat } from "../types";
import { isDark, formatColor, getColorName, getContrastLevel } from "../utils/color";

interface ColorColumnProps {
  color: Color;
  onToggleLock: (id: string) => void;
  onCopy: (text: string) => void;
  onColorChange: (id: string, hex: string) => void;
}

const FORMATS: ColorFormat[] = ["hex", "rgb", "hsl"];

export default function ColorColumn({ color, onToggleLock, onCopy, onColorChange }: ColorColumnProps) {
  const [format, setFormat] = useState<ColorFormat>("hex");
  const pickerRef = useRef<HTMLInputElement>(null);
  const dark = isDark(color.hex);

  const fg = dark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.95)";
  const fgMuted = dark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.48)";
  const pillBg = dark ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)";
  const btnHover = dark ? "hover:bg-black/10 active:bg-black/20" : "hover:bg-white/10 active:bg-white/20";

  const displayed = formatColor(color.hex, format);
  const contrast = getContrastLevel(color.hex);

  const contrastColor = {
    AAA: dark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
    AA:  dark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
    fail: dark ? "rgba(180,0,0,0.7)" : "rgba(255,120,120,0.8)",
  }[contrast.level];

  return (
    <div
      className="color-col relative flex flex-col items-center justify-center group"
      style={{ backgroundColor: color.hex }}
    >
      {/* WCAG contrast badge — top left */}
      <div
        className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: pillBg }}
      >
        <span className="text-[10px] font-bold tracking-wide" style={{ color: contrastColor }}>
          {contrast.level === "fail" ? `${contrast.ratio}:1` : contrast.level}
        </span>
        {contrast.level !== "fail" && (
          <span className="text-[10px]" style={{ color: contrastColor }}>✓</span>
        )}
      </div>

      {/* Lock button — top right */}
      <button
        onClick={() => onToggleLock(color.id)}
        title={color.locked ? "Unlock color" : "Lock color"}
        className={`absolute top-4 right-4 p-2.5 rounded-2xl transition-all duration-200 ${btnHover} ${
          color.locked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ color: fg }}
      >
        {color.locked ? <LockClosedIcon /> : <LockOpenIcon />}
      </button>

      {/* Center content */}
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        {/* Color name */}
        <p
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: fgMuted }}
        >
          {getColorName(color.hex)}
        </p>

        {/* Color value — click to copy */}
        <button
          onClick={() => onCopy(displayed)}
          title={`Copy ${format.toUpperCase()} value`}
          className={`font-mono font-semibold rounded-xl px-3 py-1.5 transition-all duration-150 ${btnHover}`}
          style={{
            color: fg,
            fontSize: format === "hex" ? "1.2rem" : "0.9rem",
            letterSpacing: format === "hex" ? "0.08em" : "0.01em",
          }}
        >
          {displayed}
        </button>

        {/* Format pills */}
        <div
          className="flex items-center gap-0.5 rounded-xl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: pillBg }}
        >
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all duration-150"
              style={{
                color: fg,
                background: format === f ? pillBg : "transparent",
                opacity: format === f ? 1 : 0.5,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker — bottom left */}
      <input
        ref={pickerRef}
        type="color"
        value={color.hex}
        onChange={(e) => onColorChange(color.id, e.target.value)}
        className="sr-only"
      />
      <button
        onClick={() => pickerRef.current?.click()}
        title="Pick custom color"
        className={`absolute bottom-4 left-4 p-2.5 rounded-2xl transition-all duration-200 ${btnHover} opacity-0 group-hover:opacity-100`}
        style={{ color: fg }}
      >
        <PenIcon />
      </button>
    </div>
  );
}

function LockClosedIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );
}

function LockOpenIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  );
}
