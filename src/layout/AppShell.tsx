// src/layout/AppShell.tsx
import type { ReactNode } from "react"
import AppLayout from "./AppLayout"

type Props = {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export default function AppShell({ title, subtitle, actions, children }: Props) {
  return (
    <AppLayout>
      <div style={wrap}>
        <div style={head}>
          <div style={headLeft}>
            <div style={titleStyle}>{title}</div>
            {subtitle ? <div style={subtitleStyle}>{subtitle}</div> : null}
          </div>

          {actions ? <div style={headRight}>{actions}</div> : null}
        </div>

        <div style={body}>{children}</div>
      </div>
    </AppLayout>
  )
}

/* Styles */
const wrap: React.CSSProperties = {
  padding: 22,
  maxWidth: 1200,
}

const head: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 14,
  paddingBottom: 14,
  borderBottom: "1px solid rgba(15,23,42,0.08)",
  marginBottom: 16,
}

const headLeft: React.CSSProperties = {
  minWidth: 0,
}

const headRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
}

const titleStyle: React.CSSProperties = {
  fontSize: 40,
  fontWeight: 900,
  letterSpacing: -0.6,
  color: "rgba(15,23,42,0.92)",
  lineHeight: 1.05,
}

const subtitleStyle: React.CSSProperties = {
  marginTop: 8,
  color: "rgba(15,23,42,0.6)",
  fontSize: 16,
}

const body: React.CSSProperties = {
  marginTop: 14,
}
