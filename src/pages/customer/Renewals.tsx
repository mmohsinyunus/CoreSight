import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import { ensureTenantLifecycleRecords, isRenewalExpiringSoon, listRenewalsByTenant } from "../../data/tenantRecords"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import CustomerPageShell from "./CustomerPageShell"
import { createRequest } from "../../data/requests"
import { addAuditLog } from "../../data/auditLogs"

export default function CustomerRenewals() {
  const { tenant, user } = useCustomerAuth()
  const [rows, setRows] = useState(() => (tenant ? listRenewalsByTenant(tenant.tenant_id) : []))
  const [toast, setToast] = useState<string | undefined>()

  useEffect(() => {
    if (!tenant) return
    ensureTenantLifecycleRecords(tenant)
    setRows(listRenewalsByTenant(tenant.tenant_id))
  }, [tenant])

  const initiateRenewal = (renewalId: string) => {
    if (!tenant || !user) return
    createRequest({
      tenant_id: tenant.tenant_id,
      requested_by: user.email,
      requested_by_user_id: user.user_id,
      type: "RENEWAL_REQUEST",
      payload: { renewal_id: renewalId, note: "Customer initiated" },
    })
    addAuditLog({
      actor_type: "CUSTOMER",
      actor_email: user.email,
      actor_user_id: user.user_id,
      tenant_id: tenant.tenant_id,
      action: "REQUEST_CREATED",
      meta: { type: "RENEWAL_REQUEST" },
    })
    setToast("Request submitted for admin review.")
  }

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
              <tr key={row.id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-elevated)" }}>
                <td className="cs-td">{row.subscription}</td>
                <td className="cs-td">
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {row.renewal_date}
                    {isRenewalExpiringSoon(row) ? <Badge /> : null}
                  </div>
                </td>
                <td className="cs-td">{row.term}</td>
                <td className="cs-td">
                  <span className="cs-pill" style={{ padding: "6px 10px", background: "var(--surface-elevated)" }}>
                    {row.status}
                  </span>
                </td>
                <td className="cs-td">{row.owner || "-"}</td>
                <td className="cs-td">{row.notes || "-"}</td>
                <td className="cs-td">
                  <button
                    className="cs-btn cs-btn-primary"
                    style={{ height: 36 }}
                    onClick={() => initiateRenewal(row.id)}
                  >
                    Initiate renewal
                  </button>
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
        {toast ? <div style={successBox}>{toast}</div> : null}
      </div>
    </CustomerPageShell>
  )
}

function Badge() {
  return (
    <span
      className="cs-pill"
      style={{ background: "rgba(255,193,7,0.12)", borderColor: "rgba(255,193,7,0.22)", color: "#f1c27d" }}
    >
      Expiring soon
    </span>
  )
}

const successBox: CSSProperties = {
  border: "1px solid rgba(77,163,255,0.35)",
  background: "rgba(77,163,255,0.08)",
  color: "var(--text)",
  padding: 10,
  borderRadius: 12,
  fontWeight: 700,
}
