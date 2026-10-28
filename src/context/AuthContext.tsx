import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { api, ApiError } from '../lib/api'

type AuthStatus = 'loading' | 'signed-out' | 'not-admin' | 'admin' | 'error'

type AuthContextValue = {
  status: AuthStatus
  session: Session | null
  error: string | null
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function checkAdminAccess(nextSession: Session | null) {
    if (!nextSession) {
      setStatus('signed-out')
      return
    }
    try {
      await api.get('/admin/dashboard/stats')
      setStatus('admin')
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setStatus('not-admin')
      } else if (err instanceof ApiError) {
        // Signed in, but something other than "not an admin" went wrong
        // (401 = bad/expired token, 5xx = server issue, etc). Surface it
        // instead of silently bouncing back to the login screen.
        setError(err.message)
        setStatus('error')
      } else {
        // Not an ApiError at all — fetch itself failed (CORS, network down,
        // DNS, wrong VITE_API_URL). This is the case that used to vanish
        // with zero feedback.
        setError(
          `Could not reach the API at ${import.meta.env.VITE_API_URL}. This is usually a CORS or network issue — check the browser console's Network tab for the exact failure.`
        )
        setStatus('error')
      }
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      checkAdminAccess(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      checkAdminAccess(nextSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ status, session, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
