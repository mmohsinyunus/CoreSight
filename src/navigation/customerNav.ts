import type { NavItem } from "./types"

export const customerNav: NavItem[] = [
  { key: "customer-dashboard", label: "Dashboard", icon: "📊", to: "/app/dashboard" },
  { key: "customer-reports", label: "Reports", icon: "🗒", to: "/app/reports" },
  { key: "customer-departments", label: "Departments", icon: "🏢", to: "/app/departments" },
  { key: "customer-subscriptions", label: "Subscriptions", icon: "🧾", to: "/app/subscriptions" },
  { key: "customer-renewals", label: "Renewals", icon: "♻️", to: "/app/renewals" },
  { key: "customer-analytics", label: "Analytics", icon: "📈", to: "/app/analytics" },
  { key: "customer-ai", label: "AI Insights", icon: "✨", to: "/app/ai-insights" },
  { key: "customer-settings", label: "Settings", icon: "⚙", to: "/app/settings" },
]
