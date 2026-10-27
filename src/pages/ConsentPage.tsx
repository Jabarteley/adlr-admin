import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { api } from '../lib/api'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { Badge } from '../components/Badge'

type ConsentRecord = {
  id: string
  user_id: string
  network_id: string
  consent_version: string | null
  ai_consent: boolean
  ai_consented_at: string | null
  consented_at: string
  revoked_at: string | null
  profiles: { first_name: string | null; last_name: string | null; email: string | null } | null
  care_networks: { network_name: string } | null
}

const PAGE_SIZE = 20

export function ConsentPage() {
  const [records, setRecords] = useState<ConsentRecord[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
    api
      .get<{ data: ConsentRecord[]; pagination: { count: number } }>(`/admin/consent-records?${params}`)
      .then((res) => {
        setRecords(res.data)
        setCount(res.pagination.count)
      })
      .finally(() => setLoading(false))
  }, [offset])

  return (
    <div>
      <PageHeader title="Consent records" subtitle="Who consented to what, and any revocations." />

      <div className="overflow-hidden rounded-2xl border border-adlr-border bg-white shadow-sm shadow-slate-100/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-adlr-border bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Network</th>
              <th className="px-5 py-3">Version</th>
              <th className="px-5 py-3">AI consent</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Consented</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80">
                <td className="px-5 py-3">
                  <Link to={`/users/${r.user_id}`} className="font-medium text-adlr-purple-deep hover:underline">
                    {`${r.profiles?.first_name || ''} ${r.profiles?.last_name || ''}`.trim() ||
                      r.profiles?.email ||
                      r.user_id}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">{r.care_networks?.network_name || '—'}</td>
                <td className="px-5 py-3 text-slate-500">{r.consent_version || '—'}</td>
                <td className="px-5 py-3">
                  <Badge variant={r.ai_consent ? 'success' : 'neutral'}>{r.ai_consent ? 'Yes' : 'No'}</Badge>
                </td>
                <td className="px-5 py-3">
                  {r.revoked_at ? <Badge variant="danger">Revoked</Badge> : <Badge variant="success">Active</Badge>}
                </td>
                <td className="px-5 py-3 text-slate-400">{new Date(r.consented_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && records.length === 0 && (
          <EmptyState icon={ShieldCheck} title="No consent records" />
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
