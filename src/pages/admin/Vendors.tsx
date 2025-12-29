import { Link } from "react-router-dom"

export default function Vendors() {
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Vendors</h1>
        <Link to="/admin/vendors/new" style={{ color: "#93c5fd" }}>
          + Onboard Vendor
        </Link>
      </div>

      <div style={{ marginTop: 16, background: "#0b1220", borderRadius: 12, padding: 16 }}>
        <p style={{ opacity: 0.85, marginTop: 0 }}>
          No vendors yet (mock). Next step we will store vendor list in localStorage.
        </p>
      </div>
    </div>
  )
}
