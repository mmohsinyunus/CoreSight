export type Role = "platform_admin" | "vendor_admin" | "viewer"

export type SessionUser = {
  id: string
  email: string
  role: Role
  tenantId?: string // Only for vendor users; platform_admin won't have this
}

// MOCK USERS (temporary, until we connect real login)
export const mockPlatformAdmin: SessionUser = {
  id: "u_platform_1",
  email: "admin@coresight.com",
  role: "platform_admin",
}

export const mockVendorAdmin: SessionUser = {
  id: "u_vendor_admin_1",
  email: "vendor.admin@vendor.com",
  role: "vendor_admin",
  tenantId: "tenant_vendor_001",
}

export const mockViewer: SessionUser = {
  id: "u_viewer_1",
  email: "viewer@vendor.com",
  role: "viewer",
  tenantId: "tenant_vendor_001",
}

// Choose who is “logged in” right now (change this to test roles)
export const mockUser: SessionUser = mockPlatformAdmin
