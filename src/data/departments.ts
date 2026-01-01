// src/data/departments.ts
import { generateId, nowIso, readStorage, writeStorage } from "../lib/storage"

export type DepartmentRecord = {
  department_id: string
  tenant_id: string
  name: string
  owner?: string
  created_at: string
}

const STORAGE_KEY = "coresight_departments"

function persist(next: DepartmentRecord[]) {
  writeStorage(STORAGE_KEY, next)
}

export function listDepartments() {
  return readStorage<DepartmentRecord[]>(STORAGE_KEY, [])
}

export function listDepartmentsByTenant(tenantId: string) {
  return listDepartments().filter((d) => d.tenant_id === tenantId)
}

export type CreateDepartmentInput = Omit<DepartmentRecord, "department_id" | "created_at"> & { created_at?: string }

export function createDepartment(input: CreateDepartmentInput) {
  const now = nowIso()
  const record: DepartmentRecord = {
    department_id: generateId("dept"),
    created_at: input.created_at || now,
    ...input,
  }
  const next = [...listDepartments(), record]
  persist(next)
  return record
}

export function ensureDepartmentSeed(tenantId: string) {
  const existing = listDepartmentsByTenant(tenantId)
  if (existing.length > 0) return existing

  const seeds = [
    { name: "Engineering", owner: "CTO" },
    { name: "Finance", owner: "VP Finance" },
    { name: "Operations", owner: "COO" },
    { name: "Sales", owner: "VP Sales" },
  ]

  const created = seeds.map((seed) =>
    createDepartment({ tenant_id: tenantId, name: seed.name, owner: seed.owner, created_at: nowIso() }),
  )
  return created
}
