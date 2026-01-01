import { useEffect, useState } from "react"
import AppShell from "../../layout/AppShell"
import { listTenants, setTenantStatus } from "../../data/tenants"
import type { Tenant, TenantStatus } from "../../data/tenants"
import { Link } from "react-router-dom"
import { adminNav } from "./nav"

export default function AdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])

  useEffect(() => {
    setTenants(listTenants())
  }, [])

  const toggleStatus = (tenant: Tenant) => {
    const nextStatus: TenantStatus = tenant.status === "Active" ? "Inactive" : "Active"
    const updated = setTenantStatus(tenant.tenant_id, nextStatus)
    if (updated) {
      setTenants(listTenants())
    }
  }

  return (
    <AppShell title="Tenants" subtitle="Administer tenant records" navSections={adminNav} chips={["Admin", "CoreSight"]}>
      <div className="cs-card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>All tenants</h3>
          <Link className="cs-btn cs-btn-primary" to="/admin/tenants/new">
            + Create Tenant
          </Link>
        </div>
        <div style={{ overflow: "auto" }}>
          <table className="cs-table">
            <thead>
              <tr>
                <th className="cs-th">Tenant</th>
                <th className="cs-th">Code</th>
                <th className="cs-th">Region</th>
                <th className="cs-th">Status</th>
                <th className="cs-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, idx) => (
                <tr key={tenant.tenant_id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "#181c23" }}>
                  <td className="cs-td">
                    <div style={{ fontWeight: 800 }}>{tenant.tenant_name}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{tenant.legal_name}</div>
                  </td>
                  <td className="cs-td">{tenant.tenant_code}</td>
                  <td className="cs-td">{tenant.region ?? "-"}</td>
                  <td className="cs-td">
                    <span className="cs-pill" style={{ background: "rgba(77,163,255,0.12)", borderColor: "var(--border)" }}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="cs-td" style={{ display: "flex", gap: 10 }}>
                    <Link className="cs-btn" to={`/admin/tenants/${tenant.tenant_id}/edit`}>
                      View / Edit
                    </Link>
                    <button className="cs-btn" onClick={() => toggleStatus(tenant)}>
                      {tenant.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
