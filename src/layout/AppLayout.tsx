import type { ReactNode } from "react"
import { Link } from "react-router-dom"

type Props = {
  children: ReactNode
}

export default function AppLayout({ children }: Props) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          background: "#0f172a",
          color: "#e5e7eb",
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 30 }}>CoreSight</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link to="/" style={{ color: "#93c5fd", textDecoration: "none" }}>
            Home
          </Link>
          <Link to="/dashboard" style={{ color: "#93c5fd", textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link to="/reports" style={{ color: "#93c5fd", textDecoration: "none" }}>
            Reports
          </Link>
        </nav>
      </aside>

      <main style={{ flex: 1, background: "#020617", color: "#e5e7eb", padding: 40 }}>
        {children}
      </main>
    </div>
  )
}
