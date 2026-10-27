import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'

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
  const [detail, setDetail] = useState<NetworkDetail | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!networkId) return
    api.get<{ data: NetworkDetail }>(`/admin/networks/${networkId}`).then((res) => setDetail(res.data))
  }, [networkId])

  useEffect(() => {
    load()
  }, [load])

  async function handleRemove(membershipId: string) {
    if (!networkId) return
    if (!confirm('Remove this member from the network? They will lose access immediately.')) return
    setBusyId(membershipId)
    try {
      await api.delete(`/admin/networks/${networkId}/members/${membershipId}`)
      load()
    } finally {
      setBusyId(null)
    }
  }

  if (!detail) return <p className="text-sm text-slate-500">Loading…</p>

  const { network, members, invites } = detail

  return (
    <div>
      <Link to="/networks" className="text-sm text-violet-700 hover:underline">
        ← Back to networks
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-slate-900">{network.network_name}</h1>
      <p className="text-sm text-slate-500">
        {network.network_type || 'Network'} · {network.status || 'active'} · created{' '}
        {new Date(network.created_at).toLocaleDateString()}
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Members</h2>
      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3">
                  <Link to={`/users/${m.user_id}`} className="text-violet-700 hover:underline">
                    {`${m.profiles?.first_name || ''} ${m.profiles?.last_name || ''}`.trim() ||
                      m.profiles?.email ||
                      m.user_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{m.role_key}</td>
                <td className="px-4 py-3 text-slate-600">{m.is_active ? m.invitation_status : 'removed'}</td>
                <td className="px-4 py-3 text-right">
                  {m.is_active && (
                    <button
                      disabled={busyId === m.id}
                      onClick={() => handleRemove(m.id)}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No members.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Invites</h2>
      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invites.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3 font-mono text-slate-800">{i.invite_code}</td>
                <td className="px-4 py-3 text-slate-600">{i.role_key}</td>
                <td className="px-4 py-3 text-slate-600">{i.invitation_status}</td>
                <td className="px-4 py-3 text-slate-400">
                  {i.expires_at ? new Date(i.expires_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {invites.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No invites.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
