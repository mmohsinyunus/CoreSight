import CustomerPageShell from "./CustomerPageShell"

export default function CustomerReports() {
  const rows = [
    { name: "Executive overview", status: "Ready" },
    { name: "Spend by department", status: "Ready" },
    { name: "Renewals heatmap", status: "Coming soon" },
  ]

  return (
    <CustomerPageShell title="Reports" subtitle="Enterprise-grade reports in dark mode">
      <div className="cs-card" style={{ padding: 18 }}>
        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Report</th>
              <th className="cs-th">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.name} style={{ background: idx % 2 === 0 ? "var(--surface)" : "#181c23" }}>
                <td className="cs-td">{row.name}</td>
                <td className="cs-td">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CustomerPageShell>
  )
}
