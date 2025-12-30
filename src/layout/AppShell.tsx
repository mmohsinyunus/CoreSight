import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"

export default function AppShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "300px 1fr" }}>
      {/* Sidebar */}
      <aside
        className="card"
        style={{
          margin: 18,
          padding: 16,
          borderRadius: 22,
          boxShadow: "var(--shadow-sm)",
          alignSelf: "start",
          position: "sticky",
          top: 18,
          height: "calc(100vh - 36px)",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 750, letterSpacing: -0.4 }}>
              CoreSight
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              Clean admin experience — Apple-style UI
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(10,132,255,0.12)",
              color: "var(--primary)",
              fontWeight: 700,
            }}
          >
            Prototype
          </span>
        </div>

        <Section title="PLATFORM">
          <SideLink to="/home" label="Home" icon="🏠" />
          <SideLink to="/dashboard" label="Dashboard" icon="📊" />
          <SideLink to="/reports" label="Reports" icon="🧾" />
        </Section>

        <Section title="VENDOR ONBOARDING">
          <SideLink to="/admin/vendors" label="Tenants" icon="🏢" />
          <SideLink to="/admin/vendor-new" label="Onboard Tenant" icon="➕" />
        </Section>

        <Section title="ADMIN">
          <SideLink to="/admin/settings" label="Settings" icon="⚙️" />
        </Section>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 18,
            border: "1px solid rgba(10,132,255,0.18)",
            background: "rgba(10,132,255,0.08)",
            fontSize: 12,
            color: "rgba(17,24,39,0.75)",
          }}
        >
          <b>Tip:</b> Use <b>Onboard Tenant</b> to append rows into your Google Sheet.
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: 18 }}>
        <div
          className="card"
          style={{
            padding: 18,
            borderRadius: 22,
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h1 className="h1">{title}</h1>
            <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
              Enterprise Intelligence Platform
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span
              style={{
                fontSize: 12,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(34,197,94,0.12)",
                color: "#15803d",
                fontWeight: 700,
              }}
            >
              Integration: Active
            </span>
            <span className="muted" style={{ fontSize: 12 }}>
              PROD • KSA
            </span>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div className="muted" style={{ fontSize: 11, letterSpacing: 0.6 }}>
        {title}
      </div>
      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>{children}</div>
    </div>
  )
}

function SideLink({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}
    >
      <span className="ico">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}
