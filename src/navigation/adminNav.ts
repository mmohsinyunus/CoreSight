import type { NavItem } from "./types"

export const adminNav: NavItem[] = [
  { key: "admin-dashboard", label: "Dashboard", icon: "📊", to: "/admin" },
  { key: "admin-tenants", label: "Tenants", icon: "🏢", to: "/admin/tenants" },
  { key: "admin-users", label: "Users", icon: "👥", to: "/admin/users" },
  { key: "admin-requests", label: "Requests", icon: "📥", to: "/admin/requests" },
  { key: "admin-subscriptions", label: "Subscriptions", icon: "💳", to: "/admin/subscriptions" },
  { key: "admin-renewals", label: "Renewals", icon: "↻", to: "/admin/renewals" },
  { key: "admin-analytics", label: "Analytics", icon: "📈", to: "/admin/analytics" },
  { key: "admin-audit", label: "Audit Logs", icon: "📜", to: "/admin/audit" },
  { key: "admin-settings", label: "Settings", icon: "⚙", to: "/admin/settings" },
]
