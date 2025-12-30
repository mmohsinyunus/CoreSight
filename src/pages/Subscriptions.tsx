// src/pages/Subscriptions.tsx
import AppShell from "../layout/AppShell"

export default function Subscriptions() {
  return (
    <AppShell
      title="Subscriptions"
      subtitle="Plans, seats, renewals, and actions"
    >
      <div style={card}>
        <h3 style={h3}>Subscriptions List</h3>
        <p style={muted}>
          This will show all active subscriptions with reclaim and renewal
          actions.
        </p>

        <div style={emptyState}>
          No subscriptions yet (demo stub)
        </div>
      </div>
    </AppShell>
  )
}

/* styles */
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  border: "1px solid rgba(15,23,42,0.08)",
}

const h3: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
}

const muted: React.CSSProperties = {
  color: "rgba(15,23,42,0.6)",
  marginTop: 6,
}

const emptyState: React.CSSProperties = {
  marginTop: 20,
  padding: 24,
  borderRadius: 12,
  background: "rgba(15,23,42,0.03)",
  textAlign: "center",
}
