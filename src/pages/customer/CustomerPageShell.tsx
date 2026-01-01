import { useMemo } from "react"
import type { ReactNode } from "react"
import AppShell from "../../layout/AppShell"
import { customerNav } from "../../navigation/customerNav"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"
import type { NavItem } from "../../navigation/types"

export default function CustomerPageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { tenant, user } = useCustomerAuth()
  const chips = [tenant ? tenant.tenant_name : "Tenant", tenant?.region ?? ""]
  const enrichedChips = user ? [...chips, user.email] : chips

  const navItems = useMemo(() => {
    const usersNav: NavItem = { key: "customer-users", label: "Users", icon: "👥", to: "/app/users" }

    if (user?.role === "CUSTOMER_PRIMARY") {
      const enriched = [...customerNav]
      const renewalsIndex = enriched.findIndex((item) => item.key === "customer-renewals")
      if (renewalsIndex >= 0) {
        enriched.splice(renewalsIndex + 1, 0, usersNav)
      } else {
        enriched.push(usersNav)
      }
      return enriched
    }

    const allowedKeys = new Set([
      "customer-dashboard",
      "customer-reports",
      "customer-departments",
      "customer-analytics",
      "customer-ai",
    ])
    return customerNav.filter((item) => allowedKeys.has(item.key))
  }, [user?.role])

  return (
    <AppShell title={title} subtitle={subtitle} navItems={navItems} chips={enrichedChips.filter(Boolean)}>
      {children}
    </AppShell>
  )
}
