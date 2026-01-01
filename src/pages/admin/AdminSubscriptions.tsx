import { useEffect, useState } from "react"
import AppShell from "../../layout/AppShell"
import { adminNav } from "../../navigation/adminNav"
import { listSubscriptions, updateSubscription } from "../../data/tenantRecords"
import { addAuditLog } from "../../data/auditLogs"

export default function AdminSubscriptions() {
  const [rows, setRows] = useState(() => listSubscriptions())

  useEffect(() => {
    setRows(listSubscriptions())
  }, [])

  // ✅ FIX: allow numbers for fields like "seats"
  const updateRow = (id: string, field: string, value: string | number) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const saveRow = (id: string) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return

    updateSubscription(id, row)
    addAuditLog({
      actor_type: "ADMIN",
      action: "SUBSCRIPTION_UPDATED",
      tenant_id: row.tenant_id,
      meta: { subscription_id: id },
    })

    setRows(listSubscriptions())
  }

  return (
    <AppShell
      title="Subscriptions"
      subtitle="Admin control of tenant subscriptions"
      navItems={adminNav}
      chips={["Admin"]}
    >
      <div className="cs-card" style={{ padding: 18 }}>
        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Tenant</th>
              <th className="cs-th">Plan</th>
              <th className="cs-th">Status</th>
              <th className="cs-th">Start</th>
              <th className="cs-th">End</th>
              <th className="cs-th">Seats</th>
              <th className="cs-th">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => {
              // ✅ keep input value stable (React likes string/number, not undefined)
              const seatsValue =
                row.seats ?? row.max_users ?? "" // ok for <input type="number">

              return (
                <tr
                  key={row.id}
                  style={{
                    background: idx % 2 === 0 ? "var(--surface)" : "#181c23",
                  }}
                >
                  <td className="cs-td">{row.tenant_id}</td>

                  <td className="cs-td">
                    <input
                      className="cs-input"
                      value={row.plan_type || ""}
                      onChange={(e) => updateRow(row.id, "plan_type", e.target.value)}
                    />
                  </td>

                  <td className="cs-td">
                    <input
                      className="cs-input"
                      value={row.subscription_status || row.status || ""}
                      onChange={(e) =>
                        updateRow(row.id, "subscription_status", e.target.value)
                      }
                    />
                  </td>

                  <td className="cs-td">
                    <input
                      className="cs-input"
                      value={row.start_date || row.subscription_start_date || ""}
                      onChange={(e) => updateRow(row.id, "start_date", e.target.value)}
                    />
                  </td>

                  <td className="cs-td">
                    <input
                      className="cs-input"
                      value={row.end_date || row.subscription_end_date || ""}
                      onChange={(e) => updateRow(row.id, "end_date", e.target.value)}
                    />
                  </td>

                  <td className="cs-td">
                    <input
                      className="cs-input"
                      type="number"
                      value={seatsValue}
                      onChange={(e) => {
                        // allow clearing the field
                        const v = e.target.value
                        updateRow(row.id, "seats", v === "" ? "" : Number(v))
                      }}
                    />
                  </td>

                  <td className="cs-td">
                    <button
                      className="cs-btn cs-btn-primary"
                      onClick={() => saveRow(row.id)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              )
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  className="cs-td"
                  colSpan={7}
                  style={{ textAlign: "center", color: "var(--muted)" }}
                >
                  No subscriptions captured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
