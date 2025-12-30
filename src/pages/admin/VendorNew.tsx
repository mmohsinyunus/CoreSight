import { useState } from "react"
import AppShell from "../../layout/AppShell"
import {
  TENANT_TYPE_OPTIONS,
  PLAN_TYPE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
  makeTenantId,
} from "../../data/vendors"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

export default function VendorNew() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Tenant
  const [tenantCode, setTenantCode] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [legalName, setLegalName] = useState("")
  const [tenantType, setTenantType] = useState("Enterprise")

  // Subscription
  const [planType, setPlanType] = useState("Standard")
  const [subscriptionStatus, setSubscriptionStatus] = useState("Active")
  const [subscriptionStart, setSubscriptionStart] = useState("")
  const [subscriptionEnd, setSubscriptionEnd] = useState("")
  const [tenantStatus, setTenantStatus] = useState("Active")
  const [isDemoTenant, setIsDemoTenant] = useState(false)

  // Admin & Compliance
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [country, setCountry] = useState("Saudi Arabia")
  const [timezone, setTimezone] = useState("Asia/Riyadh")
  const [currency, setCurrency] = useState("SAR")
  const [vat, setVat] = useState("")
  const [retention, setRetention] = useState("standard")
  const [createdBy] = useState("platform_admin_mock")

  async function handleCreate() {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const payload = {
        tenant_id: makeTenantId(),
        tenant_code: tenantCode,
        tenant_name: tenantName,
        legal_name: legalName,
        tenant_type: tenantType,

        primary_country: country,
        primary_timezone: timezone,
        default_currency: currency,

        plan_type: planType,
        subscription_status: subscriptionStatus,
        subscription_start_date: subscriptionStart,
        subscription_end_date: subscriptionEnd,

        tenant_status: tenantStatus,
        is_demo_tenant: isDemoTenant,

        primary_admin_name: adminName,
        primary_admin_email: adminEmail,

        data_retention_policy: retention,
        vat_registration_number: vat,

        created_by_user_id: createdBy,
        ai_insights_enabled: true,
        cost_optimization_enabled: true,
        usage_analytics_enabled: true,

        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const res = await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!json?.ok) throw new Error(json?.error || "Unknown error")

      setSuccess("Tenant successfully created and appended to Google Sheet.")
      setStep(1)
    } catch (e: any) {
      setError(e.message || "Failed to fetch")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="Onboard Tenant">
      <div className="card" style={{ padding: 20 }}>
        {/* Step Bar */}
        <div className="stepbar" style={{ marginBottom: 20 }}>
          <div className={`step ${step === 1 ? "active" : ""}`}>1. Tenant</div>
          <div className={`step ${step === 2 ? "active" : ""}`}>2. Subscription</div>
          <div className={`step ${step === 3 ? "active" : ""}`}>3. Admin & Compliance</div>
          <div className={`step ${step === 4 ? "active" : ""}`}>4. Review</div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid-2">
            <Field label="Tenant Code">
              <input value={tenantCode} onChange={e => setTenantCode(e.target.value)} />
            </Field>
            <Field label="Tenant Name">
              <input value={tenantName} onChange={e => setTenantName(e.target.value)} />
            </Field>
            <Field label="Legal Name (optional)">
              <input value={legalName} onChange={e => setLegalName(e.target.value)} />
            </Field>
            <Field label="Tenant Type">
              <select value={tenantType} onChange={e => setTenantType(e.target.value)}>
                {TENANT_TYPE_OPTIONS.map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="grid-2">
            <Field label="Plan Type">
              <select value={planType} onChange={e => setPlanType(e.target.value)}>
                {PLAN_TYPE_OPTIONS.map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Subscription Status">
              <select
                value={subscriptionStatus}
                onChange={e => setSubscriptionStatus(e.target.value)}
              >
                {SUBSCRIPTION_STATUS_OPTIONS.map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Start Date">
              <input type="date" value={subscriptionStart} onChange={e => setSubscriptionStart(e.target.value)} />
            </Field>
            <Field label="End Date">
              <input type="date" value={subscriptionEnd} onChange={e => setSubscriptionEnd(e.target.value)} />
            </Field>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="grid-2">
            <Field label="Admin Name">
              <input value={adminName} onChange={e => setAdminName(e.target.value)} />
            </Field>
            <Field label="Admin Email">
              <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            </Field>
            <Field label="Country">
              <input value={country} onChange={e => setCountry(e.target.value)} />
            </Field>
            <Field label="Timezone">
              <input value={timezone} onChange={e => setTimezone(e.target.value)} />
            </Field>
            <Field label="Currency">
              <input value={currency} onChange={e => setCurrency(e.target.value)} />
            </Field>
            <Field label="VAT Registration">
              <input value={vat} onChange={e => setVat(e.target.value)} />
            </Field>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <p className="muted">Review details and create tenant.</p>
            <button
              className="btn-primary"
              disabled={loading}
              onClick={handleCreate}
            >
              {loading ? "Creating..." : "Create Tenant"}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button disabled={step === 1} onClick={() => setStep(step - 1)}>
            Back
          </button>
          {step < 4 && <button onClick={() => setStep(step + 1)}>Next</button>}
        </div>

        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
        {success && <p style={{ color: "green", marginTop: 12 }}>{success}</p>}
      </div>
    </AppShell>
  )
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  )
}
