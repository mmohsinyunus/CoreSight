import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppShell from "../../layout/AppShell"
import {
  createTenant,
  fetchTenantsFromSheet,
  getTenant,
  syncTenantToSheet,
  updateTenant,
} from "../../data/tenants"
import type { Tenant, TenantInput } from "../../data/tenants"
import { createUser, getAdminEmail, listUsersByTenant, resetPassword } from "../../data/users"
import { ensureDepartmentSeed } from "../../data/departments"
import { addAuditLog } from "../../data/auditLogs"
import { ensureTenantLifecycleRecords } from "../../data/tenantRecords"
import type { User } from "../../data/users"
import { adminNav } from "../../navigation/adminNav"
import { countryOptions } from "../../data/countries"

const CURRENCY_OPTIONS = ["SAR", "USD", "EUR", "AED"] as const
type Currency = (typeof CURRENCY_OPTIONS)[number]
const GOOGLE_MAPS_URL = "https://www.google.com/maps"

const blankForm: Partial<Tenant> = {
  // tenant_code removed (point 1)
  tenant_name: "",
  legal_name: "",
  region: "",
  tenant_type: "",
  timezone: "",
  currency: "SAR",
  subscription: "",
  primary_admin_email: "",
  primary_admin_name: "",
  status: "Active",
  // point 5 (mandatory)
  vat_registration_number: "",
  national_address: "",
}

