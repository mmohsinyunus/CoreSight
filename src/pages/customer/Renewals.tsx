import { useEffect, useState } from "react"
import { ensureTenantLifecycleRecords, listRenewalsByTenant } from "../../data/tenantRecords"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import CustomerPageShell from "./CustomerPageShell"

export default function CustomerRenewals() {
  const { tenant } = useCustomerAuth()
  const [rows, setRows] = useState(() => (tenant ? listRenewalsByTenant(tenant.tenant_id) : []))

  useEffect(() => {
    if (!tenant) return
    ensureTenantLifecycleRecords(tenant)
    setRows(listRenewalsByTenant(tenant.tenant_id))
  }, [tenant])

  return (
    <CustomerPageShell title="Renewals" subtitle="Key renewal dates and owners">
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0 }}>{tenant ? `${tenant.tenant_name} renewals` : "Upcoming renewals"}</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Track renewal readiness and assign owners.
            </p>
          </div>
          <button className="cs-btn cs-btn-primary">Initiate Renewal</button>
        </div>

        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Subscription</th>
              <th className="cs-th">Renewal Date</th>
              <th className="cs-th">Term</th>
              <th className="cs-th">Status</th>
              <th className="cs-th">Owner</th>
              <th className="cs-th">Notes</th>
              <th className="cs-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "#181c23" }}>
                <td className="cs-td">{row.subscription}</td>
                <td className="cs-td">{row.renewal_date}</td>
                <td className="cs-td">{row.term}</td>
                <td className="cs-td">
                  <span className="cs-pill" style={{ padding: "6px 10px", background: "var(--surface-elevated)" }}>
                    {row.status}
                  </span>
                </td>
                <td className="cs-td">{row.owner || "-"}</td>
                <td className="cs-td">{row.notes || "-"}</td>
                <td className="cs-td">
                  <button className="cs-btn" style={{ height: 36 }}>Details</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="cs-td" colSpan={7} style={{ color: "var(--muted)", textAlign: "center" }}>
                  {tenant ? "No renewals scheduled yet." : "Select a tenant to continue."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </CustomerPageShell>
  )
}
