// src/pages/admin/Vendors.tsx

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import type { Vendor } from "../../data/vendors"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwOTaKdVIB9UsqEnlj2yVbjaEWd5rNlGIYezcotXHe4jpbcJ6Em82HM9uPVSCQLRh0tBw/exec"

// ---------- styles ----------
const page: React.CSSProperties = {
  padding: 28,
  maxWidth: 1200,
  margin: "0 auto",
}

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
}

const title: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
}

const btn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  background: "#2aa1ff",
  color: "#001018",
  textDecoration: "none",
  fontWeight: 700,
}

const tableWrap: React.CSSProperties = {
  borderRadius: 14,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
}

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  opacity: 0.75,
  borderBottom: "1px solid rgba(255,255,255,0.08)",
}

const td: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 13,
  borderBottom: "1px solid rgba(255,255,255,0.05)",
}

const badge = (bg: string): React.CSSProperties => ({
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  background: bg,
  color: "white",
})

const muted: React.CSSProperties = { opacity: 0.7 }

// ---------- component ----------
export default function Vendors() {
  const [rows, setRows] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(SHEET_URL, { method: "GET" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        setRows(Array.isArray(data) ? (data as Vendor[]) : [])
      } catch (e: any) {
        setError(e?.message || "Failed to load tenants")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div style={page}>
      <div style={header}>
        <div style={title}>Tenants</div>
        <Link to="/admin/vendor-new" style={btn}>
          + Create Tenant
        </Link>
      </div>

      {loading && <div style={muted}>Loading tenants…</div>}
      {error && <div style={{ color: "#ff8080" }}>{error}</div>}

      {!loading && !error && (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Code</th>
                <th style={th}>Tenant Name</th>
                <th style={th}>Type</th>
                <th style={th}>Plan</th>
                <th style={th}>Status</th>
                <th style={th}>Country</th>
                <th style={th}>Admin Email</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.tenant_id}>
                  <td style={td}>{v.tenant_code}</td>
                  <td style={td}>{v.tenant_name}</td>
                  <td style={td}>{v.tenant_type}</td>
                  <td style={td}>{v.plan_type}</td>
                  <td style={td}>
                    <span
                      style={badge(
                        v.subscription_status === "Active"
                          ? "rgba(80,255,180,0.25)"
                          : v.subscription_status === "Trial"
                          ? "rgba(255,180,80,0.25)"
                          : "rgba(160,160,160,0.20)"
                      )}
                    >
                      {v.subscription_status}
                    </span>
                  </td>
                  <td style={td}>{v.primary_country}</td>
                  <td style={td}>{v.primary_admin_email}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td style={td} colSpan={7}>
                    <span style={muted}>No tenants found</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
