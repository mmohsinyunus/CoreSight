import { useMemo, useState } from "react"
import AppShell from "../../layout/AppShell"
import { adminNav } from "../../navigation/adminNav"
import { listRequests, updateRequest } from "../../data/requests"
import { addAuditLog } from "../../data/auditLogs"
import { listSubscriptionsByTenant, listRenewalsByTenant, updateRenewal, updateSubscription } from "../../data/tenantRecords"

type FilterState = { status: string; type: string }

export default function AdminRequests() {
  const [filters, setFilters] = useState<FilterState>({ status: "", type: "" })
  const [selected, setSelected] = useState<string | undefined>()

  const requests = useMemo(() => {
    return listRequests().filter((r) => {
      if (filters.status && r.status !== filters.status) return false
      if (filters.type && r.type !== filters.type) return false
      return true
    })
  }, [filters])

  const onStatusChange = (requestId: string, status: "IN_REVIEW" | "APPROVED" | "REJECTED") => {
    const updated = updateRequest(requestId, { status })
    if (updated) {
      if (status === "APPROVED") {
        if (updated.type === "UPGRADE_REQUEST") {
          const subs = listSubscriptionsByTenant(updated.tenant_id)
          subs.forEach((sub) =>
            updateSubscription(sub.id, {
              plan_type: (updated.payload as any)?.desired_plan || sub.plan_type,
              status: "Pending Upgrade",
              subscription_status: "Pending Upgrade",
            }),
          )
        }
        if (updated.type === "RENEWAL_REQUEST") {
          const renewals = listRenewalsByTenant(updated.tenant_id)
          renewals.forEach((renewal) => updateRenewal(renewal.id, { status: "In Progress" }))
        }
      }

      addAuditLog({
        actor_type: "ADMIN",
        action: status === "APPROVED" ? "REQUEST_APPROVED" : status === "REJECTED" ? "REQUEST_REJECTED" : "REQUEST_CREATED",
        tenant_id: updated.tenant_id,
        meta: { request_id: updated.request_id, type: updated.type },
      })
    }
  }

  const reviewed = requests.find((r) => r.request_id === selected)

  return (
    <AppShell
      title="Requests"
      subtitle="Customer-submitted change requests awaiting admin action"
      navItems={adminNav}
      chips={["Admin"]}
    >
      <div className="cs-card" style={{ padding: 18, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <select
            className="cs-input"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            style={{ maxWidth: 200 }}
          >
            <option value="">All statuses</option>
            <option value="NEW">New</option>
            <option value="IN_REVIEW">In review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            className="cs-input"
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            style={{ maxWidth: 200 }}
          >
            <option value="">All types</option>
            <option value="UPGRADE_REQUEST">Upgrade</option>
            <option value="RENEWAL_REQUEST">Renewal</option>
            <option value="CHANGE_PLAN">Plan change</option>
            <option value="CHANGE_DATES">Date change</option>
          </select>
        </div>

        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Tenant ID</th>
              <th className="cs-th">Type</th>
              <th className="cs-th">Status</th>
              <th className="cs-th">Requested by</th>
              <th className="cs-th">Submitted</th>
              <th className="cs-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => (
              <tr key={req.request_id} style={{ background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-elevated)" }}>
                <td className="cs-td">{req.tenant_id || "–"}</td>
                <td className="cs-td">{req.type}</td>
                <td className="cs-td">{req.status}</td>
                <td className="cs-td">{req.requested_by || "-"}</td>
                <td className="cs-td">{new Date(req.created_at).toLocaleString()}</td>
                <td className="cs-td" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="cs-btn" onClick={() => setSelected(req.request_id)}>
                    Review
                  </button>
                  <button className="cs-btn cs-btn-primary" onClick={() => onStatusChange(req.request_id, "APPROVED")}>
                    Approve
                  </button>
                  <button className="cs-btn" onClick={() => onStatusChange(req.request_id, "REJECTED")}>Reject</button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td className="cs-td" colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {reviewed ? (
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "var(--surface)" }}>
            <div style={{ fontWeight: 800 }}>Request detail</div>
            <div style={{ color: "var(--text-secondary)", marginTop: 6 }}>
              {reviewed.type} · {reviewed.status}
            </div>
            <pre style={{ marginTop: 12, background: "#11151d", padding: 12, borderRadius: 10, overflow: "auto" }}>
              {JSON.stringify(reviewed.payload, null, 2)}
            </pre>
            {reviewed.status === "NEW" ? (
              <button className="cs-btn" onClick={() => onStatusChange(reviewed.request_id, "IN_REVIEW")}>
                Move to In Review
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
