import type { NavSection } from "../../layout/AppShell"

export const customerNav: NavSection[] = [
  {
    label: "Portal",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: "📊" },
      { to: "/app/reports", label: "Reports", icon: "🗒" },
      { to: "/app/departments", label: "Departments", icon: "🏢" },
      { to: "/app/analytics", label: "Analytics", icon: "📈" },
      { to: "/app/ai-insights", label: "AI Insights", icon: "✨" },
      { to: "/app/settings", label: "Settings", icon: "⚙" },
    ],
  },
]
