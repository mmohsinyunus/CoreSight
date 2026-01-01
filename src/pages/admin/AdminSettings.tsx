import AppShell from "../../layout/AppShell"
import { adminNav } from "../../navigation/adminNav"

export default function AdminSettings() {
  return (
    <AppShell title="Admin settings" subtitle="Prototype controls" navItems={adminNav} chips={["Admin"]}>
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 800 }}>Environment</div>
        <div style={{ color: "var(--text-secondary)" }}>
          Admin credentials are defined via environment variables <code>VITE_ADMIN_EMAIL</code> and <code>VITE_ADMIN_PASSWORD</code>. Defaults
          are seeded if none are set.
        </div>
      </div>
    </AppShell>
  )
}
