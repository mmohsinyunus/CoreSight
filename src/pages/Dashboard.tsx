// src/pages/Dashboard.tsx
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import AppShell from "../layout/AppShell"

type SubscriptionRow = {
  vendor: string
  plan: string
  seats: number
  used: number
  renewalDate: string // YYYY-MM-DD
  status: "Active" | "Trial" | "At risk"
  estAnnualCost: number
}

function daysUntil(dateISO: string) {
  const now = new Date()
  const d = new Date(dateISO + "T00:00:00")
  const ms = d.getTime() - now.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

function formatSAR(n: number) {
  try {
    return new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `SAR ${Math.round(n).toLocaleString()}`
  }
}

export default function Dashboard() {
  const nav = useNavigate()

  // Mock data (VC-friendly + realistic). Later we'll load via Apps Script.
  const rows: SubscriptionRow[] = useMemo(
    () => [
      {
        vendor: "Microsoft 365",
        plan: "Enterprise",
        seats: 420,
        used: 401,
        renewalDate: "2026-02-15",
        status: "Active",
        estAnnualCost: 980000,
      },
      {
        vendor: "Salesforce",
        plan: "Pro",
        seats: 160,
        used: 118,
        renewalDate: "2026-01-18",
        status: "At risk",
        estAnnualCost: 760000,
      },
      {
        vendor: "Jira / Atlassian",
        plan: "Standard",
        seats: 260,
        used: 212,
        renewalDate: "2026-03-05",
        status: "Active",
        estAnnualCost: 185000,
      },
      {
        vendor: "Slack",
        plan: "Business+",
        seats: 300,
        used: 244,
        renewalDate: "2026-01-07",
        status: "Trial",
        estAnnualCost: 220000,
      },
      {
        vendor: "Adobe",
        plan: "Creative Cloud",
        seats: 85,
        used: 72,
        renewalDate: "2026-01-28",
        status: "At risk",
        estAnnualCost: 340000,
      },
    ],
    []
  )

  const kpis = useMemo(() => {
    const total = rows.length
    const active = rows.filter((r) => r.status === "Active").length
    const trial = rows.filter((r) => r.status === "Trial").length
    const atRisk = rows.filter((r) => r.status === "At risk").length

    const annualCost = rows.reduce((a, r) => a + r.estAnnualCost, 0)
    const unusedSeats = rows.reduce((a, r) => a + Math.max(0, r.seats - r.used), 0)

    // simple “savings potential” mock
    const savingsPotential = Math.round(unusedSeats * 1200) // SAR/seat heuristic

    return {
      total,
      active,
      trial,
      atRisk,
      annualCost,
      unusedSeats,
      savingsPotential,
    }
  }, [rows])

  const expiringSoon = useMemo(() => {
    return rows
      .map((r) => ({ ...r, days: daysUntil(r.renewalDate) }))
      .sort((a, b) => a.days - b.days)
      .slice(0, 5)
  }, [rows])

  return (
    <AppShell title="Dashboard" subtitle="Executive snapshot — renewals, risk, and savings opportunities">
      <div style={page}>
        {/* Top hero */}
        <div style={hero}>
          <div>
            <div style={heroKicker}>Good morning</div>
            <div style={heroTitle}>Your subscription spend is under control.</div>
            <div style={heroSub}>
              Track renewals, reduce unused seats, and keep approvals audit-ready — all in one place.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <button style={primaryBtn} onClick={() => nav("/subscriptions")}>
                View Subscriptions
              </button>
              <button style={secondaryBtn} onClick={() => nav("/renewals")}>
                Open Renewals
              </button>
            </div>
          </div>

          <div style={heroCard}>
            <div style={miniTitle}>This month</div>
            <div style={miniValue}>{formatSAR(kpis.savingsPotential)}</div>
            <div style={miniSub}>Potential annual savings from unused seats (estimated)</div>

            {/* Tiny mock “sparkline” */}
            <div style={sparkWrap} aria-hidden="true">
              <div style={{ ...sparkBar, height: 18 }} />
              <div style={{ ...sparkBar, height: 26 }} />
              <div style={{ ...sparkBar, height: 20 }} />
              <div style={{ ...sparkBar, height: 34 }} />
              <div style={{ ...sparkBar, height: 28 }} />
              <div style={{ ...sparkBar, height: 40 }} />
              <div style={{ ...sparkBar, height: 30 }} />
            </div>
            <div style={mutedSmall}>Based on current seat utilization across key vendors.</div>
          </div>
        </div>

        {/* KPI grid */}
        <div style={grid}>
          <KpiCard label="Subscriptions" value={kpis.total.toString()} hint="Tracked vendors & apps" />
          <KpiCard label="Active" value={kpis.active.toString()} hint="In good standing" />
          <KpiCard label="Trials" value={kpis.trial.toString()} hint="Monitor conversion" />
          <KpiCard label="At risk" value={kpis.atRisk.toString()} hint="Renewal attention needed" tone="warn" />
          <KpiCard label="Annual spend" value={formatSAR(kpis.annualCost)} hint="Estimated total contract value" />
          <KpiCard label="Unused seats" value={kpis.unusedSeats.toString()} hint="Reclaimable licenses" tone="good" />
        </div>

        {/* Table */}
        <div style={panel}>
          <div style={panelTop}>
            <div>
              <div style={panelTitle}>Upcoming renewals</div>
              <div style={panelSub}>Next 90 days — prioritize approvals and renegotiation.</div>
            </div>
            <button style={ghostBtn} onClick={() => nav("/renewals")}>
              View all
            </button>
          </div>

          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Vendor</th>
                  <th style={th}>Plan</th>
                  <th style={thRight}>Seats</th>
                  <th style={thRight}>Used</th>
                  <th style={th}>Renewal</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {expiringSoon.map((r) => (
                  <tr key={r.vendor} style={tr}>
                    <td style={tdStrong}>{r.vendor}</td>
                    <td style={td}>{r.plan}</td>
                    <td style={tdRight}>{r.seats}</td>
                    <td style={tdRight}>{r.used}</td>
                    <td style={td}>{r.renewalDate}</td>
                    <td style={td}>
                      <StatusPill status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={panelBottom}>
            <button style={linkBtn} onClick={() => nav("/approvals")}>
              Go to Approval Center →
            </button>
            <button style={linkBtn} onClick={() => nav("/audit-log")}>
              View Audit Log →
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint: string
  tone?: "warn" | "good"
}) {
  const accent =
    tone === "warn"
      ? "rgba(255,149,0,0.18)"
      : tone === "good"
      ? "rgba(52,199,89,0.18)"
      : "rgba(10,132,255,0.14)"

  return (
    <div style={kpiCard}>
      <div style={kpiTop}>
        <div style={kpiLabel}>{label}</div>
        <div style={{ width: 34, height: 34, borderRadius: 12, background: accent }} />
      </div>
      <div style={kpiValue}>{value}</div>
      <div style={kpiHint}>{hint}</div>
    </div>
  )
}

function StatusPill({ status }: { status: SubscriptionRow["status"] }) {
  const style =
    status === "Active"
      ? { background: "rgba(52,199,89,0.14)", border: "1px solid rgba(52,199,89,0.25)", color: "rgba(10,80,30,0.95)" }
      : status === "Trial"
      ? { background: "rgba(10,132,255,0.12)", border: "1px solid rgba(10,132,255,0.22)", color: "rgba(10,60,120,0.95)" }
      : { background: "rgba(255,149,0,0.14)", border: "1px solid rgba(255,149,0,0.26)", color: "rgba(120,60,0,0.95)" }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        ...style,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background:
            status === "Active" ? "rgba(52,199,89,0.9)" : status === "Trial" ? "rgba(10,132,255,0.9)" : "rgba(255,149,0,0.9)",
        }}
      />
      {status}
    </span>
  )
}

/** Styles */
const page: React.CSSProperties = {
  width: "100%",
  maxWidth: 1100,
}

const hero: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 0.9fr",
  gap: 16,
  alignItems: "stretch",
  marginBottom: 16,
}

