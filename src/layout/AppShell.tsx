// src/layout/AppShell.tsx
import { NavLink } from "react-router-dom"
import type { ReactNode, CSSProperties } from "react"

export type AppShellProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export default function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  return (
    <div style={shell}>
      <aside style={sidebar}>
        <div style={brand}>
          <div style={brandRow}>
            <div style={brandName}>CoreSight</div>
            <span style={pill}>Prototype</span>
          </div>
          <div style={brandSub}>Clean admin experience — Apple-style UI</div>
        </div>

        <div style={navSectionTitle}>NAVIGATION</div>
        <SideLink to="/home" label="Home" emoji="🏠" />
        <SideLink to="/dashboard" label="Dashboard" emoji="📊" />
        <SideLink to="/reports" label="Reports" emoji="📄" />
        <SideLink to="/analytics" label="Analytics Dashboard" emoji="📈" />

        <div style={divider} />

        <div style={navSectionTitle}>SETUP</div>
        <SideLink to="/company-setup" label="Company Setup" emoji="🏗️" />
        <SideLink to="/department-setup" label="Department Setup" emoji="🧩" />
        <SideLink to="/connect-sources" label="Connect Data Sources" emoji="🔌" />
        <SideLink to="/sync-progress" label="Sync Progress" emoji="🔄" />

        <div style={divider} />

        <div style={navSectionTitle}>SUBSCRIPTIONS</div>
        <SideLink to="/subscriptions" label="Subscriptions List" emoji="🧾" />
        <SideLink to="/subscriptions/detail" label="Subscription Detail" emoji="🔎" />
        <SideLink to="/renewals" label="Renewals Dashboard" emoji="♻️" />
        <SideLink to="/renewals/detail" label="Renewal Detail" emoji="📌" />

        <div style={divider} />

        <div style={navSectionTitle}>USERS & IDENTITY</div>
        <SideLink to="/users" label="Users List" emoji="👥" />
        <SideLink to="/users/profile" label="User Profile" emoji="🪪" />
        <SideLink to="/identity-queue" label="Identity Resolution Queue" emoji="🧠" />
        <SideLink to="/departments" label="Departments Overview" emoji="🏬" />

        <div style={divider} />

        <div style={navSectionTitle}>GOVERNANCE</div>
        <SideLink to="/approvals" label="Approval Center" emoji="✅" />
        <SideLink to="/audit-log" label="Audit Log" emoji="🧾" />
        <SideLink to="/policies" label="Policies" emoji="🔐" />
        <SideLink to="/tenant-settings" label="Tenant Settings" emoji="⚙️" />

        <div style={divider} />

        <div style={navSectionTitle}>ADMIN SHORTCUTS</div>
        <SideLink to="/admin/vendors" label="Tenants" emoji="🏢" />
        <SideLink to="/admin/vendor-new" label="Onboard Tenant" emoji="➕" />
        <SideLink to="/admin/settings" label="Settings" emoji="🧩" />

        <div style={tipCard}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Quick tip</div>
          <div style={{ color: "rgba(15, 23, 42, 0.72)", lineHeight: 1.45 }}>
            If GitHub Pages shows blank again, it’s usually a <b>base path</b> or <b>build</b> issue.
            Hash routes are correct for Pages.
          </div>
        </div>
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
            <span style={chip}>KSA</span>
          </div>
        </div>

        <div style={content}>{children}</div>
      </main>
    </div>
  )
}

function SideLink({ to, label, emoji }: { to: string; label: string; emoji: string }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...navItem,
        background: isActive ? "rgba(10,132,255,0.10)" : "transparent",
        borderColor: isActive ? "rgba(10,132,255,0.25)" : "rgba(15, 23, 42, 0.10)",
        color: isActive ? "rgba(15,23,42,0.95)" : "rgba(15,23,42,0.80)",
      })}
    >
      <span style={navEmoji}>{emoji}</span>
      <span>{label}</span>
    </NavLink>
  )
}

/* Styles */
const shell: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  minHeight: "100vh",
  background: "linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.02))",
}

const sidebar: CSSProperties = {
  padding: 18,
  borderRight: "1px solid rgba(15, 23, 42, 0.10)",
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(10px)",
}

const main: CSSProperties = { padding: 18 }

const brand: CSSProperties = {
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  background: "#fff",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  marginBottom: 14,
}

const brandRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
}

const brandName: CSSProperties = { fontSize: 24, fontWeight: 900, letterSpacing: -0.2 }
const brandSub: CSSProperties = { marginTop: 6, color: "rgba(15,23,42,0.65)" }

const pill: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  background: "rgba(15, 23, 42, 0.04)",
  fontSize: 12,
  fontWeight: 800,
  color: "rgba(15,23,42,0.70)",
}

const navSectionTitle: CSSProperties = {
  padding: "12px 10px 8px",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.8,
  color: "rgba(15,23,42,0.45)",
}

const navItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  textDecoration: "none",
  marginBottom: 10,
  background: "transparent",
}

const navEmoji: CSSProperties = { width: 22, textAlign: "center" }

const divider: CSSProperties = {
  margin: "10px 0 6px",
  height: 1,
  background: "rgba(15, 23, 42, 0.08)",
  borderRadius: 999,
}

const topBar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.85)",
  border: "1px solid rgba(15, 23, 42, 0.10)",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  backdropFilter: "blur(10px)",
}

const pageTitle: CSSProperties = { fontSize: 34, fontWeight: 900, letterSpacing: -0.6 }
const pageSubtitle: CSSProperties = { marginTop: 6, color: "rgba(15,23,42,0.65)" }

const topRight: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
}

const actionsWrap: CSSProperties = { display: "flex", alignItems: "center", gap: 10 }

const chip: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid rgba(15, 23, 42, 0.12)",
  background: "rgba(15, 23, 42, 0.04)",
  fontWeight: 900,
  fontSize: 12,
  color: "rgba(15,23,42,0.75)",
}

const content: CSSProperties = { marginTop: 16 }

const tipCard: CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(10,132,255,0.18)",
  background: "rgba(10,132,255,0.06)",
}
