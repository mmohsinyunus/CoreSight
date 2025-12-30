// src/layout/AppLayout.tsx
import type { ReactNode } from "react"
import { NavLink, useLocation } from "react-router-dom"

type Props = {
  children: ReactNode
}

const linkBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14,
  color: "rgba(29,29,31,0.72)",
  transition: "background 180ms ease, color 180ms ease, transform 180ms ease",
}

const activeLink: React.CSSProperties = {
  background: "rgba(0,113,227,0.10)",
  color: "#0071e3",
}

export default function AppLayout({ children }: Props) {
  const loc = useLocation()

  const shell: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "radial-gradient(1400px 800px at 20% -10%, rgba(0,0,0,0.04), transparent 55%)," +
      "radial-gradient(1400px 800px at 80% 0%, rgba(0,0,0,0.035), transparent 55%)," +
      "linear-gradient(#fbfbfd, #f5f5f7)",
    color: "#1d1d1f",
  }

  const wrap: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 18,
    padding: 18,
  }

  const sidebar: React.CSSProperties = {
    position: "sticky",
    top: 18,
    alignSelf: "start",
    height: "calc(100vh - 36px)",
    borderRadius: 26,
    border: "1px solid rgba(29,29,31,0.10)",
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.08)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
  }

  const brandRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
  }

  const brand: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: -0.4,
    margin: 0,
  }

  const sub: React.CSSProperties = {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(29,29,31,0.55)",
    padding: "0 10px",
  }

  const nav: React.CSSProperties = {
    marginTop: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "0 6px",
  }

  const sectionLabel: React.CSSProperties = {
    marginTop: 16,
    marginBottom: 8,
    padding: "0 10px",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.3,
    color: "rgba(29,29,31,0.45)",
    textTransform: "uppercase",
  }

  const footer: React.CSSProperties = {
    marginTop: "auto",
    padding: 10,
    borderRadius: 18,
    border: "1px solid rgba(29,29,31,0.08)",
    background: "rgba(255,255,255,0.75)",
    color: "rgba(29,29,31,0.70)",
    fontSize: 12,
    lineHeight: 1.4,
  }

  const content: React.CSSProperties = {
    borderRadius: 26,
    border: "1px solid rgba(29,29,31,0.08)",
    background: "rgba(255,255,255,0.35)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.06)",
    overflow: "hidden",
  }

  const contentInner: React.CSSProperties = {
    padding: 22,
    minHeight: "calc(100vh - 36px)",
  }

  const topBar: React.CSSProperties = {
    padding: "14px 18px",
    borderBottom: "1px solid rgba(29,29,31,0.08)",
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(14px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  }

  const crumb: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 800,
    color: "rgba(29,29,31,0.70)",
  }

  const pill: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(29,29,31,0.10)",
    background: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(29,29,31,0.72)",
  }

  function navItem(to: string, label: string, emoji?: string) {
    return (
      <NavLink
        to={to}
        style={({ isActive }) => ({
          ...linkBase,
          ...(isActive ? activeLink : null),
        })}
      >
        <span style={{ width: 20, textAlign: "center", opacity: 0.9 }}>{emoji ?? "•"}</span>
        <span>{label}</span>
      </NavLink>
    )
  }

  const path = loc.pathname || "/"
  const nicePath =
    path === "/"
      ? "Home"
      : path
          .replace(/^\/+/, "")
          .split("/")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" / ")

  return (
    <div style={shell}>
      <div style={wrap}>
        {/* Sidebar */}
        <aside style={sidebar}>
          <div style={brandRow}>
            <p style={brand}>CoreSight</p>
            <span style={pill}>Prototype</span>
          </div>
          <div style={sub}>Clean admin experience — Apple-style UI</div>

          <div style={sectionLabel}>Navigation</div>
          <nav style={nav}>
            {navItem("/", "Home", "🏠")}
            {navItem("/dashboard", "Dashboard", "📊")}
            {navItem("/reports", "Reports", "📄")}
            {navItem("/admin", "Admin", "⚙️")}
          </nav>

          <div style={sectionLabel}>Admin shortcuts</div>
          <nav style={nav}>
            {navItem("/admin/vendors", "Tenants", "🏢")}
            {navItem("/admin/vendors/new", "Onboard Tenant", "➕")}
            {navItem("/admin/settings", "Settings", "🧩")}
          </nav>

          <div style={footer}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Quick tip</div>
            If GitHub Pages shows blank again, it’s usually a <b>base path</b> or <b>build</b> issue. Your
            current hash routes are correct for Pages.
          </div>
        </aside>

        {/* Content */}
        <main style={content}>
          <div style={topBar}>
            <div style={crumb}>{nicePath}</div>
            <div style={pill}>Platform Admin</div>
          </div>

          <div style={contentInner}>{children}</div>
        </main>
      </div>
    </div>
  )
}
