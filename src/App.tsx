// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"

// Real pages (these DO exist)
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Reports from "./pages/Reports"
import Approvals from "./pages/Approvals"

// Real pages
import Renewals from "./pages/Renewals"
import RenewalDetail from "./pages/RenewalDetail"

// Existing admin pages
import Vendors from "./pages/admin/Vendors"
import VendorNew from "./pages/admin/VendorNew"
import Settings from "./pages/admin/Settings"

// Placeholders (stubs for pages not built yet)
import { PlaceholderPage } from "./pages/_placeholders"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Core */}
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route
          path="/analytics"
          element={
            <PlaceholderPage
              title="Analytics Dashboard"
              subtitle="Usage, adoption, and performance metrics"
            />
          }
        />

        {/* Auth / selection */}
        <Route
          path="/login"
          element={<PlaceholderPage title="Login" subtitle="SSO + email login (demo stub)" />}
        />
        <Route
          path="/tenant-selection"
          element={<PlaceholderPage title="Tenant Selection" subtitle="Choose tenant and role" />}
        />

        {/* Setup */}
        <Route path="/company-setup" element={<PlaceholderPage title="Company Setup" />} />
        <Route path="/department-setup" element={<PlaceholderPage title="Department Setup" />} />
        <Route
          path="/connect-sources"
          element={
            <PlaceholderPage
              title="Connect Data Sources"
              subtitle="Google Sheets / CRM / ERP connectors"
            />
          }
        />
        <Route
          path="/sync-progress"
          element={<PlaceholderPage title="Sync Progress" subtitle="Live progress + error handling" />}
        />

        {/* Subscriptions */}
        <Route
          path="/subscriptions"
          element={
            <PlaceholderPage
              title="Subscriptions List"
              subtitle="Plans, seats, renewals, and actions"
            />
          }
        />
        <Route
          path="/subscriptions/detail"
          element={<PlaceholderPage title="Subscription Detail" subtitle="Reclaim, edit, audit trail" />}
        />

        {/* Users / identity */}
        <Route path="/users" element={<PlaceholderPage title="Users List" />} />
        <Route path="/users/profile" element={<PlaceholderPage title="User Profile" />} />
        <Route
          path="/identity-queue"
          element={
            <PlaceholderPage
              title="Identity Resolution Queue"
              subtitle="Merge/split identities + review actions"
            />
          }
        />
        <Route path="/departments" element={<PlaceholderPage title="Departments Overview" />} />

        {/* Vendors / admin onboarding (REAL) */}
        <Route path="/admin/vendors" element={<Vendors />} />
        <Route path="/admin/vendor-new" element={<VendorNew />} />
        <Route path="/admin/settings" element={<Settings />} />

        {/* Renewals (REAL) */}
        <Route path="/renewals" element={<Renewals />} />
        <Route path="/renewals/detail" element={<RenewalDetail />} />

        {/* Approvals (REAL) */}
        <Route path="/approvals" element={<Approvals />} />

        {/* Audit log (stub for now) */}
        <Route
          path="/audit-log"
          element={
            <PlaceholderPage
              title="Audit Log"
              subtitle="All actions are tracked here (demo log next)"
            />
          }
        />

        {/* Policies / settings */}
        <Route path="/tenant-settings" element={<PlaceholderPage title="Tenant Settings" />} />
        <Route
          path="/policies"
          element={<PlaceholderPage title="Policies" subtitle="Security + retention + data governance" />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  )
}
