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

/* ---------- UI helpers ---------- */
const panel: React.CSSProperties = {
  background: "var(--surface)",
  borderRadius: 18,
  padding: 20,
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow)",
}

const headerTitle: React.CSSProperties = { fontSize: 18, fontWeight: 600 }
const headerSub: React.CSSProperties = { fontSize: 13, color: "var(--muted)", marginTop: 4 }

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0,1fr))",
  gap: 14,
}

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0,1fr))",
  gap: 14,
}

const label: React.CSSProperties = { fontSize: 12, color: "var(--muted)" }

function Field({
  labelText,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  labelText: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
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
    <div style={{ display: "grid", gap: 6 }}>
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
        justifyContent: "space-between",
        alignItems: "center",
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

function StepPills({
  step,
  labels,
  onJump,
}: {
  step: number
  labels: string[]
  onJump: (idx: number) => void
}) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
      {labels.map((t, i) => {
        const active = i === step
        const done = i < step
        return (
          <button
            key={t}
            onClick={() => onJump(i)}
            style={{
              borderRadius: 999,
              padding: "8px 12px",
              border: "1px solid var(--border)",
              background: active
                ? "rgba(10,132,255,0.14)"
                : done
                ? "rgba(52,199,89,0.12)"
                : "var(--surface)",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {done ? "✓ " : `${i + 1}. `}
            {t}
          </button>
        )
      })}
    </div>
  )
}

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

  /* Misc */
  const [notes, setNotes] = useState("")
  const [created_by_user_id, setCreatedByUserId] = useState("platform_admin_mock")
  const [primary_admin_user_id, setPrimaryAdminUserId] = useState("")
  const [loading, setLoading] = useState(false)

  /* ✅ useMemo is now USED (no warning) */
  const canNext1 = useMemo(() => tenant_code.trim() !== "" && tenant_name.trim() !== "", [
    tenant_code,
    tenant_name,
  ])
  const canNext2 = useMemo(() => plan_type.trim() !== "" && subscription_status.trim() !== "", [
    plan_type,
    subscription_status,
  ])
  const canNext3 = useMemo(
    () => primary_admin_name.trim() !== "" && primary_admin_email.includes("@"),
    [primary_admin_name, primary_admin_email]
  )

  const canCreate = useMemo(() => canNext1 && canNext2 && canNext3, [canNext1, canNext2, canNext3])

  async function createTenant() {
    if (!canCreate || loading) return
    setLoading(true)

    const now = new Date().toISOString()

    const payload: Vendor = {
      tenant_id: makeTenantId(),
      tenant_code: tenant_code.trim(),
      tenant_name: tenant_name.trim(),
      legal_name: legal_name.trim() || undefined,

      tenant_type,

      primary_country,
      primary_timezone,
      default_currency,

      plan_type,
      subscription_status,
      subscription_start_date: subscription_start_date || undefined,
      subscription_end_date: subscription_end_date || undefined,

      max_users: Number(max_users || 0),
      max_organizations: Number(max_organizations || 0),

      tenant_status,
      is_demo_tenant,

      data_retention_policy,
      compliance_flag,

      primary_admin_name: primary_admin_name.trim(),
      primary_admin_email: primary_admin_email.trim(),
      created_by_user_id,
      primary_admin_user_id: primary_admin_user_id || undefined,

      ai_insights_enabled,
      cost_optimization_enabled,
      usage_analytics_enabled,

      created_at: now,
      updated_at: now,
      last_active_at: "",

      notes: notes.trim() || undefined,
      vat_registration_number: vat_registration_number.trim() || undefined,
      national_address: national_address.trim() || undefined,
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
      nav("/admin/vendors")
    } catch (e: unknown) {
      alert(`Create failed: ${(e as Error)?.message ?? String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  const steps = ["Tenant", "Subscription", "Admin & Compliance", "Review"]

  return (
    <AppShell title="Onboard Tenant">
      <StepPills step={step} labels={steps} onJump={setStep} />

      {/* STEP 1 */}
      {step === 0 && (
        <div style={panel}>
          <div style={headerTitle}>Tenant</div>
          <div style={headerSub}>Basic tenant identity</div>

          <div style={{ ...grid2, marginTop: 16 }}>
            <Field labelText="Tenant Code" value={tenant_code} onChange={setTenantCode} placeholder="e.g. CKSA" />
            <Field labelText="Tenant Name" value={tenant_name} onChange={setTenantName} placeholder="Canon Saudi Arabia" />
            <Field labelText="Legal Name (optional)" value={legal_name} onChange={setLegalName} />
            <SelectField labelText="Tenant Type" value={tenant_type} onChange={setTenantType} options={TENANT_TYPE_OPTIONS as string[]} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <button onClick={() => nav("/admin/vendors")}>Cancel</button>
            <button className="btn-primary" disabled={!canNext1} onClick={() => setStep(1)}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && (
        <div style={panel}>
          <div style={headerTitle}>Subscription</div>
          <div style={headerSub}>Plan, status, dates and limits</div>

          <div style={{ ...grid2, marginTop: 16 }}>
            <SelectField labelText="Plan Type" value={plan_type} onChange={setPlanType} options={PLAN_TYPE_OPTIONS as string[]} />
            <SelectField labelText="Subscription Status" value={subscription_status} onChange={setSubscriptionStatus} options={SUBSCRIPTION_STATUS_OPTIONS as string[]} />

            {/* ✅ date pickers */}
            <Field labelText="Subscription Start Date (optional)" value={subscription_start_date} onChange={setStartDate} type="date" />
            <Field labelText="Subscription End Date (optional)" value={subscription_end_date} onChange={setEndDate} type="date" />

            <SelectField labelText="Tenant Status" value={tenant_status} onChange={setTenantStatus} options={["Active", "Inactive", "Pending"]} />

            <Toggle labelText="Demo tenant" checked={is_demo_tenant} onChange={setIsDemo} />

            <Field labelText="Max Users" value={max_users} onChange={setMaxUsers} type="number" />
            <Field labelText="Max Organizations" value={max_organizations} onChange={setMaxOrgs} type="number" />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep(0)}>Back</button>
            <button className="btn-primary" disabled={!canNext2} onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <div style={panel}>
          <div style={headerTitle}>Admin & Compliance</div>
          <div style={headerSub}>Primary admin + compliance + flags</div>

          <div style={{ ...grid2, marginTop: 16 }}>
            <Field labelText="Admin Name" value={primary_admin_name} onChange={setAdminName} />
            <Field labelText="Admin Email" value={primary_admin_email} onChange={setAdminEmail} type="email" />
            <Field labelText="Primary Country" value={primary_country} onChange={setCountry} />
            <Field labelText="Primary Timezone" value={primary_timezone} onChange={setTimezone} />
            <Field labelText="Default Currency" value={default_currency} onChange={setCurrency} />
            <Field labelText="VAT Registration Number (optional)" value={vat_registration_number} onChange={setVat} />

            <SelectField
              labelText="Data Retention Policy"
              value={data_retention_policy}
              onChange={setRetention}
              options={["standard", "extended", "strict"]}
            />

            <Field
              labelText="Created By User ID"
              value={created_by_user_id}
              onChange={setCreatedByUserId}
            />

            <Field
              labelText="Primary Admin User ID (optional)"
              value={primary_admin_user_id}
              onChange={setPrimaryAdminUserId}
            />
          </div>

          <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
            <div style={label}>National Address (optional)</div>
            <textarea
              value={national_address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Long text"
              style={{ width: "100%", minHeight: 90 }}
            />
          </div>

          <div style={{ ...grid3, marginTop: 12 }}>
            <Toggle labelText="Compliance flag" checked={compliance_flag} onChange={setCompliance} />
            <Toggle labelText="AI insights enabled" checked={ai_insights_enabled} onChange={setAI} />
            <Toggle labelText="Cost optimization enabled" checked={cost_optimization_enabled} onChange={setCost} />
            <Toggle labelText="Usage analytics enabled" checked={usage_analytics_enabled} onChange={setAnalytics} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" disabled={!canNext3} onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 3 && (
        <div style={panel}>
          <div style={headerTitle}>Review</div>
          <div style={headerSub}>Confirm and create tenant</div>

          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <div style={{ ...panel, boxShadow: "none" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Summary</div>
              <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
                <div><b>Code:</b> {tenant_code}</div>
                <div><b>Name:</b> {tenant_name}</div>
                <div><b>Type:</b> {tenant_type}</div>
                <div><b>Plan:</b> {plan_type}</div>
                <div><b>Subscription:</b> {subscription_status}</div>
                <div><b>Admin:</b> {primary_admin_name} ({primary_admin_email})</div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={label}>Notes (optional)</div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes"
                style={{ width: "100%", minHeight: 90 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary" disabled={!canCreate || loading} onClick={createTenant}>
              {loading ? "Saving..." : "Create Tenant"}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
