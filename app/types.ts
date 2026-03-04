export interface Color {
  id: string;
  hex: string;
  locked: boolean;
}

export interface Palette {
  id: string;
  colors: string[];
  createdAt: number;
}

export type ColorFormat = "hex" | "rgb" | "hsl";

export type HarmonyMode =
  | "random"
  | "analogous"
  | "complementary"
  | "triadic"
  | "split"
  | "monochromatic";
