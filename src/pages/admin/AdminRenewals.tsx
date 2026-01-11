import { useEffect, useState } from "react"
import AppShell from "../../layout/AppShell"
import { adminNav } from "../../navigation/adminNav"
import { listRenewals, updateRenewal } from "../../data/tenantRecords"
import { addAuditLog } from "../../data/auditLogs"

export default function AdminRenewals() {
  const [rows, setRows] = useState(() => listRenewals())

  useEffect(() => {
    setRows(listRenewals())
  }, [])

  const updateRow = (id: string, field: string, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const saveRow = (id: string) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    updateRenewal(id, row)
    addAuditLog({
      actor_type: "ADMIN",
      action: "RENEWAL_UPDATED",
      tenant_id: row.tenant_id,
      meta: { renewal_id: id },
    })
    setRows(listRenewals())
  }

  return (
    <AppShell title="Renewals" subtitle="Track tenant renewal cycles" navItems={adminNav} chips={["Admin"]}>
      <div className="cs-card" style={{ padding: 18 }}>
        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Tenant</th>
              <th className="cs-th">Subscription</th>
              <th className="cs-th">Renewal date</th>
              <th className="cs-th">Status</th>
              <th className="cs-th">Notes</th>
              <th className="cs-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-elevated)" }}>
                <td className="cs-td">{row.tenant_id}</td>
                <td className="cs-td">{row.subscription}</td>
                <td className="cs-td">
                  <input
                    className="cs-input"
                    value={row.renewal_date}
                    onChange={(e) => updateRow(row.id, "renewal_date", e.target.value)}
                  />
                </td>
                <td className="cs-td">
                  <input
                    className="cs-input"
                    value={row.status}
                    onChange={(e) => updateRow(row.id, "status", e.target.value)}
                  />
                </td>
                <td className="cs-td">
                  <input
                    className="cs-input"
                    value={row.notes || ""}
                    onChange={(e) => updateRow(row.id, "notes", e.target.value)}
                  />
                </td>
                <td className="cs-td">
                  <button className="cs-btn cs-btn-primary" onClick={() => saveRow(row.id)}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="cs-td" colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>
                  No renewals captured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
