import AppShell from "../../layout/AppShell"
import { adminNav } from "../../navigation/adminNav"

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  overflow: "hidden",
}

const thtd = {
  padding: 12,
  borderBottom: "1px solid var(--border)",
  color: "var(--text)",
  textAlign: "left" as const,
}

export default function AdminSubscriptions() {
  const rows = [
    { name: "Tenant A", plan: "Enterprise", seats: 120, status: "Active" },
    { name: "Tenant B", plan: "Standard", seats: 80, status: "Pending" },
    { name: "Tenant C", plan: "Trial", seats: 25, status: "Expiring" },
  ]

  return (
    <AppShell title="Subscriptions" subtitle="Admin view of tenant subscriptions" navItems={adminNav} chips={["Admin"]}>
      <div style={{ background: "var(--surface)", borderRadius: 16, padding: 16, border: "1px solid var(--border)" }}>
        <table style={table}>
          <thead style={{ background: "rgba(255,255,255,0.03)" }}>
            <tr>
              <th style={thtd}>Tenant</th>
              <th style={thtd}>Plan</th>
              <th style={thtd}>Seats</th>
              <th style={thtd}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td style={thtd}>{row.name}</td>
                <td style={thtd}>{row.plan}</td>
                <td style={thtd}>{row.seats}</td>
                <td style={thtd}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
