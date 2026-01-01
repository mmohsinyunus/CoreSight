import type { NavSection } from "../../layout/AppShell"

export const adminNav: NavSection[] = [
  {
    label: "Admin",
    items: [
      { to: "/admin/tenants", label: "Tenants", icon: "🏢" },
      { to: "/admin/tenants/new", label: "Create Tenant", icon: "＋" },
      { to: "/admin/users", label: "Users", icon: "👥" },
      { to: "/admin/settings", label: "Settings", icon: "⚙" },
    ],
  },
]
