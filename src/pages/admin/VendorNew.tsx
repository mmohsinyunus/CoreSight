// src/pages/admin/VendorNew.tsx
import { useMemo, useState } from "react"
import AppShell from "../../layout/AppShell"
import type { Vendor } from "../../data/vendors"
import {
  TENANT_TYPE_OPTIONS,
  PLAN_TYPE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
  makeTenantId,
} from "../../data/vendors"
import { listTenants, upsertTenantMirrorFromSheet } from "../../data/tenants"
import { ensureTenantLifecycleRecords } from "../../data/tenantRecords"
import { countryOptions } from "../../data/countries"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

type Step = 1 | 2 | 3 | 4
type CreateResponse = { ok?: boolean; error?: string }

const CURRENCY_OPTIONS = ["SAR", "USD", "EUR", "AED"] as const
type Currency = (typeof CURRENCY_OPTIONS)[number]
const GOOGLE_MAPS_URL = "https://www.google.com/maps"

export default function VendorNew() {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  // Tenant (Step 1)
  const [tenant_name, setTenantName] = useState("")
  const [legal_name, setLegalName] = useState("")
  const [tenant_type, setTenantType] = useState<string>(
    TENANT_TYPE_OPTIONS[0] || "Enterprise",
  )

  // Point 5: VAT + National Address MUST be on first screen and mandatory
  const [vat_registration_number, setVat] = useState("")
  const [national_address, setNationalAddress] = useState("")

  // Point 6: Currency dropdown (best onboarding alignment = Step 1)
  const [default_currency, setCurrency] = useState<Currency>("SAR")

  // Subscription (Step 2)
  const [plan_type, setPlanType] = useState<string>(
    PLAN_TYPE_OPTIONS[1] || "Standard",
  )
  const [subscription_status, setSubscriptionStatus] = useState<string>(
    SUBSCRIPTION_STATUS_OPTIONS[0] || "Active",
  )
  const [subscription_start_date, setStartDate] = useState("")
  const [subscription_end_date, setEndDate] = useState("")
  const [max_users, setMaxUsers] = useState<number>(50)
  const [max_organizations, setMaxOrgs] = useState<number>(5)
  const [tenant_status, setTenantStatus] = useState("Active")

  // Point 4: remove demo checkbox from UI (keep default false in payload)
  const is_demo_tenant = false

  // Admin & Compliance (Step 3)
  const [primary_admin_name, setAdminName] = useState("")
  const [primary_admin_email, setAdminEmail] = useState("")
  const [primary_country, setCountry] = useState("Saudi Arabia")
  const [primary_timezone, setTimezone] = useState("Asia/Riyadh")

  const [data_retention_policy, setRetentionPolicy] = useState("standard")
  const [compliance_flag, setComplianceFlag] = useState(false)
  const [notes, setNotes] = useState("")

  // Feature flags
  const [ai_insights_enabled, setAI] = useState(true)
  const [cost_optimization_enabled, setCost] = useState(true)
  const [usage_analytics_enabled, setAnalytics] = useState(true)

  const created_by_user_id = "platform_admin_mock"

  // Point 7: reset fields after create (but keep success message visible)
  function resetFieldsOnly() {
    setStep(1)

    setTenantName("")
    setLegalName("")
    setTenantType(TENANT_TYPE_OPTIONS[0] || "Enterprise")

    setVat("")
    setNationalAddress("")
    setCurrency("SAR")

    setPlanType(PLAN_TYPE_OPTIONS[1] || "Standard")
    setSubscriptionStatus(SUBSCRIPTION_STATUS_OPTIONS[0] || "Active")
    setStartDate("")
    setEndDate("")
    setMaxUsers(50)
    setMaxOrgs(5)
    setTenantStatus("Active")

    setAdminName("")
    setAdminEmail("")
    setCountry("Saudi Arabia")
    setTimezone("Asia/Riyadh")

    setRetentionPolicy("standard")
    setComplianceFlag(false)
    setNotes("")

    setAI(true)
    setCost(true)
    setAnalytics(true)
  }

  const canNext = useMemo(() => {
    if (step === 1)
      return (
        tenant_name.trim() &&
        legal_name.trim() && // Point 2 mandatory
        tenant_type.trim() &&
        vat_registration_number.trim() && // Point 5 mandatory in step 1
        national_address.trim() && // Point 5 mandatory in step 1
        String(default_currency).trim() // currency present
      )

    if (step === 2) return plan_type.trim() && subscription_status.trim()

    if (step === 3) return primary_admin_name.trim() && primary_admin_email.trim()

    return true
  }, [
    step,
    tenant_name,
    legal_name,
    tenant_type,
    vat_registration_number,
    national_address,
    default_currency,
    plan_type,
    subscription_status,
    primary_admin_name,
    primary_admin_email,
  ])

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
      const tenantId = makeTenantId(listTenants().map((tenant) => tenant.tenant_id))

      /**
       * IMPORTANT:
       * Many Sheets / Apps Script implementations still expect `tenant_code`.
       * We are removing it from UI, but keeping compatibility by sending it as tenantId.
       * If your sheet truly no longer has tenant_code, you can remove this line later.
       */
      const payload: Vendor = {
        tenant_id: tenantId,
        tenant_code: tenantId, // compat: keep if sheet expects it

        tenant_name: tenant_name.trim(),
        legal_name: legal_name.trim(),

        tenant_type,

        primary_country,
        primary_timezone,
        default_currency,

        plan_type,
        subscription_status,
        subscription_start_date: subscription_start_date || "",
        subscription_end_date: subscription_end_date || "",

        max_users: Number.isFinite(max_users) ? max_users : undefined,
        max_organizations: Number.isFinite(max_organizations)
          ? max_organizations
          : undefined,

        tenant_status,
        is_demo_tenant,

        data_retention_policy,
        compliance_flag,

        primary_admin_name: primary_admin_name.trim(),
        primary_admin_email: primary_admin_email.trim(),

        created_by_user_id,

        ai_insights_enabled,
        cost_optimization_enabled,
        usage_analytics_enabled,

        created_at: nowIso,
        updated_at: nowIso,
        last_active_at: "",

        primary_admin_user_id: "",
        notes: notes || "",

        vat_registration_number: vat_registration_number.trim(),
        national_address: national_address.trim(),
      }

      const res = await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      })

      const json = (await res.json().catch(() => null)) as CreateResponse | null
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      if (!json?.ok) throw new Error(json?.error || "Create failed")

      const mirrorTenant = upsertTenantMirrorFromSheet(payload as any)
      if (mirrorTenant) ensureTenantLifecycleRecords(mirrorTenant)

      // Point 3: updated success wording (clean + explicit)
      setSuccess(`✅ Tenant created successfully. Tenant ID: ${tenantId}.`)

      // Point 7: reset form completely (but keep success visible)
      resetFieldsOnly()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to fetch"
      setError(`Create failed: ${message}`)
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
            <StepPill active={step === 3} label="3. Admin" />
            <StepPill active={step === 4} label="4. Review" />
          </div>

          {step === 1 && (
            <>
              <h2 style={h2}>Tenant</h2>
              <p style={muted}>Basic tenant identity (required fields)</p>

              <div style={grid2}>
                <Field label="Tenant Name *">
                  <input
                    className="cs-input"
                    value={tenant_name}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="e.g. Canon Saudi Arabia"
                  />
                </Field>

                <Field label="Legal Name *">
                  <input
                    className="cs-input"
                    value={legal_name}
                    onChange={(e) => setLegalName(e.target.value)}
                  />
                </Field>

                <Field label="VAT Registration Number *">
                  <input
                    className="cs-input"
                    value={vat_registration_number}
                    onChange={(e) => setVat(e.target.value)}
                  />
                </Field>

                <Field label="National Address (Google Maps link) *">
                  <input
                    className="cs-input"
                    value={national_address}
                    onChange={(e) => setNationalAddress(e.target.value)}
                    placeholder="Paste Google Maps share link"
                  />
                  <div style={helperRow}>
                    <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" style={helperLink}>
                      Open Google Maps
                    </a>
                    {national_address.startsWith("http") ? (
                      <a href={national_address} target="_blank" rel="noreferrer" style={helperLink}>
                        View selected
                      </a>
                    ) : null}
                  </div>
                </Field>

                <Field label="Default Currency *">
                  <select
                    className="cs-input"
                    value={default_currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Tenant Type *">
                  <select
                    className="cs-input"
                    value={tenant_type}
                    onChange={(e) => setTenantType(e.target.value)}
                  >
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
                  <select
                    className="cs-input"
                    value={plan_type}
                    onChange={(e) => setPlanType(e.target.value)}
                  >
                    {PLAN_TYPE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Subscription Status">
                  <select
                    className="cs-input"
                    value={subscription_status}
                    onChange={(e) => setSubscriptionStatus(e.target.value)}
                  >
                    {SUBSCRIPTION_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Subscription Start Date">
                  <input
                    className="cs-input"
                    type="date"
                    value={subscription_start_date}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Field>

                <Field label="Subscription End Date">
                  <input
                    className="cs-input"
                    type="date"
                    value={subscription_end_date}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Field>

                <Field label="Max Users">
                  <input
                    className="cs-input"
                    type="number"
                    min={0}
                    value={max_users}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                  />
                </Field>

                <Field label="Max Organizations">
                  <input
                    className="cs-input"
                    type="number"
                    min={0}
                    value={max_organizations}
                    onChange={(e) => setMaxOrgs(Number(e.target.value))}
                  />
                </Field>

                <Field label="Tenant Status">
                  <select
                    className="cs-input"
                    value={tenant_status}
                    onChange={(e) => setTenantStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </Field>

                {/* Point 4: demo checkbox removed from UI */}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={h2}>Admin</h2>
              <p style={muted}>Primary admin + configuration</p>

              <div style={grid2}>
                <Field label="Admin Name *">
                  <input
                    className="cs-input"
                    value={primary_admin_name}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                </Field>

                <Field label="Admin Email *">
                  <input
                    className="cs-input"
                    value={primary_admin_email}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </Field>

                <Field label="Primary Country">
                  <select
                    className="cs-input"
                    value={primary_country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    {countryOptions.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Primary Timezone">
                  <input
                    className="cs-input"
                    value={primary_timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  />
                </Field>

                <Field label="Data Retention Policy">
                  <select
                    className="cs-input"
                    value={data_retention_policy}
                    onChange={(e) => setRetentionPolicy(e.target.value)}
                  >
                    <option value="standard">standard</option>
                    <option value="strict">strict</option>
                    <option value="custom">custom</option>
                  </select>
                </Field>

                <Field label="Compliance Flag">
                  <div style={checkRow}>
                    <input
                      type="checkbox"
                      style={checkbox}
                      checked={compliance_flag}
                      onChange={(e) => setComplianceFlag(e.target.checked)}
                    />
                    <span style={mutedSmall}>Requires compliance review</span>
                  </div>
                </Field>

                <Field label="AI Insights Enabled">
                  <div style={checkRow}>
                    <input
                      type="checkbox"
                      style={checkbox}
                      checked={ai_insights_enabled}
                      onChange={(e) => setAI(e.target.checked)}
                    />
                    <span style={mutedSmall}>Enable</span>
                  </div>
                </Field>

                <Field label="Cost Optimization Enabled">
                  <div style={checkRow}>
                    <input
                      type="checkbox"
                      style={checkbox}
                      checked={cost_optimization_enabled}
                      onChange={(e) => setCost(e.target.checked)}
                    />
                    <span style={mutedSmall}>Enable</span>
                  </div>
                </Field>

                <Field label="Usage Analytics Enabled">
                  <div style={checkRow}>
                    <input
                      type="checkbox"
                      style={checkbox}
                      checked={usage_analytics_enabled}
                      onChange={(e) => setAnalytics(e.target.checked)}
                    />
                    <span style={mutedSmall}>Enable</span>
                  </div>
                </Field>

                <Field label="Notes (optional)">
                  <input
                    className="cs-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Field>
              </div>

              <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
                Created By User ID: <b>{created_by_user_id}</b>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={h2}>Review</h2>
              <p style={muted}>Confirm and create tenant</p>

              <div style={reviewBox}>
                <div>
                  <b>Tenant ID:</b> Will be generated on create
                </div>
                <div>
                  <b>Name:</b> {tenant_name || "-"}
                </div>
                <div>
                  <b>Legal Name:</b> {legal_name || "-"}
                </div>
                <div>
                  <b>VAT:</b> {vat_registration_number || "-"}
                </div>
                <div>
                  <b>National Address:</b>{" "}
                  {national_address.startsWith("http") ? (
                    <a href={national_address} target="_blank" rel="noreferrer" style={reviewLink}>
                      View map link
                    </a>
                  ) : (
                    national_address || "-"
                  )}
                </div>
                <div>
                  <b>Currency:</b> {default_currency || "-"}
                </div>
                <div>
                  <b>Type:</b> {tenant_type || "-"}
                </div>
                <div>
                  <b>Plan:</b> {plan_type || "-"}
                </div>
                <div>
                  <b>Status:</b> {subscription_status || "-"}
                </div>
                <div>
                  <b>Admin:</b> {primary_admin_name || "-"} ({primary_admin_email || "-"})
                </div>
              </div>
            </>
          )}

          <div style={navRow}>
            <button
              className="cs-btn cs-btn-ghost"
              style={ghostBtn}
              onClick={back}
              disabled={step === 1 || loading}
            >
              Back
            </button>

            {step < 4 ? (
              <button
                className="cs-btn cs-btn-primary"
                style={primaryBtnSmall}
                onClick={next}
                disabled={!canNext || loading}
              >
                Next
              </button>
            ) : (
              <button
                className="cs-btn cs-btn-primary"
                style={primaryBtnSmall}
                onClick={createTenant}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Tenant"}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</div>
      {children}
    </div>
  )
}

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: `1px solid ${active ? "rgba(77,163,255,0.55)" : "var(--border)"}`,
        background: active ? "rgba(77,163,255,0.08)" : "var(--surface-elevated)",
        color: active ? "var(--text)" : "var(--text-secondary)",
        fontSize: 13,
        fontWeight: 700,
        userSelect: "none",
        boxShadow: active ? "0 0 0 1px rgba(77,163,255,0.28)" : "none",
      }}
    >
      {label}
    </div>
  )
}

/** Styles */
const wrap: React.CSSProperties = {
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
  padding: 12,
}
const card: React.CSSProperties = {
  width: "100%",
  background: "linear-gradient(145deg, #161a20, #13161d)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 20,
  boxShadow: "var(--shadow-soft)",
}
const stepRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 18,
  background: "var(--surface-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 10,
}
const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
}
const h2: React.CSSProperties = { margin: "6px 0 0", fontSize: 18, color: "var(--text)" }
const muted: React.CSSProperties = { margin: "6px 0 14px", color: "var(--muted)" }
const mutedSmall: React.CSSProperties = { color: "var(--muted)", fontSize: 13 }
const checkRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, height: 44 }
const navRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", marginTop: 18 }
const ghostBtn: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 12,
  background: "var(--surface-elevated)",
}
const primaryBtnSmall: React.CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 12,
  fontWeight: 700,
}
const checkbox: React.CSSProperties = {
  width: 18,
  height: 18,
  accentColor: "var(--accent)",
  background: "var(--surface-elevated)",
  borderRadius: 6,
  border: "1px solid var(--border)",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.4)",
}
const errorBox: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "rgba(255,106,106,0.12)",
  border: "1px solid rgba(255,106,106,0.28)",
  color: "#ffd8d8",
}
const successBox: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "rgba(64,195,233,0.12)",
  border: "1px solid var(--accent)",
  color: "var(--text)",
}
const reviewBox: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--surface-elevated)",
  display: "grid",
  gap: 6,
}

const helperRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
  fontSize: 12,
}

const helperLink: React.CSSProperties = {
  color: "var(--accent)",
  fontWeight: 700,
  textDecoration: "none",
}

const reviewLink: React.CSSProperties = {
  color: "var(--accent)",
  fontWeight: 700,
  textDecoration: "none",
}
