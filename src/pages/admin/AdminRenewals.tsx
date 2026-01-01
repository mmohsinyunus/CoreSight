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

export default function AdminRenewals() {
  const rows = [
    { name: "Tenant A", owner: "alex@tenant.com", renewal: "2024-12-01", risk: "Low" },
    { name: "Tenant B", owner: "brenda@tenant.com", renewal: "2024-10-15", risk: "Medium" },
    { name: "Tenant C", owner: "chen@tenant.com", renewal: "2024-09-30", risk: "High" },
  ]

  return (
    <AppShell title="Renewals" subtitle="Track tenant renewal cycles" navItems={adminNav} chips={["Admin"]}>
      <div style={{ background: "var(--surface)", borderRadius: 16, padding: 16, border: "1px solid var(--border)" }}>
        <table style={table}>
          <thead style={{ background: "rgba(255,255,255,0.03)" }}>
            <tr>
              <th style={thtd}>Tenant</th>
              <th style={thtd}>Owner</th>
              <th style={thtd}>Renewal date</th>
              <th style={thtd}>Risk</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td style={thtd}>{row.name}</td>
                <td style={thtd}>{row.owner}</td>
                <td style={thtd}>{row.renewal}</td>
                <td style={thtd}>{row.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
