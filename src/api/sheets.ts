// src/api/sheets.ts

export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

type AppsScriptEnvelope<T> =
  | { data: T }
  | { ok: boolean; data?: T; error?: string }
  | T

function extractData<T>(payload: AppsScriptEnvelope<T>): T {
  if (payload && typeof payload === "object") {
    if ("ok" in payload) {
      if (!payload.ok) {
        throw new Error(payload.error || "Request failed")
      }
      return (payload.data ?? []) as T
    }

    if ("data" in payload) {
      return (payload as { data: T }).data
    }
  }

  return payload as T
}

function coalesceValue<T extends Record<string, unknown>>(row: T, ...keys: (keyof T)[]) {
  for (const key of keys) {
    const candidate = row[key]
    if (candidate !== undefined && candidate !== null && `${candidate}`.trim() !== "") {
      return candidate
    }
  }
  return undefined
}

function coerceNumber(value?: string | number) {
  if (value === undefined || value === null) return undefined
  const parsed = typeof value === "string" ? Number(value) : value
  return Number.isFinite(parsed) ? Number(parsed) : undefined
}

export async function fetchSheetRows<TRow>(
  sheet: string,
  params?: Record<string, string | number | undefined>,
): Promise<TRow[]> {
  const url = new URL(APPS_SCRIPT_URL)
  url.searchParams.set("sheet", sheet)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim() !== "") {
        url.searchParams.set(key, `${value}`)
      }
    })
  }

  const res = await fetch(url.toString(), { cache: "no-store", redirect: "follow" })
  let payload: AppsScriptEnvelope<TRow[]> | null = null

  try {
    payload = (await res.json()) as AppsScriptEnvelope<TRow[]>
  } catch {
    // leave payload as null so we can surface HTTP error details below
  }

  if (!res.ok) {
    const message = (payload && typeof payload === "object" && "error" in payload && payload.error) ||
      `HTTP ${res.status}`
    throw new Error(message)
  }

  const data = payload ? extractData<TRow[]>(payload) : []
  return Array.isArray(data) ? data : []
}

export interface SubscriptionEntitlementRow extends Record<string, unknown> {
  entitlement_id?: string
  Entitlement_ID?: string
  tenant_id?: string
  Tenant_ID?: string
  vendor_id?: string
  Vendor_ID?: string
  Product_Name?: string
  product_name?: string
  Plan_Name?: string
  plan_name?: string
  Status?: string
  status?: string
  End_Date?: string
  end_date?: string
  External_Subscription_ID?: string
  external_subscription_id?: string
  SKU_Code?: string
  sku_code?: string
  Subscription_Group_ID?: string
  subscription_group_id?: string
  Start_Date?: string
  start_date?: string
  Auto_Renew?: string
  auto_renew?: string
  Billing_Cycle?: string
  billing_cycle?: string
  Source_System?: string
  source_system?: string
  Data_Quality_Flag?: string
  data_quality_flag?: string
  Created_At?: string
  created_at?: string
  Updated_At?: string
  updated_at?: string
  Quantity?: number | string
  quantity?: number | string
}

export interface SubscriptionEntitlement {
  entitlement_id: string
  vendor_id?: string
  tenant_id?: string
  product_name?: string
  plan_name?: string
  status?: string
  start_date?: string
  end_date?: string
  external_subscription_id?: string
  subscription_group_id?: string
  sku_code?: string
  auto_renew?: string
  billing_cycle?: string
  quantity?: number
  source_system?: string
  data_quality_flag?: string
  created_at?: string
  updated_at?: string
  raw: SubscriptionEntitlementRow
}

function normalizeEntitlement(row: SubscriptionEntitlementRow, index: number): SubscriptionEntitlement {
  const entitlementId =
    (coalesceValue(row, "entitlement_id", "Entitlement_ID") as string | undefined) ||
    `entitlement-${index + 1}`

  return {
    entitlement_id: `${entitlementId}`,
    vendor_id: coalesceValue(row, "vendor_id", "Vendor_ID") as string | undefined,
    tenant_id: coalesceValue(row, "tenant_id", "Tenant_ID") as string | undefined,
    product_name: (coalesceValue(row, "Product_Name", "product_name") as string | undefined) || "",
    plan_name: (coalesceValue(row, "Plan_Name", "plan_name") as string | undefined) || "",
    status: (coalesceValue(row, "Status", "status") as string | undefined) || "",
    start_date: (coalesceValue(row, "Start_Date", "start_date") as string | undefined) || "",
    end_date: (coalesceValue(row, "End_Date", "end_date") as string | undefined) || "",
    external_subscription_id: coalesceValue(
      row,
      "External_Subscription_ID",
      "external_subscription_id",
    ) as string | undefined,
    subscription_group_id: coalesceValue(
      row,
      "Subscription_Group_ID",
      "subscription_group_id",
    ) as string | undefined,
    sku_code: (coalesceValue(row, "SKU_Code", "sku_code") as string | undefined) || "",
    auto_renew: (coalesceValue(row, "Auto_Renew", "auto_renew") as string | undefined) || "",
    billing_cycle:
      (coalesceValue(row, "Billing_Cycle", "billing_cycle") as string | undefined) || "",
    quantity: coerceNumber(
      coalesceValue(row, "Quantity", "quantity") as string | number | undefined,
    ),
    source_system: (coalesceValue(row, "Source_System", "source_system") as string | undefined) || "",
    data_quality_flag:
      (coalesceValue(row, "Data_Quality_Flag", "data_quality_flag") as string | undefined) || "",
    created_at: (coalesceValue(row, "Created_At", "created_at") as string | undefined) || "",
    updated_at: (coalesceValue(row, "Updated_At", "updated_at") as string | undefined) || "",
    raw: row,
  }
}

export async function fetchSubscriptionEntitlements(): Promise<SubscriptionEntitlement[]> {
  const rows = await fetchSheetRows<SubscriptionEntitlementRow>("Subscription_Entitlements")
  return rows.map((row, index) => normalizeEntitlement(row, index))
}

export async function fetchSubscriptionEntitlementById(
  entitlementId: string,
): Promise<SubscriptionEntitlement | null> {
  const trimmed = entitlementId?.trim()
  if (!trimmed) return null

  // If the Apps Script supports filtering, pass entitlement_id; if not, the client-side match still works.
  const rows = await fetchSheetRows<SubscriptionEntitlementRow>("Subscription_Entitlements", {
    entitlement_id: trimmed,
  })
  const normalized = rows.map((row, index) => normalizeEntitlement(row, index))

  const needle = trimmed.toLowerCase()
  return (
    normalized.find(
      (row) =>
        row.entitlement_id.toLowerCase() === needle ||
        (row.external_subscription_id || "").toLowerCase() === needle,
    ) || null
  )
}
