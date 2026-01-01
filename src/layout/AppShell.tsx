// src/layout/AppShell.tsx
import { useNavigate, useLocation } from "react-router-dom"
import { useMemo, useState } from "react"
import type { ReactNode, CSSProperties } from "react"
import { useAdminAuth } from "../auth/AdminAuthContext"
import { useCustomerAuth } from "../auth/CustomerAuthContext"
import Sidebar from "./Sidebar"
import type { NavItem } from "../navigation/types"
import { customerNav } from "../navigation/customerNav"
import { adminNav } from "../navigation/adminNav"
import { useNavItemsContext } from "../navigation/NavItemsProvider"

export type AppShellProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  navItems?: NavItem[]
  chips?: ReactNode[]
}

export default function AppShell({
  title,
  subtitle,
  actions,
  children,
  navItems,
  chips,
}: AppShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const adminAuth = useAdminAuth()
  const customerAuth = useCustomerAuth()
  const contextNavItems = useNavItemsContext()

  const [sidebarWidth, setSidebarWidth] = useState(72)

  // Decide which nav to show (Admin vs Customer)
  const resolvedNavItems = useMemo(() => {
    if (navItems) return navItems

    const path = location.pathname || ""
    const isAdminRoute = path.startsWith("/admin") || adminAuth.isAuthenticated
    const isCustomerRoute = path.startsWith("/customer") || customerAuth.isAuthenticated

    if (isAdminRoute) return adminNav
    if (isCustomerRoute) return customerNav

    return contextNavItems ?? customerNav
  }, [navItems, location.pathname, adminAuth.isAuthenticated, customerAuth.isAuthenticated, contextNavItems])

  const shellStyle = useMemo<CSSProperties>(
    () => ({
      ...shell,
      gridTemplateColumns: `${sidebarWidth}px 1fr`,
    }),
    [sidebarWidth],
  )

  const isLoggedIn = adminAuth.isAuthenticated || customerAuth.isAuthenticated

  return (
    <div style={shellStyle}>
      <Sidebar items={resolvedNavItems} onWidthChange={setSidebarWidth} />

      <main style={main}>
        <div style={topBar}>
          <div style={{ minWidth: 0 }}>
            <div style={pageTitle}>{title}</div>
            {subtitle ? <div style={pageSubtitle}>{subtitle}</div> : null}
          </div>

          <div style={topRight}>
            {actions ? <div style={actionsWrap}>{actions}</div> : null}

            {(chips ?? defaultChips).map((chipNode, idx) => (
              <span key={idx} style={chip}>
                {chipNode}
              </span>
            ))}

            {/* Switch role / go back to login chooser */}
            <button
              className="cs-btn"
              style={{ height: 38, marginLeft: 8 }}
              onClick={() => navigate("/")}
              title="Back to login selection"
            >
              Switch login
            </button>

            {/* Logout */}
            {isLoggedIn && (
              <button
                className="cs-btn"
                style={{ height: 38 }}
                onClick={() => {
                  if (adminAuth.isAuthenticated) adminAuth.logout()
                  if (customerAuth.isAuthenticated) customerAuth.logout()
                  navigate("/")
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <div style={content}>{children}</div>
      </main>
    </div>
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

const main: CSSProperties = {
  padding: 18,
  minHeight: "100vh",
  overflow: "auto",
  background: "var(--background)",
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

const defaultChips = ["Env: PROD", "Region: KSA"]
