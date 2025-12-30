import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Vendors from "./pages/admin/Vendors"
import VendorNew from "./pages/admin/VendorNew"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/vendors" />} />
        <Route path="/admin/vendors" element={<Vendors />} />
        <Route path="/admin/vendor-new" element={<VendorNew />} />
      </Routes>
    </BrowserRouter>
  )
}
