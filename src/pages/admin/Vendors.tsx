import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AppShell from "../../layout/AppShell"
import type { Vendor } from "../../data/vendors"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

export default function Vendors() {
  const [rows, setRows] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(SHEET_URL, { redirect: "follow", cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Vendor[]
      setRows(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      setError((e as Error)?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AppShell title="Tenants">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          Tenants from Google Sheet (Tenants tab)
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={load}>Refresh</button>
          <Link to="/admin/vendor-new" className="btn-primary">
            + Onboard Tenant
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)" }}>Loading…</div>
      ) : error ? (
        <div style={{ color: "var(--accent-bad)" }}>Failed to fetch: {error}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Country</th>
              <th>Admin Email</th>
              <th>VAT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.tenant_id}>
                <td>{v.tenant_code}</td>
                <td>{v.tenant_name}</td>
                <td>{v.tenant_type}</td>
                <td>{v.plan_type}</td>
                <td>{v.subscription_status}</td>
                <td>{v.primary_country}</td>
                <td>{v.primary_admin_email}</td>
                <td>{v.vat_registration_number || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AppShell>
  )
}
