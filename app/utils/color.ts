import { ColorFormat, HarmonyMode } from "../types";

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateRandomColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 35) + 55;
  const l = Math.floor(Math.random() * 30) + 35;
  return hslToHex(h, s, l);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

export function isDark(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r1: h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) / 6; break;
    case g1: h = ((b1 - r1) / d + 2) / 6; break;
    default:  h = ((r1 - g1) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function formatColor(hex: string, format: ColorFormat): string {
  switch (format) {
    case "hex": return hex.toUpperCase();
    case "rgb": {
      const { r, g, b } = hexToRgb(hex);
      return `rgb(${r}, ${g}, ${b})`;
    }
    case "hsl": {
      const { h, s, l } = hexToHsl(hex);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  }
}

export function generateHarmony(mode: HarmonyMode): string[] {
  const h = Math.random() * 360;
  const s = 55 + Math.random() * 28;
  const l = 38 + Math.random() * 22;
  switch (mode) {
    case "analogous":
      return [-40, -20, 0, 20, 40].map((o) => hslToHex((h + o + 360) % 360, s, l));
    case "complementary": {
      const c = (h + 180) % 360;
      return [
        hslToHex(h, s, l + 12),
        hslToHex(h, s, l),
        hslToHex(h, s, l - 12),
        hslToHex(c, s, l),
        hslToHex(c, s, l + 12),
      ];
    }
    case "triadic": {
      const h2 = (h + 120) % 360, h3 = (h + 240) % 360;
      return [
        hslToHex(h, s, l),
        hslToHex(h2, s, l + 8),
        hslToHex(h2, s, l - 6),
        hslToHex(h3, s, l),
        hslToHex(h3, s, l + 8),
      ];
    }
    case "split": {
      const s1 = (h + 150) % 360, s2 = (h + 210) % 360;
      return [
        hslToHex(h, s, l),
        hslToHex(h, s, l + 14),
        hslToHex(s1, s, l),
        hslToHex(s2, s, l),
        hslToHex(s2, s, l + 14),
      ];
    }
    case "monochromatic":
      return [20, 34, 48, 61, 74].map((li) => hslToHex(h, s, li));
    default:
      return Array.from({ length: 5 }, generateRandomColor);
  }
}

// Named color database for nearest-color lookup
const COLOR_NAMES: [string, number, number, number][] = [
  ["Red", 255, 0, 0], ["Crimson", 220, 20, 60], ["Scarlet", 255, 36, 0],
  ["Ruby", 155, 17, 30], ["Maroon", 128, 0, 0], ["Wine", 114, 47, 55],
  ["Burgundy", 128, 0, 32], ["Coral", 255, 127, 80], ["Tomato", 255, 99, 71],
  ["Salmon", 250, 128, 114], ["Sienna", 160, 82, 45], ["Rust", 183, 65, 14],
  ["Terracotta", 226, 114, 91], ["Clay", 163, 117, 74], ["Orange", 255, 165, 0],
  ["Tangerine", 242, 133, 0], ["Pumpkin", 255, 117, 24], ["Amber", 255, 191, 0],
  ["Apricot", 251, 206, 177], ["Peach", 255, 218, 185], ["Gold", 255, 215, 0],
  ["Yellow", 255, 255, 0], ["Lemon", 255, 247, 0], ["Goldenrod", 218, 165, 32],
  ["Khaki", 195, 176, 145], ["Cream", 255, 253, 208], ["Champagne", 247, 231, 206],
  ["Lime", 50, 205, 50], ["Chartreuse", 127, 255, 0], ["Olive", 128, 128, 0],
  ["Green", 0, 128, 0], ["Emerald", 80, 200, 120], ["Mint", 152, 255, 152],
  ["Sage", 143, 188, 143], ["Forest", 34, 139, 34], ["Jade", 0, 168, 107],
  ["Seafoam", 120, 201, 156], ["Teal", 0, 128, 128], ["Cyan", 0, 255, 255],
  ["Aquamarine", 127, 255, 212], ["Turquoise", 64, 224, 208], ["Sky Blue", 135, 206, 235],
  ["Cornflower", 100, 149, 237], ["Steel Blue", 70, 130, 180], ["Azure", 0, 127, 255],
  ["Cerulean", 0, 123, 167], ["Denim", 21, 96, 189], ["Blue", 0, 0, 255],
  ["Royal Blue", 65, 105, 225], ["Cobalt", 0, 71, 171], ["Navy", 0, 0, 128],
  ["Indigo", 75, 0, 130], ["Ultramarine", 18, 10, 143], ["Periwinkle", 204, 204, 255],
  ["Lavender", 230, 230, 250], ["Lilac", 200, 162, 200], ["Violet", 238, 130, 238],
  ["Purple", 128, 0, 128], ["Amethyst", 153, 102, 204], ["Plum", 221, 160, 221],
  ["Mauve", 224, 176, 255], ["Orchid", 218, 112, 214], ["Magenta", 255, 0, 255],
  ["Fuchsia", 255, 0, 128], ["Hot Pink", 255, 105, 180], ["Rose", 255, 0, 127],
  ["Pink", 255, 192, 203], ["Berry", 153, 0, 102], ["Raspberry", 227, 11, 93],
  ["Brown", 165, 42, 42], ["Chocolate", 210, 105, 30], ["Copper", 184, 115, 51],
  ["Bronze", 205, 127, 50], ["Tan", 210, 180, 140], ["Sand", 194, 178, 128],
  ["Taupe", 72, 60, 50], ["Bone", 227, 218, 201], ["Beige", 245, 245, 220],
  ["Ivory", 255, 255, 240], ["White", 255, 255, 255], ["Silver", 192, 192, 192],
  ["Gray", 128, 128, 128], ["Slate", 112, 128, 144], ["Charcoal", 54, 69, 79],
  ["Graphite", 41, 41, 41], ["Black", 0, 0, 0],
];

function relativeLuminance(r: number, g: number, b: number): number {
  return [r, g, b]
    .map((c) => { const n = c / 255; return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; })
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
}

export type ContrastLevel = "AAA" | "AA" | "fail";

export function getContrastLevel(hex: string): { ratio: number; level: ContrastLevel } {
  const { r, g, b } = hexToRgb(hex);
  const lum = relativeLuminance(r, g, b);
  const vsWhite = 1.05 / (lum + 0.05);
  const vsBlack = (lum + 0.05) / 0.05;
  const ratio = Math.max(vsWhite, vsBlack);
  return {
    ratio: Math.round(ratio * 10) / 10,
    level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "fail",
  };
}

export function getColorName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  let minDist = Infinity, closest = "Unknown";
  for (const [name, nr, ng, nb] of COLOR_NAMES) {
    const d = (r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2;
    if (d < minDist) { minDist = d; closest = name; }
  }
  return closest;
}
