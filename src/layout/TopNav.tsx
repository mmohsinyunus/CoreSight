// src/layout/TopNav.tsx
import { NavLink } from "react-router-dom"
import type { CSSProperties } from "react"
import type { NavItem } from "../navigation/types"

export default function TopNav({ items }: { items: NavItem[] }) {
  return (
    <header className="cs-topnav" style={header}>
      <div style={brand}>
        <span style={brandMark}>CS</span>
        <span style={brandName}>CoreSight</span>
      </div>

      <nav style={nav}>
        {items.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.to.split("/").length <= 2}
            style={({ isActive }) => ({
              ...navItem,
              background: isActive ? "rgba(77,163,255,0.12)" : "transparent",
              borderColor: isActive ? "rgba(77,163,255,0.45)" : "transparent",
              color: isActive ? "var(--text)" : "var(--text-secondary)",
            })}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

const header: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "0 20px",
  height: 56,
  background: "var(--surface)",
  borderBottom: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
  position: "sticky",
  top: 0,
  zIndex: 100,
  overflowX: "auto",
}

const brand: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginRight: 16,
  flexShrink: 0,
}

const brandMark: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: "var(--accent)",
  color: "var(--accent-contrast)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 900,
}

const brandName: CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  letterSpacing: -0.3,
  color: "var(--text)",
  whiteSpace: "nowrap",
}

const nav: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  flex: 1,
  overflowX: "auto",
}

const navItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid transparent",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: "nowrap",
  transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
}
