import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-adlr-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-adlr-purple-light border-t-adlr-purple" />
      </div>
    )
  }

  if (status === 'signed-out') {
    return <Navigate to="/login" replace />
  }

  if (status === 'not-admin') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-adlr-bg px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-adlr-danger-light">
          <ShieldOff size={22} className="text-adlr-danger" />
        </div>
        <p className="text-lg font-bold text-adlr-text">Not authorized</p>
        <p className="max-w-xs text-sm text-adlr-muted">This account doesn't have ADLr Admin access.</p>
      </div>
    )
  }

  return <>{children}</>
}
