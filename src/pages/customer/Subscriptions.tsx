import CustomerPageShell from "./CustomerPageShell"

const rows = [
  {
    plan: "Enterprise",
    status: "Active",
    start: "2024-01-01",
    end: "2024-12-31",
    seats: 120,
    renewal: "Annual",
  },
  {
    plan: "AI Insights Add-on",
    status: "Inactive",
    start: "2023-08-01",
    end: "2024-07-31",
    seats: 30,
    renewal: "Annual",
  },
]

export default function CustomerSubscriptions() {
  return (
    <CustomerPageShell
      title="Subscriptions"
      subtitle="Current entitlements, terms, and upgrade controls"
    >
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0 }}>Active subscriptions</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Boardroom-ready view of your plans and renewal posture.
            </p>
          </div>
          <button className="cs-btn cs-btn-primary">Request Upgrade</button>
        </div>

        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Plan</th>
              <th className="cs-th">Status</th>
              <th className="cs-th">Start Date</th>
              <th className="cs-th">End Date</th>
              <th className="cs-th">Seats</th>
              <th className="cs-th">Renewal Type</th>
              <th className="cs-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.plan} style={{ background: idx % 2 === 0 ? "var(--surface)" : "#181c23" }}>
                <td className="cs-td">{row.plan}</td>
                <td className="cs-td">
                  <span className="cs-pill" style={{ padding: "6px 10px", background: "var(--surface-elevated)" }}>
                    {row.status}
                  </span>
                </td>
                <td className="cs-td">{row.start}</td>
                <td className="cs-td">{row.end}</td>
                <td className="cs-td">{row.seats}</td>
                <td className="cs-td">{row.renewal}</td>
                <td className="cs-td">
                  <button className="cs-btn" style={{ height: 36 }}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CustomerPageShell>
  )
}
