import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

type Alert = {
  id: string
  network_id: string
  alert_type: string
  severity: string
  trigger_reason: string | null
  status: string
  created_at: string
  care_networks: { network_name: string } | null
}

const PAGE_SIZE = 20

const SEVERITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    api
      .get<{ data: Alert[]; pagination: { count: number } }>(`/admin/alerts?${params}`)
      .then((res) => {
        setAlerts(res.data)
        setCount(res.pagination.count)
      })
      .finally(() => setLoading(false))
  }, [offset])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Open alerts</h1>
      <p className="mt-1 text-sm text-slate-500">Care-pattern alerts not yet resolved, across every network.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Network</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Raised</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <Link to={`/networks/${a.network_id}`} className="text-violet-700 hover:underline">
                    {a.care_networks?.network_name || a.network_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{a.alert_type}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLES[a.severity] || 'bg-slate-100 text-slate-600'}`}>
                    {a.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{a.status}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(a.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && alerts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No open alerts.
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
