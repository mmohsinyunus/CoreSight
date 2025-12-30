// src/layout/AppShell.tsx
import type { ReactNode } from "react"
import { NavLink, useLocation } from "react-router-dom"

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
}

type NavItem = { label: string; to: string }
type NavGroup = { title: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    title: "Core",
    items: [
      { label: "Home", to: "/home" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Reports", to: "/reports" },
      { label: "Analytics Dashboard", to: "/analytics" },
    ],
  },
  {
    title: "Subscriptions",
    items: [
      { label: "Subscriptions List", to: "/subscriptions" },
      { label: "Subscription Detail", to: "/subscriptions/detail" },
      { label: "Renewals Dashboard", to: "/renewals" },
      { label: "Renewal Detail", to: "/renewals/detail" },
      { label: "Approval Center", to: "/approvals" },
    ],
  },
  {
    title: "Identity",
    items: [
      { label: "Users List", to: "/users" },
      { label: "User Profile", to: "/users/profile" },
      { label: "Identity Resolution Queue", to: "/identity-queue" },
      { label: "Departments Overview", to: "/departments" },
    ],
  },
  {
    title: "Setup",
    items: [
      { label: "Tenant Selection", to: "/tenant-selection" },
      { label: "Company Setup", to: "/company-setup" },
      { label: "Department Setup", to: "/department-setup" },
      { label: "Connect Data Sources", to: "/connect-sources" },
      { label: "Sync Progress", to: "/sync-progress" },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Vendors Overview", to: "/admin/vendors" },
      { label: "Onboard Tenant", to: "/admin/vendor-new" },
      { label: "Tenant Settings", to: "/tenant-settings" },
      { label: "Policies", to: "/policies" },
      { label: "Audit Log", to: "/audit-log" },
      { label: "Settings", to: "/admin/settings" },
    ],
  },
]

export default function AppShell({ title, subtitle, children }: Props) {
  const loc = useLocation()

  return (
    <div style={shell}>
      <aside style={sidebar}>
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>CoreSight</div>
          <div style={{ marginTop: 6, color: "var(--muted)" }}>Clean admin experience — Apple-style UI</div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="cs-pill">Prototype</span>
            <span className="cs-pill">PROD · KSA</span>
          </div>
        </div>

        <div style={{ padding: "0 12px 16px" }}>
          {NAV.map((g) => (
            <div key={g.title} style={{ marginTop: 14 }}>
              <div style={groupTitle}>{g.title}</div>
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {g.items.map((it) => (
                  <SideLink key={it.to} to={it.to} label={it.label} />
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 18 }} className="cs-card">
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Tip</div>
              <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.5 }}>
                VC demo should never break. If Apps Script fails, we’ll fallback to mock data + show a toast.
              </div>
              <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 12 }}>
                Current route: <b>{loc.pathname}</b>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main style={main}>
        <div style={topbar}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 780, letterSpacing: -0.5 }}>{title}</div>
            {subtitle ? <div style={{ marginTop: 6, color: "var(--muted)" }}>{subtitle}</div> : null}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className="cs-pill">Tenant: Demo</span>
            <span className="cs-pill">Env: PROD</span>
          </div>
        </div>

        <div style={{ paddingBottom: 24 }}>{children}</div>
      </main>
    </div>
  )
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "12px 12px",
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: isActive ? "var(--blue-weak)" : "#fff",
        color: "rgba(11,18,32,0.92)",
        fontWeight: 650,
        boxShadow: isActive ? "var(--shadow-sm)" : "none",
        display: "block",
      })}
    >
      {label}
    </NavLink>
  )
}

/** Styles */
const shell: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "var(--sidebar-w) 1fr",
  background: "var(--bg)",
}

const sidebar: React.CSSProperties = {
  borderRight: "1px solid var(--border)",
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(10px)",
}

const groupTitle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 0.7,
  textTransform: "uppercase",
  color: "rgba(11,18,32,0.55)",
  fontWeight: 800,
  padding: "0 6px",
}

const main: React.CSSProperties = {
  minWidth: 0,
}

const topbar: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  padding: "18px 22px",
  borderBottom: "1px solid var(--border)",
  background: "rgba(245,246,248,0.85)",
  backdropFilter: "blur(10px)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 12,
}
