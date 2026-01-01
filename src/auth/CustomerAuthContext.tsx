import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { findCustomerUser, hashPassword, listUsers, verifyPassword } from "../data/users"
import { getTenantByCode, listTenants } from "../data/tenants"
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
  login: (tenantCode: string, email: string, password: string) => LoginResult
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

  const login = (tenantCode: string, email: string, password: string): LoginResult => {
    const tenant = getTenantByCode(tenantCode.trim())
    if (!tenant) return { success: false, error: "Tenant not found" }
    if (tenant.status !== "Active") return { success: false, error: "Tenant inactive" }

    const user = findCustomerUser(tenant, email.trim())
    if (!user) return { success: false, error: "User not found" }
    if (user.status !== "Active") return { success: false, error: "User inactive" }

    if (!verifyPassword(password, user.password_hash)) {
      return { success: false, error: "Incorrect password" }
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
    [session],
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
