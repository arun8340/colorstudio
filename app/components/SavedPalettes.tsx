"use client";
import { Palette } from "../types";

interface SavedPalettesProps {
  palettes: Palette[];
  onLoad: (palette: Palette) => void;
  onDelete: (id: string) => void;
  onCopyAll: (colors: string[]) => void;
}

export default function SavedPalettes({ palettes, onLoad, onDelete, onCopyAll }: SavedPalettesProps) {
  if (palettes.length === 0) return null;

  return (
    <section className="bg-zinc-950 border-t border-zinc-800 px-6 py-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-4">
        Saved Palettes
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {palettes.map((palette) => (
          <div
            key={palette.id}
            className="group relative rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
            onClick={() => onLoad(palette)}
          >
            {/* Color strip */}
            <div className="flex h-14">
              {palette.colors.map((hex, i) => (
                <div key={i} className="flex-1 transition-all duration-300" style={{ backgroundColor: hex }} />
              ))}
            </div>

            {/* Hex codes overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
              {palette.colors.map((hex, i) => (
                <span key={i} className="text-[7px] font-mono font-bold text-white/90 rotate-90 tracking-tight">
                  {hex.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900">
              <span className="text-[10px] text-zinc-500 font-medium">
                {new Date(palette.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={(e) => { e.stopPropagation(); onCopyAll(palette.colors); }}
                  title="Copy all hex values"
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <CopyIcon />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(palette.id); }}
                  title="Delete palette"
                  className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}
