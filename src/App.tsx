// src/App.tsx
import type { ReactElement } from "react"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import Landing from "./pages/Landing"
import AdminLogin from "./pages/AdminLogin"
import CustomerLogin from "./pages/CustomerLogin.tsx"
import EmployeeLogin from "./pages/EmployeeLogin"
import AdminTenants from "./pages/admin/AdminTenants"
import AdminTenantForm from "./pages/admin/AdminTenantForm"
import AdminTenantView from "./pages/admin/AdminTenantView"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminSettings from "./pages/admin/AdminSettings"
import VendorNew from "./pages/admin/VendorNew"
import AdminHome from "./pages/admin/AdminHome"
import AdminSubscriptions from "./pages/admin/AdminSubscriptions"
import AdminRenewals from "./pages/admin/AdminRenewals"
import AdminAnalytics from "./pages/admin/AdminAnalytics"
import AdminRequests from "./pages/admin/AdminRequests"
import AdminAudit from "./pages/admin/AdminAudit"
import CustomerDashboard from "./pages/customer/Dashboard"
import CustomerReports from "./pages/customer/Reports"
import ReportsUsage from "./pages/customer/ReportsUsage"
import ReportsSubscriptionHealth from "./pages/customer/ReportsSubscriptionHealth"
import ReportsDepartments from "./pages/customer/ReportsDepartments"
import CustomerDepartments from "./pages/customer/Departments"
import CustomerAnalytics from "./pages/customer/Analytics"
import CustomerAIInsights from "./pages/customer/AIInsights"
import CustomerSettings from "./pages/customer/Settings"
import CustomerSubscriptions from "./pages/customer/Subscriptions"
import CustomerRenewals from "./pages/customer/Renewals"
import CustomerUsers from "./pages/customer/Users"
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

function RequireCustomerPrimary({ children }: { children: ReactElement }) {
  const { user } = useCustomerAuth()
  if (user?.role === "CUSTOMER_PRIMARY") return children
  return <Navigate to="/app/dashboard" replace state={{ message: "You don’t have access to this section." }} />
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
          <Route path="tenants/:tenantId" element={<AdminTenantView />} />
          <Route path="tenants/:tenantId/edit" element={<AdminTenantForm />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="renewals" element={<AdminRenewals />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/employee/login" element={<EmployeeLogin />} />
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
          <Route
            path="subscriptions"
            element={
              <RequireCustomerPrimary>
                <CustomerSubscriptions />
              </RequireCustomerPrimary>
            }
          />
          <Route
            path="renewals"
            element={
              <RequireCustomerPrimary>
                <CustomerRenewals />
              </RequireCustomerPrimary>
            }
          />
          <Route path="reports" element={<CustomerReports />} />
          <Route path="reports/usage" element={<ReportsUsage />} />
          <Route path="reports/subscription-health" element={<ReportsSubscriptionHealth />} />
          <Route path="reports/departments" element={<ReportsDepartments />} />
          <Route path="departments" element={<CustomerDepartments />} />
          <Route path="analytics" element={<CustomerAnalytics />} />
          <Route path="ai-insights" element={<CustomerAIInsights />} />
          <Route
            path="settings"
            element={
              <RequireCustomerPrimary>
                <CustomerSettings />
              </RequireCustomerPrimary>
            }
          />
          <Route
            path="users"
            element={
              <RequireCustomerPrimary>
                <CustomerUsers />
              </RequireCustomerPrimary>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
