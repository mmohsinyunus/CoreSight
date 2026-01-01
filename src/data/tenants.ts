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
