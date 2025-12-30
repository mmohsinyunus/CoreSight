import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppShell from "../../layout/AppShell"
import type { Vendor } from "../../data/vendors"
import {
  makeTenantId,
  TENANT_TYPE_OPTIONS,
  PLAN_TYPE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "../../data/vendors"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

/* ---------- shared styles ---------- */
const panel: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: 18,
  padding: 20,
  border: "1px solid var(--border)",
}

const title: React.CSSProperties = { fontSize: 18, fontWeight: 600 }
const sub: React.CSSProperties = { fontSize: 13, color: "var(--muted)", marginTop: 4 }

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0,1fr))",
  gap: 14,
}

const label: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
}

function Field({
  labelText,
  value,
  onChange,
  type = "text",
}: {
  labelText: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <div style={label}>{labelText}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function SelectField({
  labelText,
  value,
  onChange,
  options,
}: {
  labelText: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div>
      <div style={label}>{labelText}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

/* ---------- component ---------- */
export default function VendorNew() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)

  /* Tenant */
  const [tenant_code, setTenantCode] = useState("")
  const [tenant_name, setTenantName] = useState("")
  const [legal_name, setLegalName] = useState("")
  const [tenant_type, setTenantType] = useState("Enterprise")

  /* Subscription */
  const [plan_type, setPlanType] = useState("Standard")
  const [subscription_status, setSubscriptionStatus] = useState("Active")
  const [subscription_start_date, setStartDate] = useState("")
  const [subscription_end_date, setEndDate] = useState("")
  const [tenant_status, setTenantStatus] = useState("Active")
  const [is_demo_tenant, setIsDemo] = useState(false)
  const [max_users, setMaxUsers] = useState("50")
  const [max_organizations, setMaxOrgs] = useState("10")

  /* Admin & Compliance */
  const [primary_admin_name, setAdminName] = useState("")
  const [primary_admin_email, setAdminEmail] = useState("")
  const [primary_country, setCountry] = useState("Saudi Arabia")
  const [primary_timezone, setTimezone] = useState("Asia/Riyadh")
  const [default_currency, setCurrency] = useState("SAR")
  const [vat_registration_number, setVat] = useState("")
  const [national_address, setAddress] = useState("")
  const [data_retention_policy, setRetention] = useState("standard")
  const [compliance_flag, setCompliance] = useState(false)

  /* Feature flags */
  const [ai_insights_enabled, setAI] = useState(true)
  const [cost_optimization_enabled, setCost] = useState(false)
  const [usage_analytics_enabled, setAnalytics] = useState(true)

  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const canNext1 = tenant_code && tenant_name
  const canNext2 = plan_type && subscription_status
  const canNext3 = primary_admin_name && primary_admin_email.includes("@")

  async function createTenant() {
    if (loading) return
    setLoading(true)

    const now = new Date().toISOString()

    const payload: Vendor = {
      tenant_id: makeTenantId(),
      tenant_code,
      tenant_name,
      legal_name,
      tenant_type,

      plan_type,
      subscription_status,
      subscription_start_date,
      subscription_end_date,
      tenant_status,
      is_demo_tenant,

      max_users: Number(max_users),
      max_organizations: Number(max_organizations),

      primary_admin_name,
      primary_admin_email,
      primary_country,
      primary_timezone,
      default_currency,

      vat_registration_number,
      national_address,
      data_retention_policy,
      compliance_flag,

      ai_insights_enabled,
      cost_optimization_enabled,
      usage_analytics_enabled,

      created_at: now,
      updated_at: now,
      notes,
    }

    await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    nav("/admin/vendors")
  }

  return (
    <AppShell title="Onboard Tenant">
      {/* STEP 1 */}
      {step === 0 && (
        <div style={panel}>
          <div style={title}>Tenant</div>
          <div style={sub}>Basic tenant identity</div>

          <div style={{ ...grid2, marginTop: 16 }}>
            <Field labelText="Tenant Code" value={tenant_code} onChange={setTenantCode} />
            <Field labelText="Tenant Name" value={tenant_name} onChange={setTenantName} />
            <Field labelText="Legal Name" value={legal_name} onChange={setLegalName} />
            <SelectField
              labelText="Tenant Type"
              value={tenant_type}
              onChange={setTenantType}
              options={TENANT_TYPE_OPTIONS}
            />
          </div>

          <button disabled={!canNext1} onClick={() => setStep(1)}>Next</button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && (
        <div style={panel}>
          <div style={title}>Subscription</div>
          <div style={sub}>Plan, status & dates</div>

          <div style={{ ...grid2, marginTop: 16 }}>
            <SelectField labelText="Plan Type" value={plan_type} onChange={setPlanType} options={PLAN_TYPE_OPTIONS} />
            <SelectField labelText="Subscription Status" value={subscription_status} onChange={setSubscriptionStatus} options={SUBSCRIPTION_STATUS_OPTIONS} />

            {/* ✅ DATE PICKERS */}
            <Field labelText="Start Date" value={subscription_start_date} onChange={setStartDate} type="date" />
            <Field labelText="End Date" value={subscription_end_date} onChange={setEndDate} type="date" />

            <Field labelText="Max Users" value={max_users} onChange={setMaxUsers} type="number" />
            <Field labelText="Max Organizations" value={max_organizations} onChange={setMaxOrgs} type="number" />
          </div>

          <button onClick={() => setStep(0)}>Back</button>
          <button disabled={!canNext2} onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <div style={panel}>
          <div style={title}>Admin & Compliance</div>

          <div style={{ ...grid2, marginTop: 16 }}>
            <Field labelText="Admin Name" value={primary_admin_name} onChange={setAdminName} />
            <Field labelText="Admin Email" value={primary_admin_email} onChange={setAdminEmail} />
            <Field labelText="Country" value={primary_country} onChange={setCountry} />
            <Field labelText="Timezone" value={primary_timezone} onChange={setTimezone} />
            <Field labelText="Currency" value={default_currency} onChange={setCurrency} />
            <Field labelText="VAT Registration" value={vat_registration_number} onChange={setVat} />
          </div>

          <textarea
            placeholder="National Address"
            value={national_address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ marginTop: 12 }}
          />

          <button onClick={() => setStep(1)}>Back</button>
          <button disabled={!canNext3} onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {/* STEP 4 */}
      {step === 3 && (
        <div style={panel}>
          <div style={title}>Review</div>

          <textarea
            placeholder="Internal notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ marginTop: 12 }}
          />

          <button onClick={() => setStep(2)}>Back</button>
          <button onClick={createTenant} disabled={loading}>
            {loading ? "Saving..." : "Create Tenant"}
          </button>
        </div>
      )}
    </AppShell>
  )
}
