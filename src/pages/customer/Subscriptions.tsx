import { useEffect, useState } from "react"
import type { CSSProperties } from "react"
import { ensureTenantLifecycleRecords, listSubscriptionsByTenant } from "../../data/tenantRecords"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import CustomerPageShell from "./CustomerPageShell"
import { createRequest } from "../../data/requests"
import { addAuditLog } from "../../data/auditLogs"

export default function CustomerSubscriptions() {
  const { tenant, user } = useCustomerAuth()
  const [rows, setRows] = useState(() => (tenant ? listSubscriptionsByTenant(tenant.tenant_id) : []))
  const [toast, setToast] = useState<string | undefined>()

  useEffect(() => {
    if (!tenant) return
    ensureTenantLifecycleRecords(tenant)
    setRows(listSubscriptionsByTenant(tenant.tenant_id))
  }, [tenant])

  const requestUpgrade = () => {
    if (!tenant || !user) return
    createRequest({
      tenant_id: tenant.tenant_id,
      requested_by: user.email,
      requested_by_user_id: user.user_id,
      type: "UPGRADE_REQUEST",
      payload: { desired_plan: "Enterprise", note: "Customer submitted via portal" },
    })
    addAuditLog({
      actor_type: "CUSTOMER",
      actor_email: user.email,
      actor_user_id: user.user_id,
      tenant_id: tenant.tenant_id,
      action: "REQUEST_CREATED",
      meta: { type: "UPGRADE_REQUEST" },
    })
    setToast("Request submitted for admin review.")
  }

  return (
    <CustomerPageShell title="Subscriptions" subtitle="Current entitlements, terms, and upgrade controls">
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0 }}>{tenant ? `${tenant.tenant_name} subscriptions` : "Subscriptions"}</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Boardroom-ready view of your plans and renewal posture.
            </p>
          </div>
          <button className="cs-btn cs-btn-primary" onClick={requestUpgrade}>
            Request upgrade
          </button>
        </div>

        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Plan</th>
              <th className="cs-th">Status</th>
              <th className="cs-th">Start Date</th>
              <th className="cs-th">End Date</th>
              <th className="cs-th">Seats</th>
              <th className="cs-th">Renewal Type</th>
              <th className="cs-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-elevated)" }}>
                <td className="cs-td">{row.plan}</td>
                <td className="cs-td">
                  <span className="cs-pill" style={{ padding: "6px 10px", background: "var(--surface-elevated)" }}>
                    {row.status}
                  </span>
                </td>
                <td className="cs-td">{row.start_date || "-"}</td>
                <td className="cs-td">{row.end_date || "-"}</td>
                <td className="cs-td">{row.seats ?? "-"}</td>
                <td className="cs-td">{row.renewal_type || "Annual"}</td>
                <td className="cs-td">
                  <button className="cs-btn" style={{ height: 36 }} onClick={requestUpgrade}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="cs-td" colSpan={7} style={{ color: "var(--muted)", textAlign: "center" }}>
                  {tenant ? "No subscriptions found for this tenant." : "Select a tenant to continue."}
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

const successBox: CSSProperties = {
  border: "1px solid rgba(77,163,255,0.35)",
  background: "rgba(77,163,255,0.08)",
  color: "var(--text)",
  padding: 10,
  borderRadius: 12,
  fontWeight: 700,
}
