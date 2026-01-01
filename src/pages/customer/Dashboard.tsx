import { useEffect, useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import CustomerPageShell from "./CustomerPageShell"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import {
  ensureTenantLifecycleRecords,
  isRenewalExpiringSoon,
  listRenewalsByTenant,
  listSubscriptionsByTenant,
} from "../../data/tenantRecords"
import type { RenewalRecord, SubscriptionRecord } from "../../data/tenantRecords"

export default function CustomerDashboard() {
  const { tenant } = useCustomerAuth()
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [renewals, setRenewals] = useState<RenewalRecord[]>([])
  const location = useLocation()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (location.state && (location.state as { message?: string }).message) {
      setNotice((location.state as { message?: string }).message)
      navigate(location.pathname, { replace: true })
    }
  }, [location, navigate])

  useEffect(() => {
    if (!tenant) return
    ensureTenantLifecycleRecords(tenant)
    setSubscriptions(listSubscriptionsByTenant(tenant.tenant_id))
    setRenewals(listRenewalsByTenant(tenant.tenant_id))
  }, [tenant])

  const nextRenewal = useMemo(() => {
    const sorted = [...renewals].sort((a, b) => a.renewal_date.localeCompare(b.renewal_date))
    return sorted[0]
  }, [renewals])

  const subscriptionStatus = useMemo(() => {
    const first = subscriptions[0]
    return first?.subscription_status || first?.status || "—"
  }, [subscriptions])

  const renewalBadge = nextRenewal && isRenewalExpiringSoon(nextRenewal)

  return (
    <CustomerPageShell title="Dashboard" subtitle="Executive overview for your tenant">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {["Usage", "Spend", "Signals", "Health"].map((card) => (
          <div key={card} className="cs-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>{card}</div>
            <div style={{ color: "var(--text-secondary)" }}>Placeholder KPI card — data wiring comes later.</div>
          </div>
        ))}

        <div className="cs-card" style={{ padding: 16, display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 800 }}>Subscription Status</div>
          <div style={{ color: "var(--text-secondary)" }}>Latest subscription posture</div>
          <div className="cs-pill" style={{ width: "fit-content", padding: "8px 12px", background: "var(--surface)" }}>
            {subscriptionStatus}
          </div>
        </div>

        <div className="cs-card" style={{ padding: 16, display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 800 }}>Next Renewal</div>
          <div style={{ color: "var(--text-secondary)" }}>Keep an eye on the next renewal date</div>
          {nextRenewal ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 800 }}>{nextRenewal.renewal_date}</div>
              {renewalBadge ? <Badge label="Expiring soon" /> : null}
            </div>
          ) : (
            <div style={{ color: "var(--muted)" }}>No renewals scheduled.</div>
          )}
        </div>
      </div>

      {notice ? <div style={{ ...noticeBox }}>{notice}</div> : null}
    </CustomerPageShell>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span
      className="cs-pill"
      style={{ background: "rgba(255,193,7,0.12)", borderColor: "rgba(255,193,7,0.22)", color: "#f1c27d" }}
    >
      {label}
    </span>
  )
}

const noticeBox: CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  fontWeight: 700,
  color: "var(--text)",
}
