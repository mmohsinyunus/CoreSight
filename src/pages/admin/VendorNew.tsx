import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AppShell from "../../layout/AppShell"
import type { Vendor } from "../../data/vendors"
import { makeTenantId } from "../../data/vendors"

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

export default function VendorNew() {
  const navigate = useNavigate()

  const [tenant_code, setCode] = useState("")
  const [tenant_name, setName] = useState("")
  const [primary_admin_name, setAdmin] = useState("")
  const [primary_admin_email, setEmail] = useState("")

  async function create() {
    const payload: Vendor = {
      tenant_id: makeTenantId(),
      tenant_code,
      tenant_name,
      tenant_type: "Enterprise",
      primary_country: "Saudi Arabia",
      primary_timezone: "Asia/Riyadh",
      default_currency: "SAR",
      plan_type: "Standard",
      subscription_status: "Active",
      primary_admin_name,
      primary_admin_email,
    }

    await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    navigate("/admin/vendors")
  }

  return (
    <AppShell title="Create Tenant">
      <div style={{ display: "grid", gap: 14, maxWidth: 420 }}>
        <input placeholder="Tenant Code" value={tenant_code} onChange={e => setCode(e.target.value)} />
        <input placeholder="Tenant Name" value={tenant_name} onChange={e => setName(e.target.value)} />
        <input placeholder="Admin Name" value={primary_admin_name} onChange={e => setAdmin(e.target.value)} />
        <input placeholder="Admin Email" value={primary_admin_email} onChange={e => setEmail(e.target.value)} />
        <button className="btn-primary" onClick={create}>
          Create Tenant
        </button>
      </div>
    </AppShell>
  )
}
