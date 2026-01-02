// src/data/vendors.ts

export type TenantType = "Enterprise" | "SME" | "Partner" | "Internal" | string
export type PlanType = "Free" | "Standard" | "Pro" | "Enterprise" | string
export type SubscriptionStatus =
  | "Active"
  | "Trial"
  | "Suspended"
  | "Cancelled"
  | "Inactive"
  | string

export interface Vendor {
  /**
   * Primary identifier. This is what the UI and all new code should use.
   */
  tenant_id: string

  /**
   * Legacy alias for backward compatibility (Sheets / older integrations).
   * Avoid using this in UI. Keep only for compatibility during migration.
   */
  tenant_code?: string

  tenant_name: string
  legal_name?: string

  tenant_type: TenantType
  primary_country: string
  primary_timezone: string
  default_currency: string

  plan_type: PlanType
  subscription_status: SubscriptionStatus
  subscription_start_date?: string
  subscription_end_date?: string

  max_users?: number
  max_organizations?: number

  tenant_status?: string
  is_demo_tenant?: boolean
  data_retention_policy?: string
  compliance_flag?: boolean

  primary_admin_name: string
  primary_admin_email: string

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

export const TENANT_TYPE_OPTIONS: TenantType[] = ["Enterprise", "SME", "Partner", "Internal"]

export const PLAN_TYPE_OPTIONS: PlanType[] = ["Free", "Standard", "Pro", "Enterprise"]

export const SUBSCRIPTION_STATUS_OPTIONS: SubscriptionStatus[] = [
  "Active",
  "Trial",
  "Suspended",
  "Cancelled",
  "Inactive",
]

/**
 * Helper (optional): if you are posting to a legacy sheet endpoint that still expects tenant_code,
 * you can call this to ensure tenant_code is filled with tenant_id when missing.
 */
export function withLegacyTenantCode<T extends { tenant_id: string; tenant_code?: string }>(obj: T): T {
  if (obj.tenant_code && obj.tenant_code.trim()) return obj
  return { ...obj, tenant_code: obj.tenant_id }
}

export function makeTenantId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`
}
