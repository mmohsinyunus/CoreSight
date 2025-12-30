import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { addVendor } from "../../data/vendors"

// ✅ Google Apps Script Web App URL (/exec)
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyveLMQjQxGC12KkQhgcRSbNJ1ynWZIxqc9PFRznb-QU3imkQ2_DWFAIeMoiqRFxTdgBg/exec"

export default function VendorNew() {
  const nav = useNavigate()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
  const [max_users, setMaxUsers] = useState("10")
  const [max_organizations, setMaxOrganizations] = useState("1")
  const [tenant_status, setTenantStatus] = useState("Active")
  const [is_demo_tenant, setIsDemoTenant] = useState(false)

  // Governance / compliance
  const [data_retention_policy, setDataRetentionPolicy] = useState("1 year")
  const [compliance_flag, setComplianceFlag] = useState("Internal Policy")

  // ✅ Added (you asked)
  const [vat_registration_number, setVatRegistrationNumber] = useState("")
  const [national_address, setNationalAddress] = useState("")

  // Primary admin
  const [primary_admin_name, setPrimaryAdminName] = useState("")
  const [primary_admin_email, setPrimaryAdminEmail] = useState("")

  // Flags
  const [ai_insights_enabled, setAiInsightsEnabled] = useState(true)
  const [cost_optimization_enabled, setCostOptimizationEnabled] = useState(true)
  const [usage_analytics_enabled, setUsageAnalyticsEnabled] = useState(true)

  // Notes
  const [notes, setNotes] = useState("")

  function makeTenantId() {
    // simple unique id for now (later replace with backend-generated)
    return "t_" + Date.now().toString(36)
  }

  async function handleCreate() {
    setError("")
    setSuccess("")
    setSaving(true)

    // minimal validations
    if (!tenant_code.trim()) {
      setError("tenant_code is required")
      setSaving(false)
      return
    }
    if (!tenant_name.trim()) {
      setError("tenant_name is required")
      setSaving(false)
      return
    }
    if (!legal_name.trim()) {
      setError("legal_name is required")
      setSaving(false)
      return
    }
    if (!primary_admin_email.trim()) {
      setError("primary_admin_email is required")
      setSaving(false)
      return
    }

    const payload: Record<string, any> = {
      tenant_id: makeTenantId(),
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

      // ✅ Added fields
      vat_registration_number: vat_registration_number.trim(),
      national_address: national_address.trim(),

      primary_admin_name: primary_admin_name.trim(),
      primary_admin_email: primary_admin_email.trim(),

      created_by_user_id: "platform_admin_mock",

      ai_insights_enabled,
      cost_optimization_enabled,
      usage_analytics_enabled,

      notes: notes.trim(),
    }

    // ✅ JSONP callback to bypass CORS on GitHub Pages
    const callbackName = "coresight_cb_" + Date.now()

    // @ts-ignore
    window[callbackName] = (resp: any) => {
      try {
        if (!resp?.ok) {
          setError(resp?.message || "Failed to onboard vendor")
          return
        }

        // store locally (demo)
        addVendor(payload as any)

        setSuccess("Vendor onboarded successfully ✅")
        setTimeout(() => nav("/admin/vendors"), 600)
      } finally {
        // cleanup
        // @ts-ignore
        delete window[callbackName]
        const tag = document.getElementById(callbackName)
        if (tag) tag.remove()
        setSaving(false)
      }
    }

    const params = new URLSearchParams({
      action: "append",
      callback: callbackName,
    })

    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      params.set(k, String(v))
    })

    const url = `${SHEET_URL}?${params.toString()}`

    const script = document.createElement("script")
    script.src = url
    script.id = callbackName
    script.onerror = () => {
      setError(
        "Failed to fetch (blocked). Check Apps Script deployment: Who has access = Anyone, and use the /exec URL."
      )
      setSaving(false)
      // @ts-ignore
      delete window[callbackName]
      script.remove()
    }

    document.body.appendChild(script)
  }

  return (
    <div style={{ padding: 28, maxWidth: 920 }}>
      <h1 style={{ fontSize: 46, margin: "8px 0 10px" }}>Onboard Vendor (Tenant)</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        This form will create a tenant row in Google Sheets and (for now) store it locally for UI demo.
      </p>

      {error && (
        <div
          style={{
            background: "#5b0b0b",
            border: "1px solid #a33",
            padding: 12,
            borderRadius: 10,
            margin: "14px 0",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#0b3b17",
            border: "1px solid #2e8b57",
            padding: 12,
            borderRadius: 10,
            margin: "14px 0",
          }}
        >
          {success}
        </div>
      )}

      <Section title="Identity">
        <Field label="Tenant Name" value={tenant_name} onChange={setTenantName} placeholder="Tamer Group" />
        <Field label="Tenant Code" value={tenant_code} onChange={setTenantCode} placeholder="TAMER" />
        <Field label="Legal Name" value={legal_name} onChange={setLegalName} placeholder="Tamer Trading Company Ltd." />

        <SelectField
          label="Tenant Type"
          value={tenant_type}
          onChange={setTenantType}
          options={["Holding Group", "Single Company", "Enterprise Group"]}
        />
      </Section>

      <Section title="Location / Defaults">
        <Field label="Primary Country" value={primary_country} onChange={setPrimaryCountry} placeholder="Saudi Arabia" />
        <Field label="Primary Timezone" value={primary_timezone} onChange={setPrimaryTimezone} placeholder="Asia/Riyadh" />
        <Field label="Default Currency" value={default_currency} onChange={setDefaultCurrency} placeholder="SAR" />
      </Section>

      <Section title="Plan / Subscription">
        <SelectField label="Plan Type" value={plan_type} onChange={setPlanType} options={["Free", "Trial", "Pro", "Enterprise"]} />
        <SelectField
          label="Subscription Status"
          value={subscription_status}
          onChange={setSubscriptionStatus}
          options={["Trial", "Active", "Suspended", "Expired"]}
        />
        <Field label="Subscription Start Date" value={subscription_start_date} onChange={setSubscriptionStartDate} placeholder="YYYY-MM-DD" />
        <Field label="Subscription End Date" value={subscription_end_date} onChange={setSubscriptionEndDate} placeholder="YYYY-MM-DD" />
        <Field label="Max Users" value={max_users} onChange={setMaxUsers} placeholder="10" />
        <Field label="Max Organizations" value={max_organizations} onChange={setMaxOrganizations} placeholder="1" />

        <SelectField label="Tenant Status" value={tenant_status} onChange={setTenantStatus} options={["Active", "Inactive", "Archived"]} />

        <Checkbox label="Demo Tenant" checked={is_demo_tenant} onChange={setIsDemoTenant} />
      </Section>

      <Section title="Compliance / Governance">
        <Field label="Data Retention Policy" value={data_retention_policy} onChange={setDataRetentionPolicy} placeholder="1 year / 3 years" />
        <Field label="Compliance Flag" value={compliance_flag} onChange={setComplianceFlag} placeholder="GDPR / PDPL / Internal Policy" />

        {/* ✅ Added */}
        <Field
          label="VAT Registration Number"
          value={vat_registration_number}
          onChange={setVatRegistrationNumber}
          placeholder="300xxxxxxxxx"
        />
        <Field
          label="National Address"
          value={national_address}
          onChange={setNationalAddress}
          placeholder="Building, Street, District, City, Postal Code"
        />
      </Section>

      <Section title="Primary Admin">
        <Field label="Admin Name" value={primary_admin_name} onChange={setPrimaryAdminName} placeholder="Ahmed Ali" />
        <Field label="Admin Email" value={primary_admin_email} onChange={setPrimaryAdminEmail} placeholder="admin@vendor.com" />
      </Section>

      <Section title="Feature Flags">
        <Checkbox label="AI Insights Enabled" checked={ai_insights_enabled} onChange={setAiInsightsEnabled} />
        <Checkbox label="Cost Optimization Enabled" checked={cost_optimization_enabled} onChange={setCostOptimizationEnabled} />
        <Checkbox label="Usage Analytics Enabled" checked={usage_analytics_enabled} onChange={setUsageAnalyticsEnabled} />
      </Section>

      <Section title="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(0,0,0,0.25)",
            color: "white",
            outline: "none",
          }}
          placeholder="Internal notes (optional)"
        />
      </Section>

      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <button
          onClick={() => nav("/admin/vendors")}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleCreate}
          disabled={saving}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: saving ? "rgba(0,140,255,0.35)" : "rgba(0,140,255,0.75)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "white",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {saving ? "Creating..." : "Create Vendor"}
        </button>
      </div>
    </div>
  )
}

/* ---------- small UI helpers (no external deps) ---------- */

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div style={{ marginTop: 22 }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 20 }}>{title}</h3>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.25)",
          color: "white",
          outline: "none",
        }}
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.25)",
          color: "white",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ color: "black" }}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span style={{ opacity: 0.9 }}>{label}</span>
    </label>
  )
}
