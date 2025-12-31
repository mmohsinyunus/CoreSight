// src/pages/Renewals.tsx
import type { CSSProperties } from "react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppShell from "../layout/AppShell"

type RenewalStatus = "Due" | "In review" | "Approved" | "Rejected"

type RenewalRow = {
  id: string
  vendor: string
  subscription: string
  owner: string
  dueDate: string // YYYY-MM-DD
  amount: number
  status: RenewalStatus
  risk: "Low" | "Medium" | "High"
}

const DEMO_ROWS: RenewalRow[] = [
  {
    id: "ren_001",
    vendor: "Okta",
    subscription: "SSO Enterprise",
    owner: "IT Security",
    dueDate: "2026-01-18",
    amount: 148000,
    status: "In review",
    risk: "High",
  },
  {
    id: "ren_002",
    vendor: "Google Workspace",
    subscription: "Business Plus",
    owner: "IT Ops",
    dueDate: "2026-02-05",
    amount: 92000,
    status: "Due",
    risk: "Medium",
  },
  {
    id: "ren_003",
    vendor: "Salesforce",
    subscription: "Sales Cloud",
    owner: "Sales Ops",
    dueDate: "2026-03-01",
    amount: 315000,
    status: "Approved",
    risk: "Low",
  },
  {
    id: "ren_004",
    vendor: "Zoom",
    subscription: "Enterprise",
    owner: "IT Ops",
    dueDate: "2026-01-25",
    amount: 56000,
    status: "Rejected",
    risk: "Medium",
  },
]

