import { NavLink } from "react-router-dom"
import type { ReactNode, CSSProperties } from "react"

type AppShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div style={root}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div style={brand}>
          <div style={brandTitle}>CoreSight</div>
          <div style={brandSub}>Clean admin experience — Apple-style UI</div>

          <div style={envRow}>
            <span style={pill}>Prototype</span>
            <span style={pill}>PROD · KSA</span>
          </div>
        </div>

        <nav style={nav}>
          <Section label="CORE" />
          <SideLink to="/home" label="Home" icon="🏠" />
          <SideLink to="/dashboard" label="Dashboard" icon="📊" />
          <SideLink to="/reports" label="Reports" icon="📄" />
          <SideLink to="/analytics" label="Analytics Dashboard" icon="📈" />

          <Section label="SUBSCRIPTIONS" />
          <SideLink to="/subscriptions" label="Subscriptions List" icon="🧾" />
          <SideLink to="/subscriptions/detail" label="Subscription Detail" icon="🔎" />

          <Section label="RENEWALS" />
          <SideLink to="/renewals" label="Renewals Dashboard" icon="🔁" />
          <SideLink to="/renewals/detail" label="Renewal Detail" icon="🗂️" />

          <Section label="OPS" />
          <SideLink to="/approvals" label="Approval Center" icon="✅" />
          <SideLink to="/audit-log" label="Audit Log" icon="🧷" />

          <Section label="VENDOR ONBOARDING" />
          <SideLink to="/admin/vendors" label="Tenants" icon="🏢" />
          <SideLink to="/admin/vendor-new" label="Onboard Tenant" icon="➕" />

          <Section label="ADMIN" />
          <SideLink to="/admin/settings" label="Settings" icon="⚙️" />
          <SideLink to="/tenant-settings" label="Tenant Settings" icon="🛠️" />
          <SideLink to="/policies" label="Policies" icon="🛡️" />
        </nav>

        <div style={tipBox}>
          <b>Quick tip</b>
          <div style={{ marginTop: 6 }}>
            If GitHub Pages shows blank again, it’s usually a base path or build issue.
            Your current hash routes are correct.
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={main}>
        <header style={header}>
          <div>
            <h1 style={h1}>{title}</h1>
            {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
          </div>
        </header>

        <div style={content}>{children}</div>
      </main>
    </div>
  )
}

/* ---------- Helpers ---------- */

function Section({ label }: { label: string }) {
  return <div style={sectionTitle}>{label}</div>
}

function SideLink({
  to,
  label,
  icon,
}: {
  to: string
  label: string
  icon?: string
}) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...navItem,
        background: isActive ? "rgba(10,132,255,0.12)" : "transparent",
        color: isActive ? "#0a84ff" : "rgba(15,23,42,0.85)",
      })}
    >
      <span style={{ width: 22 }}>{icon}</span>
      {label}
    </NavLink>
  )
}

/* ---------- Styles ---------- */

const root: CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  background: "#f5f6f8",
}

const sidebar: CSSProperties = {
  width: 280,
  background: "#ffffff",
  borderRight: "1px solid rgba(15,23,42,0.08)",
  padding: 18,
  display: "flex",
  flexDirection: "column",
}

const brand: CSSProperties = {
  marginBottom: 24,
}

const brandTitle: CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
}

const brandSub: CSSProperties = {
  fontSize: 13,
  color: "rgba(15,23,42,0.6)",
  marginTop: 4,
}

const envRow: CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 12,
}

const pill: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: "rgba(15,23,42,0.06)",
}

const nav: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
}

const sectionTitle: CSSProperties = {
  marginTop: 18,
  marginBottom: 10,
  paddingLeft: 10,
  fontSize: 12,
  letterSpacing: 0.8,
  color: "rgba(15,23,42,0.45)",
  fontWeight: 800,
}

const navItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 600,
}

const tipBox: CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 14,
  background: "rgba(10,132,255,0.08)",
  border: "1px solid rgba(10,132,255,0.2)",
  fontSize: 13,
}

const main: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
}

const header: CSSProperties = {
  padding: "22px 32px",
  borderBottom: "1px solid rgba(15,23,42,0.08)",
  background: "#ffffff",
}

const h1: CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 900,
}

const subtitleStyle: CSSProperties = {
  marginTop: 6,
  color: "rgba(15,23,42,0.6)",
}

const content: CSSProperties = {
  padding: 32,
}
