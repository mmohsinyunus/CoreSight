// src/data/subscriptions.ts
import { fetchSheetData } from "./api"

export const SUBSCRIPTIONS_TAB = "Subscriptions"

export interface RawSubscriptionRow {
  subscription_id?: string
  entitlement_id?: string
  id?: string
  vendor_id?: string
  vendor_name?: string
  tenant_id?: string
  subscription_status?: string
  status?: string
  subscription_name?: string
  name?: string
  start_date?: string
  end_date?: string
  renewed_price?: number | string
  previous_price?: number | string
  cost?: number | string
  amount?: number | string
  currency?: string
}

export interface SubscriptionRecord {
  id: string
  vendor: string
  tenantId: string
  name: string
  status: string
  startDate?: string
  endDate?: string
  amount?: number
  currency?: string
  raw: RawSubscriptionRow
}

function parseAmount(row: RawSubscriptionRow): number | undefined {
  const candidates = [row.renewed_price, row.previous_price, row.cost, row.amount]

  for (const candidate of candidates) {
    const num = typeof candidate === "string" ? Number(candidate) : candidate
    if (Number.isFinite(num)) {
      return Number(num)
    }
  }

  return undefined
}

function coalesceId(row: RawSubscriptionRow, fallback: string): string {
  return row.subscription_id || row.entitlement_id || row.id || fallback
}

export function mapSubscriptionRow(
  row: RawSubscriptionRow,
  index = 0,
): SubscriptionRecord {
  return {
    id: coalesceId(row, `unknown-${index + 1}`),
    vendor: row.vendor_id || row.vendor_name || "Unknown vendor",
    tenantId: row.tenant_id || "—",
    name: row.subscription_name || row.name || row.vendor_name || "—",
    status: row.subscription_status || row.status || "Unknown",
    startDate: row.start_date || "",
    endDate: row.end_date || "",
    amount: parseAmount(row),
    currency: row.currency || "USD",
    raw: row,
  }
}

export async function getSubscriptions(): Promise<SubscriptionRecord[]> {
  const rows = await fetchSheetData<RawSubscriptionRow[]>(SUBSCRIPTIONS_TAB)
  if (!Array.isArray(rows)) return []
  return rows.map((row, idx) => mapSubscriptionRow(row, idx))
}
