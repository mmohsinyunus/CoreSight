// src/pages/_placeholders.tsx
import type { ReactNode } from "react"
import AppShell from "../layout/AppShell"

type PlaceholderProps = {
  title: string
  subtitle?: string
  cta?: { label: string; to: string }
  children?: ReactNode
}

export function PlaceholderPage({ title, subtitle, cta, children }: PlaceholderProps) {
  return (
    <AppShell title={title} subtitle={subtitle || "SaaS prototype page (stub) — coming next"}>
      <div className="cs-container" style={{ display: "grid", gap: 16 }}>
        <div className="cs-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 750 }}>Quick overview</div>
              <div style={{ marginTop: 6, color: "var(--muted)" }}>
                This page is wired in routing and styled in the global shell. We’ll implement the real UI + Apps Script calls here next.
              </div>
            </div>
            {cta ? (
              <a className="cs-btn cs-btn-primary" style={{ display: "inline-flex", alignItems: "center" }} href={`#/` + cta.to.replace(/^\//, "")}>
                {cta.label}
              </a>
            ) : null}
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            <MiniCard title="Status" value="Ready (stub)" />
            <MiniCard title="Data source" value="Apps Script" />
            <MiniCard title="UX" value="Apple-style" />
          </div>
        </div>

        {children ? (
          <div className="cs-card" style={{ padding: 18 }}>
            {children}
          </div>
        ) : (
          <div className="cs-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 750 }}>Next implementation</div>
            <ul style={{ margin: "10px 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
              <li>Top action bar (Search + Filters + Primary CTA)</li>
              <li>Table view + empty state</li>
              <li>Detail drawer / modal</li>
              <li>Apps Script GET/POST + optimistic UI</li>
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 12, background: "rgba(11,18,32,0.02)" }}>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 650 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 14, fontWeight: 750 }}>{value}</div>
    </div>
  )
}
