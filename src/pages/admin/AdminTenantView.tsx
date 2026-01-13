import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import AppShell from "../../layout/AppShell"
import { fetchTenantsFromSheet, getTenant } from "../../data/tenants"
import type { Tenant } from "../../data/tenants"
import { adminNav } from "../../navigation/adminNav"

type InfoItem = {
  label: string
  value?: string | number | null
  render?: (value?: string | number | null) => ReactNode
}

type InfoSection = {
  title: string
  description?: string
  items: InfoItem[]
}

export default function AdminTenantView() {
  const { tenantId } = useParams()
  const [tenant, setTenant] = useState<Tenant | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!tenantId) {
      setError("Missing tenant id.")
      return
    }

    const existing = getTenant(tenantId)
    if (existing) {
      setTenant(existing)
      return
    }

    setLoading(true)
    fetchTenantsFromSheet()
      .then(() => {
        const mirrorTenant = getTenant(tenantId)
        if (!mirrorTenant) {
          setError("Tenant not found.")
        }
        setTenant(mirrorTenant)
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unable to load tenant."
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [tenantId])

  const sections = useMemo<InfoSection[]>(() => {
    if (!tenant) return []
    const planName = tenant.plan_type || tenant.subscription || "—"
    return [
      {
        title: "Tenant overview",
        description: "General identifiers and status information.",
        items: [
          { label: "Tenant name", value: tenant.tenant_name },
          { label: "Legal name", value: tenant.legal_name },
          { label: "Tenant ID", value: tenant.tenant_id },
          { label: "Type", value: tenant.tenant_type },
          { label: "Status", value: tenant.status },
          {
            label: "Created",
            value: tenant.created_at ? tenant.created_at.slice(0, 10) : "—",
          },
          {
            label: "Last updated",
            value: tenant.updated_at ? tenant.updated_at.slice(0, 10) : "—",
          },
        ],
      },
      {
        title: "Location & compliance",
        description: "Regional settings and regulatory metadata.",
        items: [
          { label: "Region", value: tenant.region },
          { label: "Timezone", value: tenant.timezone },
          { label: "Currency", value: tenant.currency },
          { label: "VAT number", value: tenant.vat_registration_number },
          {
            label: "National address",
            value: tenant.national_address ?? "—",
            render: (value) =>
              typeof value === "string" && value.startsWith("http") ? (
                <a href={value} target="_blank" rel="noreferrer" style={linkStyle}>
                  View address
                </a>
              ) : (
                value || "—"
              ),
          },
        ],
      },
      {
        title: "Subscription",
        description: "Plan configuration and limits.",
        items: [
          { label: "Plan", value: planName },
          { label: "Subscription status", value: tenant.subscription_status },
          { label: "Start date", value: tenant.subscription_start_date },
          { label: "End date", value: tenant.subscription_end_date },
          { label: "Max users", value: tenant.max_users ?? "—" },
          { label: "Max organizations", value: tenant.max_organizations ?? "—" },
          { label: "Notes", value: tenant.notes ?? "—" },
        ],
      },
      {
        title: "Primary admin",
        description: "Customer owner contact information.",
        items: [
          { label: "Primary admin name", value: tenant.primary_admin_name },
          { label: "Primary admin email", value: tenant.primary_admin_email },
        ],
      },
    ]
  }, [tenant])

  return (
    <AppShell
      title="Tenant details"
      subtitle="Read-only view of customer information"
      navItems={adminNav}
      chips={["Tenant", "Admin"]}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        {tenant?.tenant_id ? (
          <Link className="cs-btn cs-btn-primary" to={`/admin/tenants/${tenant.tenant_id}/edit`}>
            Edit tenant
          </Link>
        ) : null}
        <Link className="cs-btn" to="/admin/tenants">
          Back to tenants
        </Link>
      </div>

      {loading ? (
        <div className="cs-card" style={{ padding: 18 }}>
          Loading tenant details…
        </div>
      ) : null}

      {error ? (
        <div className="cs-card" style={{ padding: 18, borderColor: "rgba(255,255,255,0.2)" }}>
          {error}
        </div>
      ) : null}

      {tenant ? (
        <div style={{ display: "grid", gap: 16 }}>
          {sections.map((section) => (
            <div key={section.title} className="cs-card" style={{ padding: 18, display: "grid", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>{section.title}</h3>
                {section.description ? (
                  <p style={{ margin: 0, color: "var(--text-secondary)" }}>{section.description}</p>
                ) : null}
              </div>
              <div style={infoGrid}>
                {section.items.map((item) => (
                  <div key={item.label} style={infoItem}>
                    <div style={infoLabel}>{item.label}</div>
                    <div style={infoValue}>
                      {item.render ? item.render(item.value) : item.value ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </AppShell>
  )
}

const infoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
}

const infoItem: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 12,
  display: "grid",
  gap: 6,
}

const infoLabel: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
}

const infoValue: React.CSSProperties = {
  fontSize: 14,
  color: "var(--text)",
  wordBreak: "break-word",
}

const linkStyle: React.CSSProperties = {
  color: "var(--accent)",
  fontWeight: 700,
  textDecoration: "none",
}
