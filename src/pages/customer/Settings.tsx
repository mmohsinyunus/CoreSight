import CustomerPageShell from "./CustomerPageShell"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"

export default function CustomerSettings() {
  const { tenant } = useCustomerAuth()

  return (
    <CustomerPageShell title="Settings" subtitle="Tenant context">
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 10 }}>
        {tenant ? (
          <>
            {infoRow("Tenant", tenant.tenant_name)}
            {infoRow("Code", tenant.tenant_code)}
            {infoRow("Legal name", tenant.legal_name ?? "–")}
            {infoRow("Region", tenant.region ?? "–")}
            {infoRow("Timezone", tenant.timezone ?? "–")}
            {infoRow("Currency", tenant.currency ?? "–")}
            {infoRow("Plan", tenant.subscription ?? "–")}
            {infoRow("Status", tenant.status)}
          </>
        ) : (
          <div style={{ color: "var(--text-secondary)" }}>No tenant selected.</div>
        )}
      </div>
    </CustomerPageShell>
  )
}

function infoRow(label: string, value: string) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
      <div style={{ color: "var(--text-secondary)", fontWeight: 700 }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  )
}
