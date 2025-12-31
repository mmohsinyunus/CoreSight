// src/pages/Subscriptions.tsx
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
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

function isDueSoon(endDate?: string) {
  if (!endDate) return false
  const date = new Date(endDate)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = diff / (1000 * 60 * 60 * 24)
  return days >= 0 && days <= 60
}

export default function Subscriptions() {
  const nav = useNavigate()
  const [rows, setRows] = useState<SubscriptionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [tenantFilter, setTenantFilter] = useState("All")

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
        setError("Failed to load subscriptions. Please try again.")
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

  const statusOptions = useMemo(() => {
    const unique = new Set<string>()
    rows.forEach((r) => {
      const val = r.status?.trim()
      if (val) unique.add(val)
    })
    return Array.from(unique)
  }, [rows])

  const tenantOptions = useMemo(() => {
    const unique = new Set<string>()
    rows.forEach((r) => {
      const val = r.tenantId?.trim()
      if (val) unique.add(val)
    })
    unique.delete("—")
    return Array.from(unique)
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.vendor.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "All" || r.status.toLowerCase() === statusFilter.toLowerCase()

      const matchesTenant = tenantFilter === "All" || r.tenantId === tenantFilter

      return matchesQuery && matchesStatus && matchesTenant
    })
  }, [rows, query, statusFilter, tenantFilter])

  const totalSubscriptions = filtered.length
  const activeCount = filtered.filter((r) => r.status.toLowerCase().includes("active")).length
  const dueSoonCount = filtered.filter((r) => isDueSoon(r.endDate)).length

  return (
    <AppShell
      title="Subscriptions"
      subtitle="Plans, seats, renewals, and actions"
      actions={
        <button style={primaryBtn} onClick={() => nav("/renewals")}>
          View Renewals
        </button>
      }
    >
      <div style={stack}>
        {/* KPI strip */}
        <div style={kpiGrid}>
          <Kpi title="Total subscriptions" value={totalSubscriptions.toString()} />
          <Kpi title="Active" value={activeCount.toString()} />
          <Kpi title="Due for renewal" value={dueSoonCount.toString()} />
        </div>

        {/* Action bar */}
        <div style={bar}>
          <div style={barLeft}>
            <input
              style={search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vendor, subscription, or ID"
            />

            <select
              style={select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s || "(empty)"}
                </option>
              ))}
            </select>

            {tenantOptions.length > 0 && (
              <select
                style={select}
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
              >
                <option value="All">All tenants</option>
                {tenantOptions.map((t) => (
                  <option key={t} value={t}>
                    {t || "(empty)"}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={barRight}>
            <button
              style={ghostBtn}
              onClick={() => {
                setQuery("")
                setStatusFilter("All")
                setTenantFilter("All")
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={card}>
          <div style={cardHead}>
            <div style={{ fontWeight: 700 }}>Subscriptions list</div>
            <div style={muted}>Click a row to open detail.</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Subscription ID</th>
                  <th style={th}>Vendor</th>
                  <th style={th}>Name</th>
                  <th style={th}>Tenant</th>
                  <th style={th}>Status</th>
                  <th style={th}>Start</th>
                  <th style={th}>End</th>
                  <th style={thRight}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td style={tdEmpty} colSpan={8}>
                      Loading subscriptions…
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td style={tdEmpty} colSpan={8}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error &&
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      style={tr}
                      onClick={() => nav(`/subscriptions/detail?id=${encodeURIComponent(r.id)}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          nav(`/subscriptions/detail?id=${encodeURIComponent(r.id)}`)
                      }}
                      role="button"
                      tabIndex={0}
                      title="Open subscription detail"
                    >
                      <td style={tdMono}>{r.id}</td>
                      <td style={tdStrong}>{r.vendor}</td>
                      <td style={td}>{r.name}</td>
                      <td style={td}>{r.tenantId}</td>
                      <td style={td}>
                        <Badge tone={r.status.toLowerCase().includes("active") ? "ok" : "info"}>
                          {r.status}
                        </Badge>
                      </td>
                      <td style={tdMono}>{r.startDate || "-"}</td>
                      <td style={tdMono}>{r.endDate || "-"}</td>
                      <td style={tdRight}>{fmtMoney(r.amount, r.currency)}</td>
                    </tr>
                  ))}

                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td style={tdEmpty} colSpan={8}>
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
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

const kpiGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
}

const kpi: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  border: "1px solid rgba(15,23,42,0.08)",
}

const kpiTitle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(15,23,42,0.6)",
  fontWeight: 700,
}

const kpiValue: React.CSSProperties = {
  marginTop: 6,
  fontSize: 20,
  fontWeight: 800,
}

const bar: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 12,
  border: "1px solid rgba(15,23,42,0.08)",
  display: "flex",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
}

const barLeft: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
}

const barRight: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
}

const search: React.CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(15,23,42,0.03)",
  padding: "0 12px",
  outline: "none",
  width: 320,
  maxWidth: "72vw",
}

const select: React.CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(15,23,42,0.03)",
  padding: "0 10px",
  outline: "none",
}

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
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
}

const muted: React.CSSProperties = {
  color: "rgba(15,23,42,0.6)",
  fontSize: 13,
}

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
}

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  color: "rgba(15,23,42,0.6)",
  padding: "12px 14px",
  borderBottom: "1px solid rgba(15,23,42,0.08)",
  fontWeight: 800,
  whiteSpace: "nowrap",
}

const thRight: React.CSSProperties = { ...th, textAlign: "right" }

const tr: React.CSSProperties = {
  cursor: "pointer",
  transition: "background 160ms ease, transform 160ms ease",
}

const td: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(15,23,42,0.06)",
  fontSize: 14,
  whiteSpace: "nowrap",
}

const tdStrong: React.CSSProperties = { ...td, fontWeight: 800 }

const tdMono: React.CSSProperties = {
  ...td,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  fontSize: 13,
  color: "rgba(15,23,42,0.8)",
}

const tdRight: React.CSSProperties = { ...td, textAlign: "right", fontWeight: 700 }

const tdEmpty: React.CSSProperties = {
  padding: 18,
  textAlign: "center",
  color: "rgba(15,23,42,0.6)",
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
