import { Link } from "react-router-dom"
import CustomerPageShell from "./CustomerPageShell"

const cards = [
  {
    title: "Usage summary",
    to: "/app/reports/usage",
    body: "Active users, engagement, and recency across your tenant.",
  },
  {
    title: "Subscription health",
    to: "/app/reports/subscription-health",
    body: "Plan posture, expiry runway, and renewal status.",
  },
  {
    title: "Departments",
    to: "/app/reports/departments",
    body: "Department directory with ownership and creation dates.",
  },
]

export default function CustomerReports() {
  return (
    <CustomerPageShell title="Reports" subtitle="Enterprise-grade reports in dark mode">
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              style={{
                textDecoration: "none",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                padding: 16,
                borderRadius: 14,
                color: "var(--text)",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16 }}>{card.title}</div>
              <div style={{ color: "var(--text-secondary)" }}>{card.body}</div>
              <span className="cs-pill" style={{ width: "fit-content", marginTop: 6 }}>
                View report →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </CustomerPageShell>
  )
}
