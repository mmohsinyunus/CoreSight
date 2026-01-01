import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppShell from "../../layout/AppShell"
import { createTenant, getTenant, updateTenant } from "../../data/tenants"
import type { Tenant, TenantInput } from "../../data/tenants"
import { createUser, listUsersByTenant, resetPassword } from "../../data/users"
import type { User } from "../../data/users"
import { adminNav } from "./nav"

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
  const [resetPasswordValue, setResetPasswordValue] = useState("")
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    if (editing && tenantId) {
      const tenant = getTenant(tenantId)
      if (tenant) {
        setForm(tenant)
        setUsers(listUsersByTenant(tenant.tenant_id))
      }
    }
  }, [editing, tenantId])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.tenant_code || !form.tenant_name) return
    if (editing && tenantId) {
      updateTenant(tenantId, form)
    } else {
      const newTenant = createTenant(form as TenantInput)
      navigate(`/admin/tenants/${newTenant.tenant_id}/edit`)
      return
    }
    navigate("/admin/tenants")
  }

  const primaryUser = useMemo(() => users.find((u) => u.role === "CUSTOMER_PRIMARY"), [users])

  const createPrimary = (e: FormEvent) => {
    e.preventDefault()
    if (!tenantId || !primaryEmail || !primaryPassword) return
    createUser({ tenant_id: tenantId, email: primaryEmail, password: primaryPassword, role: "CUSTOMER_PRIMARY" })
    setUsers(listUsersByTenant(tenantId))
    setPrimaryPassword("")
  }

  const resetPasswordHandler = (e: FormEvent) => {
    e.preventDefault()
    if (!primaryUser || !resetPasswordValue) return
    resetPassword(primaryUser.user_id, resetPasswordValue)
    setUsers(listUsersByTenant(primaryUser.tenant_id || ""))
    setResetPasswordValue("")
  }

  return (
    <AppShell
      title={editing ? "Edit tenant" : "Create tenant"}
      subtitle={
        editing
          ? "Local mirror edit (does not auto-sync Google Sheet)"
          : "Admin controls for onboarding tenants"
      }
      navSections={adminNav}
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
          <button className="cs-btn" type="button" onClick={() => navigate("/admin/tenants")}>Cancel</button>
        </div>
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
              <button className="cs-btn cs-btn-primary" type="submit">
                Create primary user
              </button>
            </form>
          )}
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
