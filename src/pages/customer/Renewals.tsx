import CustomerPageShell from "./CustomerPageShell"

const renewals = [
  {
    subscription: "Enterprise",
    date: "2024-11-15",
    term: "12 months",
    status: "On track",
    owner: "Procurement",
    notes: "Awaiting approval",
  },
  {
    subscription: "AI Insights Add-on",
    date: "2024-07-20",
    term: "12 months",
    status: "Pending",
    owner: "IT Ops",
    notes: "Needs usage review",
  },
]

export default function CustomerRenewals() {
  return (
    <CustomerPageShell
      title="Renewals"
      subtitle="Key renewal dates and owners"
    >
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0 }}>Upcoming renewals</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Track renewal readiness and assign owners.
            </p>
          </div>
          <button className="cs-btn cs-btn-primary">Initiate Renewal</button>
        </div>

        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Subscription</th>
              <th className="cs-th">Renewal Date</th>
              <th className="cs-th">Term</th>
              <th className="cs-th">Status</th>
              <th className="cs-th">Owner</th>
              <th className="cs-th">Notes</th>
              <th className="cs-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renewals.map((row, idx) => (
              <tr key={`${row.subscription}-${row.date}`} style={{ background: idx % 2 === 0 ? "var(--surface)" : "#181c23" }}>
                <td className="cs-td">{row.subscription}</td>
                <td className="cs-td">{row.date}</td>
                <td className="cs-td">{row.term}</td>
                <td className="cs-td">
                  <span className="cs-pill" style={{ padding: "6px 10px", background: "var(--surface-elevated)" }}>
                    {row.status}
                  </span>
                </td>
                <td className="cs-td">{row.owner}</td>
                <td className="cs-td">{row.notes}</td>
                <td className="cs-td">
                  <button className="cs-btn" style={{ height: 36 }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CustomerPageShell>
  )
}
