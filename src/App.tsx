// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"

// Existing admin pages (keep if they exist in your repo)
import Vendors from "./pages/admin/Vendors"
import VendorNew from "./pages/admin/VendorNew"
import Settings from "./pages/admin/Settings"

// Placeholders (stubs for ALL other pages)
import { PlaceholderPage } from "./pages/_placeholders"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Core */}
        <Route path="/home" element={<PlaceholderPage title="Home" />} />
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" subtitle="Executive overview + drilldowns (demo-ready UI next)" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" subtitle="Saved reports + export flows" />} />
        <Route path="/analytics" element={<PlaceholderPage title="Analytics Dashboard" subtitle="Usage, adoption, and performance metrics" />} />

        {/* Auth / selection */}
        <Route path="/login" element={<PlaceholderPage title="Login" subtitle="SSO + email login (demo stub)" />} />
        <Route path="/tenant-selection" element={<PlaceholderPage title="Tenant Selection" subtitle="Choose tenant and role" />} />

        {/* Setup */}
        <Route path="/company-setup" element={<PlaceholderPage title="Company Setup" />} />
        <Route path="/department-setup" element={<PlaceholderPage title="Department Setup" />} />
        <Route path="/connect-sources" element={<PlaceholderPage title="Connect Data Sources" subtitle="Google Sheets / CRM / ERP connectors" />} />
        <Route path="/sync-progress" element={<PlaceholderPage title="Sync Progress" subtitle="Live progress + error handling" />} />

        {/* Subscriptions */}
        <Route path="/subscriptions" element={<PlaceholderPage title="Subscriptions List" subtitle="Plans, seats, renewals, and actions" />} />
        <Route path="/subscriptions/detail" element={<PlaceholderPage title="Subscription Detail" subtitle="Reclaim, edit, audit trail" />} />

        {/* Users / identity */}
        <Route path="/users" element={<PlaceholderPage title="Users List" />} />
        <Route path="/users/profile" element={<PlaceholderPage title="User Profile" />} />
        <Route path="/identity-queue" element={<PlaceholderPage title="Identity Resolution Queue" subtitle="Merge/split identities + review actions" />} />
        <Route path="/departments" element={<PlaceholderPage title="Departments Overview" />} />

        {/* Vendors / admin onboarding (real pages) */}
        <Route path="/admin/vendors" element={<Vendors />} />
        <Route path="/admin/vendor-new" element={<VendorNew />} />
        <Route path="/admin/settings" element={<Settings />} />

        {/* Renewals / approvals / audit */}
        <Route path="/renewals" element={<PlaceholderPage title="Renewals Dashboard" />} />
        <Route path="/renewals/detail" element={<PlaceholderPage title="Renewal Detail" />} />
        <Route path="/approvals" element={<PlaceholderPage title="Approval Center" subtitle="Approvals, SLA, escalations" />} />
        <Route path="/audit-log" element={<PlaceholderPage title="Audit Log" subtitle="All actions are tracked here (demo log next)" />} />

        {/* Policies / settings */}
        <Route path="/tenant-settings" element={<PlaceholderPage title="Tenant Settings" />} />
        <Route path="/policies" element={<PlaceholderPage title="Policies" subtitle="Security + retention + data governance" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  )
}
