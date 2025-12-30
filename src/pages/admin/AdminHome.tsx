// src/pages/admin/AdminHome.tsx

import { useNavigate } from "react-router-dom"

export default function AdminHome() {
  const nav = useNavigate()

  const page: React.CSSProperties = {
    minHeight: "calc(100vh - 40px)",
    padding: "56px 28px",
    background:
      "radial-gradient(1200px 700px at 20% -10%, rgba(0,0,0,0.04), transparent 55%)," +
      "radial-gradient(1200px 700px at 80% 0%, rgba(0,0,0,0.035), transparent 55%)," +
      "linear-gradient(#fbfbfd, #f5f5f7)",
    color: "#1d1d1f",
  }

  const container: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
  }

  const hero: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.75fr",
    gap: 22,
    alignItems: "start",
  }

  const h1: React.CSSProperties = {
    fontSize: 56,
    lineHeight: 1.05,
    letterSpacing: -1.2,
    margin: 0,
    fontWeight: 800,
  }

  const lead: React.CSSProperties = {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 1.55,
    color: "rgba(29,29,31,0.72)",
    maxWidth: 700,
  }

  const chipsRow: React.CSSProperties = {
    marginTop: 18,
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  }

  const chip: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(29,29,31,0.10)",
    background: "rgba(255,255,255,0.7)",
    fontSize: 13,
    color: "rgba(29,29,31,0.8)",
    backdropFilter: "blur(10px)",
  }

  const rightCard: React.CSSProperties = {
    borderRadius: 24,
    padding: 18,
    border: "1px solid rgba(29,29,31,0.08)",
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
  }

  const smallTitle: React.CSSProperties = {
    fontSize: 13,
    letterSpacing: 0.2,
    fontWeight: 800,
    color: "rgba(29,29,31,0.70)",
    textTransform: "uppercase",
    margin: 0,
  }

  const kpi: React.CSSProperties = {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  }

  const kpiBox: React.CSSProperties = {
    borderRadius: 18,
    padding: 14,
    border: "1px solid rgba(29,29,31,0.08)",
    background: "rgba(255,255,255,0.85)",
  }

  const kpiNum: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: -0.4,
    margin: 0,
  }

  const kpiLbl: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(29,29,31,0.65)",
  }

  const section: React.CSSProperties = {
    marginTop: 34,
  }

  const sectionTitle: React.CSSProperties = {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: -0.2,
  }

  const grid: React.CSSProperties = {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  }

  const card: React.CSSProperties = {
    borderRadius: 26,
    padding: 22,
    border: "1px solid rgba(29,29,31,0.08)",
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.06)",
    transition: "transform 180ms ease, box-shadow 180ms ease",
  }

  const cardTitle: React.CSSProperties = {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: -0.2,
  }

  const cardText: React.CSSProperties = {
    marginTop: 10,
    color: "rgba(29,29,31,0.68)",
    lineHeight: 1.6,
    fontSize: 14,
    maxWidth: 520,
  }

  const actions: React.CSSProperties = {
    marginTop: 16,
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  }

  const btnPrimary: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#0071e3",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  }

  const btnGhost: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(29,29,31,0.12)",
    background: "rgba(255,255,255,0.75)",
    color: "#1d1d1f",
    fontWeight: 800,
    cursor: "pointer",
  }

  const note: React.CSSProperties = {
    marginTop: 10,
    fontSize: 12,
    color: "rgba(29,29,31,0.55)",
  }

  const divider: React.CSSProperties = {
    marginTop: 26,
    height: 1,
    background: "rgba(29,29,31,0.08)",
  }

  return (
    <div style={page}>
      <div style={container}>
        {/* HERO */}
        <div style={hero}>
          <div>
            <h1 style={h1}>Platform Admin</h1>
            <div style={lead}>
              Onboard vendors (tenants), assign vendor admins, and control platform access — with a clean,
              audit-friendly setup.
            </div>

            <div style={chipsRow}>
              <div style={chip}>Tenants</div>
              <div style={chip}>Organizations</div>
              <div style={chip}>Users</div>
              <div style={chip}>Integrations</div>
              <div style={chip}>Audit logs</div>
            </div>

            <div style={actions}>
              <button style={btnPrimary} onClick={() => nav("/admin/vendors")}>
                Manage Tenants
              </button>
              <button style={btnGhost} onClick={() => nav("/admin/vendors/new")}>
                Onboard New Tenant
              </button>
              <button style={btnGhost} onClick={() => nav("/admin/settings")}>
                Settings
              </button>
            </div>

            <div style={note}>
              Tip: Use <b>Onboard New Tenant</b> to push the vendor profile into your Google Sheet (Tenants tab).
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div style={rightCard}>
            <p style={smallTitle}>Quick overview</p>
            <div style={{ marginTop: 10, color: "rgba(29,29,31,0.68)", fontSize: 13, lineHeight: 1.5 }}>
              Keep it simple: create a tenant, verify admin email, and confirm the sheet row is appended.
            </div>

            <div style={kpi}>
              <div style={kpiBox}>
                <p style={kpiNum}>Tenants</p>
                <div style={kpiLbl}>Create / view / update</div>
              </div>
              <div style={kpiBox}>
                <p style={kpiNum}>Users</p>
                <div style={kpiLbl}>Coming next</div>
              </div>
              <div style={kpiBox}>
                <p style={kpiNum}>Sheets</p>
                <div style={kpiLbl}>Integration active</div>
              </div>
              <div style={kpiBox}>
                <p style={kpiNum}>Roles</p>
                <div style={kpiLbl}>Platform admin</div>
              </div>
            </div>

            <div style={divider} />

            <div style={{ marginTop: 14 }}>
              <p style={{ margin: 0, fontWeight: 900, letterSpacing: -0.2 }}>Next steps</p>
              <ul style={{ marginTop: 10, paddingLeft: 18, color: "rgba(29,29,31,0.70)", lineHeight: 1.6 }}>
                <li>Onboard tenant → verify row in Tenants sheet</li>
                <li>Confirm VAT & National Address fields</li>
                <li>Add Organizations mapping (next)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CARDS */}
        <div style={section}>
          <div style={sectionTitle}>Administration</div>

          <div style={grid}>
            <div
              style={card}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 18px 55px rgba(0,0,0,0.09)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)"
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 35px rgba(0,0,0,0.06)"
              }}
            >
              <h3 style={cardTitle}>Vendors (Tenants)</h3>
              <div style={cardText}>
                Create and manage vendor tenants. This is your onboarding entry point (writes to the Tenants
                sheet).
              </div>
              <div style={actions}>
                <button style={btnPrimary} onClick={() => nav("/admin/vendors")}>
                  Open
                </button>
                <button style={btnGhost} onClick={() => nav("/admin/vendors/new")}>
                  Add new
                </button>
              </div>
            </div>

            <div
              style={card}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 18px 55px rgba(0,0,0,0.09)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)"
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 35px rgba(0,0,0,0.06)"
              }}
            >
              <h3 style={cardTitle}>Users</h3>
              <div style={cardText}>
                Platform-level user access (later). Next we can add “Create User” and map to the Users sheet.
              </div>
              <div style={actions}>
                <button style={btnGhost} onClick={() => alert("Users module is coming next.")}>
                  Coming soon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive fallback */}
        <div style={{ marginTop: 24, color: "rgba(29,29,31,0.55)", fontSize: 12 }}>
          If you want this in full Apple-style, the next step is to also update the left sidebar to a lighter
          “frosted” look (like macOS / apple.com).
        </div>
      </div>
    </div>
  )
}
