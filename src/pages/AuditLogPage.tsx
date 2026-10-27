import { useEffect, useState } from 'react'
import { api } from '../lib/api'

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
      <h1 className="text-2xl font-bold text-slate-900">Audit log</h1>
      <p className="mt-1 text-sm text-slate-500">Every recorded action across the system, most recent first.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Object</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-slate-600">
                  {log.profiles
                    ? `${log.profiles.first_name || ''} ${log.profiles.last_name || ''}`.trim() || log.profiles.email
                    : 'system'}
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{log.action_type}</code>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {log.object_type ? `${log.object_type}${log.object_id ? ` · ${log.object_id.slice(0, 8)}` : ''}` : '—'}
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No audit log entries.
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
