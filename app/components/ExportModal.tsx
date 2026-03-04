"use client";
import { useState } from "react";
import { Color } from "../types";

interface ExportModalProps {
  colors: Color[];
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
}

type Format = "css" | "tailwind";

export default function ExportModal({ colors, onClose, onCopy }: ExportModalProps) {
  const [format, setFormat] = useState<Format>("css");

  const cssVars = colors
    .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
    .join("\n");
  const cssOutput = `:root {\n${cssVars}\n}`;

  const tailwindColors = colors
    .map((c, i) => `      'palette-${i + 1}': '${c.hex}',`)
    .join("\n");
  const tailwindOutput = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${tailwindColors}\n      },\n    },\n  },\n};`;

  const output = format === "css" ? cssOutput : tailwindOutput;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Export Palette</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Format tabs */}
          <div className="flex gap-2 mb-4">
            {(["css", "tailwind"] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  format === f
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {f === "css" ? "CSS Variables" : "Tailwind Config"}
              </button>
            ))}
          </div>

          {/* Code preview */}
          <pre className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
            {output}
          </pre>

          {/* Copy button */}
          <button
            onClick={() => onCopy(output, format === "css" ? "CSS copied!" : "Tailwind config copied!")}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
