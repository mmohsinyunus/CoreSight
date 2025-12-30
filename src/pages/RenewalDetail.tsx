// src/pages/RenewalDetail.tsx
import { useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import AppShell from "../layout/AppShell"

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function RenewalDetail() {
  const nav = useNavigate()
  const q = useQuery()
  const id = q.get("id") || "ren_???"

  return (
    <AppShell
      title="Renewal Detail"
      subtitle="Review, approve/reject, and audit trail (demo stub)"
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={ghostBtn} onClick={() => nav("/renewals")}>
            Back to Renewals
          </button>
          <button style={primaryBtn} onClick={() => nav("/approvals")}>
            Send to Approval Center
          </button>
        </div>
      }
    >
      <div style={grid}>
        <div style={card}>
          <div style={label}>Renewal ID</div>
          <div style={value}>{id}</div>

          <div style={divider} />

          <div style={row}>
            <div>
              <div style={label}>Vendor</div>
              <div style={value}>Demo Vendor</div>
            </div>
            <div>
              <div style={label}>Due date</div>
              <div style={value}>YYYY-MM-DD</div>
            </div>
          </div>

          <div style={row}>
            <div>
              <div style={label}>Amount</div>
              <div style={value}>SAR 0</div>
            </div>
            <div>
              <div style={label}>Risk</div>
              <div style={value}>Medium</div>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={label}>Next actions</div>
          <ul style={list}>
            <li>Attach commercial quote</li>
            <li>Validate seats & usage</li>
            <li>Route for approvals</li>
            <li>Log in audit trail</li>
          </ul>

          <div style={divider} />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={ghostBtn} onClick={() => nav("/audit-log")}>
              View Audit Log
            </button>
            <button style={primaryBtn} onClick={() => nav("/approvals")}>
              Open Approvals
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: 14,
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  border: "1px solid rgba(15,23,42,0.08)",
}

const label: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(15,23,42,0.6)",
  fontWeight: 800,
}

const value: React.CSSProperties = {
  marginTop: 6,
  fontSize: 16,
  fontWeight: 800,
}

const row: React.CSSProperties = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
}

const list: React.CSSProperties = {
  marginTop: 10,
  paddingLeft: 18,
  color: "rgba(15,23,42,0.8)",
  lineHeight: 1.7,
}

const divider: React.CSSProperties = {
  margin: "14px 0",
  height: 1,
  background: "rgba(15,23,42,0.08)",
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
