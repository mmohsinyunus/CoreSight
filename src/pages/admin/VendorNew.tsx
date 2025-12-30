import { useMemo, useState } from "react"
import AppShell from "../../layout/AppShell"
import {
  TENANT_TYPE_OPTIONS,
  PLAN_TYPE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
  makeTenantId,
} from "../../data/vendors"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

type Step = 1 | 2 | 3 | 4

export default function VendorNew() {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  // Tenant
  const [tenant_code, setTenantCode] = useState("")
  const [tenant_name, setTenantName] = useState("")
  const [legal_name, setLegalName] = useState("")
  const [tenant_type, setTenantType] = useState<string>(TENANT_TYPE_OPTIONS[0] || "Enterprise")

  // Subscription
  const [plan_type, setPlanType] = useState<string>(PLAN_TYPE_OPTIONS[1] || "Standard")
  const [subscription_status, setSubscriptionStatus] = useState<string>(
    SUBSCRIPTION_STATUS_OPTIONS[0] || "Active"
  )
  const [subscription_start_date, setStartDate] = useState("")
  const [subscription_end_date, setEndDate] = useState("")
  const [max_users, setMaxUsers] = useState<number>(50)
  const [max_organizations, setMaxOrgs] = useState<number>(5)
  const [tenant_status, setTenantStatus] = useState("Active")
  const [is_demo_tenant, setIsDemoTenant] = useState(false)

  // Admin & Compliance
  const [primary_admin_name, setAdminName] = useState("")
  const [primary_admin_email, setAdminEmail] = useState("")
  const [primary_country, setCountry] = useState("Saudi Arabia")
  const [primary_timezone, setTimezone] = useState("Asia/Riyadh")
  const [default_currency, setCurrency] = useState("SAR")
  const [data_retention_policy, setRetentionPolicy] = useState("standard")
  const [compliance_flag, setComplianceFlag] = useState(false)
  const [vat_registration_number, setVat] = useState("")
  const [national_address, setNationalAddress] = useState("")
  const [notes, setNotes] = useState("")

  // Feature flags
  const [ai_insights_enabled, setAI] = useState(true)
  const [cost_optimization_enabled, setCost] = useState(true)
  const [usage_analytics_enabled, setAnalytics] = useState(true)

  const created_by_user_id = "platform_admin_mock"

  const canNext = useMemo(() => {
    if (step === 1) return tenant_code.trim() && tenant_name.trim() && tenant_type.trim()
    if (step === 2) return plan_type.trim() && subscription_status.trim()
    if (step === 3) return primary_admin_name.trim() && primary_admin_email.trim()
    return true
  }, [step, tenant_code, tenant_name, tenant_type, plan_type, subscription_status, primary_admin_name, primary_admin_email])

  function next() {
    if (!canNext) return
    setStep((s) => (Math.min(4, s + 1) as Step))
  }
  function back() {
    setStep((s) => (Math.max(1, s - 1) as Step))
  }

  async function createTenant() {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const nowIso = new Date().toISOString()

      const payload = {
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
        subscription_start_date: subscription_start_date || "",
        subscription_end_date: subscription_end_date || "",

        max_users: Number.isFinite(max_users) ? max_users : "",
        max_organizations: Number.isFinite(max_organizations) ? max_organizations : "",

        tenant_status,
        is_demo_tenant,

        data_retention_policy,
        compliance_flag,

        primary_admin_name,
        primary_admin_email,

        created_by_user_id,

        ai_insights_enabled,
        cost_optimization_enabled,
        usage_analytics_enabled,

        created_at: nowIso,
        updated_at: nowIso,
        last_active_at: "",

        primary_admin_user_id: "",
        notes,
        vat_registration_number,
        national_address,
      }

      const res = await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (!json?.ok) throw new Error(json?.error || "Create failed")

      setSuccess("✅ Tenant created and appended to Google Sheet.")
      setStep(1)

      // Optional: clear some fields
      setTenantCode("")
      setTenantName("")
      setLegalName("")
      setAdminName("")
      setAdminEmail("")
    } catch (e: any) {
      setError(`Create failed: ${e?.message || "Failed to fetch"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Onboard Tenant" subtitle="Create tenant and append row into Tenants sheet">
      <div style={wrap}>
        <div style={card}>
          <div style={stepRow}>
            <StepPill active={step === 1} label="1. Tenant" />
            <StepPill active={step === 2} label="2. Subscription" />
            <StepPill active={step === 3} label="3. Admin & Compliance" />
            <StepPill active={step === 4} label="4. Review" />
          </div>

          {step === 1 && (
            <>
              <h2 style={h2}>Tenant</h2>
              <p style={muted}>Basic tenant identity</p>
              <div style={grid2}>
                <Field label="Tenant Code">
                  <input style={input} value={tenant_code} onChange={(e) => setTenantCode(e.target.value)} placeholder="e.g. CKSA" />
                </Field>
                <Field label="Tenant Name">
                  <input style={input} value={tenant_name} onChange={(e) => setTenantName(e.target.value)} placeholder="e.g. Canon Saudi Arabia" />
                </Field>
                <Field label="Legal Name (optional)">
                  <input style={input} value={legal_name} onChange={(e) => setLegalName(e.target.value)} />
                </Field>
                <Field label="Tenant Type">
                  <select style={input} value={tenant_type} onChange={(e) => setTenantType(e.target.value)}>
                    {TENANT_TYPE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={h2}>Subscription</h2>
              <p style={muted}>Plan, status, dates and limits</p>

              <div style={grid2}>
                <Field label="Plan Type">
                  <select style={input} value={plan_type} onChange={(e) => setPlanType(e.target.value)}>
                    {PLAN_TYPE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Subscription Status">
                  <select style={input} value={subscription_status} onChange={(e) => setSubscriptionStatus(e.target.value)}>
                    {SUBSCRIPTION_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Subscription Start Date (calendar)">
                  <input style={input} type="date" value={subscription_start_date} onChange={(e) => setStartDate(e.target.value)} />
                </Field>

                <Field label="Subscription End Date (calendar)">
                  <input style={input} type="date" value={subscription_end_date} onChange={(e) => setEndDate(e.target.value)} />
                </Field>

                <Field label="Max Users">
                  <input
                    style={input}
                    type="number"
                    min={0}
                    value={max_users}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                  />
                </Field>

                <Field label="Max Organizations">
                  <input
                    style={input}
                    type="number"
                    min={0}
                    value={max_organizations}
                    onChange={(e) => setMaxOrgs(Number(e.target.value))}
                  />
                </Field>

                <Field label="Tenant Status">
                  <select style={input} value={tenant_status} onChange={(e) => setTenantStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </Field>

                <Field label="Demo tenant">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44 }}>
                    <input type="checkbox" checked={is_demo_tenant} onChange={(e) => setIsDemoTenant(e.target.checked)} />
                    <span style={muted}>Mark as demo</span>
                  </div>
                </Field>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={h2}>Admin & Compliance</h2>
              <p style={muted}>Primary admin + compliance + flags</p>

              <div style={grid2}>
                <Field label="Admin Name">
                  <input style={input} value={primary_admin_name} onChange={(e) => setAdminName(e.target.value)} />
                </Field>
                <Field label="Admin Email">
                  <input style={input} value={primary_admin_email} onChange={(e) => setAdminEmail(e.target.value)} />
                </Field>

                <Field label="Primary Country">
                  <input style={input} value={primary_country} onChange={(e) => setCountry(e.target.value)} />
                </Field>

                <Field label="Primary Timezone">
                  <input style={input} value={primary_timezone} onChange={(e) => setTimezone(e.target.value)} />
                </Field>

                <Field label="Default Currency">
                  <input style={input} value={default_currency} onChange={(e) => setCurrency(e.target.value)} />
                </Field>

                <Field label="VAT Registration Number (optional)">
                  <input style={input} value={vat_registration_number} onChange={(e) => setVat(e.target.value)} />
                </Field>

                <Field label="National Address (optional)">
                  <input style={input} value={national_address} onChange={(e) => setNationalAddress(e.target.value)} />
                </Field>

                <Field label="Data Retention Policy">
                  <select style={input} value={data_retention_policy} onChange={(e) => setRetentionPolicy(e.target.value)}>
                    <option value="standard">standard</option>
                    <option value="strict">strict</option>
                    <option value="custom">custom</option>
                  </select>
                </Field>

                <Field label="Compliance Flag">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44 }}>
                    <input type="checkbox" checked={compliance_flag} onChange={(e) => setComplianceFlag(e.target.checked)} />
                    <span style={muted}>Requires compliance review</span>
                  </div>
                </Field>

                <Field label="AI Insights Enabled">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44 }}>
                    <input type="checkbox" checked={ai_insights_enabled} onChange={(e) => setAI(e.target.checked)} />
                    <span style={muted}>Enable</span>
                  </div>
                </Field>

                <Field label="Cost Optimization Enabled">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44 }}>
                    <input type="checkbox" checked={cost_optimization_enabled} onChange={(e) => setCost(e.target.checked)} />
                    <span style={muted}>Enable</span>
                  </div>
                </Field>

                <Field label="Usage Analytics Enabled">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44 }}>
                    <input type="checkbox" checked={usage_analytics_enabled} onChange={(e) => setAnalytics(e.target.checked)} />
                    <span style={muted}>Enable</span>
                  </div>
                </Field>

                <Field label="Notes (optional)">
                  <input style={input} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
              </div>

              <div style={{ marginTop: 8, ...muted }}>
                Created By User ID: <b>{created_by_user_id}</b>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={h2}>Review</h2>
              <p style={muted}>Confirm and create tenant</p>

              <div style={reviewBox}>
                <div><b>Code:</b> {tenant_code || "-"}</div>
                <div><b>Name:</b> {tenant_name || "-"}</div>
                <div><b>Type:</b> {tenant_type || "-"}</div>
                <div><b>Plan:</b> {plan_type || "-"}</div>
                <div><b>Status:</b> {subscription_status || "-"}</div>
                <div><b>Admin:</b> {primary_admin_name || "-"} ({primary_admin_email || "-"})</div>
              </div>

              <button style={primaryBtn} onClick={createTenant} disabled={loading}>
                {loading ? "Creating..." : "Create Tenant"}
              </button>
            </>
          )}

          <div style={navRow}>
            <button style={ghostBtn} onClick={back} disabled={step === 1 || loading}>
              Back
            </button>

            {step < 4 ? (
              <button style={primaryBtnSmall} onClick={next} disabled={!canNext || loading}>
                Next
              </button>
            ) : (
              <button style={primaryBtnSmall} onClick={createTenant} disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </button>
            )}
          </div>

          {error && <div style={errorBox}>{error}</div>}
          {success && <div style={successBox}>{success}</div>}
        </div>
      </div>
    </AppShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  )
}

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid rgba(15, 23, 42, 0.10)",
        background: active ? "rgba(10,132,255,0.12)" : "rgba(15, 23, 42, 0.04)",
        color: "rgba(15, 23, 42, 0.85)",
        fontSize: 13,
        fontWeight: 600,
        userSelect: "none",
      }}
    >
      {label}
    </div>
  )
}

/** Styles */
const wrap: React.CSSProperties = { width: "100%", display: "flex", justifyContent: "center" }
const card: React.CSSProperties = {
  width: "min(980px, 100%)",
  background: "#fff",
  border: "1px solid rgba(15, 23, 42, 0.10)",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
}
const stepRow: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }
const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
}
const h2: React.CSSProperties = { margin: "6px 0 0", fontSize: 18 }
const muted: React.CSSProperties = { margin: "6px 0 14px", color: "rgba(15, 23, 42, 0.65)" }
const input: React.CSSProperties = {
  height: 44,
  borderRadius: 12,
  border: "1px solid rgba(15, 23, 42, 0.12)",
  padding: "0 12px",
  outline: "none",
  background: "rgba(15, 23, 42, 0.03)",
}
const navRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", marginTop: 18 }
const ghostBtn: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid rgba(15, 23, 42, 0.12)",
  background: "#fff",
}
const primaryBtnSmall: React.CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid rgba(10,132,255,0.25)",
  background: "rgba(10,132,255,0.12)",
  fontWeight: 700,
}
const primaryBtn: React.CSSProperties = {
  height: 46,
  width: "fit-content",
  padding: "0 18px",
  borderRadius: 12,
  border: "1px solid rgba(10,132,255,0.25)",
  background: "rgba(10,132,255,0.12)",
  fontWeight: 800,
  marginTop: 12,
}
const errorBox: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "rgba(255,59,48,0.08)",
  border: "1px solid rgba(255,59,48,0.20)",
  color: "rgba(120, 15, 15, 0.95)",
}
const successBox: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "rgba(52,199,89,0.10)",
  border: "1px solid rgba(52,199,89,0.22)",
  color: "rgba(14, 87, 32, 0.95)",
}
const reviewBox: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  background: "rgba(15, 23, 42, 0.03)",
  display: "grid",
  gap: 6,
}
