import { useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAdminAuth } from "../auth/AdminAuthContext"
import UiControls from "../layout/UiControls"

export default function AdminLogin() {
  const { login, isAuthenticated } = useAdminAuth()
  const [email, setEmail] = useState("admin@coresight.local")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState<string | undefined>()
  const navigate = useNavigate()

  if (isAuthenticated) return <Navigate to="/admin/tenants" replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const result = login(email, password)
    if (!result.success) {
      setError(result.error)
      return
    }
    navigate("/admin/tenants")
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Link to="/" style={backLink}>
            ← Back to login selection
          </Link>
          <Link to="/customer/login" style={{ ...switchLink }}>
            Go to Customer Login
          </Link>
        </div>
        <div style={topRow}>
          <UiControls compact />
        </div>
        <p style={eyebrow}>Admin access</p>
        <h2 style={title}>Administrator login</h2>
        <p style={subtitle}>Use the prototype admin credentials. Update env vars to change.</p>

        <form style={form} onSubmit={onSubmit}>
          <label style={label}>
            Email
            <input className="cs-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@coresight.local" />
          </label>
          <label style={label}>
            Password
            <input
              className="cs-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
            />
          </label>
          {error ? <div style={errorBox}>{error}</div> : null}
          <button className="cs-btn cs-btn-primary" type="submit">
            Login as Admin
          </button>
          <div style={{ textAlign: "right" }}>
            <Link to="/customer/login" style={{ ...switchLink, fontSize: 12 }}>
              Switch to Customer Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--background)",
  padding: 24,
}

const card: React.CSSProperties = {
  width: "min(480px, 100%)",
  padding: 28,
  borderRadius: 18,
  border: "1px solid var(--border)",
  background: "var(--surface-elevated)",
  boxShadow: "var(--shadow-sm)",
}

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: 10,
}

const eyebrow: React.CSSProperties = { color: "var(--muted)", textTransform: "uppercase", letterSpacing: 3, fontWeight: 800, fontSize: 11 }
const title: React.CSSProperties = { margin: "6px 0", fontSize: 26, letterSpacing: -0.4 }
const subtitle: React.CSSProperties = { marginBottom: 16, color: "var(--text-secondary)" }

const form: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 14 }
const label: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8, fontWeight: 700, color: "var(--text-secondary)" }
const errorBox: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255, 90, 90, 0.08)",
  padding: 10,
  color: "#ffb4b4",
  fontWeight: 700,
}
const backLink: React.CSSProperties = {
  color: "var(--text-secondary)",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 13,
}

const switchLink: React.CSSProperties = {
  color: "var(--muted)",
  fontWeight: 700,
  fontSize: 13,
}
