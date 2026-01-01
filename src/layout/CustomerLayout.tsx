import { Outlet } from "react-router-dom"
import { NavItemsProvider } from "../navigation/NavItemsProvider"
import { customerNav } from "../navigation/customerNav"

export default function CustomerLayout() {
  return (
    <NavItemsProvider items={customerNav}>
      <Outlet />
    </NavItemsProvider>
  )
}
