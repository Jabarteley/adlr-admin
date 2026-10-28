import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldOff, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, error, signOut } = useAuth()

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

  if (status === 'error') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-adlr-bg px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-adlr-warning-light">
          <AlertTriangle size={22} className="text-adlr-warning" />
        </div>
        <p className="text-lg font-bold text-adlr-text">Couldn't verify admin access</p>
        <p className="max-w-md text-sm text-adlr-muted">{error}</p>
        <button
          onClick={() => signOut()}
          className="mt-2 rounded-lg border border-adlr-border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign out and try again
        </button>
      </div>
    )
  }

  if (status === 'not-admin') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-adlr-bg px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-adlr-danger-light">
          <ShieldOff size={22} className="text-adlr-danger" />
        </div>
        <p className="text-lg font-bold text-adlr-text">Not authorized</p>
        <p className="max-w-xs text-sm text-adlr-muted">This account doesn't have Tuora Admin access.</p>
      </div>
    )
  }

  return <>{children}</>
}
