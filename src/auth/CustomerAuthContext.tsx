import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  findUserByEmail,
  hashPassword,
  listUsers,
  listUsersByTenant,
  verifyPassword,
} from "../data/users"
import { fetchTenantsFromSheet, getTenant, listTenants } from "../data/tenants"
import type { Tenant } from "../data/tenants"
import type { User, UserRole } from "../data/users"
import { readStorage, writeStorage } from "../lib/storage"
import { addActivity } from "../data/activity"
import { addAuditLog } from "../data/auditLogs"

const STORAGE_KEY = "coresight_customer_session"

export type CustomerSession = {
  user: User
  tenant: Tenant
}

type LoginResult = { success: boolean; error?: string }

type CustomerAuthValue = {
  tenant?: Tenant
  user?: User
  isAuthenticated: boolean
  /**
   * Primary identifier is tenant_id.
   * Legacy tenant_code values still work because getTenant() resolves both.
   */
  login: (tenantId: string, email: string, password: string) => Promise<LoginResult>
  logout: () => void
}

const CustomerAuthContext = createContext<CustomerAuthValue | undefined>(undefined)

function resolveRole(user: User, tenant: Tenant): UserRole {
  if (user.role) return user.role
  const tenantUsers = listUsersByTenant(tenant.tenant_id)
  const hasPrimary = tenantUsers.some((u) => u.role === "CUSTOMER_PRIMARY")
  return hasPrimary ? "CUSTOMER_USER" : "CUSTOMER_PRIMARY"
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CustomerSession | undefined>(undefined)

  useEffect(() => {
    const stored = readStorage<CustomerSession | undefined>(STORAGE_KEY, undefined)
    if (stored?.tenant && stored?.user) {
      const role = resolveRole(stored.user, stored.tenant)
      const normalizedUser = { ...stored.user, role }
      const normalizedSession: CustomerSession = {
        tenant: stored.tenant,
        user: normalizedUser,
      }
      setSession(normalizedSession)
      writeStorage(STORAGE_KEY, normalizedSession)
    }
  }, [])

  const login = async (tenantId: string, email: string, password: string): Promise<LoginResult> => {
    const id = tenantId.trim()
    const normalizedEmail = email.trim()

    let tenant = getTenant(id)

    if (!tenant) {
      try {
        await fetchTenantsFromSheet()
        tenant = getTenant(id)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to validate tenant"
        return { success: false, error: message }
      }
    }

    if (!tenant) return { success: false, error: "Tenant not found" }

    const isActiveTenant = (tenant.status || "").toLowerCase() === "active"
    if (!isActiveTenant) {
      return { success: false, error: "Tenant is inactive. Contact administrator." }
    }

    const user = listUsers().find(
      (u) =>
        u.tenant_id === tenant.tenant_id &&
        u.email.toLowerCase() === normalizedEmail.toLowerCase() &&
        (!u.status || u.status === "Active") &&
        (u.role === "CUSTOMER_PRIMARY" || u.role === "CUSTOMER_USER"),
    )

    if (!user) {
      const emailMatch = findUserByEmail(normalizedEmail)
      if (emailMatch && emailMatch.tenant_id !== tenant.tenant_id) {
        return { success: false, error: "Email is registered to a different tenant." }
      }
      return {
        success: false,
        error: "No user found for this tenant. Ask admin to create primary login.",
      }
    }

    if (user.status && user.status !== "Active") {
      return { success: false, error: "User inactive" }
    }

    if (!verifyPassword(password, user.password_hash)) {
      return { success: false, error: "Invalid credentials." }
    }

    const role = resolveRole(user, tenant)
    const normalizedUser = { ...user, role }
    const newSession: CustomerSession = { tenant, user: normalizedUser }

    setSession(newSession)
    writeStorage(STORAGE_KEY, newSession)

    addActivity({
      tenant_id: tenant.tenant_id,
      user_email: normalizedEmail,
      user_id: user.user_id,
      event: "LOGIN",
    })

    addAuditLog({
      actor_type: "CUSTOMER",
      actor_email: normalizedEmail,
      actor_user_id: user.user_id,
      tenant_id: tenant.tenant_id,
      action: "LOGIN_SUCCESS",
    })

    return { success: true }
  }

  const logout = () => {
    setSession(undefined)
    writeStorage(STORAGE_KEY, undefined)
  }

  const value = useMemo(
    () => ({
      tenant: session?.tenant,
      user: session?.user,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [login, logout, session],
  )

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error("useCustomerAuth must be used inside CustomerAuthProvider")
  return ctx
}

/**
 * Demo seeding (DEV ONLY)
 * - Never runs in production
 * - Seeds exactly one demo customer user if none exist
 */
export function seedDemoUsers() {
  // 🚫 Never seed demo users in production
  if (!import.meta.env.DEV) return

  const tenants = listTenants()
  const users = listUsers()
  const hasCustomer = users.some((u) => u.role !== "ADMIN")
  if (tenants.length === 0 || hasCustomer) return

  const tenant = tenants[0]

  const demoUser: User = {
    user_id: "demo-user",
    tenant_id: tenant.tenant_id,
    email: "primary@demo.corp",
    password_hash: hashPassword("demo123"),
    role: "CUSTOMER_PRIMARY",
    status: "Active",
    created_at: tenant.created_at,
    updated_at: tenant.created_at,
  }

  writeStorage("coresight_users", [...users, demoUser])
}
