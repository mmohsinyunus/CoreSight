// src/data/tenantRecords.ts
import { generateId, readStorage, writeStorage } from "../lib/storage"
import type { Tenant } from "./tenants"

export type SubscriptionRecord = {
  id: string
  subscription_id: string
  tenant_id: string
  plan_type?: string
  subscription_status?: string
  subscription_start_date?: string
  subscription_end_date?: string
  max_users?: number
  max_organizations?: number
  plan?: string
  status?: string
  start_date?: string
  end_date?: string
  seats?: number
  renewal_type?: string
  amount?: number
  currency?: string
}

export type RenewalRecord = {
  id: string
  renewal_id: string
  tenant_id: string
  renewal_date: string
  status: string
  notes?: string
  subscription?: string
  term?: string
  owner?: string
}

const SUB_KEY = "coresight_subscriptions"
const RENEWAL_KEY = "coresight_renewals"

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
  const idx = existing.findIndex(
    (s) =>
      s.subscription_id === record.subscription_id ||
      s.id === record.id ||
      (!!record.tenant_id && s.tenant_id === record.tenant_id),
  )
  const normalized: SubscriptionRecord = {
    ...record,
    id: record.id || record.subscription_id || generateId("sub"),
    subscription_id: record.subscription_id || record.id || generateId("sub"),
    plan: record.plan || record.plan_type,
    status: record.status || record.subscription_status,
    start_date: record.start_date || record.subscription_start_date,
    end_date: record.end_date || record.subscription_end_date,
    seats: record.seats ?? record.max_users,
  }
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...normalized }
    persistSubscriptions([...existing])
    return existing[idx]
  }
  persistSubscriptions([...existing, normalized])
  return normalized
}

export function upsertRenewal(record: RenewalRecord) {
  const existing = listRenewals()
  const idx = existing.findIndex(
    (r) =>
      r.renewal_id === record.renewal_id ||
      r.id === record.id ||
      (!!record.tenant_id && r.tenant_id === record.tenant_id),
  )
  const normalized: RenewalRecord = {
    ...record,
    id: record.id || record.renewal_id || generateId("renewal"),
    renewal_id: record.renewal_id || record.id || generateId("renewal"),
  }
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...normalized }
    persistRenewals([...existing])
    return existing[idx]
  }
  persistRenewals([...existing, normalized])
  return normalized
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
    tenant.subscription_end_date || formatDate(addMonths(new Date(startDate || Date.now()), 12))
  const status = tenant.subscription_status || "Active"

  if (!hasSubscription) {
    const subscriptionId = generateId("sub")
    upsertSubscription({
      id: subscriptionId,
      subscription_id: subscriptionId,
      tenant_id: tenantId,
      plan_type: planName,
      subscription_status: status,
      subscription_start_date: startDate,
      subscription_end_date: endDate,
      max_users: tenant.max_users,
      max_organizations: tenant.max_organizations,
      plan: planName,
      status,
      start_date: startDate,
      end_date: endDate,
      seats: tenant.max_users,
      renewal_type: "Annual",
    })
  }

  const hasRenewal = listRenewalsByTenant(tenantId).length > 0
  if (!hasRenewal) {
    const renewalId = generateId("renewal")
    upsertRenewal({
      id: renewalId,
      renewal_id: renewalId,
      tenant_id: tenantId,
      subscription: planName,
      renewal_date: endDate,
      term: "12 months",
      status: "Upcoming",
      owner: tenant.primary_admin_name || "Procurement",
      notes: tenant.primary_admin_email || "Renewal owner notified",
    })
  }
}
