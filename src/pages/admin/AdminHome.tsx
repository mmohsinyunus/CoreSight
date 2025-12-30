import AppShell from "../../layout/AppShell"
import { Link } from "react-router-dom"

const wrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr",
  gap: 16,
  alignItems: "start",
}

const hero: React.CSSProperties = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.03)",
}

const h1: React.CSSProperties = {
  fontSize: 34,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: -0.8,
  margin: 0,
}

const sub: React.CSSProperties = {
  marginTop: 10,
  fontSize: 14,
  color: "var(--muted)",
  maxWidth: 720,
}

const grid: React.CSSProperties = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
}

const card: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.03)",
  padding: 14,
  minHeight: 120,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}

const cardTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 850,
  margin: 0,
}

const cardDesc: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: "var(--muted)",
  lineHeight: 1.4,
}

const ctaRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 12,
  alignItems: "center",
}

const primaryLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 12,
  background: "var(--accent)",
  color: "#001018",
  fontSize: 13,
  fontWeight: 850,
  textDecoration: "none",
  border: "1px solid rgba(42,161,255,0.35)",
}

const ghostLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  color: "var(--text)",
  fontSize: 13,
  fontWeight: 800,
  textDecoration: "none",
  border: "1px solid var(--border)",
}

const sideCard: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.03)",
  padding: 16,
  position: "sticky",
  top: 18,
}

const sideTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  opacity: 0.7,
  margin: 0,
}

const bullet: React.CSSProperties = {
  marginTop: 10,
  paddingLeft: 18,
  color: "var(--muted)",
  fontSize: 13,
  lineHeight: 1.7,
}

const hr: React.CSSProperties = {
  height: 1,
  background: "var(--border)",
  border: 0,
  margin: "14px 0",
}

export default function AdminHome() {
  return (
    <AppShell title="Platform Admin">
      <div style={wrap}>
        {/* LEFT */}
        <div>
          <div style={hero}>
            <h1 style={h1}>Platform Admin</h1>
            <div style={sub}>
              Onboard tenants, assign admins, and verify integrations — with a clean,
              audit-friendly setup.
            </div>

            <div style={grid}>
              <div style={card}>
                <div>
                  <p style={cardTitle}>Tenants</p>
                  <div style={cardDesc}>Create and manage tenant records.</div>
                </div>
                <div style={ctaRow}>
                  <Link to="/admin/vendors" style={ghostLink}>
                    View
                  </Link>
                  <Link to="/admin/vendor-new" style={primaryLink}>
                    + Create
                  </Link>
                </div>
              </div>

              <div style={card}>
                <div>
                  <p style={cardTitle}>Users</p>
                  <div style={cardDesc}>Invite users and assign roles (next).</div>
                </div>
                <div style={ctaRow}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Coming soon</span>
                </div>
              </div>

              <div style={card}>
                <div>
                  <p style={cardTitle}>Sheets</p>
                  <div style={cardDesc}>Confirm the integration is active.</div>
                </div>
                <div style={ctaRow}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Google Apps Script
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Optional: a small section below, not huge */}
          <div style={{ marginTop: 14, padding: 16, borderRadius: 16, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: 13, fontWeight: 850 }}>Administration</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              Keep this page lightweight — the main work happens in Tenants.
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={sideCard}>
          <p style={sideTitle}>Next steps</p>
          <ul style={bullet}>
            <li>Onboard tenant → verify row in Tenants sheet</li>
            <li>Confirm VAT & National Address fields</li>
            <li>Add Organizations mapping (next)</li>
          </ul>

          <hr style={hr} />

          <p style={sideTitle}>Health</p>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>Integration</span>
              <span style={{ fontWeight: 850 }}>Active</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>Role</span>
              <span style={{ fontWeight: 850 }}>Platform admin</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
