import { useMemo, useState } from "react"
import AppShell from "../../layout/AppShell"
import { adminNav } from "../../navigation/adminNav"
import { listAuditLogs } from "../../data/auditLogs"

type Filters = { actor: string; action: string }

export default function AdminAudit() {
  const [filters, setFilters] = useState<Filters>({ actor: "", action: "" })

  const audits = useMemo(() => {
    return listAuditLogs().filter((log) => {
      if (filters.actor && log.actor_type !== filters.actor) return false
      if (filters.action && log.action !== filters.action) return false
      return true
    })
  }, [filters])

  return (
    <AppShell title="Audit Logs" subtitle="Traceable system activity for credibility" navItems={adminNav} chips={["Admin"]}>
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <select
            className="cs-input"
            value={filters.actor}
            onChange={(e) => setFilters((f) => ({ ...f, actor: e.target.value }))}
            style={{ maxWidth: 200 }}
          >
            <option value="">All actor types</option>
            <option value="ADMIN">Admin</option>
            <option value="CUSTOMER">Customer</option>
          </select>
          <input
            className="cs-input"
            value={filters.action}
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
            placeholder="Filter by action"
            style={{ maxWidth: 220 }}
          />
        </div>

        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Actor</th>
              <th className="cs-th">Action</th>
              <th className="cs-th">Tenant</th>
              <th className="cs-th">Meta</th>
              <th className="cs-th">When</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((log, idx) => (
              <tr key={log.audit_id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-elevated)" }}>
                <td className="cs-td">{log.actor_type}</td>
                <td className="cs-td">{log.action}</td>
                <td className="cs-td">{log.tenant_id || "-"}</td>
                <td className="cs-td">
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{log.meta ? JSON.stringify(log.meta) : "-"}</pre>
                </td>
                <td className="cs-td">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {audits.length === 0 && (
              <tr>
                <td className="cs-td" colSpan={5} style={{ textAlign: "center", color: "var(--muted)" }}>
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
