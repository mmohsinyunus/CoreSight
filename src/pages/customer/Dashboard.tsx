import CustomerPageShell from "./CustomerPageShell"

export default function CustomerDashboard() {
  return (
    <CustomerPageShell title="Dashboard" subtitle="Executive overview for your tenant">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {["Usage", "Spend", "Signals", "Health"].map((card) => (
          <div key={card} className="cs-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>{card}</div>
            <div style={{ color: "var(--text-secondary)" }}>Placeholder KPI card — data wiring comes later.</div>
          </div>
        ))}
      </div>
    </CustomerPageShell>
  )
}
