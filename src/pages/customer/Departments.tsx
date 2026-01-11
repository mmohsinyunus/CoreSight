import { useEffect, useMemo, useState } from "react"
import CustomerPageShell from "./CustomerPageShell"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import { ensureDepartmentSeed, listDepartmentsByTenant } from "../../data/departments"

export default function CustomerDepartments() {
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
    <CustomerPageShell title="Departments" subtitle="Department level controls and visibility">
      <div className="cs-card" style={{ padding: 18 }}>
        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Name</th>
              <th className="cs-th">Owner</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, idx) => (
              <tr key={dept.department_id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-elevated)" }}>
                <td className="cs-td">{dept.name}</td>
                <td className="cs-td">{dept.owner || "-"}</td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td className="cs-td" colSpan={2} style={{ textAlign: "center", color: "var(--muted)" }}>
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
