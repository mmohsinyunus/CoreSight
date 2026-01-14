import { useEffect, useMemo, useState } from "react"
import { NavLink } from "react-router-dom"
import type { CSSProperties } from "react"
import type { NavItem } from "../navigation/types"
import { readStorage, writeStorage } from "../lib/storage"

const PIN_STORAGE_KEY = "coresight_sidebar_pinned"

export default function Sidebar({ items, onWidthChange }: { items: NavItem[]; onWidthChange?: (width: number) => void }) {
  const [isPinned, setIsPinned] = useState(() => readStorage(PIN_STORAGE_KEY, false))
  const [isHovered, setIsHovered] = useState(false)

  const expanded = isPinned || isHovered
  const sidebarWidth = expanded ? 240 : 72

  useEffect(() => {
    onWidthChange?.(sidebarWidth)
  }, [sidebarWidth, onWidthChange])

  useEffect(() => {
    writeStorage(PIN_STORAGE_KEY, isPinned)
    if (isPinned) setIsHovered(false)
  }, [isPinned])

  const groupedItems = useMemo(() => items, [items])

  return (
    <aside
      className="cs-sidebar"
      style={{ ...sidebar, width: sidebarWidth }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isPinned) setIsHovered(false)
      }}
    >
      <div className="cs-sidebar-brand" style={brand}>
        <div style={brandRow}>
          <div style={brandName}>CS</div>
          <button
            className="cs-btn cs-btn-ghost"
            style={{ ...toggle, ...(isPinned ? toggleActive : null) }}
            aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            onClick={() => setIsPinned((v) => {
              const next = !v
              if (!next) setIsHovered(false)
              return next
            })}
          >
            <span style={{ fontSize: 14 }}>{isPinned ? "📌" : "📍"}</span>
          </button>
        </div>
        {expanded && <div style={brandSub}>CoreSight — Enterprise control</div>}
      </div>

      <div className="cs-sidebar-nav" style={{ marginBottom: 12 }}>
        {groupedItems.map((item) => (
          <SideLink key={item.key} to={item.to} label={item.label} icon={item.icon} collapsed={!expanded} />
        ))}
      </div>

      {expanded && (
        <div className="cs-sidebar-tip" style={tipCard}>
          <div style={{ fontWeight: 800, marginBottom: 6, color: "var(--text)" }}>Boardroom ready</div>
          <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>
            Dark-first, calm surfaces. Primary actions use the cyan accent; everything else remains muted.
          </div>
        </div>
      )}
    </aside>
  )
}

function SideLink({ to, label, icon, collapsed }: NavItem & { collapsed: boolean }) {
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

const sidebar: CSSProperties = {
  padding: 14,
  borderRight: "1px solid var(--border)",
  background: "var(--surface)",
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

const brand: CSSProperties = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--surface-elevated)",
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

const toggleActive: CSSProperties = {
  borderColor: "var(--accent)",
  boxShadow: "0 0 0 2px var(--focus-ring)",
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

const tipCard: CSSProperties = {
  marginTop: "auto",
  padding: 14,
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  boxShadow: "var(--shadow-sm)",
}
