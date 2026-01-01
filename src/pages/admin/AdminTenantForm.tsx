import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppShell from "../../layout/AppShell"
import { createTenant, fetchTenantsFromSheet, getTenant, syncTenantToSheet, updateTenant } from "../../data/tenants"
import type { Tenant, TenantInput } from "../../data/tenants"
import { createUser, listUsersByTenant, resetPassword } from "../../data/users"
import { ensureTenantLifecycleRecords } from "../../data/tenantRecords"
import type { User } from "../../data/users"
import { adminNav } from "../../navigation/adminNav"

export default function AdminTenantForm() {
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(tenantId)

  const [form, setForm] = useState<Partial<Tenant>>({
    tenant_code: "",
    tenant_name: "",
    legal_name: "",
    region: "",
    tenant_type: "",
    timezone: "",
    currency: "",
    subscription: "",
    primary_admin_email: "",
    primary_admin_name: "",
    status: "Active",
  })
  const [primaryEmail, setPrimaryEmail] = useState("")
  const [primaryPassword, setPrimaryPassword] = useState("")
  const [primaryConfirm, setPrimaryConfirm] = useState("")
  const [primaryName, setPrimaryName] = useState("")
  const [resetPasswordValue, setResetPasswordValue] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [userError, setUserError] = useState<string | undefined>()
  const [userNotice, setUserNotice] = useState<string | undefined>()
  const [syncNotice, setSyncNotice] = useState<string | undefined>()
  const [syncError, setSyncError] = useState<string | undefined>()
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
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
    }
  }, [editing, tenantId])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.tenant_code || !form.tenant_name) return
    if (editing && tenantId) {
      updateTenant(tenantId, form)
    } else {
      const newTenant = createTenant(form as TenantInput)
      ensureTenantLifecycleRecords(newTenant)
      navigate(`/admin/tenants/${newTenant.tenant_id}/edit`)
      return
    }
    navigate("/admin/tenants")
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
    if (tenant) ensureTenantLifecycleRecords(tenant)
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
      if (result.ok) {
        setSyncNotice("Synced to Google Sheet.")
      } else if (result.unsupported) {
        setSyncError("Sheet sync not enabled yet. Local changes saved.")
      } else {
        setSyncError("Sync failed. Local changes remain saved.")
      }
    } catch (err) {
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
          {inputField("Tenant name", "tenant_name", form.tenant_name ?? "", setForm)}
          {inputField("Tenant code", "tenant_code", form.tenant_code ?? "", setForm)}
          {inputField("Legal name", "legal_name", form.legal_name ?? "", setForm)}
          {inputField("Type", "tenant_type", form.tenant_type ?? "", setForm)}
          {inputField("Region", "region", form.region ?? "", setForm)}
          {inputField("Timezone", "timezone", form.timezone ?? "", setForm)}
          {inputField("Currency", "currency", form.currency ?? "", setForm)}
          {inputField("Plan", "subscription", form.subscription ?? "", setForm)}
          {inputField("Primary admin name", "primary_admin_name", form.primary_admin_name ?? "", setForm)}
          {inputField("Primary admin email", "primary_admin_email", form.primary_admin_email ?? "", setForm)}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="cs-btn cs-btn-primary" type="submit">
            {editing ? "Update tenant" : "Create tenant"}
          </button>
          {editing ? (
            <button
              className="cs-btn cs-btn-ghost"
              type="button"
              onClick={syncToSheet}
              disabled={syncing}
            >
              {syncing ? "Syncing..." : "Sync to Google Sheet"}
            </button>
          ) : null}
          <button className="cs-btn" type="button" onClick={() => navigate("/admin/tenants")}>Cancel</button>
        </div>
        {syncNotice ? <div style={successBox}>{syncNotice}</div> : null}
        {syncError ? <div style={errorBox}>{syncError}</div> : null}
      </form>

      {editing && tenantId ? (
        <div className="cs-card" style={{ padding: 18, marginTop: 18, display: "grid", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0 }}>Primary customer login</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>Create or reset the tenant's primary credentials.</p>
            </div>
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
                <input
                  className="cs-input"
                  type="password"
                  value={primaryPassword}
                  onChange={(e) => setPrimaryPassword(e.target.value)}
                />
              </label>
              <label style={label}>
                Confirm password
                <input
                  className="cs-input"
                  type="password"
                  value={primaryConfirm}
                  onChange={(e) => setPrimaryConfirm(e.target.value)}
                />
              </label>
              {userError ? (
                <div style={errorBox}>{userError}</div>
              ) : null}
              {userNotice ? (
                <div style={successBox}>{userNotice}</div>
              ) : null}
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

const label: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, fontWeight: 700, color: "var(--text-secondary)" }

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
