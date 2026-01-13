import { useEffect, useMemo, useState } from "react"
import AppShell from "../../layout/AppShell"
import { fetchTenantsFromSheet, listTenants, setTenantStatus } from "../../data/tenants"
import type { Tenant, TenantStatus } from "../../data/tenants"
import { Link } from "react-router-dom"
import { adminNav } from "../../navigation/adminNav"

export default function AdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [query, setQuery] = useState("")
  const [usingMirror, setUsingMirror] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(undefined)
    setUsingMirror(false)
    try {
      const rows = await fetchTenantsFromSheet()
      setTenants(rows)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load tenants"
      setError(message)
      const mirror = listTenants()
      setTenants(mirror)
      if (mirror.length > 0) setUsingMirror(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tenants
    return tenants.filter((t) => {
      const name = (t.tenant_name || "").toLowerCase()
      const id = (t.tenant_id || "").toLowerCase()
      const legal = (t.legal_name || "").toLowerCase()
      return id.includes(q) || name.includes(q) || legal.includes(q)
    })
  }, [query, tenants])

  const toggleStatus = (tenant: Tenant) => {
    const nextStatus: TenantStatus = tenant.status === "Active" ? "Inactive" : "Active"
    const updated = setTenantStatus(tenant.tenant_id, nextStatus)
    if (updated) setTenants(listTenants())
  }

  return (
    <AppShell title="Tenants" subtitle="Administer tenant records" navItems={adminNav} chips={["Admin", "CoreSight"]}>
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>All tenants</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Source of truth: Google Sheet.{" "}
              {usingMirror ? "Showing mirror copy (may be outdated)." : "Live fetch."}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="cs-input"
              placeholder="Search tenant ID, name, or legal name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ minWidth: 260 }}
            />
            <button className="cs-btn" onClick={load} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <Link className="cs-btn cs-btn-primary" to="/admin/tenants/new">
              + Create Tenant
            </Link>
          </div>
        </div>

        {error ? (
          <div
            style={{
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text)",
              padding: 12,
              borderRadius: 12,
            }}
          >
            Unable to reach Google Sheet: {error}. {usingMirror ? "Loaded from local mirror." : ""}
          </div>
        ) : null}

        <div style={{ overflow: "auto" }}>
          <table className="cs-table">
            <thead>
              <tr>
                <th className="cs-th">#</th>
                <th className="cs-th">Tenant</th>
                <th className="cs-th">Tenant ID</th>
                <th className="cs-th">Country</th>
                <th className="cs-th">Plan</th>
                <th className="cs-th">Subscription</th>
                <th className="cs-th">Status</th>
                <th className="cs-th">Created</th>
                <th className="cs-th">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((tenant, idx) => (
                <tr
                  key={tenant.tenant_id || `${tenant.tenant_name || "tenant"}-${idx}`}
                  style={{ background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-elevated)" }}
                >
                  <td className="cs-td" style={{ width: 44 }}>
                    {idx + 1}
                  </td>

                  <td className="cs-td">
                    <div style={{ fontWeight: 800 }}>{tenant.tenant_name || "-"}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>
                      {tenant.tenant_type || tenant.legal_name || "-"}
                    </div>
                  </td>

                  <td
                    className="cs-td"
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tenant.tenant_id || "-"}
                  </td>

                  <td className="cs-td">{tenant.region ?? "-"}</td>
                  <td className="cs-td">{tenant.plan_type || tenant.subscription || "-"}</td>
                  <td className="cs-td">{tenant.subscription_status || "-"}</td>
                  <td className="cs-td">
                    <span
                      className="cs-pill"
                      style={{
                        background: "var(--surface-elevated)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="cs-td">{tenant.created_at ? tenant.created_at.slice(0, 10) : "-"}</td>

                  <td
                    className="cs-td"
                    style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}
                  >
                    {tenant.tenant_id ? (
                      <Link className="cs-btn" to={`/admin/tenants/${tenant.tenant_id}`}>
                        View
                      </Link>
                    ) : (
                      <button className="cs-btn" type="button" disabled>
                        View
                      </button>
                    )}
                    <button className="cs-btn" onClick={() => toggleStatus(tenant)} disabled={loading || !tenant.tenant_id}>
                      {tenant.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="cs-td" colSpan={9} style={{ textAlign: "center", color: "var(--muted)" }}>
                    {loading ? "Loading tenants…" : "No tenants match the filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