const heroKicker: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(15,23,42,0.6)",
}

const heroTitle: React.CSSProperties = {
  fontSize: 32,
  lineHeight: 1.15,
  marginTop: 6,
  letterSpacing: "-0.02em",
  fontWeight: 750,
  color: "rgba(15,23,42,0.92)",
}

const heroSub: React.CSSProperties = {
  marginTop: 10,
  fontSize: 14,
  color: "rgba(15,23,42,0.65)",
  maxWidth: 720,
}

const heroCard: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(10,132,255,0.10), rgba(255,255,255,0.9))",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
}

const miniTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "rgba(15,23,42,0.70)" }
const miniValue: React.CSSProperties = { fontSize: 26, fontWeight: 800, marginTop: 6, color: "rgba(15,23,42,0.92)" }
const miniSub: React.CSSProperties = { fontSize: 13, marginTop: 4, color: "rgba(15,23,42,0.62)" }

const sparkWrap: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "flex-end",
  height: 56,
  marginTop: 14,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.08)",
  background: "rgba(255,255,255,0.65)",
}

const sparkBar: React.CSSProperties = {
  width: 10,
  borderRadius: 999,
  background: "rgba(10,132,255,0.55)",
}

const mutedSmall: React.CSSProperties = { marginTop: 10, fontSize: 12, color: "rgba(15,23,42,0.55)" }

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 14,
  marginBottom: 16,
}

const kpiCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 18,
  padding: 14,
  boxShadow: "0 14px 30px rgba(15,23,42,0.05)",
}

const kpiTop: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }
const kpiLabel: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "rgba(15,23,42,0.65)" }
const kpiValue: React.CSSProperties = { fontSize: 22, fontWeight: 800, marginTop: 8, color: "rgba(15,23,42,0.92)" }
const kpiHint: React.CSSProperties = { fontSize: 12, marginTop: 6, color: "rgba(15,23,42,0.55)" }

const panel: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 18,
  padding: 14,
  boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
}

const panelTop: React.CSSProperties = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }
const panelTitle: React.CSSProperties = { fontSize: 16, fontWeight: 800, color: "rgba(15,23,42,0.92)" }
const panelSub: React.CSSProperties = { marginTop: 4, fontSize: 13, color: "rgba(15,23,42,0.60)" }

const tableWrap: React.CSSProperties = { marginTop: 12, overflowX: "auto" }
const table: React.CSSProperties = { width: "100%", borderCollapse: "separate", borderSpacing: 0 }
const th: React.CSSProperties = { textAlign: "left", fontSize: 12, color: "rgba(15,23,42,0.55)", padding: "10px 10px" }
const thRight: React.CSSProperties = { ...th, textAlign: "right" }
const tr: React.CSSProperties = { borderTop: "1px solid rgba(15,23,42,0.06)" }
const td: React.CSSProperties = { padding: "12px 10px", fontSize: 13, color: "rgba(15,23,42,0.72)" }
const tdStrong: React.CSSProperties = { ...td, fontWeight: 750, color: "rgba(15,23,42,0.90)" }
const tdRight: React.CSSProperties = { ...td, textAlign: "right" }

const panelBottom: React.CSSProperties = {
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
  marginTop: 10,
}

const primaryBtn: React.CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid rgba(10,132,255,0.22)",
  background: "rgba(10,132,255,0.14)",
  fontWeight: 800,
  color: "rgba(15,23,42,0.92)",
  cursor: "pointer",
}

const secondaryBtn: React.CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(255,255,255,0.9)",
  fontWeight: 700,
  color: "rgba(15,23,42,0.82)",
  cursor: "pointer",
}

const ghostBtn: React.CSSProperties = {
  height: 38,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(255,255,255,0.9)",
  fontWeight: 700,
  cursor: "pointer",
}

const linkBtn: React.CSSProperties = {
  height: 38,
  padding: "0 12px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,0.10)",
  background: "rgba(15,23,42,0.03)",
  fontWeight: 750,
  cursor: "pointer",
}
