// src/layout/AppShell.tsx

import type { ReactNode, CSSProperties } from "react"
import { NavLink } from "react-router-dom"

const shell: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "260px 1fr",
}

const sidebar: CSSProperties = {
  padding: 18,
  borderRight: "1px solid var(--border)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
}

const brand: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  marginBottom: 20,
}

const navTitle: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1,
  opacity: 0.6,
  marginTop: 18,
  marginBottom: 8,
}

const navItem = (active: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 12,
  marginBottom: 6,
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text)",
  background: active ? "var(--accent-soft)" : "transparent",
  border: `1px solid ${active ? "rgba(42,161,255,0.35)" : "transparent"}`,
})

const main: CSSProperties = {
  padding: 24,
}

const topbar: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  backdropFilter: "blur(16px)",
  background: "rgba(11,12,16,0.75)",
  borderBottom: "1px solid var(--border)",
  borderRadius: 16,
  padding: "14px 18px",
  marginBottom: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}

export default function AppShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div style={shell}>
      <aside style={sidebar}>
        <div style={brand}>CoreSight</div>

        <div style={navTitle}>Platform</div>

        <NavLink
          to="/admin/vendors"
          style={({ isActive }) => navItem(isActive)}
        >
          Tenants
        </NavLink>

        <NavLink
          to="/admin/vendor-new"
          style={({ isActive }) => navItem(isActive)}
        >
          Create Tenant
        </NavLink>

        <div style={navTitle}>Admin</div>

        <NavLink to="/settings" style={({ isActive }) => navItem(isActive)}>
          Settings
        </NavLink>
      </aside>

      <main style={main}>
        <div style={topbar}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              Enterprise Intelligence Platform
            </div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>PROD • KSA</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
