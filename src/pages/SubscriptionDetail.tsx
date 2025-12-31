// src/pages/SubscriptionDetail.tsx
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getSubscriptions } from "../data/subscriptions"
import type { SubscriptionRecord } from "../data/subscriptions"
import AppShell from "../layout/AppShell"

function fmtMoney(amount?: number, currency = "USD") {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—"

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`
  }
}

export default function SubscriptionDetail() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [rows, setRows] = useState<SubscriptionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const id = params.get("id")?.trim() || ""

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getSubscriptions()
        if (!active) return
        setRows(data)
      } catch (err) {
        console.error("Failed to load subscriptions", err)
        if (!active) return
        setError("Failed to load subscription. Please try again.")
        setRows([])
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const match = useMemo(() => {
    if (!id) return null
    const needle = id.toLowerCase()

    return (
      rows.find((r) =>
        [r.id, r.raw.entitlement_id, r.raw.id]
          .filter(Boolean)
          .some((candidate) => candidate?.toLowerCase() === needle),
      ) || null
    )
  }, [id, rows])

  const primaryVendorOrName = match?.vendor || match?.name || id

  const actions = (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button style={primaryBtn}>Reclaim Seats</button>
      <button
        style={ghostBtn}
        onClick={() =>
          nav(`/renewals?search=${encodeURIComponent(primaryVendorOrName)}`, {
            state: { search: primaryVendorOrName },
          })
        }
      >
        View Renewals
      </button>
    </div>
  )

  return (
    <AppShell title="Subscription Detail" subtitle="Reclaim, edit, and audit trail" actions={actions}>
      <div style={stack}>
        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{match?.name || "Subscription"}</div>
              <div style={muted}>ID: {match?.id || id || "(missing)"}</div>
            </div>
            <Badge tone={match?.status.toLowerCase().includes("active") ? "ok" : "info"}>
              {match?.status || "Unknown"}
            </Badge>
          </div>

          <div style={detailGrid}>
            <DetailField label="Vendor" value={match?.vendor || "-"} />
            <DetailField label="Tenant" value={match?.tenantId || "-"} />
            <DetailField label="Start date" value={match?.startDate || "-"} />
            <DetailField label="End date" value={match?.endDate || "-"} />
            <DetailField label="Amount" value={fmtMoney(match?.amount, match?.currency)} />
            <DetailField label="Currency" value={match?.currency || "-"} />
            <DetailField label="Subscription ID" value={match?.id || "-"} mono />
            <DetailField label="Entitlement ID" value={match?.raw.entitlement_id || "-"} mono />
            <DetailField label="Raw status" value={match?.raw.status || "-"} />
          </div>

          {loading && <div style={muted}>Loading subscription…</div>}
          {!loading && error && <div style={errorText}>{error}</div>}
          {!loading && !error && !match && id && (
            <div style={errorText}>Subscription not found for ID: {id}</div>
          )}
          {!id && <div style={errorText}>Missing subscription id.</div>}
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
  value: string
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
  background: "#fff",
  borderRadius: 16,
  border: "1px solid rgba(15,23,42,0.08)",
  overflow: "hidden",
}

const cardHead: React.CSSProperties = {
  padding: 14,
  borderBottom: "1px solid rgba(15,23,42,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
}

const muted: React.CSSProperties = {
  color: "rgba(15,23,42,0.6)",
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

const ghostBtn: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "#fff",
  fontWeight: 700,
}

const primaryBtn: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid rgba(10,132,255,0.25)",
  background: "rgba(10,132,255,0.12)",
  fontWeight: 800,
}
