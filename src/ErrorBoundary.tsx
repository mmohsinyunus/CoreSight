import type { ReactNode } from "react"
import React from "react"

export default class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "sans-serif" }}>
          <h2>CoreSight crashed</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
