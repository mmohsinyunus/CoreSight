import { readStorage, writeStorage } from "./storage"

export type ThemeMode = "dark" | "light"
export type FontChoice = "inter" | "system" | "serif"

export type UiPreferences = {
  theme: ThemeMode
  font: FontChoice
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
}

export function getUiPreferences(): UiPreferences {
  const stored = readStorage<UiPreferences | null>(STORAGE_KEY, null)
  if (!stored) return defaultPreferences
  return {
    theme: stored.theme === "light" ? "light" : "dark",
    font: stored.font in FONT_STACKS ? stored.font : defaultPreferences.font,
  }
}

export function applyUiPreferences(preferences: UiPreferences) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.dataset.theme = preferences.theme
  root.style.setProperty("--font-family", FONT_STACKS[preferences.font])
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
