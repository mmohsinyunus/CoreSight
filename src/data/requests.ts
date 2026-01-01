// src/data/requests.ts
import { generateId, nowIso, readStorage, writeStorage } from "../lib/storage"

export type RequestType = "UPGRADE_REQUEST" | "RENEWAL_REQUEST" | "CHANGE_PLAN" | "CHANGE_DATES"
export type RequestStatus = "NEW" | "IN_REVIEW" | "APPROVED" | "REJECTED"

export type RequestRecord = {
  request_id: string
  tenant_id: string
  tenant_code?: string
  requested_by?: string
  requested_by_user_id?: string
  type: RequestType
  payload: Record<string, unknown>
  status: RequestStatus
  created_at: string
  updated_at: string
  reviewed_by_admin?: string
  decision_notes?: string
}

const STORAGE_KEY = "coresight_requests"

function persist(next: RequestRecord[]) {
  writeStorage(STORAGE_KEY, next)
}

export function listRequests() {
  return readStorage<RequestRecord[]>(STORAGE_KEY, [])
}

export function listRequestsByTenant(tenantId: string) {
  return listRequests().filter((r) => r.tenant_id === tenantId)
}

export type CreateRequestInput = {
  tenant_id: string
  tenant_code?: string
  requested_by?: string
  requested_by_user_id?: string
  type: RequestType
  payload: Record<string, unknown>
}

export function createRequest(input: CreateRequestInput): RequestRecord {
  const now = nowIso()
  const record: RequestRecord = {
    request_id: generateId("req"),
    tenant_id: input.tenant_id,
    tenant_code: input.tenant_code,
    requested_by: input.requested_by,
    requested_by_user_id: input.requested_by_user_id,
    type: input.type,
    payload: input.payload,
    status: "NEW",
    created_at: now,
    updated_at: now,
  }

  const next = [...listRequests(), record]
  persist(next)
  return record
}

export function updateRequest(
  requestId: string,
  changes: Partial<Omit<RequestRecord, "request_id" | "created_at">>,
) {
  let updated: RequestRecord | undefined
  const next = listRequests().map((req) => {
    if (req.request_id !== requestId) return req
    updated = { ...req, ...changes, request_id: req.request_id, updated_at: nowIso() }
    return updated
  })
  if (updated) persist(next)
  return updated
}
