import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

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

  useEffect(() => {
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
  }, [offset, search])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Networks</h1>

      <input
        type="text"
        placeholder="Search by network name…"
        value={search}
        onChange={(e) => {
          setOffset(0)
          setSearch(e.target.value)
        }}
        className="mt-4 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
      />

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Network</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {networks.map((n) => (
              <tr key={n.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/networks/${n.id}`} className="font-medium text-violet-700 hover:underline">
                    {n.network_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{n.network_type || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{n.status || '—'}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(n.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && networks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No networks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          {count === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, count)} of {count}
        </span>
        <div className="flex gap-2">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            disabled={offset + PAGE_SIZE >= count}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
