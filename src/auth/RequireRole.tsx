import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import type { Role, SessionUser } from "./auth"

type Props = {
  user: SessionUser
  allow: Role[]
  children: ReactNode
}

export default function RequireRole({ user, allow, children }: Props) {
  if (!allow.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
