// src/pages/RenewalDetail.tsx
import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import AppShell from "../layout/AppShell"

type RenewalStatus = "Due" | "In review" | "Approved" | "Rejected"
type Risk = "Low" | "Medium" | "High"

type RenewalRow = {
  id: string
  vendor: string
  subscription: string
  owner: string
  dueDate: string
  amount: number
  status: RenewalStatus
  risk: Risk
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

export default function RenewalDetail() {
  const nav = useNavigate()
  const [sp] = useSearchParams()

  const id = sp.get("id") || "ren_001"
  const row = useMemo(() => DEMO_ROWS.find((x) => x.id === id) || DEMO_ROWS[0], [id])

  const [note, setNote] = useState("")
  const [toast, setToast] = useState<"" | "approved" | "rejected" | "info">("")

  function act(kind: "approved" | "rejected" | "info") {
    setToast(kind)
    window.setTimeout(() => setToast(""), 2200)
  }

  return (
    <AppShell
      title="Renewal Detail"
      subtitle="Review renewal, risk, owner, and approvals — demo detail screen"
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={ghostBtn} onClick={() => nav("/renewals")}>
            Back to Renewals
          </button>
          <button style={ghostBtn} onClick={() => nav("/approvals")}>
            Approval Center
          </button>
          <button style={primaryBtn} onClick={() => act("approved")} title="Demo action">
            Approve
          </button>
        </div>
      }
    >
      <div style={stack}>
        {/* Summary header */}
        <div style={hero}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={kicker}>Renewal ID</div>
              <div style={heroTitle}>{row.id}</div>
              <div style={heroSub}>
                <b>{row.vendor}</b> • {row.subscription} • Owner: {row.owner}
              </div>
            </div>

            <div style={heroRight}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Pill tone={row.risk === "High" ? "danger" : row.risk === "Medium" ? "warn" : "ok"}>
                  Risk: {row.risk}
                </Pill>
                <Pill
                  tone={
                    row.status === "Approved"
                      ? "ok"
                      : row.status === "Rejected"
                        ? "danger"
                        : row.status === "Due"
                          ? "warn"
                          : "info"
                  }
                >
                  Status: {row.status}
                </Pill>
              </div>

              <div style={money}>{fmtMoney(row.amount)}</div>
              <div style={mutedSmall}>Due: {row.dueDate}</div>
            </div>
          </div>
        </div>

        {/* 2-column layout */}
        <div style={grid}>
          {/* Left: timeline + details */}
          <div style={card}>
            <div style={cardHead}>
              <div style={cardTitle}>Approval Timeline</div>
              <div style={mutedSmall}>Demo timeline — we’ll wire this to Apps Script later.</div>
            </div>

            <div style={timeline}>
              <TimelineItem title="Renewal created" meta="Detected in subscriptions inventory" tone="info" />
              <TimelineItem title="Risk assessed" meta={`Risk set to ${row.risk}`} tone={row.risk === "High" ? "danger" : row.risk === "Medium" ? "warn" : "ok"} />
              <TimelineItem title="In review" meta="Owner reviewing contract and usage" tone="info" />
              <TimelineItem title="Decision" meta="Approve / Reject / Request info" tone="info" last />
            </div>

            <div style={divider} />

            <div style={kvGrid}>
              <KV label="Vendor" value={row.vendor} />
              <KV label="Subscription" value={row.subscription} />
              <KV label="Owner" value={row.owner} />
              <KV label="Due date" value={row.dueDate} />
              <KV label="Amount" value={fmtMoney(row.amount)} />
              <KV label="Status" value={row.status} />
            </div>
          </div>

          {/* Right: actions + notes */}
          <div style={card}>
            <div style={cardHead}>
              <div style={cardTitle}>Actions</div>
              <div style={mutedSmall}>These are demo actions (no backend yet).</div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <button className="cs-btn cs-btn-primary" onClick={() => act("approved")}>
                ✅ Approve Renewal
              </button>
              <button className="cs-btn" onClick={() => act("rejected")}>
                ❌ Reject Renewal
              </button>
              <button className="cs-btn" onClick={() => act("info")}>
                📨 Request More Info
              </button>
            </div>

            <div style={{ height: 12 }} />

            <div style={cardTitle}>Approver Note</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a short note for the audit log..."
              style={textarea}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button className="cs-btn" onClick={() => setNote("")}>
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            style={{
              ...toastBox,
              background:
                toast === "approved"
                  ? "rgba(52,199,89,0.12)"
                  : toast === "rejected"
                    ? "rgba(255,59,48,0.12)"
                    : "rgba(10,132,255,0.12)",
              borderColor:
                toast === "approved"
                  ? "rgba(52,199,89,0.22)"
                  : toast === "rejected"
                    ? "rgba(255,59,48,0.22)"
                    : "rgba(10,132,255,0.22)",
            }}
          >
            {toast === "approved" && "✅ Approved (demo)"}
            {toast === "rejected" && "❌ Rejected (demo)"}
            {toast === "info" && "📨 Requested more info (demo)"}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={kicker}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  )
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "ok" | "warn" | "danger" | "info" }) {
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
        padding: "8px 12px",
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

function TimelineItem({
  title,
  meta,
  tone,
  last,
}: {
  title: string
  meta: string
  tone: "ok" | "warn" | "danger" | "info"
  last?: boolean
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: 12 }}>
      <div style={{ display: "grid", justifyItems: "center" }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background:
              tone === "ok"
                ? "rgba(52,199,89,0.85)"
                : tone === "warn"
                  ? "rgba(255,159,10,0.85)"
                  : tone === "danger"
                    ? "rgba(255,59,48,0.85)"
                    : "rgba(10,132,255,0.85)",
          }}
        />
        {!last ? <div style={{ width: 2, height: 36, background: "rgba(15,23,42,0.10)" }} /> : null}
      </div>

      <div>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={mutedSmall}>{meta}</div>
      </div>
    </div>
  )
}

