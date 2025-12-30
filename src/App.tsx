// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"

// Pages (adjust paths if your files differ)
import AdminHome from "./pages/admin/AdminHome"
import Vendors from "./pages/admin/Vendors"
import VendorNew from "./pages/admin/VendorNew"

// If you have these pages, keep them; if not, remove the imports + routes.
// import Home from "./pages/Home"
// import Dashboard from "./pages/Dashboard"
// import Reports from "./pages/Reports"
// import Settings from "./pages/admin/Settings"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Default: if someone opens /# (blank), send them to Admin home */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/vendors" element={<Vendors />} />
        <Route path="/admin/vendor-new" element={<VendorNew />} />

        {/* Optional routes - uncomment only if these pages exist */}
        {/* <Route path="/home" element={<Home />} /> */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/reports" element={<Reports />} /> */}
        {/* <Route path="/settings" element={<Settings />} /> */}

        {/* Fallback: anything unknown goes to Admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </HashRouter>
  )
}
