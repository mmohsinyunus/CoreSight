import { useEffect, useMemo, useState } from "react"
import CustomerPageShell from "./CustomerPageShell"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import { ensureDepartmentSeed, listDepartmentsByTenant } from "../../data/departments"

export default function ReportsDepartments() {
  const { tenant } = useCustomerAuth()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (tenant && !initialized) {
      ensureDepartmentSeed(tenant.tenant_id)
      setInitialized(true)
    }
  }, [initialized, tenant])

  const departments = useMemo(() => {
    if (!tenant) return []
    return listDepartmentsByTenant(tenant.tenant_id)
  }, [tenant, initialized])

  return (
    <CustomerPageShell title="Departments" subtitle="Directory of departments and owners">
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 12 }}>
        <div className="cs-tile">
          <div className="cs-eyebrow">Total departments</div>
          <div className="cs-metric">{departments.length}</div>
        </div>

        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Name</th>
              <th className="cs-th">Owner</th>
              <th className="cs-th">Created</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.department_id}>
                <td className="cs-td">{dept.name}</td>
                <td className="cs-td">{dept.owner || "-"}</td>
                <td className="cs-td">{dept.created_at ? new Date(dept.created_at).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td className="cs-td" colSpan={3} style={{ textAlign: "center", color: "var(--muted)" }}>
                  No departments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </CustomerPageShell>
  )
}
