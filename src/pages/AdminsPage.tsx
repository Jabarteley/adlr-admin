import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'

type Admin = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  created_at: string
}

export function AdminsPage() {
  const { session } = useAuth()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    api
      .get<{ data: Admin[] }>('/admin/admins')
      .then((res) => setAdmins(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      await api.post('/admin/admins', form)
      setForm({ email: '', password: '', first_name: '', last_name: '' })
      load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not create admin.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Revoke admin access for this account?')) return
    setBusyId(id)
    try {
      await api.delete(`/admin/admins/${id}`)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Admins</h1>
      <p className="mt-1 text-sm text-slate-500">Accounts with access to this panel.</p>

      <form onSubmit={handleCreate} className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Add a new admin</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>
        {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create admin'}
        </button>
        <p className="mt-2 text-xs text-slate-400">
          If the email already has an ADLr account, it's simply flagged as admin. Otherwise a new account is created
          with the password above.
        </p>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Since</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-slate-800">
                  {`${a.first_name || ''} ${a.last_name || ''}`.trim() || '—'}
                  {a.id === session?.user.id && (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                      YOU
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{a.email}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(a.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  {a.id !== session?.user.id && (
                    <button
                      disabled={busyId === a.id}
                      onClick={() => handleRevoke(a.id)}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && admins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No admins yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
