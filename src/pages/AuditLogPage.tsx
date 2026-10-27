import { useEffect, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { api } from '../lib/api'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { Avatar } from '../components/Avatar'

type AuditLog = {
  id: string
  actor_user_id: string | null
  action_type: string
  object_type: string | null
  object_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  profiles: { first_name: string | null; last_name: string | null; email: string | null } | null
}

const PAGE_SIZE = 30

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    api
      .get<{ data: AuditLog[]; pagination: { count: number } }>(`/admin/audit-logs?${params}`)
      .then((res) => {
        setLogs(res.data)
        setCount(res.pagination.count)
      })
      .finally(() => setLoading(false))
  }, [offset])

  return (
    <div>
      <PageHeader title="Audit log" subtitle="Every recorded action across the system, most recent first." />

      <div className="overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Actor</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Object</th>
              <th className="px-5 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => {
              const actorName = log.profiles
                ? `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim() || log.profiles.email || 'unknown'
                : 'system'
              return (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={actorName} size="sm" />
                      <span className="text-slate-700">{actorName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {log.action_type}
                    </code>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {log.object_type ? `${log.object_type}${log.object_id ? ` · ${log.object_id.slice(0, 8)}` : ''}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && logs.length === 0 && <EmptyState icon={ScrollText} title="No audit log entries" />}
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
