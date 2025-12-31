// src/pages/Renewals.tsx
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchSheetData } from "../data/api"
import AppShell from "../layout/AppShell"

type RenewalStatus = "Due" | "In review" | "Approved" | "Rejected"

export interface RenewalRow {
  renewal_id: string
  vendor_id: string
  renewal_due_date: string
  renewal_status: string
  previous_price: number
  renewed_price: number
  currency: string
  price_change_percentage: number
  auto_renew_flag: string
  budget_status: string
  record_status: string
}

type UiRenewalRow = {
  id: string
  vendor: string
  subscription: string
  owner: string
  dueDate: string // YYYY-MM-DD
  amount: number
  status: RenewalStatus
  risk: "Low" | "Medium" | "High"
}

function normalizeStatus(raw?: string): RenewalStatus {
  const value = raw?.toLowerCase() || ""

  if (value.includes("approve")) return "Approved"
  if (value.includes("reject")) return "Rejected"
  if (value.includes("review")) return "In review"
  return "Due"
}

function deriveRisk(row: RenewalRow): "Low" | "Medium" | "High" {
  const budget = row.budget_status?.toLowerCase?.() || ""
  if (budget.includes("over")) return "High"
  if (budget.includes("risk")) return "High"

  const pct = Number(row.price_change_percentage)
  if (Number.isFinite(pct)) {
    if (pct >= 15) return "High"
    if (pct >= 5) return "Medium"
  }

  const autoRenew = `${row.auto_renew_flag || ""}`.toLowerCase()
  if (autoRenew === "no" || autoRenew === "false") return "Medium"

  return "Low"
}

function toUiRow(row: RenewalRow): UiRenewalRow {
  const amountValue = Number(row.renewed_price ?? row.previous_price ?? 0)

  return {
    id: row.renewal_id || "unknown", // fallback id to avoid crashes
    vendor: row.vendor_id || "Unknown vendor",
    subscription: row.record_status || "—",
    owner: row.budget_status || "—",
    dueDate: row.renewal_due_date || "—",
    amount: Number.isFinite(amountValue) ? amountValue : 0,
    status: normalizeStatus(row.renewal_status),
    risk: deriveRisk(row),
  }
}

function fmtMoney(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `SAR ${Math.round(n).toLocaleString()}`
  }
}

export default function Renewals() {
  const nav = useNavigate()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"All" | RenewalStatus>("All")
  const [risk, setRisk] = useState<"All" | "Low" | "Medium" | "High">("All")
  const [rows, setRows] = useState<UiRenewalRow[]>([])

  useEffect(() => {
    let active = true

    fetchSheetData<RenewalRow[]>("Renewals")
      .then((data) => {
        if (!active || !Array.isArray(data)) return

        const normalized = data.map(toUiRow)
        setRows(normalized)
      })
      .catch((err) => {
        console.error("Failed to load renewals", err)
        setRows([])
      })

    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return rows.filter((r) => {
      const matchQ =
        !query ||
        r.vendor.toLowerCase().includes(query) ||
        r.subscription.toLowerCase().includes(query) ||
        r.owner.toLowerCase().includes(query)

      const matchStatus = status === "All" ? true : r.status === status
      const matchRisk = risk === "All" ? true : r.risk === risk

      return matchQ && matchStatus && matchRisk
    })
  }, [q, rows, status, risk])

  const totalValue = useMemo(() => {
    return filtered.reduce((sum, r) => sum + r.amount, 0)
  }, [filtered])

  function openDetail(id: string) {
    nav(`/renewals/detail?id=${encodeURIComponent(id)}`)
  }

  return (
    <AppShell
      title="Renewals"
      subtitle="Track renewals, risk, and approvals — demo dashboard"
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            style={ghostBtn}
            onClick={() => {
              setQ("")
              setStatus("All")
              setRisk("All")
            }}
          >
            Reset
          </button>
          <button style={primaryBtn} onClick={() => nav("/approvals")} title="Go to approvals queue">
            Open Approval Center
          </button>
        </div>
      }
    >
      <div style={stack}>
        {/* KPI strip */}
        <div style={kpiGrid}>
          <Kpi title="Items" value={filtered.length.toString()} />
          <Kpi title="Total value" value={fmtMoney(totalValue)} />
          <Kpi title="High risk" value={filtered.filter((x) => x.risk === "High").length.toString()} />
        </div>

        {/* Action bar */}
        <div style={bar}>
          <div style={barLeft}>
            <input
              style={search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vendor, subscription, owner…"
            />

            <select style={select} value={status} onChange={(e) => setStatus(e.target.value as any)} title="Status">
              <option value="All">All statuses</option>
              <option value="Due">Due</option>
              <option value="In review">In review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select style={select} value={risk} onChange={(e) => setRisk(e.target.value as any)} title="Risk">
              <option value="All">All risk</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div style={barRight}>
            <button style={ghostBtn} onClick={() => nav("/subscriptions")} title="Jump back to subscriptions">
              Back to Subscriptions
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={card}>
          <div style={cardHead}>
            <div style={{ fontWeight: 700 }}>Renewals list</div>
            <div style={muted}>Click a row to open detail (next screen).</div>
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

// ✅ Row hover highlight (main “update”)
const tr: React.CSSProperties = {
  cursor: "pointer",
  transition: "background 160ms ease, transform 160ms ease",
}
;(tr as any)[":hover"] = undefined // (keeps TS quiet if you accidentally paste into a CSS-in-JS lib)

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
