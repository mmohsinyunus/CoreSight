import { HashRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./layout/AppLayout"
import VendorNew from "./pages/admin/VendorNew"
import Settings from "./pages/admin/Settings"

import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Reports from "./pages/Reports"

import AdminHome from "./pages/admin/AdminHome"
import Vendors from "./pages/admin/Vendors"

import RequireRole from "./auth/RequireRole"
import { mockUser } from "./auth/auth"

export default function App() {
  const user = mockUser

  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />

          {/* Platform Admin */}
          <Route
            path="/admin"
            element={
              <RequireRole user={user} allow={["platform_admin"]}>
                <AdminHome />
              </RequireRole>
            }
          />
          <Route
  path="/admin/vendors/new"
  element={
    <RequireRole user={user} allow={["platform_admin"]}>
      <VendorNew />
    </RequireRole>
  }
/>
<Route
  path="/admin/settings"
  element={
    <RequireRole user={user} allow={["platform_admin"]}>
      <Settings />
    </RequireRole>
  }
/>
          <Route
            path="/admin/vendors"
            element={
              <RequireRole user={user} allow={["platform_admin"]}>
                <Vendors />
              </RequireRole>
            }
          />

          {/* Fallback (prevents blank screens) */}
          <Route path="*" element={<Home />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  )
}
