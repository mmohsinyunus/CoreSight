import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import AppShell from "../../layout/AppShell"
import type { Vendor } from "../../data/vendors"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

function safeKey(v: Vendor) {
  // UI should never depend on tenant_code, but for React key we can fallback
  // to keep rendering stable if some sheet rows are missing tenant_id.
  if (v.tenant_id && v.tenant_id.trim()) return v.tenant_id
  if (v.tenant_code && v.tenant_code.trim()) return v.tenant_code
  return `${v.tenant_name || "tenant"}_${v.primary_admin_email || "admin"}`
}

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

  const hasRows = rows.length > 0

  const missingTenantIdCount = useMemo(() => {
    return rows.filter((r) => !r.tenant_id || !r.tenant_id.trim()).length
  }, [rows])

  return (
    <AppShell title="Tenants">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          Tenants from Google Sheet (Tenants tab)
          {missingTenantIdCount > 0 ? (
            <span style={{ marginLeft: 10, color: "var(--accent-warn)" }}>
              ({missingTenantIdCount} row(s) missing tenant_id)
            </span>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <Link to="/admin/vendor-new" className="btn-primary">
            + Onboard Tenant
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--muted)" }}>Loading…</div>
      ) : error ? (
        <div style={{ color: "var(--accent-bad)" }}>Failed to fetch: {error}</div>
      ) : !hasRows ? (
        <div style={{ color: "var(--muted)" }}>
          No tenants returned from the sheet yet. Try onboarding a tenant, then Refresh.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tenant ID</th>
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
              <tr key={safeKey(v)}>
                {/* IMPORTANT: UI shows tenant_id only (no tenant_code fallback) */}
                <td>{v.tenant_id?.trim() ? v.tenant_id : "-"}</td>

                <td>{v.tenant_name || "-"}</td>
                <td>{v.tenant_type || "-"}</td>
                <td>{v.plan_type || "-"}</td>
                <td>{v.subscription_status || "-"}</td>
                <td>{v.primary_country || "-"}</td>
                <td>{v.primary_admin_email || "-"}</td>
                <td>{v.vat_registration_number?.trim() ? v.vat_registration_number : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AppShell>
  )
}
