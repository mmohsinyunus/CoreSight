// src/data/entitlements.ts
import { fetchSheetData } from "./api"

export const ENTITLEMENTS_TAB = "Entitlements"

export interface RawEntitlementRow {
  Entitlement_ID?: string
  entitlement_id?: string
  Vendor_ID?: string
  vendor_id?: string
  Tenant_ID?: string
  tenant_id?: string
  Product_Name?: string
  product_name?: string
  Plan_Name?: string
  plan_name?: string
  SKU_Code?: string
  sku_code?: string
  Status?: string
  status?: string
  Start_Date?: string
  start_date?: string
  End_Date?: string
  end_date?: string
  Auto_Renew?: string
  auto_renew?: string
  Billing_Cycle?: string
  billing_cycle?: string
  Quantity?: number | string
  quantity?: number | string
  External_Subscription_ID?: string
  external_subscription_id?: string
  Subscription_Group_ID?: string
  subscription_group_id?: string
  Data_Quality_Flag?: string
  data_quality_flag?: string
  Source_System?: string
  source_system?: string
  Created_At?: string
  created_at?: string
  Updated_At?: string
  updated_at?: string
}

export interface EntitlementRecord {
  entitlementId: string
  vendorId: string
  tenantId: string
  productName: string
  planName: string
  skuCode: string
  status: string
  startDate?: string
  endDate?: string
  autoRenew?: string
  billingCycle?: string
  quantity?: number
  externalSubscriptionId?: string
  subscriptionGroupId?: string
  dataQualityFlag?: string
  sourceSystem?: string
  createdAt?: string
  updatedAt?: string
  raw: RawEntitlementRow
}

function pickValue(row: RawEntitlementRow, ...keys: (keyof RawEntitlementRow)[]) {
  for (const key of keys) {
    const value = row[key]
    if (value !== undefined && value !== null) {
      const stringified = typeof value === "string" ? value.trim() : value
      if (stringified !== "" && stringified !== null) return value
    }
  }
  return undefined
}

function parseNumber(value?: number | string) {
  if (value === undefined || value === null) return undefined
  const num = typeof value === "string" ? Number(value) : value
  return Number.isFinite(num) ? Number(num) : undefined
}

export function mapEntitlementRow(row: RawEntitlementRow, index = 0): EntitlementRecord {
  const entitlementId =
    pickValue(row, "Entitlement_ID", "entitlement_id") || `entitlement-${index + 1}`

  const vendorId = pickValue(row, "Vendor_ID", "vendor_id") || "Unknown vendor"
  const tenantId = pickValue(row, "Tenant_ID", "tenant_id") || "—"
  const productName = pickValue(row, "Product_Name", "product_name") || "Unknown product"
  const planName = pickValue(row, "Plan_Name", "plan_name") || "—"
  const skuCode = pickValue(row, "SKU_Code", "sku_code") || "—"
  const status = pickValue(row, "Status", "status") || "Unknown"
  const startDate = (pickValue(row, "Start_Date", "start_date") as string | undefined) || ""
  const endDate = (pickValue(row, "End_Date", "end_date") as string | undefined) || ""
  const autoRenew = (pickValue(row, "Auto_Renew", "auto_renew") as string | undefined) || ""
  const billingCycle = (pickValue(row, "Billing_Cycle", "billing_cycle") as string | undefined) || ""
  const quantity = parseNumber(pickValue(row, "Quantity", "quantity") as number | string | undefined)
  const externalSubscriptionId =
    (pickValue(row, "External_Subscription_ID", "external_subscription_id") as string | undefined) ||
    ""
  const subscriptionGroupId =
    (pickValue(row, "Subscription_Group_ID", "subscription_group_id") as string | undefined) || ""
  const dataQualityFlag =
    (pickValue(row, "Data_Quality_Flag", "data_quality_flag") as string | undefined) || ""
  const sourceSystem = (pickValue(row, "Source_System", "source_system") as string | undefined) || ""
  const createdAt = (pickValue(row, "Created_At", "created_at") as string | undefined) || ""
  const updatedAt = (pickValue(row, "Updated_At", "updated_at") as string | undefined) || ""

  return {
    entitlementId: `${entitlementId}`,
    vendorId: `${vendorId}`,
    tenantId: `${tenantId}`,
    productName: `${productName}`,
    planName: `${planName}`,
    skuCode: `${skuCode}`,
    status: `${status}`,
    startDate,
    endDate,
    autoRenew,
    billingCycle,
    quantity,
    externalSubscriptionId,
    subscriptionGroupId,
    dataQualityFlag,
    sourceSystem,
    createdAt,
    updatedAt,
    raw: row,
  }
}

export async function getEntitlements(): Promise<EntitlementRecord[]> {
  const rows = await fetchSheetData<RawEntitlementRow[]>(ENTITLEMENTS_TAB)
  if (!Array.isArray(rows)) return []
  return rows.map((row, idx) => mapEntitlementRow(row, idx))
}
