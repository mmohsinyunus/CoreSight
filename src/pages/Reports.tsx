import AppShell from "../layout/AppShell"

export default function Reports() {
  return (
    <AppShell title="Reports">
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Reports</div>
        <div style={{ marginTop: 8, color: "var(--muted)" }}>
          Coming next: standard exports, audit logs, and tenant reports.
        </div>
      </div>
    </AppShell>
  )
}
