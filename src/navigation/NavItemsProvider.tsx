import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import type { NavItem } from "./types"

const NavItemsContext = createContext<NavItem[] | undefined>(undefined)

export function NavItemsProvider({ items, children }: { items: NavItem[]; children: ReactNode }) {
  return <NavItemsContext.Provider value={items}>{children}</NavItemsContext.Provider>
}

export function useNavItemsContext() {
  return useContext(NavItemsContext)
}