/* Styles */
const stack: React.CSSProperties = { display: "grid", gap: 14 }

const hero: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  padding: 16,
  border: "1px solid rgba(15,23,42,0.08)",
}

const heroTitle: React.CSSProperties = { fontSize: 22, fontWeight: 950, letterSpacing: -0.2, marginTop: 6 }
const heroSub: React.CSSProperties = { marginTop: 8, color: "rgba(15,23,42,0.70)" }

const heroRight: React.CSSProperties = { display: "grid", gap: 6, textAlign: "right", minWidth: 240 }
const money: React.CSSProperties = { fontSize: 22, fontWeight: 950, letterSpacing: -0.2 }

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.35fr 1fr",
  gap: 12,
}
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  border: "1px solid rgba(15,23,42,0.08)",
  overflow: "hidden",
}
const cardHead: React.CSSProperties = {
  padding: 14,
  borderBottom: "1px solid rgba(15,23,42,0.08)",
}
const cardTitle: React.CSSProperties = { fontWeight: 950 }
const mutedSmall: React.CSSProperties = { marginTop: 6, fontSize: 13, color: "rgba(15,23,42,0.6)" }

const timeline: React.CSSProperties = { padding: 14, display: "grid", gap: 14 }

const divider: React.CSSProperties = { height: 1, background: "rgba(15,23,42,0.08)" }

const kvGrid: React.CSSProperties = {
  padding: 14,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
}

const kicker: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.7,
  color: "rgba(15,23,42,0.48)",
  textTransform: "uppercase",
}

const textarea: React.CSSProperties = {
  marginTop: 10,
  width: "100%",
  minHeight: 120,
  resize: "vertical",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.10)",
  background: "rgba(15,23,42,0.03)",
  padding: 12,
  outline: "none",
}

const toastBox: React.CSSProperties = {
  position: "fixed",
  right: 18,
  bottom: 18,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.10)",
  boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
  fontWeight: 900,
}

/* Buttons (kept local for this page) */
const ghostBtn: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "#fff",
  fontWeight: 800,
}
const primaryBtn: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid rgba(10,132,255,0.25)",
  background: "rgba(10,132,255,0.12)",
  fontWeight: 900,
}
