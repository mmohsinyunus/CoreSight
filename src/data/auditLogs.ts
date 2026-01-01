// src/data/auditLogs.ts
import { generateId, nowIso, readStorage, writeStorage } from "../lib/storage"

export type AuditActorType = "ADMIN" | "CUSTOMER"

export type AuditLog = {
  audit_id: string
  actor_type: AuditActorType
  actor_email?: string
  actor_user_id?: string
  tenant_id?: string
  action:
    | "TENANT_CREATED"
    | "TENANT_UPDATED_LOCAL"
    | "TENANT_SYNC_SHEET"
    | "PRIMARY_USER_CREATED"
    | "LOGIN_SUCCESS"
    | "REQUEST_CREATED"
    | "REQUEST_APPROVED"
    | "REQUEST_REJECTED"
    | "SUBSCRIPTION_UPDATED"
    | "RENEWAL_UPDATED"
  meta?: Record<string, unknown>
  created_at: string
}

const STORAGE_KEY = "coresight_audit_logs"

function persist(next: AuditLog[]) {
  writeStorage(STORAGE_KEY, next)
}

export function listAuditLogs() {
  return readStorage<AuditLog[]>(STORAGE_KEY, [])
}

export type AuditInput = Omit<AuditLog, "audit_id" | "created_at"> & { created_at?: string }

export function addAuditLog(input: AuditInput) {
  const now = nowIso()
  const log: AuditLog = {
    audit_id: generateId("audit"),
    created_at: input.created_at || now,
    ...input,
  }
  const next = [...listAuditLogs(), log]
  persist(next)
  return log
}
