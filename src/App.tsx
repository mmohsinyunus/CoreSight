import { HashRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./layout/AppLayout"
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
                    <Route
            path="/admin"
            element={
              <RequireRole user={user} allow={["platform_admin"]}>
                <AdminHome />
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

          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  )
}
