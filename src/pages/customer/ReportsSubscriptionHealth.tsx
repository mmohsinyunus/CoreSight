import { useMemo } from "react"
import CustomerPageShell from "./CustomerPageShell"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import { isRenewalExpiringSoon, listRenewalsByTenant, listSubscriptionsByTenant } from "../../data/tenantRecords"

function daysToExpiry(date?: string) {
  if (!date) return undefined
  const end = new Date(date)
  if (Number.isNaN(end.getTime())) return undefined
  const diff = end.getTime() - Date.now()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export default function ReportsSubscriptionHealth() {
  const { tenant } = useCustomerAuth()
  const subscription = useMemo(() => {
    if (!tenant) return undefined
    return listSubscriptionsByTenant(tenant.tenant_id)[0]
  }, [tenant])

  const renewal = useMemo(() => {
    if (!tenant) return undefined
    return listRenewalsByTenant(tenant.tenant_id)[0]
  }, [tenant])

  const expiryDays = daysToExpiry(subscription?.end_date || subscription?.subscription_end_date)
  const expiringSoon = renewal ? isRenewalExpiringSoon(renewal) : false

  return (
    <CustomerPageShell title="Subscription health" subtitle="Plan posture and renewal readiness">
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <div className="cs-tile">
            <div className="cs-eyebrow">Current plan</div>
            <div className="cs-metric">{subscription?.plan || subscription?.plan_type || "Not set"}</div>
            <div style={{ color: "var(--text-secondary)", marginTop: 6 }}>
              Status: {subscription?.status || subscription?.subscription_status || "Unknown"}
            </div>
          </div>
          <div className="cs-tile">
            <div className="cs-eyebrow">Days to expiry</div>
            <div className="cs-metric">{expiryDays ?? "—"}</div>
            <div style={{ color: "var(--text-secondary)", marginTop: 6 }}>
              End date: {subscription?.end_date || subscription?.subscription_end_date || "-"}
            </div>
          </div>
          <div className="cs-tile">
            <div className="cs-eyebrow">Next renewal</div>
            <div className="cs-metric">{renewal?.renewal_date || "-"}</div>
            <div style={{ color: "var(--text-secondary)", marginTop: 6 }}>
              Status: {renewal?.status || "Unknown"}
            </div>
          </div>
        </div>

        {expiringSoon ? (
          <div className="cs-alert cs-alert-warn">Expiring soon. Engage with procurement.</div>
        ) : null}

        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Field</th>
              <th className="cs-th">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="cs-td">Plan type</td>
              <td className="cs-td">{subscription?.plan_type || subscription?.plan || "-"}</td>
            </tr>
            <tr>
              <td className="cs-td">Subscription status</td>
              <td className="cs-td">{subscription?.status || subscription?.subscription_status || "-"}</td>
            </tr>
            <tr>
              <td className="cs-td">Start date</td>
              <td className="cs-td">{subscription?.start_date || subscription?.subscription_start_date || "-"}</td>
            </tr>
            <tr>
              <td className="cs-td">End date</td>
              <td className="cs-td">{subscription?.end_date || subscription?.subscription_end_date || "-"}</td>
            </tr>
            <tr>
              <td className="cs-td">Seats</td>
              <td className="cs-td">{subscription?.seats ?? subscription?.max_users ?? "-"}</td>
            </tr>
            <tr>
              <td className="cs-td">Renewal date</td>
              <td className="cs-td">{renewal?.renewal_date || "-"}</td>
            </tr>
            <tr>
              <td className="cs-td">Renewal status</td>
              <td className="cs-td">{renewal?.status || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CustomerPageShell>
  )
}
