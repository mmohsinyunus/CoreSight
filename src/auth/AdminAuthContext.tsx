import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { ensureSeedAdmin, getAdminEmail, getAdminPassword } from "../data/users"
import type { User } from "../data/users"
import { readStorage, writeStorage } from "../lib/storage"
import { addAuditLog } from "../data/auditLogs"

const STORAGE_KEY = "coresight_admin_session"

type AdminSession = {
  user: User
}

type LoginResult = { success: boolean; error?: string }

type AdminAuthContextValue = {
  currentUser?: User
  login: (email: string, password: string) => LoginResult
  logout: () => void
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    ensureSeedAdmin()
    const stored = readStorage<AdminSession | undefined>(STORAGE_KEY, undefined)
    if (stored?.user) {
      setCurrentUser(stored.user)
    }
  }, [])

  const login = (email: string, password: string): LoginResult => {
    const normalizedEmail = email.trim().toLowerCase()
    const expectedEmail = getAdminEmail().toLowerCase()
    const expectedPassword = getAdminPassword()

    if (normalizedEmail !== expectedEmail) {
      return { success: false, error: "Invalid credentials" }
    }
    if (password !== expectedPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    const sessionUser: User = {
      user_id: "admin",
      email: expectedEmail,
      password_hash: "", // not stored for session
      role: "ADMIN",
      status: "Active",
      created_at: "",
      updated_at: "",
    }
    setCurrentUser(sessionUser)
    writeStorage(STORAGE_KEY, { user: sessionUser })
    addAuditLog({
      actor_type: "ADMIN",
      actor_email: sessionUser.email,
      action: "LOGIN_SUCCESS",
    })
    return { success: true }
  }

  const logout = () => {
    setCurrentUser(undefined)
    writeStorage(STORAGE_KEY, undefined)
  }

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      isAuthenticated: Boolean(currentUser),
    }),
    [currentUser],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider")
  return ctx
}
