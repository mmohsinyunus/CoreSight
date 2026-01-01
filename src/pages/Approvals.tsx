// src/pages/Approvals.tsx
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppShell from "../layout/AppShell"

type ApprovalStatus = "Pending" | "Approved" | "Rejected"
type Risk = "Low" | "Medium" | "High"

type ApprovalItem = {
  id: string
  vendor: string
  subscription: string
  requestBy: string
  requestedOn: string // YYYY-MM-DD
  amount: number
  risk: Risk
  status: ApprovalStatus
}

const DEMO_QUEUE: ApprovalItem[] = [
  {
    id: "appr_001",
    vendor: "Okta",
    subscription: "SSO Enterprise",
    requestBy: "IT Security",
    requestedOn: "2025-12-22",
    amount: 148000,
    risk: "High",
    status: "Pending",
  },
  {
    id: "appr_002",
    vendor: "Zoom",
    subscription: "Enterprise",
    requestBy: "IT Ops",
    requestedOn: "2025-12-20",
    amount: 56000,
    risk: "Medium",
    status: "Pending",
  },
  {
    id: "appr_003",
    vendor: "Salesforce",
    subscription: "Sales Cloud",
    requestBy: "Sales Ops",
    requestedOn: "2025-12-15",
    amount: 315000,
    risk: "Low",
    status: "Approved",
  },
  {
    id: "appr_004",
    vendor: "Google Workspace",
    subscription: "Business Plus",
    requestBy: "IT Ops",
    requestedOn: "2025-12-10",
    amount: 92000,
    risk: "Medium",
    status: "Rejected",
  },
]

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

export default function Approvals() {
  const nav = useNavigate()

  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"All" | ApprovalStatus>("All")
  const [risk, setRisk] = useState<"All" | Risk>("All")
  const [toast, setToast] = useState<"" | "approved" | "rejected">("")

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return DEMO_QUEUE.filter((r) => {
      const matchQ =
        !query ||
        r.vendor.toLowerCase().includes(query) ||
        r.subscription.toLowerCase().includes(query) ||
        r.requestBy.toLowerCase().includes(query)

      const matchStatus = status === "All" ? true : r.status === status
      const matchRisk = risk === "All" ? true : r.risk === risk

      return matchQ && matchStatus && matchRisk
    })
  }, [q, status, risk])

  const pendingCount = useMemo(() => rows.filter((x) => x.status === "Pending").length, [rows])
  const pendingValue = useMemo(
    () => rows.filter((x) => x.status === "Pending").reduce((s, r) => s + r.amount, 0),
    [rows]
  )

  function flash(kind: "approved" | "rejected") {
    setToast(kind)
    window.setTimeout(() => setToast(""), 2200)
  }

  return (
    <AppShell
      title="Approval Center"
      subtitle="Approve renewals, monitor risk, and keep an audit-ready trail"
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={ghostBtn} onClick={() => nav("/renewals")}>
            Back to Renewals
          </button>
          <button
            style={primaryBtn}
            onClick={() => {
              setQ("")
              setStatus("All")
              setRisk("All")
            }}
          >
            Reset Filters
          </button>
        </div>
      }
    >
      <div style={stack}>
        {/* KPIs */}
        <div style={kpiGrid}>
          <Kpi title="Queue items" value={rows.length.toString()} />
          <Kpi title="Pending count" value={pendingCount.toString()} />
          <Kpi title="Pending value" value={fmtMoney(pendingValue)} />
        </div>

        {/* Filters */}
        <div style={bar}>
          <div style={barLeft}>
            <input
              className="cs-input"
              style={{ width: 340, maxWidth: "72vw" }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vendor, subscription, request by…"
            />

            <select
              className="cs-select"
              style={{ width: 180 }}
              value={status}
              onChange={(e) => setStatus(e.target.value as ApprovalStatus | "All")}
            >
              <option value="All">All status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              className="cs-select"
              style={{ width: 160 }}
              value={risk}
              onChange={(e) => setRisk(e.target.value as Risk | "All")}
            >
              <option value="All">All risk</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div style={barRight}>
            <button style={ghostBtn} onClick={() => nav("/audit-log")}>
              Open Audit Log
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={card}>
          <div style={cardHead}>
            <div style={{ fontWeight: 900 }}>Approval Queue</div>
            <div style={muted}>Demo queue — actions show toast only (backend later).</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="cs-table">
              <thead>
                <tr>
                  <th className="cs-th">Vendor</th>
                  <th className="cs-th">Subscription</th>
                  <th className="cs-th">Requested by</th>
                  <th className="cs-th">Requested on</th>
                  <th className="cs-th" style={{ textAlign: "right" }}>
                    Amount
                  </th>
                  <th className="cs-th">Risk</th>
                  <th className="cs-th">Status</th>
                  <th className="cs-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="cs-row-hover">
                    <td className="cs-td" style={{ fontWeight: 900 }}>
                      {r.vendor}
                    </td>
                    <td className="cs-td">{r.subscription}</td>
                    <td className="cs-td">{r.requestBy}</td>
                    <td className="cs-td" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
                      {r.requestedOn}
                    </td>
                    <td className="cs-td" style={{ textAlign: "right", fontWeight: 800 }}>
                      {fmtMoney(r.amount)}
                    </td>
                    <td className="cs-td">
                      <Badge tone={r.risk === "High" ? "danger" : r.risk === "Medium" ? "warn" : "ok"}>{r.risk}</Badge>
                    </td>
                    <td className="cs-td">
                      <Badge tone={r.status === "Approved" ? "ok" : r.status === "Rejected" ? "danger" : "info"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="cs-td">
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          className="cs-btn cs-btn-primary"
                          disabled={r.status !== "Pending"}
                          onClick={(e) => {
                            e.stopPropagation()
                            flash("approved")
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="cs-btn"
                          disabled={r.status !== "Pending"}
                          onClick={(e) => {
                            e.stopPropagation()
                            flash("rejected")
                          }}
                        >
                          Reject
                        </button>
                        <button
                          className="cs-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            nav(`/renewals/detail?id=${encodeURIComponent("ren_001")}`)
                          }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td className="cs-td" colSpan={8} style={{ textAlign: "center", padding: 18, color: "rgba(11,18,32,0.6)" }}>
                      No items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {toast && (
          <div
            style={{
              ...toastBox,
              background: toast === "approved" ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.12)",
              borderColor: toast === "approved" ? "rgba(52,199,89,0.22)" : "rgba(255,59,48,0.22)",
            }}
          >
            {toast === "approved" ? "✅ Approved (demo)" : "❌ Rejected (demo)"}
          </div>
        )}
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
        fontWeight: 800,
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
  background: "var(--surface)",
  borderRadius: 16,
  padding: 16,
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
}

const kpiTitle: React.CSSProperties = { fontSize: 12, color: "var(--muted)", fontWeight: 800 }
const kpiValue: React.CSSProperties = { marginTop: 6, fontSize: 20, fontWeight: 950 }

const bar: React.CSSProperties = {
  background: "var(--surface-elevated)",
  borderRadius: 16,
  padding: 12,
  border: "1px solid var(--border)",
  display: "flex",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  boxShadow: "var(--shadow-sm)",
}

const barLeft: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }
const barRight: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center" }

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
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
  background: "var(--surface-elevated)",
}

const muted: React.CSSProperties = { color: "var(--muted)", fontSize: 13 }

const ghostBtn: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
}

const primaryBtn: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  fontWeight: 900,
}

const toastBox: React.CSSProperties = {
  position: "fixed",
  right: 18,
  bottom: 18,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
  fontWeight: 900,
  background: "var(--surface-elevated)",
}
