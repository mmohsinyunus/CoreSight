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
import VendorNew from "./pages/admin/VendorNew"
import AdminHome from "./pages/admin/AdminHome"
import AdminSubscriptions from "./pages/admin/AdminSubscriptions"
import AdminRenewals from "./pages/admin/AdminRenewals"
import AdminAnalytics from "./pages/admin/AdminAnalytics"
import CustomerDashboard from "./pages/customer/Dashboard"
import CustomerReports from "./pages/customer/Reports"
import CustomerDepartments from "./pages/customer/Departments"
import CustomerAnalytics from "./pages/customer/Analytics"
import CustomerAIInsights from "./pages/customer/AIInsights"
import CustomerSettings from "./pages/customer/Settings"
import CustomerSubscriptions from "./pages/customer/Subscriptions"
import CustomerRenewals from "./pages/customer/Renewals"
import AdminLayout from "./layout/AdminLayout"
import CustomerLayout from "./layout/CustomerLayout"
import { useAdminAuth } from "./auth/AdminAuthContext"
import { useCustomerAuth } from "./auth/CustomerAuthContext"

function AdminGuard({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAdminAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}

function CustomerGuard({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useCustomerAuth()
  const { isAuthenticated: adminAuthed } = useAdminAuth()
  if (!isAuthenticated && adminAuthed) return <Navigate to="/admin" replace />
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
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="tenants" element={<AdminTenants />} />
          <Route path="tenants/new" element={<VendorNew />} />
          <Route path="tenants/:tenantId/edit" element={<AdminTenantForm />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="renewals" element={<AdminRenewals />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route
          path="/app"
          element={
            <CustomerGuard>
              <CustomerLayout />
            </CustomerGuard>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="subscriptions" element={<CustomerSubscriptions />} />
          <Route path="renewals" element={<CustomerRenewals />} />
          <Route path="reports" element={<CustomerReports />} />
          <Route path="departments" element={<CustomerDepartments />} />
          <Route path="analytics" element={<CustomerAnalytics />} />
          <Route path="ai-insights" element={<CustomerAIInsights />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
