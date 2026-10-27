import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading…</div>
  }

  if (status === 'signed-out') {
    return <Navigate to="/login" replace />
  }

  if (status === 'not-admin') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-slate-800">Not authorized</p>
        <p className="text-sm text-slate-500">This account doesn't have ADLr Admin access.</p>
      </div>
    )
  }

  return <>{children}</>
}
