import AppShell from "../layout/AppShell"

export default function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Dashboard</div>
        <div style={{ marginTop: 8, color: "var(--muted)" }}>
          Coming next: KPI tiles, charts, and filters.
        </div>
      </div>
    </AppShell>
  )
}
