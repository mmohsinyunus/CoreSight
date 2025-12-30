export type Vendor = {
  tenantId: string
  name: string
  adminEmail: string
  createdAt: string
}

const KEY = "coresight_vendors_v1"

export function getVendors(): Vendor[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? (data as Vendor[]) : []
  } catch {
    return []
  }
}

export function addVendor(v: Vendor) {
  const list = getVendors()

  // avoid duplicates (same tenantId)
  const exists = list.some(x => x.tenantId === v.tenantId)
  const next = exists ? list : [v, ...list]

  localStorage.setItem(KEY, JSON.stringify(next))
}

export function removeVendor(tenantId: string) {
  const list = getVendors()
  const next = list.filter(x => x.tenantId !== tenantId)
  localStorage.setItem(KEY, JSON.stringify(next))
}
