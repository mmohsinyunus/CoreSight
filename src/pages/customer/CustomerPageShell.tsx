import type { ReactNode } from "react"
import AppShell from "../../layout/AppShell"
import { customerNav } from "../../navigation/customerNav"
import { useCustomerAuth } from "../../auth/CustomerAuthContext"

export default function CustomerPageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { tenant, user } = useCustomerAuth()
  const chips = [tenant ? tenant.tenant_name : "Tenant", tenant?.region ?? ""]
  const enrichedChips = user ? [...chips, user.email] : chips

  return (
    <AppShell title={title} subtitle={subtitle} navItems={customerNav} chips={enrichedChips.filter(Boolean)}>
      {children}
    </AppShell>
  )
}
