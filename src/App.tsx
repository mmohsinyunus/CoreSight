// src/App.tsx
import type { ReactElement } from "react"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import Landing from "./pages/Landing"
import AdminLogin from "./pages/AdminLogin"
import CustomerLogin from "./pages/CustomerLogin"
import AdminTenants from "./pages/admin/AdminTenants"
import AdminTenantForm from "./pages/admin/AdminTenantForm"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminSettings from "./pages/admin/AdminSettings"
import CustomerDashboard from "./pages/customer/Dashboard"
import CustomerReports from "./pages/customer/Reports"
import CustomerDepartments from "./pages/customer/Departments"
import CustomerAnalytics from "./pages/customer/Analytics"
import CustomerAIInsights from "./pages/customer/AIInsights"
import CustomerSettings from "./pages/customer/Settings"
import { useAdminAuth } from "./auth/AdminAuthContext"
import { useCustomerAuth } from "./auth/CustomerAuthContext"

function AdminGuard({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAdminAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}

function CustomerGuard({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useCustomerAuth()
  if (!isAuthenticated) return <Navigate to="/customer/login" replace />
  return children
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/tenants"
          element={
            <AdminGuard>
              <AdminTenants />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/tenants/new"
          element={
            <AdminGuard>
              <AdminTenantForm />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/tenants/:tenantId/edit"
          element={
            <AdminGuard>
              <AdminTenantForm />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminGuard>
              <AdminUsers />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminGuard>
              <AdminSettings />
            </AdminGuard>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/tenants" replace />} />

        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route
          path="/app/dashboard"
          element={
            <CustomerGuard>
              <CustomerDashboard />
            </CustomerGuard>
          }
        />
        <Route
          path="/app/reports"
          element={
            <CustomerGuard>
              <CustomerReports />
            </CustomerGuard>
          }
        />
        <Route
          path="/app/departments"
          element={
            <CustomerGuard>
              <CustomerDepartments />
            </CustomerGuard>
          }
        />
        <Route
          path="/app/analytics"
          element={
            <CustomerGuard>
              <CustomerAnalytics />
            </CustomerGuard>
          }
        />
        <Route
          path="/app/ai-insights"
          element={
            <CustomerGuard>
              <CustomerAIInsights />
            </CustomerGuard>
          }
        />
        <Route
          path="/app/settings"
          element={
            <CustomerGuard>
              <CustomerSettings />
            </CustomerGuard>
          }
        />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
