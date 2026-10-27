import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Share2, ChevronRight, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { Badge } from '../components/Badge'
import { ConfirmDialog } from '../components/ConfirmDialog'

type NetworkRow = {
  id: string
  network_name: string
  network_type: string | null
  status: string | null
  created_at: string
}

const PAGE_SIZE = 20

export function NetworksPage() {
  const [networks, setNetworks] = useState<NetworkRow[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<NetworkRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (search) params.set('search', search)

    api
      .get<{ data: NetworkRow[]; pagination: { count: number } }>(`/admin/networks?${params}`)
      .then((res) => {
        setNetworks(res.data)
        setCount(res.pagination.count)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [offset, search])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/admin/networks/${deleteTarget.id}`)
      setDeleteTarget(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Networks" subtitle={`${count} total`} />

      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by network name…"
          value={search}
          onChange={(e) => {
            setOffset(0)
            setSearch(e.target.value)
          }}
          className="w-full rounded-lg border border-adlr-border bg-white py-2 pl-9 pr-3 text-sm focus:border-adlr-purple focus:outline-none focus:ring-2 focus:ring-adlr-purple-light"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Network</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {networks.map((n) => (
              <tr key={n.id} className="group hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link to={`/networks/${n.id}`} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-adlr-purple-light text-adlr-purple-deep">
                      <Share2 size={15} />
                    </div>
                    <span className="font-medium text-slate-900 group-hover:text-adlr-purple-deep">
                      {n.network_name}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600 capitalize">{(n.network_type || '—').replace(/_/g, ' ')}</td>
                <td className="px-5 py-3">
                  <Badge variant={n.status === 'active' || !n.status ? 'success' : 'neutral'}>
                    {n.status || 'active'}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-slate-400">{new Date(n.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setDeleteTarget(n)}
                      title="Delete network"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-adlr-danger-light hover:text-adlr-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                    <Link
                      to={`/networks/${n.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && networks.length === 0 && (
          <EmptyState icon={Share2} title="No networks found" subtitle="Try a different search." />
        )}
      </div>

      {count > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm text-adlr-muted">
          <span>
            {count === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, count)} of {count}
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="rounded-lg border border-adlr-border px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={offset + PAGE_SIZE >= count}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="rounded-lg border border-adlr-border px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this network?"
          description="This permanently deletes the network and everything under it — tasks, care plans, alerts, consent records, members, and invites. This cannot be undone."
          confirmWord={deleteTarget.network_name}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
