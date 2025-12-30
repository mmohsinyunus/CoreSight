import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AppShell from "../../layout/AppShell"
import type { Vendor } from "../../data/vendors"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

export default function Vendors() {
  const [rows, setRows] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(SHEET_URL)
      .then(r => r.json())
      .then(setRows)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell title="Tenants">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>
          Manage enterprise tenants
        </div>
        <Link to="/admin/vendor-new" className="btn-primary">
          + Create Tenant
        </Link>
      </div>

      {loading ? (
        <div style={{ opacity: 0.6 }}>Loading…</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Country</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(v => (
              <tr key={v.tenant_id}>
                <td>{v.tenant_code}</td>
                <td>{v.tenant_name}</td>
                <td>{v.tenant_type}</td>
                <td>{v.plan_type}</td>
                <td>{v.subscription_status}</td>
                <td>{v.primary_country}</td>
                <td>{v.primary_admin_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AppShell>
  )
}
