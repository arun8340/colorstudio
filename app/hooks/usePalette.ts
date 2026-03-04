"use client";
import { useState, useCallback, useEffect } from "react";
import { Color, Palette, HarmonyMode } from "../types";
import { generateRandomColor, generateHarmony } from "../utils/color";

const PALETTE_COUNT = 5;
const STORAGE_KEY = "saved-palettes";

function createColor(hex?: string): Color {
  return {
    id: crypto.randomUUID(),
    hex: hex ?? generateRandomColor(),
    locked: false,
  };
}

export function usePalette() {
  const [colors, setColors] = useState<Color[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<Palette[]>([]);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>("random");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("colors");
    if (shared) {
      const hexes = shared.split("-").slice(0, PALETTE_COUNT);
      if (hexes.every((h) => /^[0-9a-fA-F]{6}$/.test(h))) {
        setColors(hexes.map((h) => createColor(`#${h}`)));
        return;
      }
    }
    setColors(Array.from({ length: PALETTE_COUNT }, () => createColor()));
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedPalettes(JSON.parse(stored));
    } catch {}
  }, []);

  const regenerate = useCallback(
    (mode?: HarmonyMode) => {
      const active = mode ?? harmonyMode;
      if (active === "random") {
        setColors((prev) =>
          prev.map((c) => (c.locked ? c : { ...createColor(), id: c.id }))
        );
      } else {
        const harmony = generateHarmony(active);
        setColors((prev) =>
          prev.map((c, i) => (c.locked ? c : { ...createColor(harmony[i]), id: c.id }))
        );
      }
    },
    [harmonyMode]
  );

  const changeHarmony = useCallback(
    (mode: HarmonyMode) => {
      setHarmonyMode(mode);
      regenerate(mode);
    },
    [regenerate]
  );

  const toggleLock = useCallback((id: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
    );
  }, []);

  const updateColor = useCallback((id: string, hex: string) => {
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, hex } : c)));
  }, []);

  const savePalette = useCallback(() => {
    const palette: Palette = {
      id: crypto.randomUUID(),
      colors: colors.map((c) => c.hex),
      createdAt: Date.now(),
    };
    setSavedPalettes((prev) => {
      const updated = [palette, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [colors]);

  const deletePalette = useCallback((id: string) => {
    setSavedPalettes((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const loadPalette = useCallback((palette: Palette) => {
    setColors(palette.colors.map((hex) => createColor(hex)));
  }, []);

  return {
    colors,
    savedPalettes,
    harmonyMode,
    changeHarmony,
    regenerate,
    toggleLock,
    updateColor,
    savePalette,
    deletePalette,
    loadPalette,
  };
}
