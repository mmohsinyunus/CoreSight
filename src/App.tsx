import { HashRouter, Routes, Route, Navigate } from "react-router-dom"

import AdminHome from "./pages/admin/AdminHome"
import Vendors from "./pages/admin/Vendors"
import VendorNew from "./pages/admin/VendorNew"
import Settings from "./pages/admin/Settings"

import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Reports from "./pages/Reports"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />

        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/vendors" element={<Vendors />} />
        <Route path="/admin/vendor-new" element={<VendorNew />} />
        <Route path="/admin/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  )
}
