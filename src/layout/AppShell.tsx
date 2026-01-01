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
        label: "Core",
        items: [
          { to: "/dashboard", label: "Dashboard", icon: "📊" },
          { to: "/subscriptions", label: "Subscriptions", icon: "💳" },
          { to: "/users", label: "Users", icon: "👥" },
          { to: "/departments", label: "Departments", icon: "🏢" },
          { to: "/analytics", label: "Analytics", icon: "📈" },
          { to: "/ai-insights", label: "AI Insights", icon: "✨" },
        ],
      },
      {
        label: "Operations",
        items: [
          { to: "/approvals", label: "Approvals", icon: "✅" },
          { to: "/renewals", label: "Renewals", icon: "↻" },
          { to: "/subscriptions/detail", label: "Subscription Detail", icon: "◉" },
          { to: "/renewals/detail", label: "Renewal Detail", icon: "○" },
          { to: "/reports", label: "Reports", icon: "🗒" },
        ],
      },
      {
        label: "Admin",
        items: [
          { to: "/admin/vendors", label: "Tenants", icon: "🏢" },
          { to: "/admin/vendor-new", label: "Onboard Tenant", icon: "＋" },
          { to: "/admin/settings", label: "Admin / Settings", icon: "⚙" },
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
      aria-label={label}
      style={({ isActive }) => ({
        ...navItem,
        padding: collapsed ? "12px 10px" : "12px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        background: isActive ? "rgba(77,163,255,0.12)" : "transparent",
        borderColor: isActive ? "rgba(77,163,255,0.45)" : "var(--border)",
        boxShadow: isActive ? "inset 3px 0 0 var(--accent)" : "none",
        color: isActive ? "var(--text)" : "var(--text-secondary)",
      })}
    >
      <span style={navIcon}>{icon}</span>
      <span
        style={{
          ...navLabel,
          maxWidth: collapsed ? 0 : 180,
          opacity: collapsed ? 0 : 1,
        }}
      >
        {label}
      </span>
    </NavLink>
  )
}

/* Styles */
const shell: CSSProperties = {
  display: "grid",
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 16% 12%, rgba(77,163,255,0.06), transparent 28%)," +
    "radial-gradient(circle at 82% 8%, rgba(77,163,255,0.04), transparent 24%)," +
    "var(--background)",
}

const sidebar: CSSProperties = {
  padding: 14,
  borderRight: "1px solid var(--border)",
  background: "linear-gradient(180deg, rgba(18,22,30,0.96), rgba(11,14,20,0.94))",
  backdropFilter: "blur(10px)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  transition: "width 240ms ease, padding 200ms ease",
  position: "sticky",
  top: 0,
  alignSelf: "start",
  height: "100vh",
  overflowY: "auto",
  boxShadow: "var(--shadow-soft)",
}

const main: CSSProperties = {
  padding: 18,
  minHeight: "100vh",
  overflow: "auto",
  background: "var(--background)",
}

const brand: CSSProperties = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.02)",
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
  background: "var(--surface)",
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
  transition: "background 200ms ease, border-color 200ms ease, color 200ms ease, max-width 200ms ease, opacity 200ms ease",
}

const navIcon: CSSProperties = { width: 20, textAlign: "center", color: "var(--text)" }
const navLabel: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  transition: "opacity 200ms ease, max-width 200ms ease",
}

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
  background: "var(--surface-elevated)",
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
  background: "var(--surface)",
  boxShadow: "var(--shadow-sm)",
}
