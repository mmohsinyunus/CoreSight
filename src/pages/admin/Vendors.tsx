import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getVendors, removeVendor } from "../../data/vendors"
import type { Vendor } from "../../data/vendors"

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])

  function load() {
    setVendors(getVendors())
  }

  useEffect(() => {
    load()
  }, [])

  function handleRemove(id: string) {
    const ok = window.confirm("Remove this vendor?")
    if (!ok) return
    removeVendor(id)
    load()
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Vendors</h1>

        <Link
          to="/admin/vendors/new"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#2563eb",
            color: "white",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          + New Vendor
        </Link>
      </div>

      {vendors.length === 0 && (
        <div style={{ marginTop: 24, opacity: 0.7 }}>
          No vendors onboarded yet.
        </div>
      )}

      {vendors.length > 0 && (
        <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #334155" }}>
              <th style={{ padding: 10 }}>Tenant ID</th>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Admin Email</th>
              <th style={{ padding: 10 }}>Created</th>
              <th style={{ padding: 10 }}></th>
            </tr>
          </thead>

          <tbody>
            {vendors.map((v) => (
              <tr key={v.tenantId} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: 10, fontFamily: "monospace" }}>{v.tenantId}</td>
                <td style={{ padding: 10 }}>{v.name}</td>
                <td style={{ padding: 10 }}>{v.adminEmail}</td>
                <td style={{ padding: 10 }}>{new Date(v.createdAt).toLocaleString()}</td>
                <td style={{ padding: 10 }}>
                  <button
                    onClick={() => handleRemove(v.tenantId)}
                    style={{
                      background: "#7f1d1d",
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
