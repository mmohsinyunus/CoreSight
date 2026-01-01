// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react"
import AppShell from "../layout/AppShell"

type TenantRow = {
  tenant_id?: string
  tenant_name?: string
  tenant_type?: string
  plan_type?: string
  subscription_status?: string
  primary_country?: string
  primary_admin_email?: string
  is_demo_tenant?: boolean
  created_at?: string
  updated_at?: string
}

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

export default function Dashboard() {
  const [rows, setRows] = useState<TenantRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function load() {
    setError("")
    setLoading(true)
    try {
      // cache-bust so Pages doesn’t serve a stale response
      const res = await fetch(`${SHEET_URL}?t=${Date.now()}`, { method: "GET" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      // Your script returns an array (as you showed in the screenshot)
      const arr = Array.isArray(json) ? json : json?.data || []
      if (!Array.isArray(arr)) throw new Error("Unexpected response shape")

      setRows(arr as TenantRow[])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const metrics = useMemo(() => {
    const total = rows.length
    const active = rows.filter((r) => (r.subscription_status || "").toLowerCase() === "active").length
    const trial = rows.filter((r) => (r.subscription_status || "").toLowerCase() === "trial").length
    const demo = rows.filter((r) => !!r.is_demo_tenant).length
    return { total, active, trial, demo }
  }, [rows])

  const recent = useMemo(() => {
    // Sort by created_at/updated_at if present, else keep as-is
    const score = (r: TenantRow) => {
      const d = r.updated_at || r.created_at || ""
      const t = Date.parse(d)
      return Number.isFinite(t) ? t : 0
    }
    return [...rows].sort((a, b) => score(b) - score(a)).slice(0, 8)
  }, [rows])

  return (
    <AppShell title="Dashboard" subtitle="Executive overview + drilldowns (Demo-ready UI)">
      <div style={wrap}>
        <div style={topRow}>
          <div style={pillRow}>
            <span style={pill}>Tenant: Demo</span>
            <span style={pill}>Env: PROD</span>
          </div>

          <button className="cs-btn cs-btn-primary" style={{ height: 40 }} onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && (
          <div style={errorBox}>
            <b>Couldn’t load data:</b> {error}
          </div>
        )}

        <div style={grid4}>
          <Kpi title="Tenants" value={metrics.total} hint="From Tenants sheet" />
          <Kpi title="Active" value={metrics.active} hint="Subscription status = Active" />
          <Kpi title="Trials" value={metrics.trial} hint="Subscription status = Trial" />
          <Kpi title="Demo" value={metrics.demo} hint="is_demo_tenant = true" />
        </div>

        <div style={card}>
          <div style={cardHead}>
            <div>
              <div style={cardTitle}>Recent tenants</div>
              <div style={cardSub}>Latest created/updated records</div>
            </div>
            <div style={smallMuted}>{loading ? "Loading…" : `${rows.length} total`}</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Tenant ID</th>
                  <th style={th}>Name</th>
                  <th style={th}>Type</th>
                  <th style={th}>Plan</th>
                  <th style={th}>Status</th>
                  <th style={th}>Country</th>
                  <th style={th}>Admin Email</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, idx) => (
                  <tr key={`${r.tenant_id || idx}`} style={tr}>
                    <td style={tdMono}>{r.tenant_id || "-"}</td>
                    <td style={td}>{r.tenant_name || "-"}</td>
                    <td style={td}>{r.tenant_type || "-"}</td>
                    <td style={td}>{r.plan_type || "-"}</td>
                    <td style={td}>
                      <span style={statusPill(r.subscription_status)}>{r.subscription_status || "-"}</span>
                    </td>
                    <td style={td}>{r.primary_country || "-"}</td>
                    <td style={td}>{r.primary_admin_email || "-"}</td>
                  </tr>
                ))}

                {!loading && recent.length === 0 && (
                  <tr>
                    <td style={{ ...td, padding: 18 }} colSpan={7}>
                      No tenant rows found yet. Try onboarding one from <b>Vendor Onboarding → Onboard Tenant</b>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={noteCard}>
          <div style={noteTitle}>Next implementation (after Dashboard v1)</div>
          <ul style={list}>
            <li>Top action bar (Search + Filters + primary CTA)</li>
            <li>Detail drawer (open a tenant row)</li>
            <li>Apps Script: add “recent activity” endpoint (audit log stream)</li>
          </ul>
        </div>
      </div>
    </AppShell>
  )
}

function Kpi({ title, value, hint }: { title: string; value: number; hint: string }) {
  return (
    <div style={kpi}>
      <div style={kpiTop}>
        <div style={kpiTitle}>{title}</div>
        <div style={kpiHint}>{hint}</div>
      </div>
      <div style={kpiValue}>{value}</div>
    </div>
  )
}

function statusPill(status?: string): React.CSSProperties {
  const s = (status || "").toLowerCase()
  let bg = "rgba(255,255,255,0.04)"
  let border = "var(--border)"
  let color = "var(--text-secondary)"

  if (s === "active") {
    bg = "rgba(64,195,233,0.16)"
    border = "rgba(64,195,233,0.35)"
    color = "#dff7ff"
  } else if (s === "trial") {
    bg = "rgba(100,210,243,0.16)"
    border = "rgba(100,210,243,0.35)"
    color = "#d2f5ff"
  } else if (s === "inactive") {
    bg = "rgba(255,255,255,0.06)"
    border = "var(--border)"
    color = "var(--muted)"
  }

  return {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${border}`,
    background: bg,
    color,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  }
}

/** Styles */
const wrap: React.CSSProperties = { display: "grid", gap: 16 }
const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
}
const pillRow: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" }
const pill: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.04)",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-secondary)",
}
const grid4: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12,
}
const kpi: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
  boxShadow: "var(--shadow-sm)",
  minHeight: 92,
}
const kpiTop: React.CSSProperties = { display: "grid", gap: 4 }
const kpiTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }
const kpiHint: React.CSSProperties = { fontSize: 12, color: "var(--muted)" }
const kpiValue: React.CSSProperties = {
  marginTop: 10,
  fontSize: 28,
  fontWeight: 800,
  letterSpacing: -0.2,
  color: "var(--text)",
}

const card: React.CSSProperties = {
  background: "var(--surface-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 16,
  boxShadow: "var(--shadow-sm)",
}
const cardHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }
const cardTitle: React.CSSProperties = { fontSize: 16, fontWeight: 700 }
const cardSub: React.CSSProperties = { fontSize: 13, color: "var(--muted)", marginTop: 4 }
const smallMuted: React.CSSProperties = { fontSize: 12, color: "var(--muted)" }

const table: React.CSSProperties = { width: "100%", borderCollapse: "separate", borderSpacing: 0, marginTop: 12, background: "var(--surface)" }
const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  color: "var(--muted)",
  padding: "10px 10px",
  borderBottom: "1px solid var(--border)",
  fontWeight: 700,
}
const tr: React.CSSProperties = { borderBottom: "1px solid var(--border)" }
const td: React.CSSProperties = { padding: "10px 10px", fontSize: 13, color: "var(--text)" }
const tdMono: React.CSSProperties = { ...td, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }

const errorBox: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--border)",
  color: "var(--text)",
}

const noteCard: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 16,
  boxShadow: "var(--shadow-sm)",
}
const noteTitle: React.CSSProperties = { fontSize: 14, fontWeight: 700, marginBottom: 8 }
const list: React.CSSProperties = { margin: 0, paddingLeft: 18, color: "var(--text-secondary)" }

// Simple responsive tweak (optional): if you want, move to CSS later
if (typeof window !== "undefined") {
  const w = window.innerWidth
  if (w < 900) grid4.gridTemplateColumns = "repeat(2, minmax(0, 1fr))"
  if (w < 520) grid4.gridTemplateColumns = "repeat(1, minmax(0, 1fr))"
}
