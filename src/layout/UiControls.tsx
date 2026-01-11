import { useEffect, useState } from "react"
import {
  applyUiPreferences,
  getUiPreferences,
  setUiPreferences,
  uiFontScaleOptions,
  type ThemeMode,
} from "../lib/uiPreferences"

export default function UiControls({ compact = false }: { compact?: boolean }) {
  const [preferences, setPreferences] = useState(getUiPreferences)

  useEffect(() => {
    applyUiPreferences(preferences)
  }, [preferences])

  const updateTheme = (nextTheme: ThemeMode) => {
    const next = { ...preferences, theme: nextTheme }
    setPreferences(next)
    setUiPreferences(next)
  }

  const updateFontScale = (nextFontScale: (typeof uiFontScaleOptions)[number]["value"]) => {
    const next = { ...preferences, fontScale: nextFontScale }
    setPreferences(next)
    setUiPreferences(next)
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: compact ? 12 : 13, fontWeight: 700 }}>
        Text size
        <select
          className="cs-select"
          value={preferences.fontScale}
          onChange={(event) => updateFontScale(event.target.value as (typeof uiFontScaleOptions)[number]["value"])}
          style={{ height: compact ? 32 : 38, paddingInline: 8, fontSize: compact ? 12 : 13 }}
        >
          {uiFontScaleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        className="cs-btn"
        style={{ height: compact ? 32 : 38, paddingInline: 12, fontSize: compact ? 12 : 13 }}
        onClick={() => updateTheme(preferences.theme === "dark" ? "light" : "dark")}
      >
        {preferences.theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
    </div>
  )
}
