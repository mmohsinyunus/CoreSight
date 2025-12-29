import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function VendorNew() {
  const nav = useNavigate()
  const [vendorName, setVendorName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")

  function handleCreate() {
    // Mock create (later we’ll store in localStorage / DB)
    if (!vendorName.trim() || !adminEmail.trim()) return
    nav("/admin/vendors")
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Onboard Vendor</h1>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>Vendor Name</div>
          <input
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10 }}
            placeholder="e.g., Canon Saudi Arabia"
          />
        </label>

        <label>
          <div style={{ marginBottom: 6, opacity: 0.85 }}>Initial Vendor Admin Email</div>
          <input
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10 }}
            placeholder="admin@vendor.com"
          />
        </label>

        <button
          onClick={handleCreate}
          style={{
            padding: 12,
            borderRadius: 12,
            background: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          Create Vendor
        </button>
      </div>
    </div>
  )
}
