import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { addVendor } from "../../data/vendors"

// ✅ Google Apps Script Web App URL
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycby67IuG40S_PDKPczI-_tbCkk2f-VkcEOAvLjBOux3R2AkWCg56Wcsyesjb2nImSxuQ4A/exec"

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
  const [plan_type, setPlanType] = useState("Trial")
  const [subscription_status, setSubscriptionStatus] = useState("Trial")
  const [subscription_start_date, setSubscriptionStartDate] = useState("")
  const [subscription_end_date, setSubscriptionEndDate] = useState("")
  const [max_users, setMaxUsers] = useState<number>(10)
  const [max_organizations, setMaxOrganizations] = useState<number>(1)

  // Status / governance
  const [tenant_status, setTenantStatus] = useState("Active")
  const [is_demo_tenant, setIsDemoTenant] = useState(false)
  const [data_retention_policy, setDataRetentionPolicy] = useState("1 year")
  const [compliance_flag, setComplianceFlag] = useState("Internal Policy")

  // Primary admin
  const [primary_admin_name, setPrimaryAdminName] = useState("")
  const [primary_admin_email, setPrimaryAdminEmail] = useState("")
  const [created_by_user_id, setCreatedByUserId] = useState("platform_admin")
  const [primary_admin_user_id, setPrimaryAdminUserId] = useState("")

  // Feature flags
  const [ai_insights_enabled, setAiInsightsEnabled] = useState(false)
  const [cost_optimization_enabled, setCostOptimizationEnabled] = useState(false)
  const [usage_analytics_enabled, setUsageAnalyticsEnabled] = useState(true)

  // ✅ New fields
  const [vat_registration_number, setVatNumber] = useState("")
  const [national_address, setNationalAddress] = useState("")

  // Notes
  const [notes, setNotes] = useState("")

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setError(null)

    if (!tenant_name.trim() || !primary_admin_email.trim()) {
      setError("Tenant Name and Primary Admin Email are required.")
      return
    }

    const now = new Date().toISOString()
    const tenant_id = "tenant_" + crypto.randomUUID().slice(0, 8)

    // ✅ Payload keys match your Google Sheet columns
    const payload = {
      tenant_id,
      tenant_code: tenant_code.trim(),
      tenant_name: tenant_name.trim(),
      legal_name: legal_name.trim(),
      tenant_type: tenant_type.trim(),

      primary_country: primary_country.trim(),
      primary_timezone: primary_timezone.trim(),
      default_currency: default_currency.trim(),

      plan_type: plan_type.trim(),
      subscription_status: subscription_status.trim(),
      subscription_start_date: subscription_start_date.trim(),
      subscription_end_date: subscription_end_date.trim(),
      max_users,
      max_organizations,

      tenant_status: tenant_status.trim(),
      is_demo_tenant,
      data_retention_policy: data_retention_policy.trim(),
      compliance_flag: compliance_flag.trim(),

      primary_admin_name: primary_admin_name.trim(),
      primary_admin_email: primary_admin_email.trim(),
      created_by_user_id: created_by_user_id.trim(),

      ai_insights_enabled,
      cost_optimization_enabled,
      usage_analytics_enabled,

      created_at: now,
      updated_at: now,
      last_active_at: "",

      notes: notes.trim(),
      primary_admin_user_id: primary_admin_user_id.trim(),

      vat_registration_number: vat_registration_number.trim(),
      national_address: national_address.trim(),
    }

    setSaving(true)

    try {
      // Local UI persistence
      addVendor({
        tenantId: tenant_id,
        name: payload.tenant_name,
        adminEmail: payload.primary_admin_email,
        createdAt: now,
      })

      // Send to Google Sheet
      const res = await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const text = await res.text()
      let json: any = null
      try {
        json = JSON.parse(text)
      } catch {}

      if (!res.ok || (json && json.ok === false)) {
        throw new Error(json?.error || `Sheet write failed: ${text}`)
      }

      nav("/admin/vendors")
    } catch (e: any) {
      setError(e?.message || "Failed to onboard tenant.")
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: 12,
    borderRadius: 10,
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Onboard Vendor (Tenant)</h1>

      {error && (
        <div style={{ background: "#3b0a0a", border: "1px solid #7f1d1d", padding: 12, borderRadius: 10, marginTop: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <h3 style={{ marginBottom: 0 }}>Identity</h3>
        <input style={inputStyle} placeholder="tenant_code (optional)" value={tenant_code} onChange={(e) => setTenantCode(e.target.value)} />
        <input style={inputStyle} placeholder="tenant_name (required)" value={tenant_name} onChange={(e) => setTenantName(e.target.value)} />
        <input style={inputStyle} placeholder="legal_name (optional)" value={legal_name} onChange={(e) => setLegalName(e.target.value)} />
        <input style={inputStyle} placeholder="tenant_type (e.g., Single Company)" value={tenant_type} onChange={(e) => setTenantType(e.target.value)} />

        <h3 style={{ marginBottom: 0 }}>Compliance & Address</h3>
        <input style={inputStyle} placeholder="vat_registration_number" value={vat_registration_number} onChange={(e) => setVatNumber(e.target.value)} />
        <textarea style={{ ...inputStyle, minHeight: 90 }} placeholder="national_address" value={national_address} onChange={(e) => setNationalAddress(e.target.value)} />

        <h3 style={{ marginBottom: 0 }}>Primary Settings</h3>
        <input style={inputStyle} placeholder="primary_country" value={primary_country} onChange={(e) => setPrimaryCountry(e.target.value)} />
        <input style={inputStyle} placeholder="primary_timezone" value={primary_timezone} onChange={(e) => setPrimaryTimezone(e.target.value)} />
        <input style={inputStyle} placeholder="default_currency" value={default_currency} onChange={(e) => setDefaultCurrency(e.target.value)} />

        <h3 style={{ marginBottom: 0 }}>Subscription</h3>
        <input style={inputStyle} placeholder="plan_type" value={plan_type} onChange={(e) => setPlanType(e.target.value)} />
        <input style={inputStyle} placeholder="subscription_status" value={subscription_status} onChange={(e) => setSubscriptionStatus(e.target.value)} />
        <input style={inputStyle} placeholder="subscription_start_date (YYYY-MM-DD)" value={subscription_start_date} onChange={(e) => setSubscriptionStartDate(e.target.value)} />
        <input style={inputStyle} placeholder="subscription_end_date (YYYY-MM-DD)" value={subscription_end_date} onChange={(e) => setSubscriptionEndDate(e.target.value)} />
        <input style={inputStyle} type="number" placeholder="max_users" value={max_users} onChange={(e) => setMaxUsers(Number(e.target.value))} />
        <input style={inputStyle} type="number" placeholder="max_organizations" value={max_organizations} onChange={(e) => setMaxOrganizations(Number(e.target.value))} />

        <h3 style={{ marginBottom: 0 }}>Operations</h3>
        <input style={inputStyle} placeholder="tenant_status" value={tenant_status} onChange={(e) => setTenantStatus(e.target.value)} />
        <input style={inputStyle} placeholder="data_retention_policy" value={data_retention_policy} onChange={(e) => setDataRetentionPolicy(e.target.value)} />
        <input style={inputStyle} placeholder="compliance_flag" value={compliance_flag} onChange={(e) => setComplianceFlag(e.target.value)} />

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={is_demo_tenant} onChange={(e) => setIsDemoTenant(e.target.checked)} />
          is_demo_tenant
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={ai_insights_enabled} onChange={(e) => setAiInsightsEnabled(e.target.checked)} />
          ai_insights_enabled
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={cost_optimization_enabled} onChange={(e) => setCostOptimizationEnabled(e.target.checked)} />
          cost_optimization_enabled
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={usage_analytics_enabled} onChange={(e) => setUsageAnalyticsEnabled(e.target.checked)} />
          usage_analytics_enabled
        </label>

        <h3 style={{ marginBottom: 0 }}>Primary Admin</h3>
        <input style={inputStyle} placeholder="primary_admin_name" value={primary_admin_name} onChange={(e) => setPrimaryAdminName(e.target.value)} />
        <input style={inputStyle} placeholder="primary_admin_email (required)" value={primary_admin_email} onChange={(e) => setPrimaryAdminEmail(e.target.value)} />
        <input style={inputStyle} placeholder="primary_admin_user_id (optional)" value={primary_admin_user_id} onChange={(e) => setPrimaryAdminUserId(e.target.value)} />
        <input style={inputStyle} placeholder="created_by_user_id" value={created_by_user_id} onChange={(e) => setCreatedByUserId(e.target.value)} />

        <textarea style={{ ...inputStyle, minHeight: 90 }} placeholder="notes (internal)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <button
          onClick={handleCreate}
          disabled={saving}
          style={{
            padding: 14,
            borderRadius: 12,
            background: saving ? "#1f3b8a" : "#2563eb",
            color: "white",
            border: "none",
            fontWeight: 800,
            cursor: saving ? "not-allowed" : "pointer",
            marginTop: 8,
          }}
        >
          {saving ? "Creating..." : "Create Tenant"}
        </button>
      </div>
    </div>
  )
}
