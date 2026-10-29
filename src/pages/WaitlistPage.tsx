import { useEffect, useState } from 'react'
import { Search, ListChecks } from 'lucide-react'
import { api } from '../lib/api'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'

type WaitlistRow = {
  id: string
  name: string | null
  email: string
  created_at: string
  notified_at: string | null
}

const PAGE_SIZE = 20

export function WaitlistPage() {
  const [rows, setRows] = useState<WaitlistRow[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    if (search) params.set('search', search)

    api
      .get<{ data: WaitlistRow[]; pagination: { count: number } }>(`/admin/waitlist?${params}`)
      .then((res) => {
        setRows(res.data)
        setCount(res.pagination.count)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [offset, search])

  return (
    <div>
      <PageHeader title="Waitlist" subtitle={`${count} signups from withtuora.com`} />

      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email…"
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
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80">
                <td className="px-5 py-3 font-medium text-slate-900">{r.name || '(no name)'}</td>
                <td className="px-5 py-3 text-slate-600">{r.email}</td>
                <td className="px-5 py-3 text-slate-400">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <EmptyState icon={ListChecks} title="No waitlist signups yet" subtitle="They'll show up here as soon as someone joins." />
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
    </div>
  )
}
