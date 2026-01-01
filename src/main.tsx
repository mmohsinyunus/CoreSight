// src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { AdminAuthProvider } from "./auth/AdminAuthContext"
import { CustomerAuthProvider } from "./auth/CustomerAuthContext"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminAuthProvider>
      <CustomerAuthProvider>
        <App />
      </CustomerAuthProvider>
    </AdminAuthProvider>
  </React.StrictMode>,
)
