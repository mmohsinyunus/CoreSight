import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { mockUser } from "../auth/auth"

type Props = {
  children: ReactNode
}

export default function AppLayout({ children }: Props) {
  const user = mockUser

  const linkStyle: React.CSSProperties = {
    color: "#93c5fd",
    textDecoration: "none",
    fontSize: 18,
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: "#0f172a",
          color: "#e5e7eb",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 30 }}>
          CoreSight
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Link to="/" style={linkStyle}>
            Home
          </Link>
          <Link to="/dashboard" style={linkStyle}>
            Dashboard
          </Link>
          <Link to="/reports" style={linkStyle}>
            Reports
          </Link>

          {/* Platform Admin (only for platform_admin role) */}
          {user.role === "platform_admin" && (
            <Link to="/admin" style={linkStyle}>
              Admin
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          background: "#020617",
          color: "#e5e7eb",
          padding: 40,
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  )
}
