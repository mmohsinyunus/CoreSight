import { Link } from "react-router-dom"
import UiControls from "../layout/UiControls"

export default function Landing() {
  return (
    <div style={container}>
      <div style={heroBox}>
        <div style={topRow}>
          <UiControls compact />
        </div>
        <p style={eyebrow}>CoreSight Prototype</p>
        <h1 style={title}>Choose your entry point</h1>
        <p style={subtitle}>Boardroom-ready access for admins and customers. Dark-first, calm gradients.</p>

        <div style={actions}>
          <Link to="/customer/login" style={{ ...cta, background: "var(--accent)", color: "var(--accent-contrast)" }}>
            Customer Login
          </Link>
          <Link to="/admin/login" style={{ ...cta, border: "1px solid var(--border)", color: "var(--text)" }}>
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(1200px 1200px at 20% 10%, rgba(77,163,255,0.14), transparent 40%)," +
    "radial-gradient(1200px 1200px at 80% 0%, rgba(77,163,255,0.10), transparent 38%)," +
    "var(--background)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  color: "var(--text)",
}

const heroBox: React.CSSProperties = {
  width: "min(720px, 100%)",
  padding: 40,
  borderRadius: 24,
  border: "1px solid var(--border)",
  background: "var(--surface-elevated)",
  boxShadow: "var(--shadow)",
}

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: 10,
}

const eyebrow: React.CSSProperties = {
  textTransform: "uppercase",
  letterSpacing: 3,
  fontWeight: 800,
  color: "var(--muted)",
  fontSize: 12,
  marginBottom: 8,
}

const title: React.CSSProperties = { fontSize: 36, margin: "4px 0", letterSpacing: -0.6 }

const subtitle: React.CSSProperties = { color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.45 }

const actions: React.CSSProperties = { display: "flex", gap: 16, marginTop: 26, flexWrap: "wrap" }

const cta: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 14,
  fontWeight: 800,
  border: "none",
  textDecoration: "none",
  boxShadow: "var(--shadow-sm)",
  transition: "transform 160ms ease, box-shadow 200ms ease, background 200ms ease",
}
