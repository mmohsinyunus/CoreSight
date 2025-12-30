// src/pages/SubscriptionDetail.tsx
import AppShell from "../layout/AppShell"

export default function SubscriptionDetail() {
  return (
    <AppShell
      title="Subscription Detail"
      subtitle="Reclaim, edit, and audit trail"
    >
      <div style={card}>
        <h3 style={h3}>Subscription Detail</h3>
        <p style={muted}>
          Detailed view for a single subscription (demo stub)
        </p>
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
