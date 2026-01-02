// src/pages/CustomerLogin.tsx
import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useCustomerAuth, seedDemoUsers } from "../auth/CustomerAuthContext"
import { ensureSeedTenant } from "../data/tenants"

// Named component (helps editors/refactors)
function CustomerLogin() {
  const { isAuthenticated, login } = useCustomerAuth()
  const navigate = useNavigate()

  // Tenant ID (previously tenant code)
  const [tenantId, setTenantId] = useState("acme")
  const [email, setEmail] = useState("primary@demo.corp")
  const [password, setPassword] = useState("demo123")
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    ensureSeedTenant()
    seedDemoUsers()
  }, [])

  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(undefined)

    const result = await login(tenantId, email, password)
    if (!result.success) {
      setError(result.error)
      return
    }

    navigate("/app/dashboard")
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Link to="/" style={backLink}>
            ← Back to login selection
          </Link>
          <Link to="/admin/login" style={switchLink}>
            Go to Admin Login
          </Link>
        </div>

        <p style={eyebrow}>Customer access</p>
        <h2 style={title}>Tenant login</h2>
        <p style={subtitle}>
          Enter the tenant ID and credentials issued by your CoreSight admin.
        </p>

        <form style={form} onSubmit={onSubmit}>
          <label style={label}>
            Tenant ID
            <input
              className="cs-input"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="e.g. acme"
            />
          </label>

          <label style={label}>
            Email
            <input
              className="cs-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="primary@demo.corp"
            />
          </label>

          <label style={label}>
            Password
            <input
              className="cs-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </label>

          {error ? <div style={errorBox}>{error}</div> : null}

          <button className="cs-btn cs-btn-primary" type="submit">
            Login to portal
          </button>

          <div style={{ textAlign: "right" }}>
            <Link to="/admin/login" style={{ ...switchLink, fontSize: 12 }}>
              Switch to Admin Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

// ✅ Critical line: default export
export default CustomerLogin

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--background)",
  padding: 24,
}

const card: React.CSSProperties = {
  width: "min(520px, 100%)",
  padding: 28,
  borderRadius: 18,
  border: "1px solid var(--border)",
  background: "var(--surface-elevated)",
  boxShadow: "var(--shadow-sm)",
}

const eyebrow: React.CSSProperties = {
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: 3,
  fontWeight: 800,
  fontSize: 11,
}

const title: React.CSSProperties = { margin: "6px 0", fontSize: 26, letterSpacing: -0.4 }
const subtitle: React.CSSProperties = { marginBottom: 16, color: "var(--text-secondary)" }

const form: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 14 }

const label: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontWeight: 700,
  color: "var(--text-secondary)",
}

const errorBox: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  padding: 10,
  color: "var(--text)",
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
