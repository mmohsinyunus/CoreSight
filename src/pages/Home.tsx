import AppShell from "../layout/AppShell"

export default function Home() {
  return (
    <AppShell title="Home">
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Welcome</div>
        <div style={{ marginTop: 8, color: "var(--muted)" }}>
          Use the sidebar to navigate. Dashboard & Reports are placeholders for now.
        </div>
      </div>
    </AppShell>
  )
}