function fmtMoney(amount: number, currency = "SAR") {
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

function daysUntil(dueDate: string) {
  const s = dueDate?.slice(0, 10)
  if (!s || s.length !== 10) return null
  const dt = new Date(`${s}T00:00:00`)
  if (Number.isNaN(dt.getTime())) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const ms = dt.getTime() - today.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export default function Renewals() {
  const nav = useNavigate()

  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"All" | RenewalStatus>("All")
  const [risk, setRisk] = useState<"All" | "Low" | "Medium" | "High">("All")

  // Demo-only (keeps UI consistent with "Refresh" button)
  const [loading, setLoading] = useState(false)
  const rows = DEMO_ROWS

  async function load() {
    setLoading(true)
    // Demo stub: mimic fetch latency without breaking build
    await new Promise((r) => setTimeout(r, 250))
    setLoading(false)
  }

  function openDetail(id: string) {
    // ✅ id param routing (works even if your detail route is /renewals/detail)
    // Prefer /renewals/detail/:id, but this still allows you to read params later.
    nav(`/renewals/detail?id=${encodeURIComponent(id)}`)
  }

  const distinctStatuses = useMemo(() => {
    const set = new Set<RenewalStatus>()
    rows.forEach((r) => set.add(r.status))
    return Array.from(set)
  }, [rows])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return rows.filter((r) => {
      const matchQ =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.vendor.toLowerCase().includes(query) ||
        r.subscription.toLowerCase().includes(query) ||
        r.owner.toLowerCase().includes(query)

      const matchStatus = status === "All" ? true : r.status === status
      const matchRisk = risk === "All" ? true : r.risk === risk

      return matchQ && matchStatus && matchRisk
    })
  }, [q, status, risk, rows])

  const totalValue = useMemo(() => {
    return filtered.reduce((sum, r) => sum + r.amount, 0)
  }, [filtered])

  const dueSoonCount = useMemo(() => {
    return filtered.filter((r) => {
      const d = daysUntil(r.dueDate)
      return d !== null && d >= 0 && d <= 30
    }).length
  }, [filtered])

  const overdueCount = useMemo(() => {
    return filtered.filter((r) => {
      const d = daysUntil(r.dueDate)
      return d !== null && d < 0
    }).length
  }, [filtered])

  return (
    <AppShell
      title="Renewals"
      subtitle="Renewals queue (demo rows for now)"
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="cs-btn" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button className="cs-btn cs-btn-primary" onClick={() => nav("/approvals")}>
            Open Approval Center
          </button>
        </div>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          <Kpi title="Items" value={String(filtered.length)} />
          <Kpi title="Total value" value={fmtMoney(totalValue)} />
          <Kpi title="Due ≤ 30 days" value={String(dueSoonCount)} />
          <Kpi title="Overdue" value={String(overdueCount)} />
        </div>

        <div className="cs-card" style={{ padding: 12, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="cs-input"
              style={{ width: 360, maxWidth: "72vw" }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search id, vendor, owner, subscription…"
            />

            <select style={select} value={status} onChange={(e) => setStatus(e.target.value as any)} title="Status">
              <option value="All">All statuses</option>
              {distinctStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select style={select} value={risk} onChange={(e) => setRisk(e.target.value as any)} title="Risk">
              <option value="All">All risk</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <button className="cs-btn" onClick={() => nav("/subscriptions")}>
            Back to Subscriptions
          </button>
        </div>

        <div className="cs-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: 14, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 900 }}>Renewals list</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{loading ? "Loading…" : `${filtered.length} rows`}</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Vendor</th>
                  <th style={th}>Subscription</th>
                  <th style={th}>Owner</th>
                  <th style={th}>Due date</th>
                  <th style={thRight}>Amount</th>
                  <th style={th}>Risk</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    style={tr}
                    onClick={() => openDetail(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openDetail(r.id)
                    }}
                    role="button"
                    tabIndex={0}
                    title="Open renewal detail"
                  >
                    <td style={tdStrong}>{r.vendor}</td>
                    <td style={td}>{r.subscription}</td>
                    <td style={td}>{r.owner}</td>
                    <td style={tdMono}>{r.dueDate}</td>
                    <td style={tdRight}>{fmtMoney(r.amount)}</td>
                    <td style={td}>
                      <Badge tone={r.risk === "High" ? "danger" : r.risk === "Medium" ? "warn" : "ok"}>{r.risk}</Badge>
                    </td>
                    <td style={td}>
                      <Badge
                        tone={
                          r.status === "Approved"
                            ? "ok"
                            : r.status === "Rejected"
                              ? "danger"
                              : r.status === "Due"
                                ? "warn"
                                : "info"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td style={tdEmpty} colSpan={7}>
                      No matching renewals.
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
    <div className="cs-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900 }}>{value}</div>
    </div>
  )
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "ok" | "warn" | "danger" | "info" }) {
  const bg =
    tone === "ok" ? "rgba(52,199,89,0.12)"
    : tone === "warn" ? "rgba(255,159,10,0.14)"
    : tone === "danger" ? "rgba(255,59,48,0.12)"
    : "rgba(10,132,255,0.12)"

  const border =
    tone === "ok" ? "rgba(52,199,89,0.25)"
    : tone === "warn" ? "rgba(255,159,10,0.28)"
    : tone === "danger" ? "rgba(255,59,48,0.25)"
    : "rgba(10,132,255,0.22)"

  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: 999, background: bg, border: `1px solid ${border}`, fontSize: 12, fontWeight: 900 }}>
      {children}
    </span>
  )
}

/* styles */
const select: CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(15,23,42,0.03)",
  padding: "0 10px",
  outline: "none",
}

const table: CSSProperties = { width: "100%", borderCollapse: "collapse" }

const th: CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  color: "rgba(15,23,42,0.6)",
  padding: "12px 14px",
  borderBottom: "1px solid rgba(15,23,42,0.08)",
  fontWeight: 800,
  whiteSpace: "nowrap",
}
const thRight: CSSProperties = { ...th, textAlign: "right" }

const tr: CSSProperties = { cursor: "pointer" }

const td: CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(15,23,42,0.06)",
  fontSize: 14,
  whiteSpace: "nowrap",
}

const tdStrong: CSSProperties = { ...td, fontWeight: 800 }

const tdMono: CSSProperties = {
  ...td,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  fontSize: 13,
  color: "rgba(15,23,42,0.8)",
}

const tdRight: CSSProperties = { ...td, textAlign: "right", fontWeight: 700 }

const tdEmpty: CSSProperties = { padding: 18, textAlign: "center", color: "rgba(15,23,42,0.6)" }
