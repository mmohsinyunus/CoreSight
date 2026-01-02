// src/data/tenants.ts
import { generateId, nowIso, readStorage, writeStorage } from "../lib/storage"
import { appsScriptBaseUrl } from "./api"

export type TenantStatus = "Active" | "Inactive"
export type Tenant = {
  tenant_id: string
  /**
   * Legacy alias for older Sheets / integrations.
   * Prefer tenant_id everywhere.
   */
  tenant_code?: string
  tenant_name: string
  legal_name?: string
  tenant_type?: string
  region?: string
  timezone?: string
  currency?: string
  subscription?: string
  plan_type?: string
  subscription_status?: string
  subscription_start_date?: string
  subscription_end_date?: string
  max_users?: number
  max_organizations?: number
  notes?: string
  vat_registration_number?: string
  national_address?: string
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

/**
 * Canonical lookup: resolves by tenant_id OR legacy tenant_code.
 */
export function getTenant(idOrCode: string) {
  const normalized = idOrCode?.toLowerCase()
  return listTenants().find(
    (t) =>
      t.tenant_id?.toLowerCase() === normalized || t.tenant_code?.toLowerCase() === normalized,
  )
}

/**
 * Backward-compatible name. Prefer getTenant().
 */
export function getTenantByCode(code: string) {
  return getTenant(code)
}

export type TenantInput = Omit<Tenant, "tenant_id" | "created_at" | "updated_at" | "status"> & {
  status?: TenantStatus
}

export function createTenant(payload: TenantInput): Tenant {
  const now = nowIso()
  const tenantId = generateId("tenant")

  const tenant: Tenant = {
    tenant_id: tenantId,
    // IMPORTANT: do not force tenant_code unless explicitly provided.
    // This helps migrate the app away from tenant_code over time.
    tenant_code: payload.tenant_code?.trim() || undefined,

    tenant_name: payload.tenant_name,
    legal_name: payload.legal_name ?? payload.tenant_name,
    tenant_type: payload.tenant_type ?? "Enterprise",
    region: payload.region ?? "Global",
    timezone: payload.timezone ?? "UTC",
    currency: payload.currency ?? "USD",
    subscription: payload.subscription ?? "Enterprise",
    plan_type: payload.plan_type,
    subscription_status: payload.subscription_status,
    subscription_start_date: payload.subscription_start_date,
    subscription_end_date: payload.subscription_end_date,
    max_users: payload.max_users,
    max_organizations: payload.max_organizations,
    notes: payload.notes,
    vat_registration_number: payload.vat_registration_number,
    national_address: payload.national_address,
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
  // Keep demo stable: CustomerLogin defaults to "acme" and getTenant() resolves via tenant_code.
  // In a later cleanup, you can seed with a fixed tenant_id if you want.
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

function normalizeSheetRow(row: Record<string, any>): TenantSheetPayload {
  return {
    tenant_id: row.tenant_id || row.tenant_code || "",
    tenant_code: row.tenant_code || row.code || row.tenant_id || "",
    tenant_name: row.tenant_name || row.name || "",
    legal_name: row.legal_name || row.tenant_name || "",
    tenant_type: row.tenant_type || row.type || "",
    primary_country: row.primary_country || row.country || "",
    primary_timezone: row.primary_timezone || row.timezone || "",
    default_currency: row.default_currency || row.currency || "",
    plan_type: row.plan_type || row.subscription || "",
    subscription_status: row.subscription_status || row.status || "",
    subscription_start_date: row.subscription_start_date || "",
    subscription_end_date: row.subscription_end_date || "",
    max_users: row.max_users,
    max_organizations: row.max_organizations,
    tenant_status: row.tenant_status || row.status || "",
    is_demo_tenant: row.is_demo_tenant,
    data_retention_policy: row.data_retention_policy,
    compliance_flag: row.compliance_flag,
    primary_admin_name: row.primary_admin_name,
    primary_admin_email: row.primary_admin_email,
    created_by_user_id: row.created_by_user_id,
    ai_insights_enabled: row.ai_insights_enabled,
    cost_optimization_enabled: row.cost_optimization_enabled,
    usage_analytics_enabled: row.usage_analytics_enabled,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_active_at: row.last_active_at,
    primary_admin_user_id: row.primary_admin_user_id,
    notes: row.notes,
    vat_registration_number: row.vat_registration_number,
    national_address: row.national_address,
  }
}

export async function fetchTenantsFromSheet(): Promise<Tenant[]> {
  const url = new URL(appsScriptBaseUrl)
  url.searchParams.set("t", `${Date.now()}`)

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const body = await res.json().catch(() => null)
  const rows: Record<string, any>[] = Array.isArray(body)
    ? body
    : body && typeof body === "object" && "data" in body
      ? ((body as { data?: unknown }).data as Record<string, any>[] | undefined) ?? []
      : []

  if (!Array.isArray(rows)) {
    throw new Error("Unexpected sheet response")
  }

  const normalized = rows
    .map((row) => normalizeSheetRow(row))
    .filter((row) => (row.tenant_id || row.tenant_code) && row.tenant_name)

  const tenants: Tenant[] = []
  normalized.forEach((row) => {
    const t = upsertTenantMirrorFromSheet(row)
    if (t) tenants.push(t)
  })

  return tenants
}

export type TenantSheetPayload = {
  tenant_id: string
  tenant_code?: string
  tenant_name: string
  legal_name?: string
  tenant_type?: string
  primary_country?: string
  primary_timezone?: string
  default_currency?: string
  plan_type?: string
  subscription_status?: string
  subscription_start_date?: string
  subscription_end_date?: string
  max_users?: number | string
  max_organizations?: number | string
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

function normalizeNumber(value?: number | string) {
  if (value === undefined || value === null) return undefined
  const num = typeof value === "string" ? Number(value) : value
  return Number.isFinite(num) ? Number(num) : undefined
}

export function upsertTenantMirrorFromSheet(payload: TenantSheetPayload) {
  const now = nowIso()
  const status: TenantStatus = payload.tenant_status === "Active" ? "Active" : "Inactive"

  const id = payload.tenant_id || payload.tenant_code
  if (!id) throw new Error("Tenant payload missing identifiers")

  const nextTenant: Tenant = {
    tenant_id: id,
    // Only keep tenant_code if sheet provides it; otherwise leave undefined (migration-friendly)
    tenant_code: payload.tenant_code?.trim() || undefined,

    tenant_name: payload.tenant_name,
    legal_name: payload.legal_name ?? payload.tenant_name,
    tenant_type: payload.tenant_type ?? "Enterprise",
    region: payload.primary_country ?? "Global",
    timezone: payload.primary_timezone ?? "UTC",
    currency: payload.default_currency ?? "USD",
    subscription: payload.plan_type ?? "",
    plan_type: payload.plan_type ?? "",
    subscription_status: payload.subscription_status ?? "",
    subscription_start_date: payload.subscription_start_date,
    subscription_end_date: payload.subscription_end_date,
    max_users: normalizeNumber(payload.max_users),
    max_organizations: normalizeNumber(payload.max_organizations),
    primary_admin_email: payload.primary_admin_email,
    primary_admin_name: payload.primary_admin_name,
    status,
    created_at: payload.created_at || now,
    updated_at: payload.updated_at || now,
  }

  const existing = listTenants()
  const matchIndex = existing.findIndex(
    (t) => t.tenant_id === nextTenant.tenant_id || (t.tenant_code && t.tenant_code === nextTenant.tenant_code),
  )
  if (matchIndex >= 0) {
    existing[matchIndex] = { ...existing[matchIndex], ...nextTenant, updated_at: nowIso() }
    persistTenants([...existing])
    return existing[matchIndex]
  }

  const next = [...existing, nextTenant]
  persistTenants(next)
  return nextTenant
}

type TenantSyncResponse = { ok: boolean; error?: string }

export type TenantSyncResult = { ok: true } | { ok: false; unsupported?: boolean; error?: string }

function buildSheetUpdateRow(tenant: Tenant): Partial<TenantSheetPayload> {
  const now = nowIso()
  return {
    tenant_name: tenant.tenant_name,
    legal_name: tenant.legal_name,
    tenant_type: tenant.tenant_type,
    primary_country: tenant.region,
    primary_timezone: tenant.timezone,
    default_currency: tenant.currency,
    plan_type: tenant.plan_type || tenant.subscription,
    subscription_status: tenant.subscription_status,
    subscription_start_date: tenant.subscription_start_date,
    subscription_end_date: tenant.subscription_end_date,
    max_users: tenant.max_users,
    max_organizations: tenant.max_organizations,
    tenant_status: tenant.status,
    primary_admin_name: tenant.primary_admin_name,
    primary_admin_email: tenant.primary_admin_email,
    notes: tenant.notes,
    vat_registration_number: tenant.vat_registration_number,
    national_address: tenant.national_address,
    updated_at: now,
  }
}

export async function syncTenantToSheet(tenant: Tenant): Promise<TenantSyncResult> {
  if (!tenant.tenant_id) return { ok: false, error: "Missing tenant id" }

  const payload = {
    action: "updateTenant",
    tenant_id: tenant.tenant_id,
    row: buildSheetUpdateRow(tenant),
  }

  const res = await fetch(appsScriptBaseUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  })

  const json = (await res.json().catch(() => null)) as TenantSyncResponse | null

  if (!res.ok) {
    return { ok: false, error: json?.error || `HTTP ${res.status}` }
  }

  if (json && json.ok === false) {
    const message = json.error || "Sync failed"
    const unsupported = /unsupported|not enabled|not implemented/i.test(message)
    return { ok: false, error: message, unsupported }
  }

  return { ok: true }
}
