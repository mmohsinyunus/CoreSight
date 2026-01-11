import { useEffect, useState } from "react"
import {
  applyUiPreferences,
  getUiPreferences,
  setUiPreferences,
  uiFontOptions,
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

  const updateFont = (nextFont: (typeof uiFontOptions)[number]["value"]) => {
    const next = { ...preferences, font: nextFont }
    setPreferences(next)
    setUiPreferences(next)
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: compact ? 12 : 13, fontWeight: 700 }}>
        Font
        <select
          className="cs-select"
          value={preferences.font}
          onChange={(event) => updateFont(event.target.value as (typeof uiFontOptions)[number]["value"])}
          style={{ height: compact ? 32 : 38, paddingInline: 8, fontSize: compact ? 12 : 13 }}
        >
          {uiFontOptions.map((option) => (
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
