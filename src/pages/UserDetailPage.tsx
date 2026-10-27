import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Mail, Undo2, Trash2, Share2 } from 'lucide-react'
import { api } from '../lib/api'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { ConfirmDialog } from '../components/ConfirmDialog'

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
  const navigate = useNavigate()
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  async function handleDelete() {
    setBusy(true)
    try {
      await api.delete(`/admin/users/${userId}`)
      navigate('/users')
    } finally {
      setBusy(false)
    }
  }

  if (!detail) return <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />

  const { profile, memberships, push_tokens } = detail
  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '(no name)'

  return (
    <div>
      <Link to="/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-adlr-muted hover:text-adlr-text">
        <ArrowLeft size={15} /> Back to users
      </Link>

      <div className="flex items-center gap-4">
        <Avatar name={name} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-adlr-text">{name}</h1>
            {profile.is_admin && <Badge variant="purple">Admin</Badge>}
          </div>
          <p className="text-sm text-adlr-muted">{profile.email}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 rounded-2xl border border-adlr-border bg-white p-6 text-sm shadow-sm shadow-slate-100/50 sm:grid-cols-3">
        <Field label="Role" value={profile.role} />
        <Field label="Account mode" value={profile.account_mode} />
        <Field
          label="Status"
          value={
            profile.account_status === 'pending_deletion' ? (
              <Badge variant="warning">Pending deletion</Badge>
            ) : (
              <Badge variant="success">Active</Badge>
            )
          }
        />
        <Field label="Phone" value={profile.phone} />
        <Field label="Timezone" value={profile.timezone} />
        <Field label="Joined" value={new Date(profile.created_at).toLocaleDateString()} />
        <Field label="Push tokens" value={String(push_tokens.length)} />
      </div>

      {profile.account_status === 'pending_deletion' && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-adlr-warning-light p-4 text-sm text-amber-900">
          <Undo2 size={18} className="mt-0.5 shrink-0" />
          <p>
            Deletion requested {new Date(profile.deletion_requested_at!).toLocaleDateString()}, scheduled for{' '}
            {new Date(profile.scheduled_deletion_date!).toLocaleDateString()}.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={() => runAction(() => api.post(`/admin/users/${userId}/reset-password`))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-adlr-border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <KeyRound size={14} /> Send password reset
        </button>
        <button
          disabled={busy}
          onClick={() => runAction(() => api.post(`/admin/users/${userId}/resend-welcome-email`))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-adlr-border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <Mail size={14} /> Resend welcome email
        </button>
        {profile.account_status === 'pending_deletion' && (
          <button
            disabled={busy}
            onClick={() => runAction(() => api.post(`/admin/users/${userId}/cancel-deletion`))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-adlr-success-light px-4 py-2 text-sm font-medium text-adlr-success hover:bg-emerald-100 disabled:opacity-50"
          >
            <Undo2 size={14} /> Cancel deletion
          </button>
        )}
        <button
          disabled={busy}
          onClick={() => setConfirmDelete(true)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-adlr-danger-light bg-white px-4 py-2 text-sm font-medium text-adlr-danger hover:bg-adlr-danger-light disabled:opacity-50"
        >
          <Trash2 size={14} /> Delete user
        </button>
      </div>

      {actionMessage && <p className="mt-3 text-sm text-adlr-muted">{actionMessage}</p>}

      <h2 className="mt-8 flex items-center gap-2 text-lg font-bold text-adlr-text">
        <Share2 size={17} className="text-adlr-muted" /> Network memberships
      </h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Network</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {memberships.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link to={`/networks/${m.network_id}`} className="font-medium text-adlr-purple-deep hover:underline">
                    {m.care_networks?.network_name || m.network_id}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600 capitalize">{m.role_key.replace(/_/g, ' ')}</td>
                <td className="px-5 py-3">
                  {m.is_active ? (
                    <Badge variant={m.invitation_status === 'accepted' ? 'success' : 'warning'}>
                      {m.invitation_status}
                    </Badge>
                  ) : (
                    <Badge variant="neutral">Removed</Badge>
                  )}
                </td>
              </tr>
            ))}
            {memberships.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-400">
                  No network memberships.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this user?"
          description="This permanently deletes the account, every network they own (and all its data), and removes their memberships elsewhere. This cannot be undone."
          confirmWord={profile.email || 'delete'}
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-adlr-muted">{label}</p>
      <p className="mt-0.5 text-slate-800">{value || '—'}</p>
    </div>
  )
}
