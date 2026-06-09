import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "caritas:accessibility-preferences";

export const DEFAULT_FONT_SCALE = 100;
export const MIN_FONT_SCALE = 90;
export const MAX_FONT_SCALE = 120;
export const FONT_SCALE_STEP = 10;

export type AccessibilityPreferences = {
  fontScale: number;
  highContrast: boolean;
  readable: boolean;
};

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontScale: DEFAULT_FONT_SCALE,
  highContrast: false,
  readable: false,
};

function clampFontScale(value: number) {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, value));
}

function readStoredPreferences(): AccessibilityPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<AccessibilityPreferences>;
    const parsedFontScale = Number(parsed.fontScale);

    return {
      fontScale: Number.isFinite(parsedFontScale)
        ? clampFontScale(parsedFontScale)
        : DEFAULT_FONT_SCALE,
      highContrast: parsed.highContrast === true,
      readable: parsed.readable === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    readStoredPreferences,
  );

  useEffect(() => {
    const root = document.documentElement;

    if (preferences.fontScale === DEFAULT_FONT_SCALE) {
      root.style.removeProperty("font-size");
    } else {
      root.style.fontSize = `${preferences.fontScale}%`;
    }

    root.classList.toggle("caritas-high-contrast", preferences.highContrast);
    root.classList.toggle("caritas-readable", preferences.readable);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const canIncreaseFont = preferences.fontScale < MAX_FONT_SCALE;
  const canDecreaseFont = preferences.fontScale > MIN_FONT_SCALE;

  const fontScaleLabel = useMemo(
    () => `${preferences.fontScale}%`,
    [preferences.fontScale],
  );

  const increaseFont = () => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      fontScale: clampFontScale(
        currentPreferences.fontScale + FONT_SCALE_STEP,
      ),
    }));
  };

  const decreaseFont = () => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      fontScale: clampFontScale(
        currentPreferences.fontScale - FONT_SCALE_STEP,
      ),
    }));
  };

  const resetFont = () => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      fontScale: DEFAULT_FONT_SCALE,
    }));
  };

  const toggleHighContrast = () => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      highContrast: !currentPreferences.highContrast,
    }));
  };

  const toggleReadable = () => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      readable: !currentPreferences.readable,
    }));
  };

  const resetAll = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    fontScaleLabel,
    canIncreaseFont,
    canDecreaseFont,
    increaseFont,
    decreaseFont,
    resetFont,
    toggleHighContrast,
    toggleReadable,
    resetAll,
  };
}