export const TENANT_ID_LENGTH = 5
export const TENANT_ID_REGEX = new RegExp(`^\\d{${TENANT_ID_LENGTH}}$`)

export function sanitizeTenantId(value: string) {
  return value.replace(/\D/g, "").slice(0, TENANT_ID_LENGTH)
}

export function isValidTenantId(value: string) {
  return TENANT_ID_REGEX.test(value)
}

export function generateTenantId(existingIds: string[] = []) {
  const existing = new Set(existingIds.filter(Boolean))
  const maxAttempts = 1000

  for (let i = 0; i < maxAttempts; i += 1) {
    const id = String(Math.floor(10000 + Math.random() * 90000))
    if (!existing.has(id)) return id
  }

  let candidate = (Date.now() % 90000) + 10000
  for (let i = 0; i < 90000; i += 1) {
    const id = String(candidate)
    if (!existing.has(id)) return id
    candidate = ((candidate - 10000 + 1) % 90000) + 10000
  }

  return "00000"
}
