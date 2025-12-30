import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"

type AppShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

const shell: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "280px 1fr",
  background: "#f5f6f8",
}

const sidebar: React.CSSProperties = {
  padding: 18,
  borderRight: "1px solid rgba(15, 23, 42, 0.10)",
  background: "#ffffff",
}

const brand: React.CSSProperties = { marginBottom: 14 }
const brandTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: -0.3,
  margin: 0,
}
const brandSub: React.CSSProperties = { marginTop: 6, color: "rgba(15,23,42,0.55)", fontSize: 13 }

const sectionLabel: React.CSSProperties = {
  marginTop: 18,
  marginBottom: 8,
  fontSize: 12,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  color: "rgba(15,23,42,0.45)",
  fontWeight: 700,
}

const contentWrap: React.CSSProperties = {
  padding: 26,
}

const topBar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
}

const pageTitle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  letterSpacing: -0.4,
  margin: 0,
}
const pageSubtitle: React.CSSProperties = {
  marginTop: 6,
  color: "rgba(15,23,42,0.60)",
  fontSize: 14,
}

const env: React.CSSProperties = {
  color: "rgba(15,23,42,0.55)",
  fontSize: 12,
  fontWeight: 700,
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "block",
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(15,23,42,0.10)",
        background: isActive ? "rgba(10,132,255,0.12)" : "transparent",
        color: "rgba(15,23,42,0.9)",
        textDecoration: "none",
        fontWeight: 600,
      })}
    >
      {label}
    </NavLink>
  )
}

export default function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div style={shell}>
      <aside style={sidebar}>
        <div style={brand}>
          <h1 style={brandTitle}>CoreSight</h1>
          <div style={brandSub}>Clean admin experience — Apple-style UI</div>
        </div>

        <div style={sectionLabel}>Platform</div>
        <div style={{ display: "grid", gap: 10 }}>
          <SideLink to="/home" label="Home" />
          <SideLink to="/dashboard" label="Dashboard" />
          <SideLink to="/reports" label="Reports" />
        </div>

        <div style={sectionLabel}>Vendor Onboarding</div>
        <div style={{ display: "grid", gap: 10 }}>
          <SideLink to="/admin/vendors" label="Tenants" />
          <SideLink to="/admin/vendor-new" label="Onboard Tenant" />
        </div>

        <div style={sectionLabel}>Admin</div>
        <div style={{ display: "grid", gap: 10 }}>
          <SideLink to="/admin/settings" label="Settings" />
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 12,
            borderRadius: 16,
            background: "rgba(10,132,255,0.08)",
            border: "1px solid rgba(10,132,255,0.18)",
            color: "rgba(15,23,42,0.75)",
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          <b>Tip:</b> Use <b>Onboard Tenant</b> to append rows into your Google Sheet.
        </div>
      </aside>

      <main style={contentWrap}>
        <div style={topBar}>
          <div>
            <h2 style={pageTitle}>{title}</h2>
            {subtitle ? <div style={pageSubtitle}>{subtitle}</div> : null}
          </div>
          <div style={env}>PROD • KSA</div>
        </div>

        {children}
      </main>
    </div>
  )
}
