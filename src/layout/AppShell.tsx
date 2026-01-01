// src/layout/AppShell.tsx
import { NavLink } from "react-router-dom"
import { useMemo, useState } from "react"
import type { ReactNode, CSSProperties } from "react"

export type AppShellProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export default function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(true)

  const navItems = useMemo(
    () => [
      {
        label: "Overview",
        items: [
          { to: "/dashboard", label: "Dashboard", icon: "⧉" },
          { to: "/subscriptions", label: "Subscriptions", icon: "▢" },
          { to: "/reports", label: "Reports", icon: "☰" },
          { to: "/analytics", label: "Analytics", icon: "▣" },
          { to: "/approvals", label: "Approvals", icon: "✓" },
        ],
      },
      {
        label: "People",
        items: [
          { to: "/users", label: "Users", icon: "👤" },
          { to: "/departments", label: "Departments", icon: "▥" },
          { to: "/identity-queue", label: "Identity", icon: "⚡" },
        ],
      },
      {
        label: "AI & Insights",
        items: [
          { to: "/home", label: "Home", icon: "⌂" },
          { to: "/renewals", label: "Renewals", icon: "↻" },
          { to: "/renewals/detail", label: "Renewal Detail", icon: "○" },
          { to: "/subscriptions/detail", label: "Subscription Detail", icon: "◉" },
          { to: "/analytics", label: "AI Insights", icon: "✺" },
        ],
      },
      {
        label: "Admin",
        items: [
          { to: "/admin/vendors", label: "Tenants", icon: "🏢" },
          { to: "/admin/vendor-new", label: "Onboard", icon: "＋" },
          { to: "/admin/settings", label: "Settings", icon: "⚙" },
        ],
      },
    ],
    [],
  )

  const sidebarWidth = collapsed ? 72 : 240

  const shellStyle = useMemo<CSSProperties>(
    () => ({
      ...shell,
      gridTemplateColumns: `${sidebarWidth}px 1fr`,
    }),
    [sidebarWidth],
  )

  return (
    <div style={shellStyle}>
      <aside style={{ ...sidebar, width: sidebarWidth }}>
        <div style={brand}>
          <div style={brandRow}>
            <div style={brandName}>CS</div>
            <button
              className="cs-btn cs-btn-ghost"
              style={toggle}
              aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? "→" : "←"}
            </button>
          </div>
          {!collapsed && <div style={brandSub}>CoreSight — Enterprise control</div>}
        </div>

        {navItems.map((section) => (
          <div key={section.label} style={{ marginBottom: 12 }}>
            {!collapsed && <div style={navSectionTitle}>{section.label}</div>}
            {section.items.map((item) => (
              <SideLink key={item.to} to={item.to} label={item.label} icon={item.icon} collapsed={collapsed} />
            ))}
          </div>
        ))}

        {!collapsed && (
          <div style={tipCard}>
            <div style={{ fontWeight: 800, marginBottom: 6, color: "var(--text)" }}>Boardroom ready</div>
            <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>
              Dark-first, calm surfaces. Primary actions use the cyan accent; everything else remains muted.
            </div>
          </div>
        )}
      </aside>

      <main style={main}>
        <div style={topBar}>
          <div style={{ minWidth: 0 }}>
            <div style={pageTitle}>{title}</div>
            {subtitle ? <div style={pageSubtitle}>{subtitle}</div> : null}
          </div>

          <div style={topRight}>
            {actions ? <div style={actionsWrap}>{actions}</div> : null}
            <span style={chip}>Env: PROD</span>
            <span style={chip}>Region: KSA</span>
          </div>
        </div>

        <div style={content}>{children}</div>
      </main>
    </div>
  )
}

function SideLink({
  to,
  label,
  icon,
  collapsed,
}: {
  to: string
  label: string
  icon: string
  collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...navItem,
        padding: collapsed ? "12px 10px" : "12px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        background: isActive ? "rgba(64,195,233,0.12)" : "transparent",
        borderColor: isActive ? "var(--accent)" : "var(--border)",
        color: isActive ? "#e9f8ff" : "var(--text-secondary)",
      })}
    >
      <span style={navIcon}>{icon}</span>
      {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
    </NavLink>
  )
}

/* Styles */
const shell: CSSProperties = {
  display: "grid",
  minHeight: "100vh",
  background: "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.04), transparent 30%), var(--bg)",
}

const sidebar: CSSProperties = {
  padding: 14,
  borderRight: "1px solid var(--border)",
  background: "linear-gradient(180deg, rgba(17,25,38,0.95), rgba(12,16,26,0.95))",
  backdropFilter: "blur(8px)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  transition: "width 200ms ease",
  position: "sticky",
  top: 0,
  alignSelf: "start",
  height: "100vh",
  overflowY: "auto",
  boxShadow: "var(--shadow-sm)",
}

const main: CSSProperties = {
  padding: 18,
  minHeight: "100vh",
  overflow: "auto",
  background: "var(--bg)",
}

const brand: CSSProperties = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.03)",
  boxShadow: "var(--shadow-sm)",
  marginBottom: 8,
}

const brandRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
}

const brandName: CSSProperties = { fontSize: 18, fontWeight: 900, letterSpacing: -0.2, color: "var(--text)" }
const brandSub: CSSProperties = { marginTop: 6, color: "var(--muted)", fontSize: 12 }

const toggle: CSSProperties = {
  height: 32,
  width: 36,
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text)",
  boxShadow: "none",
}

const navSectionTitle: CSSProperties = {
  padding: "10px 8px 6px",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.8,
  color: "var(--muted)",
  textTransform: "uppercase",
}

const navItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  textDecoration: "none",
  marginBottom: 8,
  background: "transparent",
  transition: "background 180ms ease, border-color 180ms ease, color 180ms ease",
}

const navIcon: CSSProperties = { width: 20, textAlign: "center", color: "var(--text)" }

const topBar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: 18,
  borderRadius: 16,
  background: "var(--surface-elevated)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
}

const pageTitle: CSSProperties = { fontSize: 30, fontWeight: 800, letterSpacing: -0.6, color: "var(--text)" }
const pageSubtitle: CSSProperties = { marginTop: 6, color: "var(--text-secondary)" }

const topRight: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
}

const actionsWrap: CSSProperties = { display: "flex", alignItems: "center", gap: 10 }

const chip: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.04)",
  fontWeight: 700,
  fontSize: 12,
  color: "var(--text-secondary)",
}

const content: CSSProperties = { marginTop: 16 }

const tipCard: CSSProperties = {
  marginTop: "auto",
  padding: 14,
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.04)",
  boxShadow: "var(--shadow-sm)",
}
