import { useEffect, useMemo, useState } from "react"
import type { CSSProperties } from "react"
import CustomerPageShell from "./CustomerPageShell"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import { createUser, listUsersByTenant, resetPassword, updateUser } from "../../data/users"
import type { User } from "../../data/users"

export default function CustomerUsers() {
  const { tenant, user } = useCustomerAuth()
  const [rows, setRows] = useState<User[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [notice, setNotice] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!tenant) return
    setRows(listUsersByTenant(tenant.tenant_id))
  }, [tenant])

  const isPrimary = useMemo(() => user?.role === "CUSTOMER_PRIMARY", [user?.role])

  const refresh = () => {
    if (!tenant) return
    setRows(listUsersByTenant(tenant.tenant_id))
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant || !isPrimary) return
    if (!email || !password) {
      setError("Email and password are required")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    createUser({
      tenant_id: tenant.tenant_id,
      email: email.trim(),
      password,
      role: "CUSTOMER_USER",
      status: "Active",
      name: name.trim() || undefined,
    })
    setName("")
    setEmail("")
    setPassword("")
    setConfirm("")
    setError(undefined)
    setNotice("User created")
    refresh()
  }

  const handleResetPassword = (userId: string, targetEmail: string) => {
    const nextPassword = window.prompt(`Enter new password for ${targetEmail}`)
    if (!nextPassword) return
    resetPassword(userId, nextPassword)
    setNotice("Password reset")
    refresh()
  }

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active"
    updateUser(userId, { status: nextStatus as User["status"] })
    setNotice(nextStatus === "Active" ? "User activated" : "User deactivated")
    refresh()
  }

  if (!tenant) {
    return (
      <CustomerPageShell title="Users" subtitle="Manage tenant users">
        <div className="cs-card" style={{ padding: 18 }}>No tenant selected.</div>
      </CustomerPageShell>
    )
  }

  return (
    <CustomerPageShell title="Users" subtitle="Manage customer logins for this tenant">
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 14 }}>
        {isPrimary ? (
          <form
            onSubmit={handleCreate}
            style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
          >
            <label style={label}>
              Name (optional)
              <input className="cs-input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label style={label}>
              Email
              <input className="cs-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label style={label}>
              Password
              <input
                className="cs-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label style={label}>
              Confirm
              <input
                className="cs-input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <button className="cs-btn cs-btn-primary" type="submit">
                Create user
              </button>
              <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>Role: CUSTOMER_USER (default)</div>
            </div>
          </form>
        ) : (
          <div style={{ color: "var(--text-secondary)" }}>You need primary access to manage users.</div>
        )}

        {error && <div style={errorBox}>{error}</div>}
        {notice && <div style={successBox}>{notice}</div>}

        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Name</th>
              <th className="cs-th">Email</th>
              <th className="cs-th">Role</th>
              <th className="cs-th">Status</th>
              <th className="cs-th">Created</th>
              <th className="cs-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.user_id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "#181c23" }}>
                <td className="cs-td">{row.name || "—"}</td>
                <td className="cs-td">{row.email}</td>
                <td className="cs-td">{row.role}</td>
                <td className="cs-td">
                  <span className="cs-pill" style={{ padding: "6px 10px", background: "var(--surface-elevated)" }}>
                    {row.status}
                  </span>
                </td>
                <td className="cs-td">{row.created_at?.slice(0, 10) || ""}</td>
                <td className="cs-td" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="cs-btn"
                    style={{ height: 34 }}
                    onClick={() => handleResetPassword(row.user_id, row.email)}
                    disabled={!isPrimary}
                  >
                    Reset password
                  </button>
                  <button
                    className="cs-btn cs-btn-ghost"
                    style={{ height: 34 }}
                    onClick={() => handleToggleStatus(row.user_id, row.status)}
                    disabled={!isPrimary || row.role === "CUSTOMER_PRIMARY"}
                  >
                    {row.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="cs-td" colSpan={6} style={{ color: "var(--muted)", textAlign: "center" }}>
                  No users for this tenant yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </CustomerPageShell>
  )
}

const label: CSSProperties = { display: "flex", flexDirection: "column", gap: 6, fontWeight: 700, color: "var(--text-secondary)" }

const errorBox: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,90,90,0.08)",
  color: "#ffb4b4",
  padding: 10,
  borderRadius: 12,
  fontWeight: 700,
}

const successBox: CSSProperties = {
  border: "1px solid rgba(77,163,255,0.35)",
  background: "rgba(77,163,255,0.08)",
  color: "var(--text)",
  padding: 10,
  borderRadius: 12,
  fontWeight: 700,
}
