import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { api } from '../lib/api'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { Badge } from '../components/Badge'

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

function severityBadge(severity: string) {
  if (severity === 'high') return <Badge variant="danger">High</Badge>
  if (severity === 'medium') return <Badge variant="warning">Medium</Badge>
  return <Badge variant="neutral">Low</Badge>
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
      <PageHeader title="Open alerts" subtitle="Care-pattern alerts not yet resolved, across every network." />

      <div className="overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Network</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Severity</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Raised</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link to={`/networks/${a.network_id}`} className="font-medium text-adlr-purple-deep hover:underline">
                    {a.care_networks?.network_name || a.network_id}
                  </Link>
                  {a.trigger_reason && <p className="mt-0.5 text-xs text-slate-400">{a.trigger_reason}</p>}
                </td>
                <td className="px-5 py-3 text-slate-600 capitalize">{a.alert_type.replace(/_/g, ' ')}</td>
                <td className="px-5 py-3">{severityBadge(a.severity)}</td>
                <td className="px-5 py-3 text-slate-600 capitalize">{a.status}</td>
                <td className="px-5 py-3 text-slate-400">{new Date(a.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && alerts.length === 0 && (
          <EmptyState icon={AlertTriangle} title="No open alerts" subtitle="Everything's quiet right now." />
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
