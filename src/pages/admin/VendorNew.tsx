import { useState } from "react"
import { useNavigate } from "react-router-dom"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyveLMQjQxGC12KkQhgcRSbNJ1ynWZIxqc9PFRznb-QU3imkQ2_DWFAIeMoiqRFxTdgBg/exec"

  function uuid() {
  // browser-safe UUID
  if ("crypto" in window && "randomUUID" in crypto) return crypto.randomUUID()
  // fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function VendorNew() {
  const nav = useNavigate()

  // Identity
  const [tenant_code, setTenantCode] = useState("")
  const [tenant_name, setTenantName] = useState("")
  const [legal_name, setLegalName] = useState("")
  const [tenant_type, setTenantType] = useState("Single Company")

  // Location / defaults
  const [primary_country, setPrimaryCountry] = useState("Saudi Arabia")
  const [primary_timezone, setPrimaryTimezone] = useState("Asia/Riyadh")
  const [default_currency, setDefaultCurrency] = useState("SAR")

  // Plan / subscription
  const [plan_type, setPlanType] = useState("Free")
  const [subscription_status, setSubscriptionStatus] = useState("Trial")
  const [subscription_start_date, setSubscriptionStartDate] = useState("")
  const [subscription_end_date, setSubscriptionEndDate] = useState("")
  const [max_users, setMaxUsers] = useState(10)
  const [max_organizations, setMaxOrganizations] = useState(1)

  // Status / governance
  const [tenant_status, setTenantStatus] = useState("Active")
  const [is_demo_tenant, setIsDemoTenant] = useState(false)
  const [data_retention_policy, setDataRetentionPolicy] = useState("3 years")
  const [compliance_flag, setComplianceFlag] = useState("Internal Policy")

  // Admin
  const [primary_admin_name, setPrimaryAdminName] = useState("")
  const [primary_admin_email, setPrimaryAdminEmail] = useState("")

  // Features
  const [ai_insights_enabled, setAiInsightsEnabled] = useState(true)
  const [cost_optimization_enabled, setCostOptimizationEnabled] = useState(true)
  const [usage_analytics_enabled, setUsageAnalyticsEnabled] = useState(true)

  // Notes / extra
  const [notes, setNotes] = useState("")
  const [vat_registration_number, setVatRegistrationNumber] = useState("")
  const [national_address, setNationalAddress] = useState("")

  // UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleCreate() {
    setError(null)
    setSuccess(null)

    // basic validation
    if (!tenant_code.trim()) return setError("Tenant code is required.")
    if (!tenant_name.trim()) return setError("Tenant name is required.")
    if (!primary_admin_email.trim()) return setError("Primary admin email is required.")

    setLoading(true)
    try {
      const tenant_id = uuid()

      const payload = {
        tenant_id,
        tenant_code: tenant_code.trim(),
        tenant_name: tenant_name.trim(),
        legal_name: legal_name.trim(),
        tenant_type,

        primary_country,
        primary_timezone,
        default_currency,

        plan_type,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        max_users,
        max_organizations,

        tenant_status,
        is_demo_tenant,
        data_retention_policy,
        compliance_flag,

        primary_admin_name: primary_admin_name.trim(),
        primary_admin_email: primary_admin_email.trim(),

        // placeholders for later (kept to match schema)
        created_by_user_id: "system",
        primary_admin_user_id: "",

        ai_insights_enabled,
        cost_optimization_enabled,
        usage_analytics_enabled,

        // timestamps (Apps Script will default if missing)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active_at: "",

        notes: notes.trim(),

        // added by you
        vat_registration_number: vat_registration_number.trim(),
        national_address: national_address.trim(),
      }

      const res = await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok || !json || json.ok !== true) {
        const msg =
          (json && (json.error || json.message)) ||
          `Failed to save. HTTP ${res.status}`
        throw new Error(msg)
      }

      setSuccess(`Vendor created (tenant_id: ${json.tenant_id}). Row: ${json.row}`)
      // redirect after a short delay so user sees success
      setTimeout(() => nav("/admin/vendors"), 800)
    } catch (e: any) {
      setError(e?.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 980 }}>
      <h1 style={{ margin: 0 }}>Onboard Vendor (Tenant)</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
        This will create a tenant record in the <b>Tenants</b> Google Sheet.
      </p>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(255,0,0,0.12)" }}>
          <b>Error:</b> {error}
        </div>
      )}

      {success && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(0,255,120,0.10)" }}>
          {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
        <Field label="Tenant Code *" value={tenant_code} onChange={setTenantCode} placeholder="e.g. TAMER" />
        <Field label="Tenant Name *" value={tenant_name} onChange={setTenantName} placeholder="Display name" />

        <Field label="Legal Name" value={legal_name} onChange={setLegalName} placeholder="Registered legal entity" />
        <Select
          label="Tenant Type"
          value={tenant_type}
          onChange={setTenantType}
          options={["Single Company", "Holding Group", "Enterprise Group"]}
        />

        <Field label="Primary Country" value={primary_country} onChange={setPrimaryCountry} />
        <Field label="Primary Timezone" value={primary_timezone} onChange={setPrimaryTimezone} />

        <Field label="Default Currency" value={default_currency} onChange={setDefaultCurrency} />
        <Select
          label="Plan Type"
          value={plan_type}
          onChange={setPlanType}
          options={["Free", "Trial", "Pro", "Enterprise"]}
        />

        <Select
          label="Subscription Status"
          value={subscription_status}
          onChange={setSubscriptionStatus}
          options={["Trial", "Active", "Suspended", "Expired"]}
        />
        <Select
          label="Tenant Status"
          value={tenant_status}
          onChange={setTenantStatus}
          options={["Active", "Inactive", "Archived"]}
        />

        <Field label="Subscription Start Date" value={subscription_start_date} onChange={setSubscriptionStartDate} placeholder="YYYY-MM-DD" />
        <Field label="Subscription End Date" value={subscription_end_date} onChange={setSubscriptionEndDate} placeholder="YYYY-MM-DD" />

        <NumberField label="Max Users" value={max_users} onChange={setMaxUsers} />
        <NumberField label="Max Organizations" value={max_organizations} onChange={setMaxOrganizations} />

        <Field label="Primary Admin Name" value={primary_admin_name} onChange={setPrimaryAdminName} />
        <Field label="Primary Admin Email *" value={primary_admin_email} onChange={setPrimaryAdminEmail} placeholder="name@company.com" />

        <Field label="VAT Registration Number" value={vat_registration_number} onChange={setVatRegistrationNumber} />
        <Field label="National Address" value={national_address} onChange={setNationalAddress} placeholder="Short address or full national address text" />

        <Field label="Data Retention Policy" value={data_retention_policy} onChange={setDataRetentionPolicy} />
        <Field label="Compliance Flag" value={compliance_flag} onChange={setComplianceFlag} />

        <Checkbox label="Demo tenant" checked={is_demo_tenant} onChange={setIsDemoTenant} />
        <div />

        <Checkbox label="AI Insights enabled" checked={ai_insights_enabled} onChange={setAiInsightsEnabled} />
        <Checkbox label="Cost Optimization enabled" checked={cost_optimization_enabled} onChange={setCostOptimizationEnabled} />
        <Checkbox label="Usage Analytics enabled" checked={usage_analytics_enabled} onChange={setUsageAnalyticsEnabled} />

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", marginBottom: 6, opacity: 0.85 }}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)",
              color: "white",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          onClick={() => nav("/admin/vendors")}
          style={btn("secondary")}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          onClick={handleCreate}
          style={btn("primary")}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Vendor"}
        </button>
      </div>
    </div>
  )
}

function btn(kind: "primary" | "secondary") {
  const base = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: "pointer",
    fontWeight: 600,
  } as const

  if (kind === "primary") {
    return { ...base, background: "rgba(90,140,255,0.35)", color: "white" }
  }
  return { ...base, background: "rgba(255,255,255,0.06)", color: "white" }
}

function Field(props: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 6, opacity: 0.85 }}>{props.label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.25)",
          color: "white",
          outline: "none",
        }}
      />
    </div>
  )
}

function NumberField(props: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 6, opacity: 0.85 }}>{props.label}</label>
      <input
        type="number"
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.25)",
          color: "white",
          outline: "none",
        }}
      />
    </div>
  )
}

function Select(props: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 6, opacity: 0.85 }}>{props.label}</label>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.25)",
          color: "white",
          outline: "none",
        }}
      >
        {props.options.map((o) => (
          <option key={o} value={o} style={{ color: "black" }}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function Checkbox(props: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
        style={{ transform: "scale(1.1)" }}
      />
      <span style={{ opacity: 0.9 }}>{props.label}</span>
    </label>
  )
}
