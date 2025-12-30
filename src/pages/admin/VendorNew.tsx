// src/pages/admin/VendorNew.tsx

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import type { Vendor, TenantType, PlanType, SubscriptionStatus } from "../../data/vendors"
import {
  TENANT_TYPE_OPTIONS,
  PLAN_TYPE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
  makeTenantId,
} from "../../data/vendors"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

const page: React.CSSProperties = { padding: 28, maxWidth: 980, margin: "0 auto" }

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: 22,
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
}

const label: React.CSSProperties = { display: "block", fontSize: 12, opacity: 0.8, marginBottom: 6 }

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  outline: "none",
}

const selectStyle: React.CSSProperties = { ...input }
const rowSpan2: React.CSSProperties = { gridColumn: "1 / span 2" }

const btn: React.CSSProperties = {
  marginTop: 18,
  padding: "10px 14px",
  borderRadius: 12,
  border: "0",
  cursor: "pointer",
  background: "#2aa1ff",
  color: "#001018",
  fontWeight: 800,
}

const danger: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  background: "rgba(255, 80, 80, 0.10)",
  border: "1px solid rgba(255, 80, 80, 0.25)",
  color: "rgba(255,255,255,0.92)",
  fontSize: 13,
}

const ok: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  background: "rgba(80, 255, 180, 0.08)",
  border: "1px solid rgba(80, 255, 180, 0.22)",
  color: "rgba(255,255,255,0.92)",
  fontSize: 13,
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export default function VendorNew() {
  const navigate = useNavigate()

  const [tenant_code, setTenantCode] = useState("")
  const [tenant_name, setTenantName] = useState("")
  const [legal_name, setLegalName] = useState("")

  const [tenant_type, setTenantType] = useState<TenantType>("Enterprise")
  const [plan_type, setPlanType] = useState<PlanType>("Standard")
  const [subscription_status, setSubscriptionStatus] = useState<SubscriptionStatus>("Active")

  const [primary_country, setPrimaryCountry] = useState("Saudi Arabia")
  const [primary_timezone, setPrimaryTimezone] = useState("Asia/Riyadh")
  const [default_currency, setDefaultCurrency] = useState("SAR")

  const [subscription_start_date, setSubStart] = useState("")
  const [subscription_end_date, setSubEnd] = useState("")

  const [max_users, setMaxUsers] = useState<number>(50)
  const [max_organizations, setMaxOrgs] = useState<number>(3)

  const [primary_admin_name, setAdminName] = useState("")
  const [primary_admin_email, setAdminEmail] = useState("")

  const [notes, setNotes] = useState("")
  const [vat_registration_number, setVat] = useState("")
  const [national_address, setNationalAddress] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSave = useMemo(() => {
    if (!tenant_code.trim()) return false
    if (!tenant_name.trim()) return false
    if (!primary_admin_name.trim()) return false
    if (!primary_admin_email.trim()) return false
    if (!isValidEmail(primary_admin_email)) return false
    return true
  }, [tenant_code, tenant_name, primary_admin_name, primary_admin_email])

  async function handleCreate() {
    setError(null)
    setSuccess(null)

    if (!canSave) {
      setError("Please fill required fields and ensure Admin Email is valid.")
      return
    }

    const nowIso = new Date().toISOString()

    // IMPORTANT: use tenant_id (not tenant_id/tenantId etc.)
    const payload: Vendor = {
      tenant_id: makeTenantId(),
      tenant_code: tenant_code.trim(),
      tenant_name: tenant_name.trim(),
      legal_name: legal_name.trim() || undefined,

      tenant_type,
      primary_country: primary_country.trim(),
      primary_timezone: primary_timezone.trim(),
      default_currency: default_currency.trim(),

      plan_type,
      subscription_status,
      subscription_start_date: subscription_start_date || undefined,
      subscription_end_date: subscription_end_date || undefined,

      max_users: Number.isFinite(max_users) ? max_users : undefined,
      max_organizations: Number.isFinite(max_organizations) ? max_organizations : undefined,

      primary_admin_name: primary_admin_name.trim(),
      primary_admin_email: primary_admin_email.trim(),

      notes: notes.trim() || undefined,
      vat_registration_number: vat_registration_number.trim() || undefined,
      national_address: national_address.trim() || undefined,

      created_at: nowIso,
      updated_at: nowIso,
    }

    try {
      setLoading(true)

      const res = await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const text = await res.text()

      let data: any = null
      try {
        data = JSON.parse(text)
      } catch {
        data = { ok: res.ok, raw: text }
      }

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || data?.message || `Request failed: ${res.status}`)
      }

      setSuccess("Tenant created successfully.")
      setTimeout(() => navigate("/admin/vendors"), 500)
    } catch (e: any) {
      setError(e?.message || "Failed to create tenant.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Create Tenant</div>
        <div style={{ opacity: 0.75, fontSize: 13, marginBottom: 18 }}>
          CoreSight Admin — create a new tenant record.
        </div>

        <div style={grid}>
          <div>
            <label style={label}>Tenant Code *</label>
            <input
              style={input}
              placeholder="e.g. CKSA"
              value={tenant_code}
              onChange={(e) => setTenantCode(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>Tenant Name *</label>
            <input
              style={input}
              placeholder="e.g. Canon Saudi Arabia"
              value={tenant_name}
              onChange={(e) => setTenantName(e.target.value)}
            />
          </div>

          <div style={rowSpan2}>
            <label style={label}>Legal Name</label>
            <input
              style={input}
              placeholder="Optional"
              value={legal_name}
              onChange={(e) => setLegalName(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>Tenant Type</label>
            <select
              style={selectStyle}
              value={tenant_type}
              onChange={(e) => setTenantType(e.target.value as TenantType)}
            >
              {TENANT_TYPE_OPTIONS.map((t: TenantType) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Plan Type</label>
            <select
              style={selectStyle}
              value={plan_type}
              onChange={(e) => setPlanType(e.target.value as PlanType)}
            >
              {PLAN_TYPE_OPTIONS.map((p: PlanType) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Primary Country</label>
            <input style={input} value={primary_country} onChange={(e) => setPrimaryCountry(e.target.value)} />
          </div>

          <div>
            <label style={label}>Primary Timezone</label>
            <input style={input} value={primary_timezone} onChange={(e) => setPrimaryTimezone(e.target.value)} />
          </div>

          <div>
            <label style={label}>Default Currency</label>
            <input style={input} value={default_currency} onChange={(e) => setDefaultCurrency(e.target.value)} />
          </div>

          <div>
            <label style={label}>Subscription Status</label>
            <select
              style={selectStyle}
              value={subscription_status}
              onChange={(e) => setSubscriptionStatus(e.target.value as SubscriptionStatus)}
            >
              {SUBSCRIPTION_STATUS_OPTIONS.map((s: SubscriptionStatus) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Subscription Start Date</label>
            <input
              style={input}
              placeholder="YYYY-MM-DD"
              value={subscription_start_date}
              onChange={(e) => setSubStart(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>Subscription End Date</label>
            <input
              style={input}
              placeholder="YYYY-MM-DD"
              value={subscription_end_date}
              onChange={(e) => setSubEnd(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>Max Users</label>
            <input
              style={input}
              type="number"
              value={max_users}
              onChange={(e) => setMaxUsers(parseInt(e.target.value || "0", 10))}
            />
          </div>

          <div>
            <label style={label}>Max Organizations</label>
            <input
              style={input}
              type="number"
              value={max_organizations}
              onChange={(e) => setMaxOrgs(parseInt(e.target.value || "0", 10))}
            />
          </div>

          <div>
            <label style={label}>Primary Admin Name *</label>
            <input
              style={input}
              placeholder="Admin Name"
              value={primary_admin_name}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>Primary Admin Email *</label>
            <input
              style={input}
              placeholder="admin@company.com"
              value={primary_admin_email}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={label}>VAT Registration Number</label>
            <input style={input} value={vat_registration_number} onChange={(e) => setVat(e.target.value)} />
          </div>

          <div>
            <label style={label}>National Address</label>
            <input style={input} value={national_address} onChange={(e) => setNationalAddress(e.target.value)} />
          </div>

          <div style={rowSpan2}>
            <label style={label}>Notes</label>
            <input style={input} placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <button style={btn} disabled={loading || !canSave} onClick={handleCreate}>
          {loading ? "Saving..." : "Create Tenant"}
        </button>

        {error && <div style={danger}>{error}</div>}
        {success && <div style={ok}>{success}</div>}
      </div>
    </div>
  )
}
