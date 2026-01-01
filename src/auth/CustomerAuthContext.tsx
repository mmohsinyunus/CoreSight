import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { findUserByEmail, hashPassword, listUsers, verifyPassword } from "../data/users"
import { fetchTenantsFromSheet, getTenantByCode, listTenants } from "../data/tenants"
import type { Tenant } from "../data/tenants"
import type { User } from "../data/users"
import { readStorage, writeStorage } from "../lib/storage"

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
  login: (tenantCode: string, email: string, password: string) => Promise<LoginResult>
  logout: () => void
}

const CustomerAuthContext = createContext<CustomerAuthValue | undefined>(undefined)

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CustomerSession | undefined>(undefined)

  useEffect(() => {
    const stored = readStorage<CustomerSession | undefined>(STORAGE_KEY, undefined)
    if (stored?.tenant && stored?.user) {
      setSession(stored)
    }
  }, [])

  const login = async (tenantCode: string, email: string, password: string): Promise<LoginResult> => {
    const code = tenantCode.trim()
    const normalizedEmail = email.trim()

    let tenant = getTenantByCode(code)

    if (!tenant) {
      try {
        await fetchTenantsFromSheet()
        tenant = getTenantByCode(code)
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
        u.tenant_id === tenant?.tenant_id &&
        u.email.toLowerCase() === normalizedEmail.toLowerCase() &&
        (!u.status || u.status === "Active") &&
        (u.role === "CUSTOMER_PRIMARY" || u.role === "CUSTOMER_USER"),
    )

    if (!user) {
      const emailMatch = findUserByEmail(normalizedEmail)
      if (emailMatch && emailMatch.tenant_id !== tenant.tenant_id) {
        return { success: false, error: "Email is registered to a different tenant." }
      }
      return { success: false, error: "No user found for this tenant. Ask admin to create primary login." }
    }

    if (user.status && user.status !== "Active") return { success: false, error: "User inactive" }

    if (!verifyPassword(password, user.password_hash)) {
      return { success: false, error: "Invalid credentials." }
    }

    const newSession: CustomerSession = { tenant, user }
    setSession(newSession)
    writeStorage(STORAGE_KEY, newSession)
    return { success: true }
  }

  const logout = () => {
    setSession(undefined)
    writeStorage(STORAGE_KEY, undefined)
  }

  const value = useMemo(
    () => ({ tenant: session?.tenant, user: session?.user, isAuthenticated: Boolean(session), login, logout }),
    [login, logout, session],
  )

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error("useCustomerAuth must be used inside CustomerAuthProvider")
  return ctx
}

// Helper seeds for demo convenience
export function seedDemoUsers() {
  const tenants = listTenants()
  const users = listUsers()
  const hasCustomer = users.some((u) => u.role !== "ADMIN")
  if (tenants.length === 0 || hasCustomer) return
  const tenant = tenants[0]
  // Only seed a single demo user when storage is empty
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
