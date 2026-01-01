import { useMemo } from "react"
import CustomerPageShell from "./CustomerPageShell"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import { listUsersByTenant } from "../../data/users"
import { listActivityByTenant } from "../../data/activity"

function getLastActivityForUser(activity: ReturnType<typeof listActivityByTenant>, email: string) {
  const filtered = activity
    .filter((a) => a.user_email?.toLowerCase() === email.toLowerCase())
    .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
  return filtered[0]?.created_at
}

export default function ReportsUsage() {
  const { tenant } = useCustomerAuth()

  const data = useMemo(() => {
    if (!tenant) return { users: [], activity: [] }
    return {
      users: listUsersByTenant(tenant.tenant_id),
      activity: listActivityByTenant(tenant.tenant_id),
    }
  }, [tenant])

  const activeCutoff = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d
  }, [])

  const activeUsers = data.activity.filter((a) => new Date(a.created_at) >= activeCutoff)

  const activeUserIds = new Set(activeUsers.map((a) => a.user_email))
  const totalUsers = data.users.length
  const activeLast30 = Array.from(activeUserIds).filter(Boolean).length
  const lastLogin = data.activity
    .filter((a) => a.event === "LOGIN")
    .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))[0]?.created_at

  return (
    <CustomerPageShell title="Usage summary" subtitle="User activity and engagement">
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <div className="cs-tile">
            <div className="cs-eyebrow">Total users</div>
            <div className="cs-metric">{totalUsers}</div>
          </div>
          <div className="cs-tile">
            <div className="cs-eyebrow">Active (last 30 days)</div>
            <div className="cs-metric">{activeLast30}</div>
          </div>
          <div className="cs-tile">
            <div className="cs-eyebrow">Last login</div>
            <div className="cs-metric">{lastLogin ? new Date(lastLogin).toLocaleString() : "-"}</div>
          </div>
        </div>

        <div className="cs-section-header">User activity</div>
        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Email</th>
              <th className="cs-th">Role</th>
              <th className="cs-th">Status</th>
              <th className="cs-th">Last active</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => {
              const lastActive = getLastActivityForUser(data.activity, user.email)
              return (
                <tr key={user.user_id}>
                  <td className="cs-td">{user.email}</td>
                  <td className="cs-td">{user.role}</td>
                  <td className="cs-td">{user.status}</td>
                  <td className="cs-td">{lastActive ? new Date(lastActive).toLocaleString() : "-"}</td>
                </tr>
              )
            })}
            {data.users.length === 0 && (
              <tr>
                <td className="cs-td" colSpan={4} style={{ textAlign: "center", color: "var(--muted)" }}>
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </CustomerPageShell>
  )
}
