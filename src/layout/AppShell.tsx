import { ReactNode } from "react"
import { NavLink } from "react-router-dom"

export default function AppShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        background: "var(--bg)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          padding: 18,
          borderRight: "1px solid var(--border)",
          background: "linear-gradient(180deg, #ffffff, #f7f8fa)",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.2 }}>
          CoreSight
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
          Clean admin experience — Apple-style UI
        </div>

        <div style={{ marginTop: 18, fontSize: 11, color: "var(--muted)" }}>
          PLATFORM
        </div>
        <nav style={{ marginTop: 8, display: "grid", gap: 8 }}>
          <SideLink to="/home" label="Home" />
          <SideLink to="/dashboard" label="Dashboard" />
          <SideLink to="/reports" label="Reports" />
        </nav>

        <div style={{ marginTop: 18, fontSize: 11, color: "var(--muted)" }}>
          VENDOR ONBOARDING
        </div>
        <nav style={{ marginTop: 8, display: "grid", gap: 8 }}>
          <SideLink to="/admin/vendors" label="Tenants" />
          <SideLink to="/admin/vendor-new" label="Onboard Tenant" />
        </nav>

        <div style={{ marginTop: 18, fontSize: 11, color: "var(--muted)" }}>
          ADMIN
        </div>
        <nav style={{ marginTop: 8, display: "grid", gap: 8 }}>
          <SideLink to="/admin/settings" label="Settings" />
        </nav>

        <div
          style={{
            marginTop: 18,
            padding: 12,
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "rgba(10,132,255,0.06)",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          Tip: Use <b>Onboard Tenant</b> to append rows into your Google Sheet.
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: 22 }}>
        <div
          className="card"
          style={{
            padding: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{title}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
              Enterprise Intelligence Platform
            </div>
          </div>

          <div style={{ fontSize: 12, color: "var(--muted)" }}>PROD • KSA</div>
        </div>

        {children}
      </main>
    </div>
  )
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: isActive ? "rgba(10,132,255,0.12)" : "transparent",
        fontWeight: 500,
      })}
    >
      {label}
    </NavLink>
  )
}
