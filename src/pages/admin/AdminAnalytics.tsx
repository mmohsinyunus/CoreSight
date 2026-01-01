import AppShell from "../../layout/AppShell"
import { adminNav } from "../../navigation/adminNav"
import type { CSSProperties } from "react"

const card: CSSProperties = {
  borderRadius: 16,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.03)",
  padding: 16,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
}

const tile: CSSProperties = {
  borderRadius: 14,
  border: "1px solid var(--border)",
  padding: 14,
  background: "var(--surface)",
}

export default function AdminAnalytics() {
  const metrics = [
    { label: "MRR", value: "$420k" },
    { label: "Renewal rate", value: "92%" },
    { label: "Avg. seats", value: "88" },
    { label: "At-risk", value: "3 tenants" },
    { label: "Net new", value: "5 tenants" },
    { label: "Support load", value: "Low" },
  ]

  return (
    <AppShell title="Analytics" subtitle="Executive telemetry" navItems={adminNav} chips={["Admin"]}>
      <div style={card}>
        {metrics.map((metric) => (
          <div key={metric.label} style={tile}>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>{metric.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>{metric.value}</div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
