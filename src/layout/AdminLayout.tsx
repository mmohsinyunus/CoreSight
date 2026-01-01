import { Outlet } from "react-router-dom"
import { NavItemsProvider } from "../navigation/NavItemsProvider"
import { adminNav } from "../navigation/adminNav"

export default function AdminLayout() {
  return (
    <NavItemsProvider items={adminNav}>
      <Outlet />
    </NavItemsProvider>
  )
}
