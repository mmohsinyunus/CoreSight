// src/pages/Subscriptions.tsx
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getEntitlements } from "../data/entitlements"
import type { EntitlementRecord } from "../data/entitlements"
import AppShell from "../layout/AppShell"

function isDueIn60Days(endDate?: string) {
  if (!endDate) return false
  const date = new Date(endDate)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 60
}

function deriveTone(status?: string): "ok" | "warn" | "info" | "danger" {
  const value = status?.toLowerCase() || ""
  if (value === "active") return "ok"
  if (value.includes("pending") || value.includes("trial")) return "warn"
  if (value.includes("expired") || value.includes("cancel")) return "danger"
  return "info"
}

export default function Subscriptions() {
  const nav = useNavigate()
  const [rows, setRows] = useState<EntitlementRecord[]>([])
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
        const data = await getEntitlements()
        if (!active) return
        setRows(data)
      } catch (err) {
        console.error("Failed to load entitlements", err)
        if (!active) return
        setRows([])
        setError("Failed to load subscriptions. Please try again.")
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
    const set = new Set<string>()
    rows.forEach((r) => {
      const val = r.status?.trim()
      if (val) set.add(val)
    })
    return Array.from(set)
  }, [rows])

  const tenantOptions = useMemo(() => {
    const set = new Set<string>()
    rows.forEach((r) => {
      const val = r.tenantId?.trim()
      if (val) set.add(val)
    })
    return Array.from(set)
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchQuery =
        !q ||
        row.entitlementId.toLowerCase().includes(q) ||
        row.vendorId.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q) ||
        row.planName.toLowerCase().includes(q)

      const matchStatus =
        statusFilter === "All" || row.status.toLowerCase() === statusFilter.toLowerCase()

      const matchTenant = tenantFilter === "All" || row.tenantId === tenantFilter

      return matchQuery && matchStatus && matchTenant
    })
  }, [rows, query, statusFilter, tenantFilter])

  const totalRows = filtered.length
  const activeCount = filtered.filter((r) => r.status.toLowerCase() === "active").length
  const dueSoonCount = filtered.filter((r) => isDueIn60Days(r.endDate)).length

  return (
    <AppShell
      title="Subscriptions"
      subtitle="Plans, seats, renewals, and actions"
      actions={
        <button className="cs-btn cs-btn-primary" onClick={() => nav("/renewals")}>
          View Renewals
        </button>
      }
    >
      <div style={stack}>
        <div style={kpiGrid}>
          <Kpi title="Total subscriptions" value={totalRows.toString()} />
          <Kpi title="Active" value={activeCount.toString()} />
          <Kpi title="Due in 60 days" value={dueSoonCount.toString()} />
        </div>

        <div style={bar}>
          <div style={barLeft}>
            <input
              className="cs-input"
              style={{ width: 280 }}
              placeholder="Search entitlement, vendor, product, or plan"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <select
              className="cs-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              className="cs-select"
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
            >
              <option value="All">All tenants</option>
              {tenantOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div style={barRight}>
            <button
              className="cs-btn"
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

        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={{ fontWeight: 800 }}>Subscriptions list</div>
              <div style={muted}>Click a row to open detail.</div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Entitlement ID</th>
                  <th style={th}>Vendor</th>
                  <th style={th}>Product</th>
                  <th style={th}>Plan</th>
                  <th style={th}>Status</th>
                  <th style={th}>End Date</th>
                  <th style={thRight}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td style={tdEmpty} colSpan={7}>
                      Loading subscriptions…
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td style={tdEmpty} colSpan={7}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error &&
                  filtered.map((row) => (
                    <tr
                      key={row.entitlementId}
                      style={tr}
                      onClick={() => nav(`/subscriptions/detail?id=${encodeURIComponent(row.entitlementId)}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          nav(`/subscriptions/detail?id=${encodeURIComponent(row.entitlementId)}`)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      title="Open subscription detail"
                    >
                      <td style={tdMono}>{row.entitlementId}</td>
                      <td style={tdStrong}>{row.vendorId}</td>
                      <td style={td}>{row.productName}</td>
                      <td style={td}>{row.planName}</td>
                      <td style={td}>
                        <Badge tone={deriveTone(row.status)}>{row.status || "Unknown"}</Badge>
                      </td>
                      <td style={tdMono}>{row.endDate || "—"}</td>
                      <td style={tdRight}>{row.quantity ?? "—"}</td>
                    </tr>
                  ))}

                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td style={tdEmpty} colSpan={7}>
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
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid rgba(15,23,42,0.08)",
  overflow: "hidden",
}

const cardHead: React.CSSProperties = {
  padding: 14,
  borderBottom: "1px solid rgba(15,23,42,0.08)",
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
