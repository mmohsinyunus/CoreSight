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

const section: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
  background: "var(--surface)",
  boxShadow: "var(--shadow)",
}

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 10,
}

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
}

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
}

const label: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
  marginBottom: 6,
}
const fieldWrap: React.CSSProperties = { display: "grid", gap: 6 }

function Field({
  labelText,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  labelText: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div style={fieldWrap}>
      <div style={label}>{labelText}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
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
    <div style={fieldWrap}>
      <div style={label}>{labelText}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function Toggle({
  labelText,
  checked,
  onChange,
}: {
  labelText: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--surface-2)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600 }}>{labelText}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export default function VendorNew() {
  const navigate = useNavigate()

  // Tenant identity
  const [tenant_code, setTenantCode] = useState("")
  const [tenant_name, setTenantName] = useState("")
  const [legal_name, setLegalName] = useState("")
  const [tenant_type, setTenantType] = useState<string>("Enterprise")

  // Location & compliance
  const [primary_country, setPrimaryCountry] = useState("Saudi Arabia")
  const [primary_timezone, setPrimaryTimezone] = useState("Asia/Riyadh")
  const [default_currency, setDefaultCurrency] = useState("SAR")
  const [data_retention_policy, setRetention] = useState("standard")
  const [compliance_flag, setComplianceFlag] = useState(false)
  const [vat_registration_number, setVat] = useState("")
  const [national_address, setNationalAddress] = useState("")

  // Subscription
  const [plan_type, setPlanType] = useState<string>("Standard")
  const [subscription_status, setSubscriptionStatus] = useState<string>("Active")
  const [subscription_start_date, setStartDate] = useState("")
  const [subscription_end_date, setEndDate] = useState("")
  const [tenant_status, setTenantStatus] = useState("Active")
  const [is_demo_tenant, setIsDemo] = useState(false)

  // Limits
  const [max_users, setMaxUsers] = useState("50")
  const [max_organizations, setMaxOrgs] = useState("10")

  // Feature flags
  const [ai_insights_enabled, setAi] = useState(true)
  const [cost_optimization_enabled, setCost] = useState(false)
  const [usage_analytics_enabled, setAnalytics] = useState(true)

  // Admin details
  const [primary_admin_name, setAdminName] = useState("")
  const [primary_admin_email, setAdminEmail] = useState("")
  const [primary_admin_user_id, setPrimaryAdminUserId] = useState("")
  const [created_by_user_id, setCreatedByUserId] = useState("platform_admin_mock")

  // Notes
  const [notes, setNotes] = useState("")

  const [loading, setLoading] = useState(false)

  const canSave = useMemo(() => {
    return (
      tenant_code.trim().length > 0 &&
      tenant_name.trim().length > 0 &&
      primary_admin_name.trim().length > 0 &&
      primary_admin_email.includes("@")
    )
  }, [tenant_code, tenant_name, primary_admin_name, primary_admin_email])

  async function create() {
    if (!canSave || loading) return
    setLoading(true)

    const nowIso = new Date().toISOString()

    const payload: Vendor = {
      tenant_id: makeTenantId(),
      tenant_code,
      tenant_name,
      legal_name,
      tenant_type,

      primary_country,
      primary_timezone,
      default_currency,

      plan_type,
      subscription_status,
      subscription_start_date: subscription_start_date || nowIso,
      subscription_end_date: subscription_end_date || "",

      max_users: Number(max_users || 0),
      max_organizations: Number(max_organizations || 0),

      tenant_status,
      is_demo_tenant,
      data_retention_policy,
      compliance_flag,

      primary_admin_name,
      primary_admin_email,

      created_by_user_id,
      primary_admin_user_id: primary_admin_user_id || "",

      ai_insights_enabled,
      cost_optimization_enabled,
      usage_analytics_enabled,

      created_at: nowIso,
      updated_at: nowIso,
      last_active_at: "",

      notes,
      vat_registration_number,
      national_address,
    }

    try {
      const res = await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        redirect: "follow",
      })

      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        alert(`Create failed: ${res.status}\n${txt}`)
        return
      }

      navigate("/admin/vendors")
    } catch (e: unknown) {
      alert(`Create failed: ${(e as Error)?.message ?? String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Onboard Tenant">
      <div style={{ display: "grid", gap: 14 }}>
        {/* Tenant + Admin */}
        <div style={grid2}>
          <div style={section}>
            <div style={sectionTitle}>Tenant</div>
            <div style={grid2}>
              <Field labelText="Tenant Code" value={tenant_code} onChange={setTenantCode} placeholder="e.g. CKSA" />
              <Field labelText="Tenant Name" value={tenant_name} onChange={setTenantName} placeholder="Canon Saudi Arabia" />
              <Field labelText="Legal Name" value={legal_name} onChange={setLegalName} placeholder="Legal entity name" />
              <SelectField labelText="Tenant Type" value={tenant_type} onChange={setTenantType} options={TENANT_TYPE_OPTIONS as string[]} />
            </div>
          </div>

          <div style={section}>
            <div style={sectionTitle}>Primary Admin</div>
            <div style={grid2}>
              <Field labelText="Admin Name" value={primary_admin_name} onChange={setAdminName} placeholder="Full name" />
              <Field labelText="Admin Email" value={primary_admin_email} onChange={setAdminEmail} placeholder="name@company.com" type="email" />
              <Field labelText="Primary Admin User ID (optional)" value={primary_admin_user_id} onChange={setPrimaryAdminUserId} placeholder="uuid / user id" />
              <Field labelText="Created By User ID" value={created_by_user_id} onChange={setCreatedByUserId} />
            </div>
          </div>
        </div>

        {/* Location + Subscription */}
        <div style={grid2}>
          <div style={section}>
            <div style={sectionTitle}>Location & Compliance</div>
            <div style={grid2}>
              <Field labelText="Primary Country" value={primary_country} onChange={setPrimaryCountry} />
              <Field labelText="Primary Timezone" value={primary_timezone} onChange={setPrimaryTimezone} />
              <Field labelText="Default Currency" value={default_currency} onChange={setDefaultCurrency} />
              <SelectField labelText="Retention Policy" value={data_retention_policy} onChange={setRetention} options={["standard", "extended", "strict"]} />
              <Field labelText="VAT Registration Number" value={vat_registration_number} onChange={setVat} />
              <div style={fieldWrap}>
                <div style={label}>National Address</div>
                <textarea
                  value={national_address}
                  onChange={(e) => setNationalAddress(e.target.value)}
                  placeholder="National address (long text)"
                  style={{ width: "100%", minHeight: 84 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <Toggle labelText="Compliance flag" checked={compliance_flag} onChange={setComplianceFlag} />
            </div>
          </div>

          <div style={section}>
            <div style={sectionTitle}>Subscription</div>
            <div style={grid2}>
              <SelectField labelText="Plan Type" value={plan_type} onChange={setPlanType} options={PLAN_TYPE_OPTIONS as string[]} />
              <SelectField labelText="Subscription Status" value={subscription_status} onChange={setSubscriptionStatus} options={SUBSCRIPTION_STATUS_OPTIONS as string[]} />
              <Field labelText="Subscription Start Date (optional)" value={subscription_start_date} onChange={setStartDate} placeholder="YYYY-MM-DD or ISO" />
              <Field labelText="Subscription End Date (optional)" value={subscription_end_date} onChange={setEndDate} placeholder="YYYY-MM-DD or ISO" />
              <SelectField labelText="Tenant Status" value={tenant_status} onChange={setTenantStatus} options={["Active", "Inactive", "Pending"]} />
              <Toggle labelText="Demo tenant" checked={is_demo_tenant} onChange={setIsDemo} />
            </div>
          </div>
        </div>

        {/* Limits + Feature Flags */}
        <div style={grid2}>
          <div style={section}>
            <div style={sectionTitle}>Limits</div>
            <div style={grid2}>
              <Field labelText="Max Users" value={max_users} onChange={setMaxUsers} type="number" />
              <Field labelText="Max Organizations" value={max_organizations} onChange={setMaxOrgs} type="number" />
            </div>
          </div>

          <div style={section}>
            <div style={sectionTitle}>Feature Flags</div>
            <div style={grid3}>
              <Toggle labelText="AI insights" checked={ai_insights_enabled} onChange={setAi} />
              <Toggle labelText="Cost optimization" checked={cost_optimization_enabled} onChange={setCost} />
              <Toggle labelText="Usage analytics" checked={usage_analytics_enabled} onChange={setAnalytics} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={section}>
          <div style={sectionTitle}>Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional internal notes"
            style={{ width: "100%", minHeight: 90 }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={() => navigate("/admin/vendors")}>Cancel</button>
          <button className="btn-primary" onClick={create} disabled={!canSave || loading}>
            {loading ? "Saving..." : "Create Tenant"}
          </button>
        </div>
      </div>
    </AppShell>
  )
}