export default function AdminTenantForm() {
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(tenantId)

  const [form, setForm] = useState<Partial<Tenant>>({ ...blankForm })

  // Primary user section (edit mode)
  const [primaryEmail, setPrimaryEmail] = useState("")
  const [primaryPassword, setPrimaryPassword] = useState("")
  const [primaryConfirm, setPrimaryConfirm] = useState("")
  const [primaryName, setPrimaryName] = useState("")
  const [resetPasswordValue, setResetPasswordValue] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [userError, setUserError] = useState<string | undefined>()
  const [userNotice, setUserNotice] = useState<string | undefined>()

  // Sync section
  const [syncNotice, setSyncNotice] = useState<string | undefined>()
  const [syncError, setSyncError] = useState<string | undefined>()
  const [syncing, setSyncing] = useState(false)

  // Create UX (point 3 + 7)
  const [createNotice, setCreateNotice] = useState<string | undefined>()
  const [createError, setCreateError] = useState<string | undefined>()
  const [createdTenantId, setCreatedTenantId] = useState<string | undefined>()

  useEffect(() => {
    // Reset all notices when switching mode or tenant
    setCreateNotice(undefined)
    setCreateError(undefined)
    setCreatedTenantId(undefined)
    setUserError(undefined)
    setUserNotice(undefined)
    setSyncNotice(undefined)
    setSyncError(undefined)

    if (editing && tenantId) {
      const tenant = getTenant(tenantId)
      if (tenant) {
        setForm(tenant)
        setUsers(listUsersByTenant(tenant.tenant_id))
        return
      }

      fetchTenantsFromSheet()
        .then(() => {
          const mirrorTenant = getTenant(tenantId)
          if (mirrorTenant) {
            setForm(mirrorTenant)
            setUsers(listUsersByTenant(mirrorTenant.tenant_id))
          }
        })
        .catch(() => undefined)
    } else {
      setForm({ ...blankForm })
      setUsers([])
    }
  }, [editing, tenantId])

  const validate = () => {
    if (!String(form.tenant_name ?? "").trim()) return "Tenant name is required."
    if (!String(form.legal_name ?? "").trim()) return "Legal name is required."

    if (!String((form as any).vat_registration_number ?? "").trim())
      return "VAT registration number is required."
    if (!String((form as any).national_address ?? "").trim())
      return "National address is required."

    if (!String(form.currency ?? "").trim()) return "Currency is required."
    return undefined
  }

  const hardResetForNewEntry = () => {
    // point 7: completely reset page for new tenant entry
    setForm({ ...blankForm })
    setCreatedTenantId(undefined)
    setCreateNotice(undefined)
    setCreateError(undefined)

    setPrimaryEmail("")
    setPrimaryPassword("")
    setPrimaryConfirm("")
    setPrimaryName("")
    setResetPasswordValue("")
    setUsers([])
    setUserError(undefined)
    setUserNotice(undefined)

    setSyncNotice(undefined)
    setSyncError(undefined)
    setSyncing(false)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    setCreateNotice(undefined)
    setCreateError(undefined)

    const err = validate()
    if (err) {
      setCreateError(err)
      return
    }

    if (editing && tenantId) {
      updateTenant(tenantId, form)
      navigate("/admin/tenants")
      return
    }

    // Create new tenant
    const newTenant = createTenant(form as TenantInput)
    ensureTenantLifecycleRecords(newTenant)

    // point 3: better wording
    setCreatedTenantId(newTenant.tenant_id)
    setCreateNotice(`New tenant created. The Tenant ID is ${newTenant.tenant_id}.`)

    // point 7: clear the form after create (keeps notice visible)
    setForm({ ...blankForm })
  }

  const primaryUser = useMemo(() => users.find((u) => u.role === "CUSTOMER_PRIMARY"), [users])

  const createPrimary = (e: FormEvent) => {
    e.preventDefault()
    if (!tenantId || !primaryEmail || !primaryPassword) return
    if (primaryPassword !== primaryConfirm) {
      setUserError("Passwords do not match")
      return
    }

    const tenant = getTenant(tenantId)
    setUserError(undefined)

    createUser({
      tenant_id: tenantId,
      email: primaryEmail.trim(),
      password: primaryPassword,
      role: "CUSTOMER_PRIMARY",
      name: primaryName.trim() || undefined,
    })

    if (tenant) {
      ensureTenantLifecycleRecords(tenant)
      ensureDepartmentSeed(tenant.tenant_id)
      addAuditLog({
        actor_type: "ADMIN",
        actor_email: getAdminEmail(),
        action: "PRIMARY_USER_CREATED",
        tenant_id: tenant.tenant_id,
        meta: { email: primaryEmail.trim() },
      })
    }

    setUsers(listUsersByTenant(tenantId))
    setPrimaryPassword("")
    setPrimaryConfirm("")
    setPrimaryName("")
    setUserNotice("Primary customer created. Subscriptions & renewals seeded for this tenant.")
  }

  const resetPasswordHandler = (e: FormEvent) => {
    e.preventDefault()
    if (!primaryUser || !resetPasswordValue) return
    resetPassword(primaryUser.user_id, resetPasswordValue)
    setUsers(listUsersByTenant(primaryUser.tenant_id || ""))
    setResetPasswordValue("")
    setUserNotice("Password reset")
  }

  const syncToSheet = async () => {
    if (!tenantId) return
    const confirmed = window.confirm(
      "This will update the source-of-truth Google Sheet for this tenant. Continue?",
    )
    if (!confirmed) return

    setSyncNotice(undefined)
    setSyncError(undefined)
    setSyncing(true)

    const updated = updateTenant(tenantId, form) || getTenant(tenantId)
    if (!updated) {
      setSyncError("Sync failed. Local changes remain saved.")
      setSyncing(false)
      return
    }

    try {
      const result = await syncTenantToSheet(updated)
      if (result.ok) setSyncNotice("Synced to Google Sheet.")
      else if (result.unsupported) setSyncError("Sheet sync not enabled yet. Local changes saved.")
      else setSyncError("Sync failed. Local changes remain saved.")
    } catch {
      setSyncError("Sync failed. Local changes remain saved.")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <AppShell
      title={editing ? "Edit tenant" : "Create tenant"}
      subtitle={
        editing
          ? "Local mirror edit (does not auto-sync Google Sheet)"
          : "Admin controls for onboarding tenants"
      }
      navItems={adminNav}
      chips={[editing ? "Tenant" : "Create", "Admin"]}
    >
      <form className="cs-card" style={{ padding: 18, display: "grid", gap: 14 }} onSubmit={onSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {inputField("Tenant name *", "tenant_name", String(form.tenant_name ?? ""), setForm)}
          {inputField("Legal name *", "legal_name", String(form.legal_name ?? ""), setForm)}

          {inputField(
            "VAT number *",
            "vat_registration_number" as any,
            String((form as any).vat_registration_number ?? ""),
            setForm,
          )}
          <label style={label}>
            National address (Google Maps link) *
            <input
              className="cs-input"
              value={String((form as any).national_address ?? "")}
              placeholder="Paste Google Maps share link"
              onChange={(e) =>
                setForm((prev: Partial<Tenant>) => ({
                  ...prev,
                  national_address: e.target.value,
                }))
              }
            />
            <div style={helperRow}>
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" style={helperLink}>
                Open Google Maps
              </a>
              {String((form as any).national_address ?? "").startsWith("http") ? (
                <a
                  href={String((form as any).national_address ?? "")}
                  target="_blank"
                  rel="noreferrer"
                  style={helperLink}
                >
                  View selected
                </a>
              ) : null}
            </div>
          </label>

          {inputField("Type", "tenant_type", String(form.tenant_type ?? ""), setForm)}
          <label style={label}>
            Region
            <select
              className="cs-input"
              value={String(form.region ?? "")}
              onChange={(e) =>
                setForm((prev: Partial<Tenant>) => ({
                  ...prev,
                  region: e.target.value,
                }))
              }
            >
              <option value="">Select a country</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>
          {inputField("Timezone", "timezone", String(form.timezone ?? ""), setForm)}

          <label style={label}>
            Currency *
            <select
              className="cs-input"
              value={String(form.currency ?? "SAR")}
              onChange={(e) =>
                setForm((prev: Partial<Tenant>) => ({
                  ...prev,
                  currency: e.target.value as Currency,
                }))
              }
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {inputField("Plan", "subscription", String(form.subscription ?? ""), setForm)}
          {inputField("Primary admin name", "primary_admin_name", String(form.primary_admin_name ?? ""), setForm)}
          {inputField("Primary admin email", "primary_admin_email", String(form.primary_admin_email ?? ""), setForm)}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="cs-btn cs-btn-primary" type="submit">
            {editing ? "Update tenant" : "Create tenant"}
          </button>

          {editing ? (
            <button className="cs-btn cs-btn-ghost" type="button" onClick={syncToSheet} disabled={syncing}>
              {syncing ? "Syncing..." : "Sync to Google Sheet"}
            </button>
          ) : null}

          {!editing && createdTenantId ? (
            <button className="cs-btn" type="button" onClick={hardResetForNewEntry}>
              Create another tenant
            </button>
          ) : null}

          <button className="cs-btn" type="button" onClick={() => navigate("/admin/tenants")}>
            Cancel
          </button>
        </div>

        {createNotice ? <div style={successBox}>{createNotice}</div> : null}
        {createError ? <div style={errorBox}>{createError}</div> : null}

        {syncNotice ? <div style={successBox}>{syncNotice}</div> : null}
        {syncError ? <div style={errorBox}>{syncError}</div> : null}
      </form>

      {editing && tenantId ? (
        <div className="cs-card" style={{ padding: 18, marginTop: 18, display: "grid", gap: 14 }}>
          <div>
            <h3 style={{ margin: 0 }}>Primary customer login</h3>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Create or reset the tenant&apos;s primary credentials.
            </p>
          </div>

          {primaryUser ? (
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div className="cs-pill" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                Primary: {primaryUser.email}
              </div>
              <form style={{ display: "flex", gap: 10, alignItems: "center" }} onSubmit={resetPasswordHandler}>
                <input
                  className="cs-input"
                  type="password"
                  placeholder="New password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  style={{ width: 220 }}
                />
                <button className="cs-btn" type="submit">
                  Reset password
                </button>
              </form>
            </div>
          ) : (
            <form style={{ display: "grid", gap: 12, maxWidth: 420 }} onSubmit={createPrimary}>
              <label style={label}>
                Primary admin name (optional)
                <input className="cs-input" value={primaryName} onChange={(e) => setPrimaryName(e.target.value)} />
              </label>
              <label style={label}>
                Primary admin email
                <input className="cs-input" value={primaryEmail} onChange={(e) => setPrimaryEmail(e.target.value)} />
              </label>
              <label style={label}>
                Password
                <input className="cs-input" type="password" value={primaryPassword} onChange={(e) => setPrimaryPassword(e.target.value)} />
              </label>
              <label style={label}>
                Confirm password
                <input className="cs-input" type="password" value={primaryConfirm} onChange={(e) => setPrimaryConfirm(e.target.value)} />
              </label>

              {userError ? <div style={errorBox}>{userError}</div> : null}
              {userNotice ? <div style={successBox}>{userNotice}</div> : null}

              <button className="cs-btn cs-btn-primary" type="submit">
                Create primary user
              </button>
            </form>
          )}

          {userNotice && primaryUser ? <div style={successBox}>{userNotice}</div> : null}
        </div>
      ) : null}
    </AppShell>
  )
}

function inputField(labelText: string, key: keyof Tenant, value: string, setForm: (next: any) => void) {
  return (
    <label style={label}>
      {labelText}
      <input
        className="cs-input"
        value={value}
        onChange={(e) =>
          setForm((prev: Partial<Tenant>) => ({
            ...prev,
            [key]: e.target.value,
          }))
        }
      />
    </label>
  )
}

const label: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontWeight: 700,
  color: "var(--text-secondary)",
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

const errorBox: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,90,90,0.08)",
  color: "#ffb4b4",
  padding: 10,
  borderRadius: 12,
  fontWeight: 700,
}

const successBox: React.CSSProperties = {
  border: "1px solid rgba(77,163,255,0.35)",
  background: "rgba(77,163,255,0.08)",
  color: "var(--text)",
  padding: 10,
  borderRadius: 12,
  fontWeight: 700,
}
