// src/data/tenantRecords.ts
import { generateId, readStorage, writeStorage } from "../lib/storage"
import type { Tenant } from "./tenants"

export type SubscriptionRecord = {
  id: string
  tenant_id: string
  plan: string
  status: string
  start_date?: string
  end_date?: string
  seats?: number
  renewal_type?: string
  amount?: number
  currency?: string
}

export type RenewalRecord = {
  id: string
  tenant_id: string
  subscription: string
  renewal_date: string
  term: string
  status: string
  owner?: string
  notes?: string
}

const SUB_KEY = "coresight_subscription_records"
const RENEWAL_KEY = "coresight_renewal_records"

function persistSubscriptions(next: SubscriptionRecord[]) {
  writeStorage(SUB_KEY, next)
}

function persistRenewals(next: RenewalRecord[]) {
  writeStorage(RENEWAL_KEY, next)
}

export function listSubscriptions(): SubscriptionRecord[] {
  return readStorage<SubscriptionRecord[]>(SUB_KEY, [])
}

export function listRenewals(): RenewalRecord[] {
  return readStorage<RenewalRecord[]>(RENEWAL_KEY, [])
}

export function listSubscriptionsByTenant(tenantId: string) {
  return listSubscriptions().filter((s) => s.tenant_id === tenantId)
}

export function listRenewalsByTenant(tenantId: string) {
  return listRenewals().filter((r) => r.tenant_id === tenantId)
}

export function upsertSubscription(record: SubscriptionRecord) {
  const existing = listSubscriptions()
  const idx = existing.findIndex((s) => s.id === record.id)
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...record }
    persistSubscriptions([...existing])
    return existing[idx]
  }
  const created = { ...record, id: record.id || generateId("sub") }
  persistSubscriptions([...existing, created])
  return created
}

export function upsertRenewal(record: RenewalRecord) {
  const existing = listRenewals()
  const idx = existing.findIndex((r) => r.id === record.id)
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...record }
    persistRenewals([...existing])
    return existing[idx]
  }
  const created = { ...record, id: record.id || generateId("renewal") }
  persistRenewals([...existing, created])
  return created
}

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function ensureTenantLifecycleRecords(tenant: Tenant) {
  const tenantId = tenant.tenant_id
  if (!tenantId) return

  const hasSubscription = listSubscriptionsByTenant(tenantId).length > 0
  const planName = tenant.plan_type || tenant.subscription || "Enterprise"
  const startDate = tenant.subscription_start_date || formatDate(new Date())
  const endDate =
    tenant.subscription_end_date ||
    formatDate(addMonths(new Date(startDate || Date.now()), 12))

  if (!hasSubscription) {
    upsertSubscription({
      id: generateId("sub"),
      tenant_id: tenantId,
      plan: planName,
      status: tenant.subscription_status || "Active",
      start_date: startDate,
      end_date: endDate,
      seats: tenant.max_users,
      renewal_type: "Annual",
    })
  }

  const hasRenewal = listRenewalsByTenant(tenantId).length > 0
  if (!hasRenewal) {
    upsertRenewal({
      id: generateId("renewal"),
      tenant_id: tenantId,
      subscription: planName,
      renewal_date: endDate,
      term: "12 months",
      status: tenant.subscription_status || "On track",
      owner: tenant.primary_admin_name || "Procurement",
      notes: tenant.primary_admin_email || "Renewal owner notified",
    })
  }
}
