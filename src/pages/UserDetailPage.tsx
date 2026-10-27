import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'

type UserDetail = {
  profile: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
    role: string | null
    account_mode: string | null
    account_status: string | null
    is_admin: boolean
    timezone: string | null
    created_at: string
    deletion_requested_at: string | null
    scheduled_deletion_date: string | null
    deleted_at: string | null
  }
  memberships: {
    id: string
    network_id: string
    role_key: string
    is_active: boolean
    invitation_status: string
    care_networks: { network_name: string } | null
  }[]
  push_tokens: { push_token: string; updated_at: string }[]
}

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    if (!userId) return
    api.get<{ data: UserDetail }>(`/admin/users/${userId}`).then((res) => setDetail(res.data))
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  async function runAction(action: () => Promise<{ message: string }>) {
    setBusy(true)
    setActionMessage(null)
    try {
      const res = await action()
      setActionMessage(res.message)
      load()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setBusy(false)
    }
  }

  if (!detail) return <p className="text-sm text-slate-500">Loading…</p>

  const { profile, memberships, push_tokens } = detail
  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '(no name)'

  return (
    <div>
      <Link to="/users" className="text-sm text-violet-700 hover:underline">
        ← Back to users
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-slate-900">{name}</h1>
      <p className="text-sm text-slate-500">{profile.email}</p>

      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 rounded-xl border border-slate-200 bg-white p-5 text-sm sm:grid-cols-3">
        <Field label="Role" value={profile.role} />
        <Field label="Account mode" value={profile.account_mode} />
        <Field label="Status" value={profile.account_status || 'active'} />
        <Field label="Phone" value={profile.phone} />
        <Field label="Timezone" value={profile.timezone} />
        <Field label="Joined" value={new Date(profile.created_at).toLocaleDateString()} />
        <Field label="Admin" value={profile.is_admin ? 'Yes' : 'No'} />
        <Field label="Push tokens" value={String(push_tokens.length)} />
      </div>

      {profile.account_status === 'pending_deletion' && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Deletion requested {new Date(profile.deletion_requested_at!).toLocaleDateString()}, scheduled for{' '}
          {new Date(profile.scheduled_deletion_date!).toLocaleDateString()}.
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          disabled={busy}
          onClick={() => runAction(() => api.post(`/admin/users/${userId}/reset-password`))}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          Send password reset
        </button>
        <button
          disabled={busy}
          onClick={() => runAction(() => api.post(`/admin/users/${userId}/resend-welcome-email`))}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          Resend welcome email
        </button>
        {profile.account_status === 'pending_deletion' && (
          <button
            disabled={busy}
            onClick={() => runAction(() => api.post(`/admin/users/${userId}/cancel-deletion`))}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            Cancel deletion
          </button>
        )}
      </div>

      {actionMessage && <p className="mt-3 text-sm text-slate-600">{actionMessage}</p>}

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Network memberships</h2>
      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Network</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {memberships.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3">
                  <Link to={`/networks/${m.network_id}`} className="text-violet-700 hover:underline">
                    {m.care_networks?.network_name || m.network_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{m.role_key}</td>
                <td className="px-4 py-3 text-slate-600">
                  {m.is_active ? m.invitation_status : 'removed'}
                </td>
              </tr>
            ))}
            {memberships.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  No network memberships.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="text-slate-800">{value || '—'}</p>
    </div>
  )
}
