import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useRef } from "react"
import { NavItemsProvider } from "../navigation/NavItemsProvider"
import { customerNav } from "../navigation/customerNav"
import { useCustomerAuth } from "../auth/CustomerAuthContext"
import { addActivity } from "../data/activity"

export default function CustomerLayout() {
  const { user, tenant } = useCustomerAuth()
  const location = useLocation()
  const lastLoggedRef = useRef<Record<string, number>>({})

  useEffect(() => {
    if (!user || !tenant) return
    const key = `${tenant.tenant_id}-${user.user_id}-${location.pathname}`
    const now = Date.now()
    const last = lastLoggedRef.current[key]
    if (!last || now - last > 5 * 60 * 1000) {
      addActivity({
        tenant_id: tenant.tenant_id,
        user_email: user.email,
        user_id: user.user_id,
        event: "PAGE_VIEW",
        path: location.pathname,
      })
      lastLoggedRef.current[key] = now
    }
  }, [location.pathname, tenant, user])

  return (
    <NavItemsProvider items={customerNav}>
      <Outlet />
    </NavItemsProvider>
  )
}
