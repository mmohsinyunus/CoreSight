import { Link } from "react-router-dom"

export default function AdminHome() {
  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ marginBottom: 8 }}>Platform Admin</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Onboard vendors (tenants), assign vendor admins, and control platform access.
      </p>

      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        <div style={{ background: "#0b1220", padding: 16, borderRadius: 12, width: 280 }}>
          <h3 style={{ marginTop: 0 }}>Vendors</h3>
          <p style={{ opacity: 0.85 }}>Create and manage vendor tenants.</p>
          <Link to="/admin/vendors" style={{ color: "#93c5fd" }}>Open</Link>
        </div>

        <div style={{ background: "#0b1220", padding: 16, borderRadius: 12, width: 280 }}>
          <h3 style={{ marginTop: 0 }}>Users</h3>
          <p style={{ opacity: 0.85 }}>Platform-level user access (later).</p>
          <span style={{ opacity: 0.6 }}>Coming next</span>
        </div>
      </div>
    </div>
  )
}
