import { useEffect, useState, type FormEvent } from 'react'
import { UserCog, UserPlus } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { ConfirmDialog } from '../components/ConfirmDialog'

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
  const [revokeTarget, setRevokeTarget] = useState<Admin | null>(null)
  const [revoking, setRevoking] = useState(false)

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

  async function handleRevoke() {
    if (!revokeTarget) return
    setRevoking(true)
    try {
      await api.delete(`/admin/admins/${revokeTarget.id}`)
      setRevokeTarget(null)
      load()
    } finally {
      setRevoking(false)
    }
  }

  return (
    <div>
      <PageHeader title="Admins" subtitle="Accounts with access to this panel." />

      <form onSubmit={handleCreate} className="rounded-2xl border border-adlr-border bg-white p-6 shadow-sm shadow-slate-100/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-adlr-purple-light text-adlr-purple-deep">
            <UserPlus size={15} />
          </div>
          <h2 className="text-sm font-bold text-adlr-text">Add a new admin</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-adlr-border px-3 py-2 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-lg border border-adlr-border px-3 py-2 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
          />
          <input
            type="text"
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="rounded-lg border border-adlr-border px-3 py-2 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
          />
          <input
            type="text"
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="rounded-lg border border-adlr-border px-3 py-2 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
          />
        </div>
        {formError && <p className="mt-3 text-sm text-adlr-danger">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-lg bg-gradient-to-br from-adlr-purple to-adlr-purple-deep px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create admin'}
        </button>
        <p className="mt-2 text-xs text-adlr-muted">
          If the email already has an Tuora account, it's simply flagged as admin. Otherwise a new account is created
          with the password above.
        </p>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Since</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((a) => {
              const name = `${a.first_name || ''} ${a.last_name || ''}`.trim() || '—'
              const isYou = a.id === session?.user.id
              return (
                <tr key={a.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={name} size="sm" />
                      <div>
                        <p className="font-medium text-slate-800">
                          {name}
                          {isYou && (
                            <span className="ml-2 align-middle">
                              <Badge variant="neutral">You</Badge>
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    {!isYou && (
                      <button
                        onClick={() => setRevokeTarget(a)}
                        className="text-xs font-medium text-adlr-danger hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && admins.length === 0 && <EmptyState icon={UserCog} title="No admins yet" />}
      </div>

      {revokeTarget && (
        <ConfirmDialog
          title="Revoke admin access?"
          description={`${revokeTarget.email} will immediately lose access to this panel. Their regular Tuora account is unaffected.`}
          confirmWord="revoke"
          confirmLabel="Revoke"
          busy={revoking}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}
    </div>
  )
}
