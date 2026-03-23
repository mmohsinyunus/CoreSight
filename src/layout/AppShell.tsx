// src/layout/AppShell.tsx
import { useNavigate, useLocation } from "react-router-dom"
import { useMemo } from "react"
import type { ReactNode, CSSProperties } from "react"
import { useAdminAuth } from "../auth/AdminAuthContext"
import { useCustomerAuth } from "../auth/CustomerAuthContext"
import TopNav from "./TopNav"
import type { NavItem } from "../navigation/types"
import { customerNav } from "../navigation/customerNav"
import { adminNav } from "../navigation/adminNav"
import { useNavItemsContext } from "../navigation/NavItemsProvider"
import UiControls from "./UiControls"

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

  const isLoggedIn = adminAuth.isAuthenticated || customerAuth.isAuthenticated

  return (
    <div className="cs-shell" style={shell}>
      <TopNav items={resolvedNavItems} />

      <div style={subHeader}>
        <div style={{ minWidth: 0 }}>
          <div className="cs-page-title" style={pageTitle}>{title}</div>
          {subtitle ? (
            <div className="cs-page-subtitle" style={pageSubtitle}>{subtitle}</div>
          ) : null}
        </div>

        <div className="cs-top-right" style={topRight}>
          {actions ? <div style={actionsWrap}>{actions}</div> : null}

          <UiControls compact />

          {(chips ?? defaultChips).map((chipNode, idx) => (
            <span key={idx} style={chip}>{chipNode}</span>
          ))}

          <button
            className="cs-btn"
            style={{ height: 34 }}
            onClick={() => navigate("/")}
            title="Back to login selection"
          >
            Switch login
          </button>

          {isLoggedIn && (
            <button
              className="cs-btn"
              style={{ height: 34 }}
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

      <main className="cs-main" style={main}>
        {children}
      </main>
    </div>
  )
}

/* Styles */
const shell: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 16% 12%, rgba(77,163,255,0.06), transparent 28%)," +
    "radial-gradient(circle at 82% 8%, rgba(77,163,255,0.04), transparent 24%)," +
    "var(--background)",
}

const subHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: "14px 24px",
  borderBottom: "1px solid var(--border)",
  background: "var(--surface-elevated)",
  flexWrap: "wrap",
}

const pageTitle: CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: -0.4,
  color: "var(--text)",
}

const pageSubtitle: CSSProperties = {
  marginTop: 2,
  fontSize: 13,
  color: "var(--text-secondary)",
}

const topRight: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "flex-end",
}

const actionsWrap: CSSProperties = { display: "flex", alignItems: "center", gap: 8 }

const chip: CSSProperties = {
  padding: "5px 10px",
  borderRadius: 999,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  fontWeight: 700,
  fontSize: 11,
  color: "var(--text-secondary)",
}

const main: CSSProperties = {
  flex: 1,
  padding: "20px 24px",
  overflow: "auto",
}

const defaultChips = ["Env: DEV", "Region: KSA"]
