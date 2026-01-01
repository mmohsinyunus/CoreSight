import { useEffect, useState } from "react"
import AppShell from "../../layout/AppShell"
import { listUsers } from "../../data/users"
import type { User } from "../../data/users"
import { listTenants } from "../../data/tenants"
import { adminNav } from "./nav"

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [tenantMap, setTenantMap] = useState<Record<string, string>>({})

  useEffect(() => {
    setUsers(listUsers())
    const tenants = listTenants()
    const map: Record<string, string> = {}
    tenants.forEach((t) => {
      map[t.tenant_id] = t.tenant_name
    })
    setTenantMap(map)
  }, [])

  return (
    <AppShell title="Tenant users" subtitle="Accounts issued by admins" navSections={adminNav} chips={["Admin"]}>
      <div className="cs-card" style={{ padding: 18 }}>
        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Email</th>
              <th className="cs-th">Role</th>
              <th className="cs-th">Tenant</th>
              <th className="cs-th">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.user_id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "#181c23" }}>
                <td className="cs-td">{user.email}</td>
                <td className="cs-td">{user.role}</td>
                <td className="cs-td">{user.tenant_id ? tenantMap[user.tenant_id] ?? user.tenant_id : "Admin"}</td>
                <td className="cs-td">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
