// src/data/tenants.ts
import { generateId, nowIso, readStorage, writeStorage } from "../lib/storage"

export type TenantStatus = "Active" | "Inactive"
export type Tenant = {
  tenant_id: string
  tenant_code: string
  tenant_name: string
  legal_name?: string
  tenant_type?: string
  region?: string
  timezone?: string
  currency?: string
  subscription?: string
  primary_admin_name?: string
  primary_admin_email?: string
  status: TenantStatus
  created_at: string
  updated_at: string
}

const STORAGE_KEY = "coresight_tenants"

export function listTenants(): Tenant[] {
  return readStorage<Tenant[]>(STORAGE_KEY, [])
}

function persistTenants(next: Tenant[]) {
  writeStorage(STORAGE_KEY, next)
}

export function getTenant(id: string) {
  return listTenants().find((t) => t.tenant_id === id)
}

export function getTenantByCode(code: string) {
  return listTenants().find((t) => t.tenant_code.toLowerCase() === code.toLowerCase())
}

export type TenantInput = Omit<Tenant, "tenant_id" | "created_at" | "updated_at" | "status"> & {
  status?: TenantStatus
}

export function createTenant(payload: TenantInput): Tenant {
  const now = nowIso()
  const tenant: Tenant = {
    tenant_id: generateId("tenant"),
    tenant_code: payload.tenant_code,
    tenant_name: payload.tenant_name,
    legal_name: payload.legal_name ?? payload.tenant_name,
    tenant_type: payload.tenant_type ?? "Enterprise",
    region: payload.region ?? "Global",
    timezone: payload.timezone ?? "UTC",
    currency: payload.currency ?? "USD",
    subscription: payload.subscription ?? "Enterprise",
    primary_admin_email: payload.primary_admin_email,
    primary_admin_name: payload.primary_admin_name,
    status: payload.status ?? "Active",
    created_at: now,
    updated_at: now,
  }

  const next = [...listTenants(), tenant]
  persistTenants(next)
  return tenant
}

export function updateTenant(id: string, changes: Partial<Tenant>): Tenant | undefined {
  let updated: Tenant | undefined
  const next = listTenants().map((tenant) => {
    if (tenant.tenant_id !== id) return tenant
    updated = {
      ...tenant,
      ...changes,
      tenant_id: tenant.tenant_id,
      updated_at: nowIso(),
    }
    return updated
  })
  if (updated) persistTenants(next)
  return updated
}

export function setTenantStatus(id: string, status: TenantStatus) {
  return updateTenant(id, { status })
}

export function ensureSeedTenant() {
  if (listTenants().length > 0) return
  createTenant({
    tenant_code: "acme",
    tenant_name: "Acme Holdings",
    legal_name: "Acme Holdings LLC",
    tenant_type: "Demo Enterprise",
    region: "USA",
    timezone: "UTC",
    currency: "USD",
    subscription: "Pilot",
    status: "Active",
  })
}

export type TenantSheetPayload = {
  tenant_id: string
  tenant_code: string
  tenant_name: string
  legal_name?: string
  tenant_type?: string
  primary_country?: string
  primary_timezone?: string
  default_currency?: string
  plan_type?: string
  subscription_status?: string
  tenant_status?: string
  is_demo_tenant?: boolean
  data_retention_policy?: string
  compliance_flag?: boolean
  primary_admin_name?: string
  primary_admin_email?: string
  created_by_user_id?: string
  ai_insights_enabled?: boolean
  cost_optimization_enabled?: boolean
  usage_analytics_enabled?: boolean
  created_at?: string
  updated_at?: string
  last_active_at?: string
  primary_admin_user_id?: string
  notes?: string
  vat_registration_number?: string
  national_address?: string
}

export function upsertTenantMirrorFromSheet(payload: TenantSheetPayload) {
  const now = nowIso()
  const status: TenantStatus = payload.tenant_status === "Active" ? "Active" : "Inactive"

  const nextTenant: Tenant = {
    tenant_id: payload.tenant_id,
    tenant_code: payload.tenant_code,
    tenant_name: payload.tenant_name,
    legal_name: payload.legal_name ?? payload.tenant_name,
    tenant_type: payload.tenant_type ?? "Enterprise",
    region: payload.primary_country ?? "Global",
    timezone: payload.primary_timezone ?? "UTC",
    currency: payload.default_currency ?? "USD",
    subscription: payload.plan_type ?? "",
    primary_admin_email: payload.primary_admin_email,
    primary_admin_name: payload.primary_admin_name,
    status,
    created_at: payload.created_at || now,
    updated_at: payload.updated_at || now,
  }

  const existing = listTenants()
  const matchIndex = existing.findIndex((t) => t.tenant_id === nextTenant.tenant_id)
  if (matchIndex >= 0) {
    existing[matchIndex] = { ...existing[matchIndex], ...nextTenant, updated_at: nowIso() }
    persistTenants([...existing])
    return existing[matchIndex]
  }

  const next = [...existing, nextTenant]
  persistTenants(next)
  return nextTenant
}
