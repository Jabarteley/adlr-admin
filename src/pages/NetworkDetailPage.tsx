import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Users, Mail, Trash2, UserMinus } from 'lucide-react'
import { api } from '../lib/api'
import { Avatar } from '../components/Avatar'
import { Badge } from '../components/Badge'
import { ConfirmDialog } from '../components/ConfirmDialog'

type NetworkDetail = {
  network: { id: string; network_name: string; network_type: string | null; status: string | null; created_at: string }
  members: {
    id: string
    user_id: string
    role_key: string
    is_active: boolean
    invitation_status: string
    profiles: { first_name: string | null; last_name: string | null; email: string | null } | null
  }[]
  invites: {
    id: string
    invite_code: string
    role_key: string
    invitation_status: string
    expires_at: string | null
    created_at: string
  }[]
}

export function NetworkDetailPage() {
  const { networkId } = useParams<{ networkId: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<NetworkDetail | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmDeleteNetwork, setConfirmDeleteNetwork] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<NetworkDetail['members'][number] | null>(null)
  const [deletingNetwork, setDeletingNetwork] = useState(false)

  const load = useCallback(() => {
    if (!networkId) return
    api.get<{ data: NetworkDetail }>(`/admin/networks/${networkId}`).then((res) => setDetail(res.data))
  }, [networkId])

  useEffect(() => {
    load()
  }, [load])

  async function handleRemoveMember() {
    if (!networkId || !removeTarget) return
    setBusyId(removeTarget.id)
    try {
      await api.delete(`/admin/networks/${networkId}/members/${removeTarget.id}`)
      setRemoveTarget(null)
      load()
    } finally {
      setBusyId(null)
    }
  }

  async function handleDeleteNetwork() {
    if (!networkId) return
    setDeletingNetwork(true)
    try {
      await api.delete(`/admin/networks/${networkId}`)
      navigate('/networks')
    } finally {
      setDeletingNetwork(false)
    }
  }

  if (!detail) return <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />

  const { network, members, invites } = detail

  return (
    <div>
      <Link to="/networks" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-adlr-muted hover:text-adlr-text">
        <ArrowLeft size={15} /> Back to networks
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-adlr-purple-light text-adlr-purple-deep">
            <Share2 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-adlr-text">{network.network_name}</h1>
            <p className="text-sm text-adlr-muted">
              {(network.network_type || 'Network').replace(/_/g, ' ')} · created{' '}
              {new Date(network.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => setConfirmDeleteNetwork(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-adlr-danger-light bg-white px-4 py-2 text-sm font-medium text-adlr-danger hover:bg-adlr-danger-light"
        >
          <Trash2 size={14} /> Delete network
        </button>
      </div>

      <h2 className="mt-8 flex items-center gap-2 text-lg font-bold text-adlr-text">
        <Users size={17} className="text-adlr-muted" /> Members
      </h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => {
              const name =
                `${m.profiles?.first_name || ''} ${m.profiles?.last_name || ''}`.trim() || m.profiles?.email || m.user_id
              return (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3">
                    <Link to={`/users/${m.user_id}`} className="flex items-center gap-3">
                      <Avatar name={name} size="sm" />
                      <span className="font-medium text-adlr-purple-deep hover:underline">{name}</span>
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
                  <td className="px-5 py-3 text-right">
                    {m.is_active && (
                      <button
                        disabled={busyId === m.id}
                        onClick={() => setRemoveTarget(m)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-adlr-danger hover:underline disabled:opacity-50"
                      >
                        <UserMinus size={12} /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                  No members.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 flex items-center gap-2 text-lg font-bold text-adlr-text">
        <Mail size={17} className="text-adlr-muted" /> Invites
      </h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invites.map((i) => (
              <tr key={i.id} className="hover:bg-slate-50/80">
                <td className="px-5 py-3 font-mono text-slate-800">{i.invite_code}</td>
                <td className="px-5 py-3 text-slate-600 capitalize">{i.role_key.replace(/_/g, ' ')}</td>
                <td className="px-5 py-3">
                  <Badge variant={i.invitation_status === 'accepted' ? 'success' : 'neutral'}>
                    {i.invitation_status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {i.expires_at ? new Date(i.expires_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {invites.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                  No invites.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {removeTarget && (
        <ConfirmDialog
          title="Remove this member?"
          description="They will immediately lose access to this network. This does not delete their account."
          confirmWord="remove"
          confirmLabel="Remove"
          busy={busyId === removeTarget.id}
          onConfirm={handleRemoveMember}
          onCancel={() => setRemoveTarget(null)}
        />
      )}

      {confirmDeleteNetwork && (
        <ConfirmDialog
          title="Delete this network?"
          description="This permanently deletes the network and everything under it — tasks, care plans, alerts, consent records, members, and invites. This cannot be undone."
          confirmWord={network.network_name}
          busy={deletingNetwork}
          onConfirm={handleDeleteNetwork}
          onCancel={() => setConfirmDeleteNetwork(false)}
        />
      )}
    </div>
  )
}
