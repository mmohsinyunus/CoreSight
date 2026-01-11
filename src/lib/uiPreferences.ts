import { readStorage, writeStorage } from "./storage"

export type ThemeMode = "dark" | "light"
export type FontChoice = "inter" | "system" | "serif"
export type FontScaleChoice = "sm" | "md" | "lg" | "xl"

export type UiPreferences = {
  theme: ThemeMode
  font: FontChoice
  fontScale: FontScaleChoice
}

const STORAGE_KEY = "coresight_ui_preferences"

const FONT_STACKS: Record<FontChoice, string> = {
  inter:
    "Inter, 'Segoe UI', system-ui, -apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
  system:
    "system-ui, -apple-system, 'Segoe UI', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
  serif: "'Iowan Old Style', 'Times New Roman', Times, serif",
}

const defaultPreferences: UiPreferences = {
  theme: "dark",
  font: "inter",
  fontScale: "md",
}

export function getUiPreferences(): UiPreferences {
  const stored = readStorage<UiPreferences | null>(STORAGE_KEY, null)
  if (!stored) return defaultPreferences
  return {
    theme: stored.theme === "light" ? "light" : "dark",
    font: stored.font in FONT_STACKS ? stored.font : defaultPreferences.font,
    fontScale: stored.fontScale in FONT_SCALES ? stored.fontScale : defaultPreferences.fontScale,
  }
}

export function applyUiPreferences(preferences: UiPreferences) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.dataset.theme = preferences.theme
  root.style.setProperty("--font-family", FONT_STACKS[preferences.font])
  root.style.setProperty("--font-scale", String(FONT_SCALES[preferences.fontScale]))
}

export function setUiPreferences(preferences: UiPreferences) {
  writeStorage(STORAGE_KEY, preferences)
  applyUiPreferences(preferences)
}

export const uiFontOptions = [
  { value: "inter" as const, label: "Inter" },
  { value: "system" as const, label: "System" },
  { value: "serif" as const, label: "Serif" },
]

const FONT_SCALES: Record<FontScaleChoice, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.1,
  xl: 1.2,
}

export const uiFontScaleOptions = [
  { value: "sm" as const, label: "A-" },
  { value: "md" as const, label: "A" },
  { value: "lg" as const, label: "A+" },
  { value: "xl" as const, label: "A++" },
]
