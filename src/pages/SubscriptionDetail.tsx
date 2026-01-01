// src/pages/SubscriptionDetail.tsx
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  fetchSubscriptionEntitlementById,
  type SubscriptionEntitlement,
} from "../api/sheets"
import AppShell from "../layout/AppShell"

function deriveTone(status?: string): "ok" | "warn" | "info" | "danger" {
  const value = status?.toLowerCase() || ""
  if (value === "active") return "ok"
  if (value.includes("pending") || value.includes("trial")) return "warn"
  if (value.includes("expired") || value.includes("cancel")) return "danger"
  return "info"
}

export default function SubscriptionDetail() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [match, setMatch] = useState<SubscriptionEntitlement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const entitlementId = params.get("entitlement_id")?.trim() || ""

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!entitlementId) {
        setMatch(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await fetchSubscriptionEntitlementById(entitlementId)
        if (!active) return
        setMatch(data)
      } catch (err) {
        console.error("Failed to load entitlement", err)
        if (!active) return
        setMatch(null)
        setError("Failed to load subscription. Please try again.")
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [entitlementId])

  const statusTone = deriveTone(match?.status)
  const subscriptionId = match?.external_subscription_id || match?.entitlement_id || "Subscription"
  const entitlementLabel = entitlementId || match?.entitlement_id || "Entitlement"

  const actions = (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button className="cs-btn cs-btn-primary">Reclaim seats</button>
      <button
        className="cs-btn"
        onClick={() => {
          const q = match?.entitlement_id || entitlementId
          const target = q ? `/renewals?search=${encodeURIComponent(q)}` : "/renewals"
          nav(target, q ? { state: { search: q } } : undefined)
        }}
      >
        View renewals
      </button>
    </div>
  )

  const detailFields = useMemo(
    () => [
      { label: "Subscription ID", value: match?.external_subscription_id, mono: true },
      { label: "Entitlement ID", value: match?.entitlement_id, mono: true },
      { label: "Vendor ID", value: match?.vendor_id },
      { label: "Product Name", value: match?.product_name },
      { label: "Plan Name", value: match?.plan_name },
      { label: "SKU Code", value: match?.sku_code, mono: true },
      { label: "Status", value: match?.status },
      { label: "Start Date", value: match?.start_date },
      { label: "End Date", value: match?.end_date },
      { label: "Auto Renew", value: match?.auto_renew },
      { label: "Billing Cycle", value: match?.billing_cycle },
      { label: "Quantity", value: match?.quantity?.toString() },
      { label: "Subscription Group ID", value: match?.subscription_group_id, mono: true },
      { label: "Data Quality Flag", value: match?.data_quality_flag },
      { label: "Source System", value: match?.source_system },
      { label: "Tenant ID", value: match?.tenant_id },
      { label: "Created At", value: match?.created_at },
      { label: "Updated At", value: match?.updated_at },
    ],
    [match],
  )

  return (
    <AppShell
      title="Subscription Detail"
      subtitle="Reclaim, view lifecycle, and act on entitlements"
      actions={actions}
    >
      <div style={stack}>
        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{match?.product_name || subscriptionId}</div>
              <div style={muted}>Subscription ID: {subscriptionId}</div>
              <div style={muted}>Entitlement ID: {entitlementLabel}</div>
            </div>
            <Badge tone={statusTone}>{match?.status || "Unknown"}</Badge>
          </div>

          {loading && <div style={muted}>Loading subscription…</div>}
          {!loading && error && <div style={errorText}>{error}</div>}
          {!loading && !error && !entitlementId && (
            <div style={helperRow}>
              <div style={errorText}>Missing entitlement id.</div>
              <button className="cs-btn" onClick={() => nav("/subscriptions")}>
                Back to subscriptions
              </button>
            </div>
          )}
          {!loading && !error && entitlementId && !match && (
            <div style={helperRow}>
              <div style={errorText}>Subscription not found for entitlement: {entitlementId}</div>
              <button className="cs-btn" onClick={() => nav("/subscriptions")}>
                Back to subscriptions
              </button>
            </div>
          )}

          {!loading && !error && match && (
            <div style={detailGrid}>
              {detailFields.map((field) => (
                <DetailField key={field.label} label={field.label} value={field.value} mono={field.mono} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function DetailField({
  label,
  value,
  mono,
}: {
  label: string
  value?: string | number | null
  mono?: boolean
}) {
  return (
    <div style={detailField}>
      <div style={detailLabel}>{label}</div>
      <div style={{ ...detailValue, ...(mono ? monoStyle : {}) }}>{value || "-"}</div>
    </div>
  )
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "ok" | "warn" | "danger" | "info" }) {
  const bg =
    tone === "ok"
      ? "rgba(52,199,89,0.12)"
      : tone === "warn"
        ? "rgba(255,159,10,0.14)"
        : tone === "danger"
          ? "rgba(255,59,48,0.12)"
          : "rgba(10,132,255,0.12)"

  const border =
    tone === "ok"
      ? "rgba(52,199,89,0.25)"
      : tone === "warn"
        ? "rgba(255,159,10,0.28)"
        : tone === "danger"
          ? "rgba(255,59,48,0.25)"
          : "rgba(10,132,255,0.22)"

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  )
}

/* Styles */
const stack: React.CSSProperties = { display: "grid", gap: 14 }

const card: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: 16,
  border: "1px solid var(--border)",
  overflow: "hidden",
  boxShadow: "var(--shadow-sm)",
}

const cardHead: React.CSSProperties = {
  padding: 14,
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  background: "var(--surface-elevated)",
}

const muted: React.CSSProperties = {
  color: "var(--muted)",
  fontSize: 13,
}

const detailGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 12,
  padding: 14,
}

const detailField: React.CSSProperties = {
  background: "rgba(15,23,42,0.02)",
  borderRadius: 12,
  padding: 12,
  border: "1px solid rgba(15,23,42,0.06)",
}

const detailLabel: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(15,23,42,0.6)",
  fontWeight: 700,
}

const detailValue: React.CSSProperties = {
  marginTop: 6,
  fontSize: 15,
  fontWeight: 800,
}

const monoStyle: React.CSSProperties = {
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  fontSize: 13,
}

const errorText: React.CSSProperties = {
  color: "rgba(255,59,48,0.9)",
  padding: "0 14px 14px",
  fontWeight: 700,
}

const helperRow: React.CSSProperties = {
  padding: "0 14px 14px",
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
}
