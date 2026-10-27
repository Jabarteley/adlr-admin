import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

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
      <h1 className="text-2xl font-bold text-slate-900">Consent records</h1>
      <p className="mt-1 text-sm text-slate-500">Who consented to what, and any revocations.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Network</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">AI consent</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Consented</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <Link to={`/users/${r.user_id}`} className="text-violet-700 hover:underline">
                    {`${r.profiles?.first_name || ''} ${r.profiles?.last_name || ''}`.trim() ||
                      r.profiles?.email ||
                      r.user_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{r.care_networks?.network_name || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{r.consent_version || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{r.ai_consent ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  {r.revoked_at ? (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Revoked</span>
                  ) : (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(r.consented_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No consent records.
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
