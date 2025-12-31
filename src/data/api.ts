// src/data/api.ts

export const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

export type SheetResponse<T> =
  | {
      ok: true
      data: T
      error?: string
    }
  | {
      ok: false
      error?: string
      data?: T
    }

export interface EntitlementRow {
  entitlement_id?: string
  Entitlement_ID?: string
  tenant_id?: string
  Tenant_ID?: string
  organization_id?: string
  Organization_ID?: string
  vendor_id?: string
  Vendor_ID?: string
  Product_Name?: string
  product_name?: string
  Plan_Name?: string
  plan_name?: string
  SKU_Code?: string
  sku_code?: string
  External_Subscription_ID?: string
  external_subscription_id?: string
  Subscription_Group_ID?: string
  subscription_group_id?: string
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
  Source_System?: string
  source_system?: string
  Data_Quality_Flag?: string
  data_quality_flag?: string
  Created_At?: string
  created_at?: string
  Updated_At?: string
  updated_at?: string
}

export interface Entitlement {
  entitlement_id: string
  tenant_id?: string
  organization_id?: string
  vendor_id?: string
  product_name?: string
  plan_name?: string
  sku_code?: string
  external_subscription_id?: string
  subscription_group_id?: string
  status?: string
  start_date?: string
  end_date?: string
  auto_renew?: string
  billing_cycle?: string
  quantity?: number
  source_system?: string
  data_quality_flag?: string
  created_at?: string
  updated_at?: string
  raw?: EntitlementRow
}

function coalesceValue(row: EntitlementRow, ...keys: (keyof EntitlementRow)[]) {
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

function normalizeEntitlement(row: EntitlementRow, index: number): Entitlement {
  const entitlementId =
    coalesceValue(row, "entitlement_id", "Entitlement_ID") || `entitlement-${index + 1}`

  return {
    entitlement_id: `${entitlementId}`,
    tenant_id: coalesceValue(row, "tenant_id", "Tenant_ID") as string | undefined,
    organization_id: coalesceValue(row, "organization_id", "Organization_ID") as
      | string
      | undefined,
    vendor_id: coalesceValue(row, "vendor_id", "Vendor_ID") as string | undefined,
    product_name: (coalesceValue(row, "Product_Name", "product_name") as string | undefined) ||
      "",
    plan_name: (coalesceValue(row, "Plan_Name", "plan_name") as string | undefined) || "",
    sku_code: (coalesceValue(row, "SKU_Code", "sku_code") as string | undefined) || "",
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
    status: (coalesceValue(row, "Status", "status") as string | undefined) || "",
    start_date: (coalesceValue(row, "Start_Date", "start_date") as string | undefined) || "",
    end_date: (coalesceValue(row, "End_Date", "end_date") as string | undefined) || "",
    auto_renew: (coalesceValue(row, "Auto_Renew", "auto_renew") as string | undefined) || "",
    billing_cycle:
      (coalesceValue(row, "Billing_Cycle", "billing_cycle") as string | undefined) || "",
    quantity: coerceNumber(coalesceValue(row, "Quantity", "quantity") as string | number | undefined),
    source_system: (coalesceValue(row, "Source_System", "source_system") as string | undefined) || "",
    data_quality_flag:
      (coalesceValue(row, "Data_Quality_Flag", "data_quality_flag") as string | undefined) ||
      "",
    created_at: (coalesceValue(row, "Created_At", "created_at") as string | undefined) || "",
    updated_at: (coalesceValue(row, "Updated_At", "updated_at") as string | undefined) || "",
    raw: row,
  }
}

function parseArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data
    if (Array.isArray(data)) return data as T[]
  }
  return []
}

export async function fetchEntitlements(): Promise<Entitlement[]> {
  const res = await fetch(SHEET_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch entitlements: HTTP ${res.status}`)
  }

  let payload: unknown
  try {
    payload = await res.json()
  } catch (err) {
    console.error("Invalid entitlements response", err)
    throw new Error("Invalid entitlements response")
  }

  const rows = parseArrayResponse<EntitlementRow>(payload)
  return rows.map((row, index) => normalizeEntitlement(row, index))
}

export async function fetchEntitlementById(id: string): Promise<Entitlement | null> {
  const trimmed = id?.trim()
  if (!trimmed) return null

  const entitlements = await fetchEntitlements()
  const needle = trimmed.toLowerCase()

  return (
    entitlements.find(
      (row) =>
        row.entitlement_id.toLowerCase() === needle ||
        row.external_subscription_id?.toLowerCase() === needle,
    ) || null
  )
}

export async function fetchSheetData<T>(tabName: string): Promise<T> {
  const url = new URL(SHEET_URL)
  url.searchParams.set("tab", tabName)

  const res = await fetch(url.toString())
  let body: SheetResponse<T> | T | null = null

  try {
    body = (await res.json()) as SheetResponse<T>
  } catch {
    // leave body as null so we can surface HTTP error details below
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && body.error) ||
      `HTTP ${res.status}`
    throw new Error(message)
  }

  if (body && typeof body === "object" && "ok" in body) {
    if (!body.ok) {
      throw new Error(body.error || "Request failed")
    }
    return body.data as T
  }

  return body as T
}

export const appsScriptBaseUrl = SHEET_URL
