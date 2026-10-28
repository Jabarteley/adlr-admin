import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { status, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (status === 'admin' || status === 'not-admin' || status === 'error') {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const message = await signIn(email, password)
    if (message) setError(message)
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-adlr-lavender via-adlr-bg to-white px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-adlr-border bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-adlr-purple to-adlr-purple-deep text-lg font-extrabold text-white">
          T
        </div>
        <h1 className="mt-4 text-xl font-bold text-adlr-text">Tuora Admin</h1>
        <p className="mt-1 text-sm text-adlr-muted">Sign in with your admin account.</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-adlr-border px-3 py-2 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-adlr-border px-3 py-2 pr-10 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {error && <p className="mt-3 text-sm text-adlr-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-gradient-to-br from-adlr-purple to-adlr-purple-deep py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
