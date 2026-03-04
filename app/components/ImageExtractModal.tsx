"use client";
import { useState, useCallback, useRef } from "react";

interface ImageExtractModalProps {
  onApply: (hexColors: string[]) => void;
  onClose: () => void;
}

// ── K-means color extraction ──────────────────────────────────────────────────

type RGB = [number, number, number];

function colorDist([r1, g1, b1]: RGB, [r2, g2, b2]: RGB): number {
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

function rgbToHex([r, g, b]: RGB): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function kMeansExtract(imageData: ImageData, k = 5): string[] {
  const pixels: RGB[] = [];
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4 * 4) {
    if (data[i + 3] < 128) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (pixels.length < k) return [];

  // K-means++ initialisation
  const centroids: RGB[] = [pixels[Math.floor(Math.random() * pixels.length)]];
  while (centroids.length < k) {
    const dists = pixels.map((p) => Math.min(...centroids.map((c) => colorDist(p, c))));
    const total = dists.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < pixels.length; i++) {
      rand -= dists[i];
      if (rand <= 0) { centroids.push(pixels[i]); break; }
    }
  }

  // 15 iterations
  for (let iter = 0; iter < 15; iter++) {
    const sums: [number, number, number][] = Array.from({ length: k }, () => [0, 0, 0]);
    const counts = new Array<number>(k).fill(0);
    for (const p of pixels) {
      let minD = Infinity, nearest = 0;
      for (let j = 0; j < k; j++) {
        const d = colorDist(p, centroids[j]);
        if (d < minD) { minD = d; nearest = j; }
      }
      sums[nearest][0] += p[0];
      sums[nearest][1] += p[1];
      sums[nearest][2] += p[2];
      counts[nearest]++;
    }
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        centroids[j] = [
          Math.round(sums[j][0] / counts[j]),
          Math.round(sums[j][1] / counts[j]),
          Math.round(sums[j][2] / counts[j]),
        ];
      }
    }
  }

  return centroids.map(rgbToHex);
}

async function extractFromFile(file: File, k = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const MAX = 200;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(img.width * scale));
        canvas.height = Math.max(1, Math.floor(img.height * scale));
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(kMeansExtract(imageData, k));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImageExtractModal({ onApply, onClose }: ImageExtractModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setExtracted([]);
    setLoading(true);
    try {
      const colors = await extractFromFile(file);
      setExtracted(colors);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setExtracted([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="font-semibold text-white text-sm">Extract from Image</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Upload any photo to pull dominant colors</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          {!imageUrl ? (
            /* Drop zone */
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 h-52 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                dragging
                  ? "border-white/40 bg-white/5"
                  : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <ImageIcon />
              </div>
              <div className="text-center">
                <p className="text-zinc-300 text-sm font-medium">Drop an image here</p>
                <p className="text-zinc-600 text-xs mt-0.5">or click to browse · JPG, PNG, WebP</p>
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={onFileChange} />
            </div>
          ) : (
            /* Preview + extracted colors */
            <div className="flex flex-col gap-5">
              <div className="flex gap-4 items-start">
                {/* Image thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-32 h-32 object-cover rounded-xl border border-zinc-700 shrink-0"
                />

                {/* Extracted swatches */}
                <div className="flex-1">
                  <p className="text-zinc-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    {loading ? "Extracting colors…" : "Dominant Colors"}
                  </p>
                  {loading ? (
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-1 h-20 rounded-xl bg-zinc-800 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {extracted.map((hex, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-1">
                          <div
                            className="h-20 rounded-xl border border-white/10 shadow-md"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="text-center text-[9px] font-mono text-zinc-500 uppercase tracking-wide">
                            {hex}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Try another
                </button>
                <button
                  onClick={() => { onApply(extracted); onClose(); }}
                  disabled={loading || extracted.length === 0}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-zinc-100 text-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply Palette →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageIcon() {
  return (
    <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}
