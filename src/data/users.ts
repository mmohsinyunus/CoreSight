// src/data/users.ts
import { generateId, nowIso, readStorage, writeStorage } from "../lib/storage"
import type { Tenant } from "./tenants"

export type UserRole = "ADMIN" | "CUSTOMER_PRIMARY" | "CUSTOMER_USER"
export type UserStatus = "Active" | "Inactive"

export type User = {
  user_id: string
  tenant_id?: string
  email: string
  password_hash: string
  role: UserRole
  status: UserStatus
  name?: string
  created_at: string
  updated_at: string
}

const STORAGE_KEY = "coresight_users"

export function hashPassword(password: string) {
  try {
    return btoa(unescape(encodeURIComponent(password)))
  } catch {
    return password
  }
}

export function verifyPassword(password: string, hash: string) {
  return hashPassword(password) === hash
}

export function listUsers(): User[] {
  return readStorage<User[]>(STORAGE_KEY, [])
}

function persist(next: User[]) {
  writeStorage(STORAGE_KEY, next)
}

export function listUsersByTenant(tenantId: string) {
  return listUsers().filter((u) => u.tenant_id === tenantId)
}

export function findUserByEmail(email: string) {
  return listUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function findCustomerUser(tenant: Tenant, email: string) {
  return listUsers().find(
    (u) =>
      u.tenant_id === tenant.tenant_id &&
      u.email.toLowerCase() === email.toLowerCase() &&
      (u.role === "CUSTOMER_PRIMARY" || u.role === "CUSTOMER_USER"),
  )
}

export type CreateUserPayload = {
  tenant_id?: string
  email: string
  password: string
  role: UserRole
  status?: UserStatus
  name?: string
}

export function createUser(payload: CreateUserPayload): User {
  const now = nowIso()
  const user: User = {
    user_id: generateId("user"),
    tenant_id: payload.tenant_id,
    email: payload.email,
    password_hash: hashPassword(payload.password),
    role: payload.role,
    status: payload.status ?? "Active",
    name: payload.name,
    created_at: now,
    updated_at: now,
  }
  const next = [...listUsers(), user]
  persist(next)
  return user
}

export function updateUser(id: string, changes: Partial<User>) {
  let updated: User | undefined
  const next = listUsers().map((u) => {
    if (u.user_id !== id) return u
    updated = {
      ...u,
      ...changes,
      user_id: u.user_id,
      updated_at: nowIso(),
    }
    return updated
  })
  if (updated) persist(next)
  return updated
}

export function resetPassword(userId: string, password: string) {
  return updateUser(userId, { password_hash: hashPassword(password) })
}

export function ensureSeedAdmin() {
  if (findUserByEmail(getAdminEmail())) return
  createUser({
    email: getAdminEmail(),
    password: getAdminPassword(),
    role: "ADMIN",
    status: "Active",
  })
}

export function getAdminEmail() {
  return import.meta.env.VITE_ADMIN_EMAIL || "admin@coresight.local"
}

export function getAdminPassword() {
  return import.meta.env.VITE_ADMIN_PASSWORD || "admin123"
}
