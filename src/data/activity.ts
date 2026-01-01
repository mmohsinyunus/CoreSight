// src/data/activity.ts
import { generateId, nowIso, readStorage, writeStorage } from "../lib/storage"

export type ActivityEvent = "LOGIN" | "PAGE_VIEW"

export type ActivityRecord = {
  activity_id: string
  tenant_id: string
  user_email?: string
  user_id?: string
  event: ActivityEvent
  path?: string
  created_at: string
}

const STORAGE_KEY = "coresight_activity"

function persist(next: ActivityRecord[]) {
  writeStorage(STORAGE_KEY, next)
}

export function listActivity() {
  return readStorage<ActivityRecord[]>(STORAGE_KEY, [])
}

export function listActivityByTenant(tenantId: string) {
  return listActivity().filter((a) => a.tenant_id === tenantId)
}

export type ActivityInput = Omit<ActivityRecord, "activity_id" | "created_at"> & { created_at?: string }

export function addActivity(input: ActivityInput) {
  const record: ActivityRecord = {
    activity_id: generateId("act"),
    created_at: input.created_at || nowIso(),
    ...input,
  }
  const next = [...listActivity(), record]
  persist(next)
  return record
}
